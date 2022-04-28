import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { initContract } from "./utils";

window.nearInitPromise = initContract()
  .then(() => {
    ReactDOM.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
      document.querySelector("#root")
    );
  })
  .catch(console.error);
