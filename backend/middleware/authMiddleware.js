const jwt = require("jsonwebtoken");

// ✅ Must match authRoutes.js
const SECRET_KEY = process.env.JWT_SECRET || "mysecretkey";

// ✅ Check token + attach decoded user to req.user
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization; // "Bearer <token>"

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // { id, role, iat, exp }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// ✅ Allow only specific roles
function allowRoles(...roles) {
  return (req, res, next) => {
    const role = req.user?.role;

    if (!role || !roles.includes(role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
}

module.exports = { authMiddleware, allowRoles };
