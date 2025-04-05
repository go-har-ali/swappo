const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const token = req.header("Authorization");
  if (!token)
    return res.status(401).json({ error: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET || "DUFSFUYUFDSYFUY78WE8EHF"
    );
    req.user = decoded; // Store user data in request object
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token." });
  }
}

// Middleware to check user roles
function verifyRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res
        .status(403)
        .json({ error: "Access denied. Insufficient permissions." });
    }
    next();
  };
}

module.exports = { verifyToken, verifyRole };
