import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { MantineProvider, Container } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { RecoilRoot } from "recoil";
import MantineTheme from "./MantineTheme";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider theme={MantineTheme} defaultColorScheme="dark">
      <ModalsProvider
        modalProps={{
          radius: "md",
          centered: true,
        }}
      >
        <RecoilRoot>
          <Container>
            <App />
          </Container>
        </RecoilRoot>
      </ModalsProvider>
    </MantineProvider>
  </React.StrictMode>
);
