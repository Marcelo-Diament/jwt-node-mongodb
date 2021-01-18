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
