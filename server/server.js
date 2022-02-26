const express = require('express');
const { ApolloServer } = require('apollo-server-express'); //import ApolloServer
const path = require('path');

const { typeDefs, resolvers } = require('./schemas'); //import our typeDefs and resolvers
const db = require('./config/connection');
const { authMiddleware } = require('./utils/auth'); //import the authentication

const PORT = process.env.PORT || 3001;
const app = express();

const startServer = async () => { //create a new Apollo server adn pass in our schema data
  const server = new ApolloServer({
    typeDefs, 
    resolvers,
    context: authMiddleware
  });
  await server.start(); //start the Apollo server
  server.applyMiddleware({ app }); //integrate our Apollo server with the Express application as middleware
  console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
};

startServer() //initialize the Apollo server

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve up static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
  });
});
