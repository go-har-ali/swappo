const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: null },

  // Role field to differentiate users
  role: {
    type: String,
    enum: ["client", "vendor"], // Allowed roles
    default: "client", // By default, new users are clients
  },

  createdAt: { type: Date, default: Date.now }, // Timestamp
});

const User = mongoose.model("User", UserSchema);

module.exports = User;

// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   profilePicture: { type: String, default: null }, // Ensure this field exists
// });

// const User = mongoose.model("User", UserSchema);

// module.exports = User;
