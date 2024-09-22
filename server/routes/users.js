const router = require('express').Router()
const prisma=require('../db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

router.post("/",async(req, res)=>{
    try {
        const {email,name,password}= req.body
        if (!email || !name || !password){
            return res.status(400).json({error:"All fields are required"})
        }
        const hash = await bcrypt.hash(password,10)
        const user = await prisma.user.create({data:{
            email,name,password : hash
        }})
        res.status(201).json({message:"User Created"})
    } catch (error) {
        res.status(500).json({error:'Internal error'})
    }
})


router.post("/login",async(req, res)=>{
    try {
        const {email,password}= req.body
        if (!email || !password){
            return res.status(400).json({error:"All fields are required"})
        }
        
        const user = await prisma.user.findUnique({where:{email}})
        if (!user) {
            return res.status(401).json({error:"Invalid email or Password"})
        }
        const validPassword = await bcrypt.compare(password,user.password)
        if (!validPassword) {
            return res.status(401).json({error:"Invalid email or Password"})
        }
        const token = jwt.sign({userId:user.id},process.env.JWT_SECRET,{expiresIn:'1d'})
        res.status(200).json({message:"Login Succesful",token})
    } catch (error) {
        res.status(500).json({error:'Internal error'})
        console.log(error)
    }
})


















module.exports=router