import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Homepage from "./homepage";
import { MantineProvider, createTheme } from "@mantine/core";

import "@mantine/core/styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider
      // This should match the theme in /src/Root.tsx in the Tauri project
      theme={createTheme({
        fontFamily: "Segoe UI, sans-serif",
        colors: {
          dark: [
            "#BFBFC2",
            "#A4A5A9",
            "#8E9196",
            "#595C63",
            "#34373D",
            "#292B30",
            "#212225",
            "#161719",
            "#101113",
            "#0C0D0F",
          ],
        },
        defaultRadius: "lg",
      })}
      defaultColorScheme="dark"
    >
      <Homepage />
    </MantineProvider>
  </React.StrictMode>
);
