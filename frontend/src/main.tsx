import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import { AuthProvider } from "./context/authContext.tsx";
import client from "./graphql/ApolloClient";
import App from "./App.tsx";
import "./index.css";
import axios from "axios";
import { MediaLengthProvider } from "./context/mediaLengthContext.tsx";
axios.defaults.withCredentials = true;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <MediaLengthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </MediaLengthProvider>
      </AuthProvider>
    </ApolloProvider>
  </StrictMode>,
);
