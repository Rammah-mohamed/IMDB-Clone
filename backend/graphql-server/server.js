require("dotenv").config();
const cors = require("cors");
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./src/schema");
const resolvers = require("./src/resolvers");

const app = express();

// Define allowed origin explicitly
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

async function startServer() {
  const server = new ApolloServer({ typeDefs, resolvers });

  await server.start();

  // Apply middleware with CORS settings
  server.applyMiddleware({
    app,
    cors: {
      origin: CLIENT_URL,
      credentials: true, // Important for cookies and sessions
    },
  });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer();
