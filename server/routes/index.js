const router = require('express').Router()
const userRoutes = require('./users')
const albumRoutes = require('./albums')
const reviewRoutes = require('./reviews')
const commentRoutes = require('./comments')
const reportRoutes = require('./reports')
const adminRoutes = require('./admin')

router.use('/users',userRoutes)
router.use('/albums',albumRoutes)
router.use('/reviews',reviewRoutes)
router.use('/comments',commentRoutes)
router.use('/reports',reportRoutes)
router.use('/admin',adminRoutes)

module.exports=router