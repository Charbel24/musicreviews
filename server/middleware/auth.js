const jwt = require("jsonwebtoken");
const prisma = require('../db');
const { response } = require("express");

function auth(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer", "").trim();
  if (!token) {
    return res.status(401).json({ error: "Authorization denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.userId = decoded.userId;
    next();
  } catch (error) { 
    res.status(401).json({ error: "Authorization denied" });
  }
}

async function adminAuth(req, res, next) {
  try { 
    const user = await prisma.user.findUnique({where:{id:req.userId}})
    if (!user||!user.isAdmin){
      return res.status(403).json({error:"Access Denied"})
    }
    req.isAdmin =true;
    next()
  } catch (error) {
    res.status(500).json({error:"INTERNAL ERROR"})
  }
}
module.exports = {auth,adminAuth};
