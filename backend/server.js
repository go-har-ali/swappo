const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/User.js");
const Product = require("./models/Product.js");
const TradeRequest = require("./models/Trade");
const multer = require("multer");
const path = require("path");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
require("dotenv").config();

// "dev": "nodemon server.js"

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "https://frontend-swappo-late-app.vercel.app", // ✅ Add this one!
  "https://frontend-swappo-app.vercel.app",
  "https://frontend-swappo-mern.vercel.app",
  "https://frontend-swappo-learn.vercel.app",
  "https://frontend-swappo-relearn.vercel.app",
  "https://frontend-swappo-earn.vercel.app",
  "https://frontend-swappo-earnapp.vercel.app",
  "https://frontend-swappo-earnapplogic.vercel.app",
  "https://frontend-swappo-eapp.vercel.app",
  "https://frontend-swappo-eappe.vercel.app",
  "https://frontend-swappo-chal.vercel.app",
];

// CORS for Express
// const corsOptions = {
//   origin: allowedOrigins,
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
// };
// app.use(cors(corsOptions)); // ✅ this one

app.use(
  cors({
    origin: allowedOrigins, // allow your deployed frontend
    credentials: true,
  })
);

app.use(cors());
app.use(express.json()); // For parsing JSON body
app.use(express.urlencoded({ extended: true })); // For form data
app.use("/uploads", express.static("uploads")); // Serve uploaded images

const io = socketIO(server, {
  cors: {
    origin: allowedOrigins, // ✅ Use the same list as above
    // origin: "http://localhost:5173",
    // methods: ["GET", "POST"],

    credentials: true,

    methods: ["GET", "POST"], // Optional but helps
  },
});

const productRoutes = require("./routes/products.js");
const cartRoutes = require("./routes/cart.js");
const tradeRequestsRoutes = require("./routes/tradeRequests");

// || "mongodb://localhost:27017/swappo"

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

mongoose.set("bufferTimeoutMS", 30000);

app.use((req, res, next) => {
  const origin = req.get("origin") || req.get("referer") || "unknown";
  const host = req.get("host") || "unknown";

  console.log(`🚨 Origin: ${origin} | Host: ${host} | URL: ${req.url}`);

  next();
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join room using userId to allow targeted messages
  socket.on("join", (userId) => {
    console.log("📥 JOIN REQUEST from user:", userId);
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // Handle incoming trade request
  socket.on("tradeRequest", async (data) => {
    console.log("📨 Incoming trade request data:", data);
    try {
      const trade = new TradeRequest(data);
      await trade.save();

      console.log("✅ Trade request saved to DB:", trade);

      // Emit to the target user room
      io.to(data.toUserId).emit("tradeRequestReceived", trade);
      console.log(
        `Trade request sent from ${data.fromUserId} to ${data.toUserId}`
      );
    } catch (error) {
      console.error("Error saving trade request:", error);
    }
  });

  // Handle accept/reject trade
  socket.on("respondToTrade", async ({ tradeId, status }) => {
    console.log("📥 Trade response received:", { tradeId, status });

    try {
      const trade = await TradeRequest.findByIdAndUpdate(
        tradeId,
        { status },
        { new: true }
      );

      if (!trade) {
        console.error("Trade not found");
        return;
      }

      console.log("✅ Trade updated in DB:", trade);

      // Notify the sender about the response
      io.to(trade.fromUserId.toString()).emit("tradeResponse", trade);
      console.log(`Trade ${tradeId} responded with: ${status}`);
    } catch (error) {
      console.error("Error responding to trade:", error);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Directory to store uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/products", productRoutes);
//app.use("api/products/inventory", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/trade-requests", tradeRequestsRoutes);

app.post("/api/register", upload.single("profilePicture"), async (req, res) => {
  console.log("req body", req.body); // Debugging
  console.log("req file", req.file); // Debugging

  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ status: "error", error: "All fields are required" });
    }

    // Validate role (should be either "client" or "vendor")
    if (!["client", "vendor"].includes(role)) {
      return res.status(400).json({
        status: "error",
        error: "Invalid role. Must be 'client' or 'vendor'.",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: "error", error: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      profilePicture: req.file ? req.file.filename : null,
      role, // Store role (client or vendor)
    });

    await newUser.save();
    res.json({ status: "ok", user: newUser }); // Send created user for debugging
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", error: "Internal server error" });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  // Authenticate the user
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !isValidPassword(user, password)) {
      // assuming isValidPassword is a function to verify passwords
      res.status(401).json({ message: "Invalid email or password" });
    } else {
      const token = generateToken(user); // Assuming generateToken creates a JWT
      console.log("Token", token);
      res.json({ user: token });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role, // ✅ Make sure this is added
      email: user.email,
    }, // Payload of the JWT
    "DUFSFUYUFDSYFUY78WE8EHF", //
    { expiresIn: "24h" } // Token expiration time
  );
}

async function isValidPassword(user, password) {
  return await bcrypt.compare(password, user.password); // assuming user.password is the hashed password
}

server.listen(5000, () => console.log("Server running on port 5000"));
