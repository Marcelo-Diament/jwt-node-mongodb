const express = require('express')
const jwt = require('jsonwebtoken')
const authConfig = require('../config/auth')

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

router.post('/authentication', async (req, res) => {
  const { email, senha } = req.body
  const user = await User.findOne({ email }).select('+senha')

  if (!user)
    return res.status(400).send({ error: 'Ops... Usuário não encontrado!' })

  if (!await bcrypt.compare(senha, user.senha))
    return res.status(400).send({ error: 'Ops... Senha inválida!' })

  user.senha = undefined

  const token = jwt.sign({ id: user.id }, authConfig.secret, { expiresIn: 43200 })

  res.send({ user, token })
})

module.exports = app => app.use('/auth', router)