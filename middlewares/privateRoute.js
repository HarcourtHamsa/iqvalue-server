const jwt = require("jsonwebtoken");

const private = (req, res, next) => {
  const token = req.header("token");

  // check it token is present
  if (!token) {
    res.status(401).json({
      success: false,
      message: "authorization header not present",
    });

    return;
  }

  try {
    const isVerified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = isVerified;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = private;
