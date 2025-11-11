const jwt = require("jsonwebtoken");

const IsSecurityIncharge = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        errors: [{ msg: "Invalid SuperAdmin Token" }],
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        errors: [{ msg: "Invalid token format." }],
      });
    }

    // Token verify karna
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Role check karna
    if (decoded.role !== "SecurityIncharge") {
      return res.status(403).json({
        success: false,
        errors: [{ msg: `You are not SecurityIncharge` }],
      });
    }

    // Valid user => attach user data aur aage jao
    req.user = decoded;
    next();

  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({
      success: false,
      errors: [{ msg: "Invalid or expired token." }],
    });
  }
};

module.exports = IsSecurityIncharge;
