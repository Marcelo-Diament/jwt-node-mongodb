# Autenticação JWT com node.js e MongoDB

## Introdução

Essa prática visa ensinar como usar o _JSON Web Token_ (a.k.a. **JWT**) com [node.js](http://nodejs.org/en/download) e [MongoDB](https://www.mongodb.com/). Vamos criar rotas e controladores que permitam o registro de usuários e a autenticação dos mesmos. Para testarmos o acesso de usuários autenticados, vamos criar também uma rota de pedidos (que será apenas para exemplo, não faremos o CRUD nessa prática). Fica desde já o desafio de integrar essa prática com o _front end_ em [React.js](https://pt-br.reactjs.org/).

## Pré Requisitos

### Node.js

Precisaremos ter o [node.js](http://nodejs.org/en/download) instalado em nossa máquina (verifique executando o código `node -v` no terminal).

### Postman ou Insomnia

Para podermos enxergar as requisições e respostas de nosso _back end_ (com método `POST` , por exemplo), podemos usar programas como o [Postman](https://www.postman.com/) ou [Insomnia](https://insomnia.rest/download/).
