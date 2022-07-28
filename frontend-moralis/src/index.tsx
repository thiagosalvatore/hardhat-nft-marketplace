import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { MoralisProvider } from "react-moralis";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <MoralisProvider
      appId={process.env.REACT_APP_MORALIS_APP_ID!}
      serverUrl={process.env.REACT_APP_MORALIS_SERVER_URL!}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MoralisProvider>
  </React.StrictMode>
);
