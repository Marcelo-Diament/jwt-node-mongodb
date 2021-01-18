const express = require('express')
const authMiddleware = require('../middlewares/auth')
const router = express.Router()

router.use(authMiddleware)

router.get('/', async (req, res) => res.send({ ok: true, userId: req.userId }))

module.exports = app => app.use('/orders', router)