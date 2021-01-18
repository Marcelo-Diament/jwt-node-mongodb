const jwt = require('jsonwebtoken')
const authConfig = require('../config/auth')

module.exports = (req, res, next) => {

  const authorization = req.headers.authorization
  if (!authorization)
    return res.status(401).send({ error: 'Token não enviado' })

  const authParts = authorization.split(' ')
  if (authParts.length !== 2)
    return res.status(401).send({ error: 'Erro de token' })

  const [bearer, token] = authParts
  if (!/^Bearer$/i.test(bearer))
    return res.status(401).send({ error: 'Token mal formatado' })

  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err)
      return res.status(401).send({ error: 'Token inválido' })
    req.userId = decoded.id
    return next()
  })
}