import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App, { DB, DEFAULT_STATE, STATE, State } from "./App";
import { MantineProvider, Container, Title, Divider, Button, JsonInput } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { RecoilRoot, useRecoilState } from "recoil";
import MantineTheme from "./MantineTheme";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { ErrorBoundary } from "react-error-boundary";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <MantineProvider theme={MantineTheme} defaultColorScheme="dark">
      <RecoilRoot>
        <ErrorBoundary fallbackRender={fallbackRender}>
          <ModalsProvider
            modalProps={{
              radius: "md",
              centered: true,
            }}
          >
            <Container>
              <Notifications limit={3} />
              <App />
            </Container>
          </ModalsProvider>
        </ErrorBoundary>
      </RecoilRoot>
    </MantineProvider>
  </React.StrictMode>
);

function fallbackRender(props: { error: any; resetErrorBoundary: any }) {
  // const [state, setState] = useRecoilState<State>(STATE);

  // Call resetErrorBoundary() to reset the error boundary and retry the render.
  console.log(props.error);
  return (
    <Container mt="sm">
      <Title order={1}>An error occurred</Title>
      <Button fullWidth mt="sm" variant="light" onClick={props.resetErrorBoundary}>
        Retry
      </Button>
      <pre>{props.error.message}</pre>
      <pre>{props.error?.stack}</pre>
      <Divider my="md" />
      <RecoveryEditor />
    </Container>
  );
}

function RecoveryEditor() {
  const [state, setState] = useRecoilState<State>(STATE);
  const [previousState, setPreviousState] = useState<string>(JSON.stringify(state, null, 2));

  return (
    <>
      <JsonInput
        minRows={4}
        value={previousState}
        onChange={(e) => {
          setPreviousState(e);
        }}
        autosize
        formatOnBlur
        validationError="Invalid JSON"
      />

      <Button
        fullWidth
        my="sm"
        variant="light"
        onClick={() => {
          let parsed = null;
          try {
            parsed = JSON.parse(previousState);
          } catch (e) {
            alert("Invalid JSON");
          }
          setState({
            ...parsed,
          });
        }}
      >
        Save to State
      </Button>
      <Button
        fullWidth
        variant="light"
        my="sm"
        onClick={() => {
          let parsed = null;
          try {
            parsed = JSON.parse(previousState);
          } catch (e) {
            alert("Invalid JSON");
          }
          DB.execute("UPDATE data SET data = ? WHERE id = 1", [parsed]);
        }}
      >
        Save to Disk
      </Button>
      <Button
        fullWidth
        color="red"
        variant="light"
        onClick={async () => {
          setState({ ...DEFAULT_STATE });
          DB.execute("UPDATE data SET data = ? WHERE id = 1", [JSON.stringify(DEFAULT_STATE)]);
          window.location.reload();
        }}
      >
        Reset to default
      </Button>
    </>
  );
}
