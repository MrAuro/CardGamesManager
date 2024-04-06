import { CHIPS_STATE, KEYBINDINGS_STATE, SETTINGS_STATE } from "@/Root";
import { Scope, Scopes, getActions } from "@/types/Keybindings";
import { useRecoilImmerState } from "@/utils/RecoilImmer";
import {
  ActionIcon,
  Button,
  ButtonGroup,
  Code,
  Collapse,
  ColorInput,
  Grid,
  Input,
  InputWrapper,
  NumberInput,
  Select,
  Slider,
  Table,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconCash,
  IconCurrencyDollar,
  IconDeviceFloppy,
  IconEye,
  IconEyeOff,
  IconHandFinger,
  IconHandFingerOff,
  IconKeyframe,
  IconKeyframeFilled,
  IconLayoutColumns,
  IconLayoutGrid,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftCollapseFilled,
  IconLayoutSidebarRightCollapseFilled,
  IconPencil,
  IconPlus,
  IconPokerChip,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import { useRecordHotkeys } from "react-hotkeys-hook";
import { useRecoilState } from "recoil";

export default function GeneralSettings() {
  const [settings, setSettings] = useRecoilState(SETTINGS_STATE);
  const [keybindings, setKeybindings] = useRecoilImmerState(KEYBINDINGS_STATE);
  const [chips, setChips] = useRecoilImmerState(CHIPS_STATE);

  const theme = useMantineTheme();

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
      <Input.Wrapper
        label="Enable Touchscreen Menu"
        description="Displays a menu of the right side of the screen with helpful actions"
        mt="sm"
      >
        <ButtonGroup mt={5}>
          <Button
            variant={settings?.touchscreenMenu ? "filled" : "default"}
            leftSection={<IconHandFinger />}
            onClick={() => {
              setSettings({ ...settings, touchscreenMenu: true });
            }}
          >
            On
          </Button>
          <Button
            variant={!settings?.touchscreenMenu ? "filled" : "default"}
            leftSection={<IconHandFingerOff />}
            onClick={() => {
              setSettings({ ...settings, touchscreenMenu: false });
            }}
          >
            Off
          </Button>
        </ButtonGroup>
      </Input.Wrapper>

      <Input.Wrapper
        label="Touchscreen Menu Position"
        description="Should the menu be on the left or right side of the screen"
        mt="sm"
      >
        <ButtonGroup mt={5}>
          <Button
            variant={settings.touchscreenMenuPosition == "left" ? "filled" : "default"}
            leftSection={<IconLayoutSidebarLeftCollapseFilled />}
            onClick={() => {
              setSettings({ ...settings, touchscreenMenuPosition: "left" });
            }}
          >
            Left
          </Button>
          <Button
            variant={settings.touchscreenMenuPosition == "right" ? "filled" : "default"}
            leftSection={<IconLayoutSidebarRightCollapseFilled />}
            onClick={() => {
              setSettings({ ...settings, touchscreenMenuPosition: "right" });
            }}
          >
            Right
          </Button>
        </ButtonGroup>
      </Input.Wrapper>
      <Input.Wrapper
        mb="xl"
        label="Touchscreen Menu Width"
        description="Certain UI elements may look weird at low and high percents"
        mt="sm"
      >
        <Slider
          mt="xs"
          defaultValue={settings.touchscreenMenuWidth}
          min={15}
          max={85}
          step={5}
          marks={[
            {
              label: "15%",
              value: 15,
            },
            {
              label: "30%",
              value: 30,
            },
            {
              label: "45%",
              value: 45,
            },
            {
              label: "60%",
              value: 60,
            },
            {
              label: "75%",
              value: 75,
            },
            {
              label: "85%",
              value: 85,
            },
          ]}
          onChangeEnd={(value) => {
            setSettings({ ...settings, touchscreenMenuWidth: value });
          }}
        />
      </Input.Wrapper>
      <Input.Wrapper
        label="Four Color Deck"
        description="Diamonds are blue and Clubs are green"
        mt="sm"
      >
        <ButtonGroup mt={5}>
          <Button
            variant={settings.fourColorDeck ? "filled" : "default"}
            leftSection={<IconLayoutGrid />}
            onClick={() => {
              setSettings({ ...settings, fourColorDeck: true });
            }}
          >
            On
          </Button>
          <Button
            variant={!settings.fourColorDeck ? "filled" : "default"}
            leftSection={<IconLayoutColumns />}
            onClick={() => {
              setSettings({ ...settings, fourColorDeck: false });
            }}
          >
            Off
          </Button>
        </ButtonGroup>
      </Input.Wrapper>

      <Input.Wrapper
        label="Poker Chips"
        description="Poker chips are only available when the Touchscreen menu is enabled"
        mt="sm"
      >
        <Table
          withColumnBorders
          withTableBorder
          mt="xs"
          style={{
            tableLayout: "fixed",
            width: "50%",
          }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Chip Color</Table.Th>
              <Table.Th>Denomination</Table.Th>
              <Table.Th
                style={{
                  width: "80px",
                }}
              ></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {chips.map((chip, index) => {
              return (
                <Table.Tr key={index}>
                  <Table.Td>
                    <ColorInput
                      defaultValue={chip.color}
                      format="hex"
                      withEyeDropper={false}
                      swatchesPerRow={5}
                      closeOnColorSwatchClick
                      swatches={[
                        theme.colors.gray[0],
                        theme.colors.red[8],
                        theme.colors.green[8],
                        theme.colors.blue[9],
                        theme.colors.dark[9],
                      ]}
                      onChangeEnd={(color) => {
                        setChips((draft) => {
                          draft[index].color = color;
                        });
                      }}
                    />
                  </Table.Td>
                  <Table.Td>
                    <NumberInput
                      radius="md"
                      allowNegative={false}
                      thousandSeparator=","
                      leftSection={<IconCurrencyDollar />}
                      placeholder="0"
                      value={chip.denomination}
                      decimalScale={2}
                      fixedDecimalScale
                      onChange={(value) =>
                        setChips((draft) => {
                          draft[index].denomination = parseFloat(`${value}`);
                        })
                      }
                    />
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
                        tabIndex={-1}
                        variant="transparent"
                        c="red"
                        onClick={() => {
                          setChips((draft) => {
                            draft.splice(index, 1);
                          });
                        }}
                      >
                        <IconTrash />
                      </ActionIcon>
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
                setChips((draft) => {
                  draft.push({
                    color: theme.colors.gray[0],
                    denomination: 0,
                  });
                });
              }}
            >
              Add Chip
            </Button>
          </Table.Caption>
        </Table>
      </Input.Wrapper>
      <Input.Wrapper
        mb="xl"
        label="UI Scale"
        description="Certain UI elements may look weird at low and high percents"
        mt="sm"
      >
        <Slider
          mt="xs"
          defaultValue={settings.scale}
          min={50}
          max={150}
          step={5}
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
          onChangeEnd={(value) => {
            setSettings({ ...settings, scale: value });
          }}
        />
      </Input.Wrapper>
      {/* <Text fw="bold">Keyboard Shortcuts</Text> */}
      <Button
        onClick={() => {
          setSettings({ ...settings, debug: !settings.debug });
        }}
        mr="sm"
      >
        {settings.debug ? "Close" : "Open"} DevTools
      </Button>
      <Button onClick={toggle}>{opened ? "Hide" : "Show"} Keybindings Editor</Button>
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
              <Table.Th>Selector</Table.Th>
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
                  <Table.Td>
                    {keyEditing === keybinding.id ? (
                      <Select
                        searchable
                        data={["A", "B", "None"]}
                        defaultValue={keybinding.selector}
                        allowDeselect={false}
                        onChange={(value) => {
                          setKeybindings((draft) => {
                            const index = draft.findIndex((kb) => kb.id === keybinding.id);
                            draft[index].selector = value as any;
                          });
                        }}
                      />
                    ) : (
                      <Text size="sm" c="dimmed">
                        {keybinding.selector}
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
                    selector: "None",
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
