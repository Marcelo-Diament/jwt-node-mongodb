# Autenticação JWT com node.js e MongoDB

## Introdução

Essa prática visa ensinar como usar o _JSON Web Token_ (a.k.a. **JWT**) com [node.js](http://nodejs.org/en/download) e [MongoDB](https://www.mongodb.com/). Vamos criar rotas e controladores que permitam o registro de usuários e a autenticação dos mesmos. Para testarmos o acesso de usuários autenticados, vamos criar também uma rota de pedidos (que será apenas para exemplo, não faremos o CRUD nessa prática). Fica desde já o desafio de integrar essa prática com o _front end_ em [React.js](https://pt-br.reactjs.org/).

## Pré Requisitos

### Node.js

Precisaremos ter o [node.js](http://nodejs.org/en/download) instalado em nossa máquina (verifique executando o código `node -v` no terminal).

### Postman ou Insomnia

Para podermos enxergar as requisições e respostas de nosso _back end_ (com método `POST` , por exemplo), podemos usar programas como o [Postman](https://www.postman.com/) ou [Insomnia](https://insomnia.rest/download/).

### Banco de Dados MongoDB

Siga os seguintes passos (caso seja o seu primeiro banco de dados [MongoDB](https://www.mongodb.com/)):

**1. Cadastro no MongoDB**

Cadastre-se em https://www.mongodb.com/

**2. Projeto**

Crie um projeto novo (no projeto vamos chamá-lo de `mongocrud` ):

**2.1. Cluster**

Vamos criar um _cluster_ (gratuito) com as seguintes configurações:

_Cloud Provider_: AWS | N. Virginia
_Cluster Tier_: M0 Sandbox - Free
_Additional Settings_: MongoDB 4.2 | Back Up Off
_Cluster Name_: `MongoDB-Crud`

**3. Conexão**

Após criar o _cluster_, defina configurações de conexão (_Connect_):

IP: permitir qualquer IP (0.0.0.0/0)
Usuário e senha (marcelo-diament | m0ng0#DB#DH)
Conexão: usando o [MongoDB Compass](https://docs.mongodb.com/manual/installation/) ('_I have MongoDB Compass_' | '_1.11 or earlier_')

Copie o trecho de conexão ( `mongodb://marcelo-diament:<password>@mongodb-crud-shard-00-00.eoagi.mongodb.net:27017,mongodb-crud-shard-00-01.eoagi.mongodb.net:27017,mongodb-crud-shard-00-02.eoagi.mongodb.net:27017/test?replicaSet=atlas-v4muir-shard-0&ssl=true&authSource=admin` )

**4. MongoDB Compass**

Baixe o [MongoDB Compass](https://docs.mongodb.com/manual/installation/) (_Community Version_) e crie uma nova conexão colando a _string_ copiada.

> Importante: caracteres especiais devem ser convertidos em _percent enconding_ ( `#` fica `%23` ). Use [essa ferramenta](https://www.url-encode-decode.com/) para converter os caracteres.

 `mongodb://marcelo-diament:m0ng0%23DB%23DH@mongodb-crud-shard-00-00.eoagi.mongodb.net:27017,mongodb-crud-shard-00-01.eoagi.mongodb.net:27017,mongodb-crud-shard-00-02.eoagi.mongodb.net:27017/test?replicaSet=atlas-v4muir-shard-0&ssl=true&authSource=admin`

**5. Criação do Banco de Dados e _Cluster_**

No MongoDB Compass, crie um novo Banco de Dados (_CREATE DATABASE_). Vamos chama-lo de `mongocrud` . E a _collection_ inicial chamaremos de `user` .

___

## Passo a Passo

### 01. Iniciando Projeto

``` sh
npm init
```

### 02. Instalando Dependências

``` sh
npm i express body-parser mongoose dotenv bcryptjs jsonwebtoken --save
```

``` sh
npm i nodemon --save-dev
```

### 03. Definindo Script `start`

No package.json, incluir em _scripts_:

``` json
"start": "nodemon server"
```

### 04. Criando Servidor (e Rota Inicial)

``` js
const express = require('express')
const bodyParser = require('body-parser')

const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
}))

app.get('/', (req, res) => res.send('<h1>Node + Express + MongoDB Auth</h1>'))

app.listen(port, () => console.log(`Servidor rodando na porta ${port}`))
```

No terminal, execute `npm start` (ou `npm run start` ) e veja se o terminal exibe a mensagem que definimos no `console.log()` definido como _callback_ do método `listen()` .

Acesse no navegador `localhost:5000` (ou a porta definida no servidor) e veja se ele retorna a mensagem definida no método `send()` da nossa rota inicial.

Se estiver tudo ok, pode seguir para o próximo passo. Caso contrário, reveja os passos anteriores.

### 05. Conectando com Banco de Dados

Vamos criar um arquivo _index.js_ dentro de uma pasta (que criaremos também) chamada _db_ ( `mkdir db && cd db && touch index.js && code db/index.js` ).

Nesse arquivo vamos usar o _mongoose_ para fazermos a conexão:

``` js
// Importando mongoose
const mongoose = require('mongoose')

// Usando useCreateIndex (pois o método ensureIndex foi depreciado e geraria um erro posteriormente
mongoose.set('useCreateIndex', true)

// Conectando via mongoose, onde mongocrud é o nome do nosso banco de dados
mongoose.connect('mongodb://localhost/mongocrud', {
    useMongoClient: true
})

// Definindo classe de promise a ser utilizada pelo mongoose (no node, usamos global.Promise)
mongoose.Promise = global.Promise

// Exportamos mongoose
module.exports = mongoose
```

### 06. Criando o Model de User

Criaremos uma pasta chamada _models_ e, dentro dela, um arquivo _user.js_, que ficará assim:

``` js
// Importando mongoose
const mongoose = require('mongoose')

// Criando o Schema de User (um blueprint, um esqueleto da tabela, como deve ser um registro)
const UserSchema = new mongoose.Schema({
    // Definindo o campo nome
    nome: {
        // Definindo o tipo de campo (String)
        type: String,
        // Definindo que é um campo obrigatório
        required: true
    },
    email: {
        type: String,
        // Definindo que seu valor deve ser único
        unique: true,
        required: true,
        // Definindo que seu valor (texto) será convertido para caixa baixa (minúsculas)
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        // Definindo que esse campo não será trazido automaticamente nos selects/consultas
        select: false
    },
    criadoEm: {
        // Definindo tipo de campo como data
        type: Date,
        // Definindo valor padrão para o campo (quando o mesmo não for enviado) como a data atual
        default: Date.now
    }
})

// Definindo nosso model User de acordo com a Schema acima declarada
const User = mongoose.model('User', UserSchema)

// Exportando o model User
module.exports = User
```

### 07. Criando o Controller de Autenticação

Vamos criar uma pasta chamada _controllers_. Dentro dela criaremos o _controller_ responsável pela autenticação (_auth.js_). O _controller_ nada mais é do que um objeto com os métodos (a serem utilizados de acordo com cada rota) definidos dentro dele.

``` js
const express = require('express')
const User = require('../models/user')
const router = express.Router()

router.post('/register', async (req, res) => {
    const {
        email
    } = req.body

    try {
        const user = await User.create(req.body)
        return res.send({
            user
        })
    } catch (err) {
        return res.status(400).send({
            error: 'Ops! Houve uma falha no cadastro do usuário'
        })
    }
})

module.exports = app => app.use('/auth', router)
```

E precisamos importar esse _controller_ no nosso _server_: `require('./controllers/auth')(app)`

### 08. Testando o Cadastro de Usuário

No Postman ou no Insomnia, vamos acessar nosso _back end_ para testarmos o cadastro de usuários.

Para isso basta criarmos uma requisição com o **método `POST` ** e com o _endpoint_ (endereço para onde a requisição é enviada) com o valor: **http://localhost:5000/auth/register**.

E no _body_ da nossa _request_ (requisição), vamos passar um JSON com os dados necessários ( `nome` , `email` e `senha` ). O campo `criadoEm` será preenchido automaticamente com o valor _default_. Exemplo:

``` json
{
	"nome": "Marcelo",
	"email": "marcelo@djament.com.br",
	"senha": "123456"
}
```

Ao enviar nossa _request_, devemos receber um _status code_ 200 OK e o nosso registro aparecerá com o campo `criadoEm` e dois novos campos - `_id` e `__v` , gerados pelo próprio MongoDB:

``` json
{
	"user": {
		"_id": "6004a284203b7e3d908f4f02",
		"nome": "Marcelo",
		"email": "marcelo@djament.com.br",
		"senha": "123456",
		"criadoEm": "2021-01-17T20:48:04.529Z",
		"__v": 0
	}
}
```

### 09. Encriptando a Senha

De volta ao nosso _model_ de usuário, vamos importar o pacote _dcryptjs_ antes de definirmos o `UserSchema` :

``` js
const bcrypt = require('bcryptjs')
```

E antes de salvarmos o registro ( `const User` ), vamos usar um método do _mongoose_ que nos permite manipular o objeto a ser criado ( `NomeDoSchema.pre('save', callback` ). Vale ressaltar que, nesse caso, não podemos usar _arrow function_, pois usaremos a _keyword_ `this` para nos referirmos ao objeto que será criado - e com _arrow function_ perderíamos o escopo da função.

``` js
// Definimos a função a ser executada antes de salvarmos o usuário
UserSchema.pre('save', function(next) {

    // Usamos o bcryptjs para 'hashearmos' a senha
    const hash = await bcrypt.hash(this.senha, 10)

    // Atribuímos o valor do hash à propriedade senha do usuário a ser criado
    this.senha = hash

    // Continuamos com o registro do usuário
    next()
})
```

Se voltarmos ao Postman/Insomnia e salvarmos um novo usuário, veremos que a senha agora se parece com `$2a$10$WUDvddmqQFTUmvnM6Ix.xehdpkonrQ/nL4PBUMqDcXq6uep2Qc/7i` .

### 10. Validações de Cadastro

Nosso campo `email` possui uma _constraint_ (restrição) `unique` , ou seja, não permitimos o cadastro de mais de um usuário com o mesmo email. Se houver a tentativa de um cadastro de email já existente, nosso sistema reotrnará o _status code_ 400 _BAD REQUEST_ com a mensagem 'Ops! Houve uma falha no cadastro do usuário'.

Para tratarmos esse cenário específico, podemos criar a seguinte validação em nosso _controller_. Dentro do `try` (logo após 'abrirmos' ele) inseriremos:

``` js
if ((await User.findOne({
        email: email
    })))
    return res.status(400).send({
        error: 'Ops! Parece que esse email já foi cadastrado!'
    })
```

Acima usamos o _if_ com _short circuit_ (condição `&&` retorno) para, caso o email já exista, retornarmos uma resposta mais específica.

Outra melhoria que podemos fazer é 'apagar' a senha após salvá-la no objeto do usuário (pois quando criamos um usuário ele acaba retornando a senha encriptada - o `select: false` que definimos no _model_ só é aplicado no _select_, não no momento de criação do registro). Então depois de criarmos o registro, 'limpar' essa senha:

``` js
user.senha = undefined
```

### 11. Rota de Autenticação

No nosso arquivo _auth.js_ vamos criar uma nova rota, com o verbo/método `POST` e o _endpoint_ `authentication` . Receberemos na _request_ os valores de `email` e `senha` (vamos usar a desestruturação para capturarmos esses valores do `req.body` e atribuirmos a variáveis com os mesmos nomes das chaves ( `email` e `senha` ): `const { email, senha } = req.body` .

Então, o primeiro passo será buscarmos o usuário com aquele email (que sabemos que é único) com o método `findOnd()` . Mas como precisaremos verificar a senha do usuário - e definimos no nosso _model_ para não recebê-la nos `select` s, precisaremos adicionar um segundo método (`select('+senha') para termos acesso a ela.

Em seguida, partiremos para as validações!

#### Validações

**Usuário não existente**

A primeira validação é sabermos se o usuário está cadastrado no nosso Banco de Dados. Para isso vamos declarar:

``` js
if (!user)
    return res.status(204).send({
        error: 'Ops... Usuário não encontrado!'
    })
```

**Senha incorreta**

Como nossa senha está encriptada, precisamos importar o _bcryptjs_ ( `const bcrypt = require('bcryptjs')` e depois validar a senha inserida:

``` js
if (!await bcrypt.compare(senha, user.senha))
    return res.status(400).send({
        error: 'Ops... Senha inválida!'
    })
```

> Observação: por razões de segurança, pode ser interessante termos o mesmo erro devolvido para 'usuário não encontrado' e 'senha inválida', de modo a não mostrar que o email existe no segundo caso. É uma escolha a ser feita pelo desenvolvedor, _product owner_ ou pelas regras de negócios.

**Sucesso**

E, caso a _request_ não caia em nenhuma das condições, o usuário é autenticado ( `res.send({user})` ).

Por fim, também precisamos 'limpar' a senha nessa rota.

#### Código final da rota:

``` js
router.post('/authentication', async (req, res) => {
    const {
        email,
        senha
    } = req.body
    const user = await User.findOne({
        email
    }).select('+senha')

    if (!user)
        return res.status(204).send({
            error: 'Ops... Usuário não encontrado!'
        })

    if (!await bcrypt.compare(senha, user.senha))
        return res.status(400).send({
            error: 'Ops... Senha inválida!'
        })

    user.senha = undefined

    res.send({
        user
    })
})
```

Podemos testar novamente no Postman/Insomnia, criando uma nova _request_ com o método `POST` , _endpoint_ `http://localhost:5000/auth/authentication`

### 12. JWT | JSON Web Token

Chegou a hora de usasrmos nosso Web Token. O primeiro passo é importar o pacote no nosso _controller_: `const jwt = require('jsonwebtoken')` .

Dentro da nossa rota de autenticação, vamos gerar esse _token_ usando a chave `id` do nosso usuário (por ser única) e um _hash_, que será o identificador da nossa aplicação. Para isso podemos escolher uma palavra chave e gerar uma chave MD5 a partir dela (você pode usar [esse site](https://www.md5hashgenerator.com/) para isso).

Não queremos deixar essa chave exposta, então podemos salvá-la num novo local/arquivo - _config/auth.json_ com a chave `"secret"` . Exemplo:

``` json
{
	"secret": "b1eb18b2364449f0dee6c1794d1a1e57"
}
```

Agora importarmos esse JSON ( `const authConfig = require('../config/auth')` _ e usarmos em nossa rota de autenticação, após limparmos a senha:

``` js
const token = jwt.sign({
    id: user.id
}, authConfig.secret, {
    expiresIn: 43200
})
```

Veja que passamos como argumentos o `id` do usuário, nosso _token_ ( `secret` ) e um prazo de validade ( `expiresIn` , que é calculado em segundos - no caso ele expirará em 12 horas).

Por fim, basta enviarmos o `token` junto ao `user` : `res.send({user, token})` . Então nossa rota de autenticação ficou assim:

``` js
router.post('/authentication', async (req, res) => {
    const {
        email,
        senha
    } = req.body
    const user = await User.findOne({
        email
    }).select('+senha')

    if (!user)
        return res.status(400).send({
            error: 'Ops... Usuário não encontrado!'
        })

    if (!await bcrypt.compare(senha, user.senha))
        return res.status(400).send({
            error: 'Ops... Senha inválida!'
        })

    user.senha = undefined

    const token = jwt.sign({
        id: user.id
    }, authConfig.secret, {
        expiresIn: 43200
    })

    res.send({
        user,
        token
    })
})
```

Mas... e o usuário que acaba de ser registrar? Vamos obrigar ele a fazer o login após se cadastrar? Não seria mais interessante já logar após o cadastro?

Então vamos gerar e passar esse mesmo _token_ no momento de registro. E, já que vamos duplicar esse código, é mais recomendável nós definirmos uma função para gerar o _token_ e executá-la em ambas as rotas.

A função deverá receber um parâmetro (o `id` do usuário) e retornar o _token_ (mas vamos definir esse parâmetro como argumento opcional, caso não seja enviado será um objeto vazio):

``` js
function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 43200
    })
}
```

E no método `send` da _response_, vamos atribuir o valor retornado pela função à propriedade `token` :

``` js
res.send({
    user,
    token: generateToken({
        id: user.id
    })
})
```

Com essa atualização, não precisamos mais do trecho que definia o _token_ dentro da rota de autenticação.

### 13. Pedidos (orders)

Para podermos evoluir com o projeto e, principalmente, para verificarmos se os usuários realmente estão autenticados (afinal, no login e no cadastro o usuário não estará registrado), vamos simular a possibilidade de usuários cadastrarem Pedidos. Então começaremos com o _controller_ desses pedidos - vamos criar o arquivo _orders.js_ dentro da pasta _controllers_.

> **Desafio**: após terminar a prática, tente realizar o CRUD de fato, permitindo que usuário possam realizar (cadastrar) pedidos na nossa API.

**Controller Orders**

``` js
const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => res.send('<h1>Pedidos</h1>'))

module.exports = app => app.use('/orders', router)
```

A princípio vamos apenas tratar essa rota retornando um título 'Pedidos'.

No nosso _server.js_ também precisamos passar o `app` para essa rota:

``` js
require('./controllers/orders')(app)
```

Para testar podemos criar uma nova _request_ no Postman/Insomnia ( `GET` | `http://localhost:5000/orders` ) ou podemos acessar http://localhost:5000/orders no próprio _browser_/navegador.

Ok, mas até aí... sem novidades. Mas... digamos que o usuário precisa estar autenticado para poder visualizar os pedidos/_orders_. É aí que entra o _middleware_!

**Middleware**

Podemos entender o _middleware_ como o 'meio de campo' entre a _request_ e a _response_, ou melhor, entre a rota e o _controller_. É no _middleware_ que faremos essa autenticação.

Então vamos criar uma pasta para os _middlewares_ e, dentro dela, vamos criar um _middleware_ de autenticação. Chamaremos esse novo arquivo de _auth.js_.

Nele, vamos tratar essa autenticação. Caso esteja tudo ok, vamos acessar esse terceiro argumento, o `next` , que permitirá que o usuário prossiga para a rota desejada, desde que esteja autenticado.

Já vamos importar nossos recursos de autenticação:

``` js
const jwt = require('jsonwebtoken')
const authConfig = require('../config/auth')
```

E vamos exportar nosso retorno, de acordo com a requisição e resposta:

``` js
module.exports = (req, res, next) => {
    // Validações e retorno
}
```

Precisamos fazer algumas validações (para otimizar a performance da nossa aplicação), como verificar se o token está sendo enviado:

``` js
// Vamos tentar capturar a autorização enviada no header da requisição
const authorization = req.headers.authorization

// Validando se a autorização existe
if (!authorization)
    return res.status(401).send({
        error: 'Token não enviado'
    })
```

Se estiver sendo enviado, se está formatado corretamente (com 2 partes, `Bearer` e o `token` propriamente dito) e se a primeira parte é o `Bearer` :

``` js
// Quebrando o JWT em 2 partes, o Bearer e o Token, com split
const authParts = authorization.split(' ')

// Validando se temos essas 2 partes
if (authParts.length !== 2)
    return res.status(401).send({
        error: 'Erro de token'
    })

// Desestruturando para salvarmos cada parte em uma variável
const [bearer, token] = authParts

// Se a primeira parte não começar com a string 'Bearer' retornamos outro erro (verificação com RegEx)
if (!/^Bearer$/i.test(bearer))
    return res.status(401).send({
        error: 'Token mal formatado'
    })
```

Caso todas essas validações estejam OK, vamos verificar o _token_ propriamente dito. Se estiver tudo OK com o _token_ também, retornamos o ID do usuário decodificado num _callback_:

``` js
jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err)
        return res.status(401).send({
            error: 'Token inválido'
        })
    req.userId = decoded.id
    return next()
})
```

Para testarmos nossa autenticação, vamos importar o _middleware_ de autorização em nosso controlador (_controller_) de pedidos ( `const authMiddleware = require('../middlewares/auth')` ) e declarar `router.use(authMiddleware)` .

Lá no Postman/Insomnia vamos acessar nossa _request_ `GET` para `orders` sem _token_, com um _token_ mal formatado, com o _token_ errado e com o _token_ correto (basta autenticar um usuário na outra _request_ de autenticação e copiar o _token_ informado).

Como usamos o ID do usuário na requisição, podemos acessá-lo no controlador de pedidos, por exemplo:

``` js
router.get('/', async (req, res) => res.send(`<h1>Pedidos | Autenticação do Usuário de ID ${req.userId}</h1>`))
```

Podemos ainda, passar a _response_ como objeto:

``` js
router.get('/', async (req, res) => res.send({
    ok: true,
    userId: req.userId
}))
```

___
