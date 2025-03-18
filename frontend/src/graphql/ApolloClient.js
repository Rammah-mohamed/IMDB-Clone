// src/ApolloClient.js
import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: import.meta.env.VITE_GRAPHQL_API + "graphql",
  cache: new InMemoryCache(),
  credentials: "include",
});

export default client;
