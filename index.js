const {ApolloServer, PubSub} = require('apollo-server');
const gql = require('graphql-tag');
const mongoose = require('mongoose');

const {MONGODB} = require('./config.js');
const resolvers = require('./graphql/resolvers');
const typeDefs= require('./graphql/typeDefs');

const pubSub = new PubSub();

const PORT = process.env.PORT || 5000;

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req, pubSub })
});

mongoose
    .connect(MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MongoDB started!");
        return server.listen({ port: PORT});
    })
    .then(res => {
        console.log(`Server started at ${res.url}`);
    })
    .catch(err => {
        console.log(err);
    });
