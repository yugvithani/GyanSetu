const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET ;

exports.verifyToken = (req, res, next) => {
  // console.log(req);
  const token = req.headers.authorization?.split(" ")[1];
  // console.log(token);
  if (!token) {
    return res.status(401).json({ message: 'Please login.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // console.log(decoded)
    req.user = decoded;
    // console.log(req.user);
    next();
  } catch (error) {
    // console.error(error);
    res.status(400).json({ message: 'Invalid token.' });
  }
};
