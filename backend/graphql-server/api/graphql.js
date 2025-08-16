import { ApolloServer } from "apollo-server-micro";
import Cors from "micro-cors";
import typeDefs from "../src/schema.js";
import resolvers from "../src/resolvers.js";

const cors = Cors({
  origin: [process.env.CLIENT_URL], // allow local + deployed frontend
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
});

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const startServer = server.start();

export default cors(async function handler(req, res) {
    if (req.method === "OPTIONS") {
        res.end();
        return false;
    }

    await startServer;
    await server.createHandler({ path: "/api/graphql" })(req, res);
});

export const config = {
    api: {
        bodyParser: false,
    },
};
