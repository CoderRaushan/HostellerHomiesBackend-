const jwt = require("jsonwebtoken");

const IsStudent = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        errors: [{ msg: "Invalid Guard Token" }],
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
    if (decoded.role !== "Student") {
      return res.status(403).json({
        success: false,
        errors: [{ msg: `You are not Student` }],
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

module.exports = IsStudent;
