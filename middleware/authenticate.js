const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");
const Authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.jwtoken;
    jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Token is not valid" });
      }

      // If the token is valid, attach the user data to the request object
      req.user = decoded;
      const user = await User.findById(req.user._id);
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      user.lastLogin = today;
      await user.save();
      //console.log(req.user);
      // Continue with the next middleware or route handler
      next();
    });
  } catch (error) {
    res.status(401).send("Unauthorized: No Token Provided");
    console.log(error);
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

module.exports = { Authenticate, adminMiddleware };
