const express = require('express')
const User = require('../models/user')
const router = express.Router()

router.post('/register', async (req, res) => {
  const { email } = req.body

  try {
    if ((await User.findOne({ email: email })))
      return res.status(400).send({ error: 'Ops! Parece que esse email já foi cadastrado!' })

    const user = await User.create(req.body)

    user.senha = undefined

    return res.send({ user })
  } catch (err) {
    return res.status(400).send({ error: 'Ops! Houve uma falha no cadastro do usuário' })
  }
})

module.exports = app => app.use('/auth', router)