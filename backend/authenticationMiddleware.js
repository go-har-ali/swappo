const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  // console.log("Headerssssssssssssss...", req.headers.authorization); // This will show the authorization header content

  if (!authHeader) {
    console.log("No authorization header provided");
    return res.status(401).json({ message: "Authorization header is missing" });
  }
  // Typically, the Authorization header is in the format: "Bearer TOKEN"
  const tokenParts = authHeader.split(" ");

  // Check if the token is correctly formatted
  if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
    return res
      .status(401)
      .json({ message: "Authorization header is malformed" });
  }

  const token = tokenParts[1];

  jwt.verify(token, "54321", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.user = user;
    next();
  });
};

module.exports = authenticate;
