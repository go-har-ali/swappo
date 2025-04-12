const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const multer = require("multer");
const path = require("path");

const { verifyToken, verifyRole } = require("../middlewares/authMiddleware"); // Import middleware

const router = express.Router();

// Multer storage setup for product images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const filePath = path.join(__dirname, "uploads", "1743150407899-product3.jpg");

// Create a new product
router.post(
  "/",
  verifyToken,
  verifyRole("vendor"),
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { name, description, price, owner } = req.body;
      if (!name || !price || !owner) {
        return res.status(400).json({ error: "All fields are required" });
      }

      console.log("Received body:", req.body); // Debugging
      console.log("Uploaded files:", req.files); // Debugging

      console.log("Received owner:", owner); // Debugging

      const priceNumber = parseFloat(price); // Convert price to a number
      if (isNaN(priceNumber)) {
        return res.status(400).json({ error: "Price must be a valid number" });
      }

      const images = req.files ? req.files.map((file) => file.filename) : [];

      // Validate owner ID before creating ObjectId
      if (!mongoose.Types.ObjectId.isValid(owner)) {
        return res.status(400).json({ error: "Invalid owner ID format" });
      }

      const newProduct = new Product({
        name,
        description,
        price,
        images,
        owner: new mongoose.Types.ObjectId(owner), // ✅ Use `new` keyword
      });

      console.log("New product:", newProduct); // Debugging

      await newProduct.save();
      console.log("Product saved successfully"); // Debugging
      return res.status(201).json({ success: true, product: newProduct });
    } catch (error) {
      console.error("Error saving product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ✅ Clients and Vendors can view products
// router.get("/", verifyToken, async (req, res) => {
//   try {
//     const products = await Product.find().populate("owner", "name email");
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// Get products owned by the logged-in user
router.get(
  "/inventory",
  verifyToken,
  verifyRole("vendor"),
  async (req, res) => {
    try {
      console.log("💡 /inventory route hit");
      console.log("➡️ req.user:", req.user); // shows what's inside the decoded token

      //const userId = req.query.userId; // Get userId from frontend

      const vendorId = req.user.userId; // Get vendor's ID from the token

      if (!vendorId) {
        console.log("❌ vendorId missing from token!");
        return res.status(400).json({ error: "User ID is required" });
      }

      const products = await Product.find({ owner: vendorId }).populate(
        "owner",
        "name email"
      );

      console.log("✅ Fetched products:", products);

      res.json(products);
    } catch (error) {
      console.error("❌ Error in /inventory route:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("owner", "name email");
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "owner",
      "name email"
    );
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put(
  "/:id",
  verifyToken,
  verifyRole("vendor"),
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { name, description, price, owner } = req.body;
      const updateFields = {};

      if (name) updateFields.name = name;
      if (description) updateFields.description = description;
      if (price) updateFields.price = price;

      // Ensure owner is a valid ObjectId
      if (owner) {
        console.log("Received owner in PUT request:", owner);
        if (mongoose.Types.ObjectId.isValid(owner)) {
          updateFields.owner = new mongoose.Types.ObjectId(owner);
          console.log("Converted owner ID:", updateFields.owner);
        } else {
          return res.status(400).json({ error: "Invalid owner ID" });
        }
      }

      if (req.files && req.files.length > 0) {
        updateFields.images = req.files.map((file) => file.filename);
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: updateFields },
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ✅ Vendors can delete their own products
router.delete("/:id", verifyToken, verifyRole("vendor"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (product.owner.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "You are not the owner of this product" });
    }

    await product.remove();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
