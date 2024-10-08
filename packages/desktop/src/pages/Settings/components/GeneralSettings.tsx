import { CHIPS_STATE, KEYBINDINGS_STATE, SETTINGS_STATE } from "@/Root";
import { Scope, Scopes, getActions } from "@/types/Keybindings";
import { VISUAL_FOCUS_TARGETS, VisualFocusTarget } from "@/types/Settings";
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
  IconCalculator,
  IconCalculatorOff,
  IconCurrencyDollar,
  IconDeviceFloppy,
  IconEar,
  IconEarOff,
  IconEye,
  IconEyeOff,
  IconHandFinger,
  IconHandFingerOff,
  IconKeyframe,
  IconKeyframeFilled,
  IconLayoutColumns,
  IconLayoutGrid,
  IconPencil,
  IconPlus,
  IconTrash,
  IconTrashOff,
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

  const [wasTouchscreenMenuOn, setWasTouchscreenMenuOn] = useState(settings.touchscreenMenu);
  const [wasCameraMenuOn, setWasCameraMenuOn] = useState(settings.cameraMenu);

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
            disabled={opened}
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
        label="Show Calculator"
        description="Displays a simple calculator in the touchscreen menu for quick multiplications"
        mt="sm"
      >
        <ButtonGroup mt={5}>
          <Button
            disabled={opened}
            variant={settings?.touchscreenMenuCalculator ? "filled" : "default"}
            leftSection={<IconCalculator />}
            onClick={() => {
              setSettings({ ...settings, touchscreenMenuCalculator: true });
            }}
          >
            On
          </Button>
          <Button
            variant={!settings?.touchscreenMenuCalculator ? "filled" : "default"}
            leftSection={<IconCalculatorOff />}
            onClick={() => {
              setSettings({ ...settings, touchscreenMenuCalculator: false });
            }}
          >
            Off
          </Button>
        </ButtonGroup>
      </Input.Wrapper>
      <Input.Wrapper
        label="Auto Clear Touchscreen Chip Total"
        description={`When the Bet/Raise/Set Balance keybinding is used, should the chip total be cleared?`}
        mt="sm"
      >
        <ButtonGroup mt={5}>
          <Button
            variant={settings.autoClearChipTotal ? "filled" : "default"}
            leftSection={<IconTrash />}
            onClick={() => {
              setSettings({ ...settings, autoClearChipTotal: true });
            }}
          >
            Clear
          </Button>
          <Button
            variant={!settings.autoClearChipTotal ? "filled" : "default"}
            leftSection={<IconTrashOff />}
            onClick={() => {
              setSettings({ ...settings, autoClearChipTotal: false });
            }}
          >
            Keep
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
        mb="xl"
        label="Touchscreen Menu Chips Columns"
        description="Columns of chips in the touchscreen menu"
        mt="sm"
      >
        <Slider
          mt="xs"
          defaultValue={settings.touchscreenMenuChipsColumns}
          min={1}
          max={10}
          step={1}
          marks={[
            {
              label: "1",
              value: 1,
            },
            {
              label: "2",
              value: 2,
            },
            {
              label: "3",
              value: 3,
            },
            {
              label: "4",
              value: 4,
            },
            {
              label: "5",
              value: 5,
            },
            {
              label: "6",
              value: 6,
            },
            {
              label: "7",
              value: 7,
            },
            {
              label: "8",
              value: 8,
            },
            {
              label: "9",
              value: 9,
            },
            {
              label: "10",
              value: 10,
            },
          ]}
          onChangeEnd={(value) => {
            setSettings({ ...settings, touchscreenMenuChipsColumns: value });
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
        <Text size="xs" c="red" mt={2} mb={2}>
          Refresh the page after changing chips to prevent issues
        </Text>
        <Table
          withColumnBorders
          withTableBorder
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
                <Table.Tr key={chip.id}>
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
                    id: crypto.randomUUID(),
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
      <Input.Wrapper
        label="TTS Enabled"
        description="TTS is experimental and may not work as expected"
        mt="sm"
      >
        <ButtonGroup mt={5}>
          <Button
            variant={settings.tts ? "filled" : "default"}
            leftSection={<IconEar />}
            onClick={() => {
              setSettings({ ...settings, tts: true });
            }}
          >
            On
          </Button>
          <Button
            variant={!settings.tts ? "filled" : "default"}
            leftSection={<IconEarOff />}
            onClick={() => {
              setSettings({ ...settings, tts: false });
            }}
          >
            Off
          </Button>
        </ButtonGroup>
      </Input.Wrapper>
      <Input.Wrapper mb="xl" label="TTS Volume" mt="sm">
        <Slider
          mt="xs"
          defaultValue={settings.ttsVolume}
          min={0}
          max={1}
          step={0.05}
          marks={[
            {
              label: "0",
              value: 0,
            },
            {
              label: "0.5",
              value: 0.5,
            },
            {
              label: "1",
              value: 1,
            },
          ]}
          onChangeEnd={(value) => {
            setSettings({ ...settings, ttsVolume: value });
          }}
        />
      </Input.Wrapper>
      <Input.Wrapper mb="xl" label="TTS Rate" mt="sm">
        <Slider
          mt="xs"
          defaultValue={settings.ttsRate}
          min={0.1}
          max={2}
          step={0.05}
          marks={[
            {
              label: "0",
              value: 0,
            },
            {
              label: "0.5",
              value: 0.5,
            },
            {
              label: "1",
              value: 1,
            },
            {
              label: "1.5",
              value: 1.5,
            },
            {
              label: "2",
              value: 2,
            },
          ]}
          onChangeEnd={(value) => {
            setSettings({ ...settings, ttsRate: value });
          }}
        />
      </Input.Wrapper>
      <Input.Wrapper mb="xl" label="TTS Pitch" mt="sm">
        <Slider
          mt="xs"
          defaultValue={settings.ttsPitch}
          min={0}
          max={2}
          step={0.05}
          marks={[
            {
              label: "0",
              value: 0,
            },
            {
              label: "1",
              value: 1,
            },
            {
              label: "2",
              value: 2,
            },
          ]}
          onChangeEnd={(value) => {
            setSettings({ ...settings, ttsPitch: value });
          }}
        />
      </Input.Wrapper>
      <Input.Wrapper mb="sm" label="TTS Voice" mt="sm">
        <Select
          data={[...new Set(window.speechSynthesis.getVoices().map((voice) => voice.name))]}
          defaultValue={settings.ttsVoice}
          clearable={false}
          allowDeselect={false}
          placeholder={settings.ttsVoice !== "" ? settings.ttsVoice : "Select a voice"}
          onChange={(value) => {
            setSettings({ ...settings, ttsVoice: value as string });
          }}
        />
      </Input.Wrapper>

      <Input.Wrapper
        mb="sm"
        label="Selector Visual Focus"
        mt="sm"
        description="When a hotkey selector is enabled, should other elements be dimmed? This has no effect on hotkey scoping and is purely visual."
      >
        <Select
          label="Selector A"
          data={VISUAL_FOCUS_TARGETS}
          defaultValue={settings.selectorAVisualFocus}
          clearable={false}
          allowDeselect={false}
          placeholder={settings.selectorAVisualFocus}
          onChange={(value) => {
            setSettings({ ...settings, selectorAVisualFocus: value as VisualFocusTarget });
          }}
        />
        <Select
          label="Selector B"
          data={VISUAL_FOCUS_TARGETS}
          defaultValue={settings.selectorBVisualFocus}
          clearable={false}
          allowDeselect={false}
          placeholder={settings.selectorBVisualFocus}
          onChange={(value) => {
            setSettings({ ...settings, selectorBVisualFocus: value as VisualFocusTarget });
          }}
        />
      </Input.Wrapper>

      <Button
        onClick={() => {
          // Hide the touchscreen and camera menu to prevent issues with keybinding hooks
          if (opened) {
            setSettings({
              ...settings,
              touchscreenMenu: wasTouchscreenMenuOn,
              cameraMenu: wasCameraMenuOn,
            });
          } else {
            setWasTouchscreenMenuOn(settings.touchscreenMenu);
            setWasCameraMenuOn(settings.cameraMenu);
            setSettings({ ...settings, touchscreenMenu: false, cameraMenu: false });
          }

          toggle();
        }}
      >
        {opened ? "Hide" : "Show"} Keybindings Editor
      </Button>
      <Collapse in={opened}>
        {(wasCameraMenuOn || wasTouchscreenMenuOn) && (
          <Text fw="bold" c="red" ta="center" size="xs" mt="xs">
            The {wasCameraMenuOn && "Camera Menu"}
            {wasCameraMenuOn && wasTouchscreenMenuOn && " and the "}
            {wasTouchscreenMenuOn && "Touchscreen Menu"}{" "}
            {wasCameraMenuOn && wasTouchscreenMenuOn ? "were" : "was"} hidden to prevent issues with
            keybindings. {wasCameraMenuOn && wasTouchscreenMenuOn ? "They" : "It"} will be restored
            when you close the keybindings editor.
          </Text>
        )}
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
                        data={getActions(keybinding.scope, chips)}
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
