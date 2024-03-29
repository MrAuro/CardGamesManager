import { KEYBINDINGS_STATE, SETTINGS_STATE } from "@/Root";
import { Scope, Scopes, getActions } from "@/types/Keybindings";
import { useRecoilImmerState } from "@/utils/RecoilImmer";
import {
  ActionIcon,
  Button,
  ButtonGroup,
  Code,
  Collapse,
  Grid,
  Input,
  Select,
  Slider,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconDeviceFloppy,
  IconEye,
  IconEyeOff,
  IconKeyframe,
  IconKeyframeFilled,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import { useRecordHotkeys } from "react-hotkeys-hook";
import { useRecoilState } from "recoil";

export default function GeneralSettings() {
  const [settings, setSettings] = useRecoilState(SETTINGS_STATE);
  const [keybindings, setKeybindings] = useRecoilImmerState(KEYBINDINGS_STATE);

  const [opened, { toggle }] = useDisclosure(false);
  const [keylistening, setKeylistening] = useState("");
  const [keyEditing, setKeyEditing] = useState("");
  const [keys, { start, stop }] = useRecordHotkeys();

  const saveKey = (id: string, key: string) => {
    setKeybindings((draft) => {
      const index = draft.findIndex((kb) => kb.id === id);
      draft[index].key = key;
    });
  };

  const saveScope = (id: string, scope: Scope) => {
    setKeybindings((draft) => {
      const index = draft.findIndex((kb) => kb.id === id);
      draft[index].scope = scope;
    });
  };

  const saveAction = (id: string, action: string) => {
    setKeybindings((draft) => {
      const index = draft.findIndex((kb) => kb.id === id);
      draft[index].action = action as any;
    });
  };

  const deleteKeybinding = (id: string) => {
    setKeybindings((draft) => {
      const index = draft.findIndex((kb) => kb.id === id);
      draft.splice(index, 1);
    });
  };

  return (
    <>
      <Title order={2}>General Settings</Title>
      <Button
        onClick={() => {
          setSettings({ ...settings, debug: !settings.debug });
        }}
      >
        {settings.debug ? "Close" : "Open"} DevTools
      </Button>
      <Input.Wrapper
        label="Corner of Eye Mode"
        description="Makes use of bright colors to inform the user of important actions"
      >
        <ButtonGroup mt={5}>
          <Button
            variant={settings.cornerOfEyeMode ? "filled" : "default"}
            leftSection={<IconEye />}
            onClick={() => {
              setSettings({ ...settings, cornerOfEyeMode: true });
            }}
          >
            On
          </Button>
          <Button
            variant={!settings.cornerOfEyeMode ? "filled" : "default"}
            leftSection={<IconEyeOff />}
            onClick={() => {
              setSettings({ ...settings, cornerOfEyeMode: false });
            }}
          >
            Off
          </Button>
        </ButtonGroup>
      </Input.Wrapper>
      <Input.Wrapper mb="xl" label="UI Scale">
        <Slider
          defaultValue={settings.scale}
          min={50}
          max={150}
          marks={[
            {
              label: "50%",
              value: 50,
            },
            {
              label: "75%",
              value: 75,
            },
            {
              label: "100%",
              value: 100,
            },
            {
              label: "125%",
              value: 125,
            },
            {
              label: "150%",
              value: 150,
            },
          ]}
          onChange={(value) => {
            setSettings({ ...settings, scale: value });
          }}
        />
      </Input.Wrapper>
      {/* <Text fw="bold">Keyboard Shortcuts</Text> */}
      <Button onClick={toggle}>{opened ? "Hide" : "Show"} Keyboard Shortcuts</Button>
      <Collapse in={opened}>
        <Table
          withColumnBorders
          withTableBorder
          mt="xs"
          style={{
            tableLayout: "fixed",
          }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Keybinding</Table.Th>
              <Table.Th>Scope</Table.Th>
              <Table.Th>Action</Table.Th>
              <Table.Th
                style={{
                  width: "80px",
                }}
              />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {keybindings.map((keybinding) => {
              return (
                <Table.Tr key={keybinding.id}>
                  <Table.Td py={0}>
                    <Grid>
                      <Grid.Col
                        span={11}
                        style={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Text component="div">
                          {keybinding.key !== "" ? (
                            <Code>{keybinding.key}</Code>
                          ) : keylistening === keybinding.id ? (
                            keys.size > 0 ? (
                              <Code>{Array.from(keys).join("+")}...</Code>
                            ) : (
                              <Text size="sm" c="dimmed">
                                Press a key combo...
                              </Text>
                            )
                          ) : (
                            <Text size="sm" c="dimmed">
                              None
                            </Text>
                          )}
                        </Text>
                      </Grid.Col>
                      <Grid.Col
                        span={1}
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                        }}
                      >
                        {keyEditing === keybinding.id && (
                          <ActionIcon
                            variant="transparent"
                            c="gray"
                            onClick={() => {
                              if (keylistening === keybinding.id) {
                                saveKey(keybinding.id, Array.from(keys).join("+"));

                                setKeylistening("");
                                stop();
                              } else {
                                saveKey(keybinding.id, "");

                                setKeylistening(keybinding.id);
                                start();
                              }
                            }}
                          >
                            {keylistening === keybinding.id ? (
                              <IconKeyframeFilled />
                            ) : (
                              <IconKeyframe />
                            )}
                          </ActionIcon>
                        )}
                      </Grid.Col>
                    </Grid>
                  </Table.Td>

                  <Table.Td
                    style={{
                      height: 51, // Prevents the height from changing when the select is shown
                    }}
                  >
                    {keyEditing === keybinding.id ? (
                      <Select
                        searchable
                        data={Scopes}
                        defaultValue={keybinding.scope}
                        allowDeselect={false}
                        onChange={(value) => saveScope(keybinding.id, value as Scope)}
                      />
                    ) : (
                      <Text size="sm" c="dimmed">
                        {keybinding.scope}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {keyEditing === keybinding.id ? (
                      <Select
                        searchable
                        data={getActions(keybinding.scope)}
                        defaultValue={keybinding.action}
                        allowDeselect={false}
                        onChange={(value) => saveAction(keybinding.id, value as string)}
                      />
                    ) : (
                      <Text size="sm" c="dimmed">
                        {keybinding.action}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td
                    py={0}
                    style={{
                      width: "80px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <ActionIcon
                        variant="transparent"
                        c="gray"
                        onClick={() => {
                          if (keyEditing === keybinding.id) {
                            setKeyEditing("");
                          } else {
                            setKeyEditing(keybinding.id);
                          }
                        }}
                      >
                        {keyEditing === keybinding.id ? <IconDeviceFloppy /> : <IconPencil />}
                      </ActionIcon>
                      {keyEditing === keybinding.id && (
                        <ActionIcon
                          variant="transparent"
                          c="red"
                          onClick={() => deleteKeybinding(keybinding.id)}
                        >
                          <IconTrash />
                        </ActionIcon>
                      )}
                    </div>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
          <Table.Caption>
            <Button
              leftSection={<IconPlus />}
              variant="subtle"
              size="compact-sm"
              onClick={() => {
                setKeybindings((draft) => {
                  draft.push({
                    id: crypto.randomUUID(),
                    key: "",
                    action: "None",
                    scope: "None",
                  });
                });
              }}
            >
              Add Keybinding
            </Button>
          </Table.Caption>
        </Table>
      </Collapse>
    </>
  );
}
