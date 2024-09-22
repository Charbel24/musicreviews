const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer", "");
  if (!token) {
    return res.status(401).json({ error: "Authorization denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.useId = decoded.useId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Authorization denied" });
  }
}

module.exports = auth;
