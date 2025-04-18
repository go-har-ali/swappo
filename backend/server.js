const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/User.js");
const Product = require("./models/Product.js");
const multer = require("multer");
const path = require("path");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
require("dotenv").config();

// "dev": "nodemon server.js"

const productRoutes = require("./routes/products.js");
const cartRoutes = require("./routes/cart.js");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "https://frontend-swappo-late-app.vercel.app", // ✅ Add this one!
  "https://frontend-swappo-app.vercel.app",
  "https://frontend-swappo-mern.vercel.app",
];

const io = socketIO(server, {
  cors: {
    origin: allowedOrigins, // ✅ Use the same list as above
    // origin: "http://localhost:5173",
    // methods: ["GET", "POST"],

    credentials: true,
  },
});

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(cors());
app.use(express.json()); // For parsing JSON body
app.use(express.urlencoded({ extended: true })); // For form data
app.use("/uploads", express.static("uploads")); // Serve uploaded images

// || "mongodb://localhost:27017/swappo"

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

mongoose.set("bufferTimeoutMS", 30000);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Listen for trade requests
  socket.on("tradeRequest", (data) => {
    const { toUserId, fromUserId, productId, offerValue } = data;

    // Emit to the recipient user
    io.to(toUserId).emit("receiveTradeRequest", {
      fromUserId,
      productId,
      offerValue,
    });
  });

  socket.on("respondToTrade", (data) => {
    io.to(data.fromUserId).emit("tradeResponse", data);
  });

  socket.on("join", (userId) => {
    socket.join(userId); // Use userId as room
  });

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
