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
