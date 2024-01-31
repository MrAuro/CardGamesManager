import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import { MantineProvider } from "@mantine/core";
import { atom, useRecoilState } from "recoil";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
