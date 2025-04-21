// const jwt = require("jsonwebtoken");

// function verifyToken(req, res, next) {
//   const token = req.header("Authorization");
//   console.log("🔐 Full Auth Header:", req.headers.authorization);
//   console.log("🔐 Token extracted:", token);

//   if (!token) {
//     console.log("🚫 No token provided");
//     return res.status(401).json({ error: "Access denied. No token provided." });
//   }

//   try {
//     const decoded = jwt.verify(
//       token.replace("Bearer ", ""),
//       process.env.JWT_SECRET || "DUFSFUYUFDSYFUY78WE8EHF"
//     );
//     req.user = decoded;
//     console.log("✅ Decoded Token:", decoded);
//     next();
//   } catch (error) {
//     console.log("🚫 Token verification failed:", error.message);
//     res.status(400).json({ error: "Invalid token." });
//   }
// }

const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.header("Authorization");
  console.log("🔐 Full Auth Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("🚫 No token or bad format");
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1]; // ✅ Properly extracted token
  console.log("🔐 Token extracted:", token);

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "DUFSFUYUFDSYFUY78WE8EHF"
    );
    req.user = decoded; // 👈 Makes req.user.id available
    console.log("✅ Decoded Token:", decoded);
    next();
  } catch (error) {
    console.log("🚫 Token verification failed:", error.message);
    res.status(400).json({ error: "Invalid token." });
  }
}

// Middleware to check user roles
function verifyRole(requiredRole) {
  return (req, res, next) => {
    console.log("🛂 Checking role:", req.user?.role, "Required:", requiredRole);
    if (!req.user || req.user.role !== requiredRole) {
      console.log("❌ Access denied. Role mismatch.");
      return res
        .status(403)
        .json({ error: "Access denied. Insufficient permissions." });
    }
    console.log("✅ Role verified");
    next();
  };
}

module.exports = { verifyToken, verifyRole };
