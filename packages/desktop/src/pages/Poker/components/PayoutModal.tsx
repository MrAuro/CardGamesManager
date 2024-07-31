import { CHIP_BREAKDOWN_AMOUNT, CHIP_BREAKDOWN_OPEN } from "@/components/ChipBreakdown";
import { formatMoney } from "@/utils/MoneyHelper";
import {
  Container,
  darken,
  Divider,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useRecoilState, useRecoilValue } from "recoil";
import { LAST_POT, PAYOUT_MODAL_OPEN } from "../routes/Round";
import { getPlayer } from "@/utils/PlayerHelper";
import { PLAYERS_STATE } from "@/Root";
import { modals } from "@mantine/modals";

export default function PayoutModal() {
  const [, setChipBreakdownAmount] = useRecoilState(CHIP_BREAKDOWN_AMOUNT);
  const [, setChipBreakdownOpen] = useRecoilState(CHIP_BREAKDOWN_OPEN);
  const lastPot = useRecoilValue(LAST_POT);
  const [modelOpen, setModelOpen] = useRecoilState(PAYOUT_MODAL_OPEN);
  const theme = useMantineTheme();

  const players = useRecoilValue(PLAYERS_STATE);

  return (
    <Modal
      title="Pot Distribution"
      id="payout-modal"
      opened={modelOpen}
      onClose={() => {
        setModelOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          modals.close("payout-modal");
        }

        // Prevent keybindings from being triggered
        event.stopPropagation();
      }}
    >
      <>
        <Stack>
          {Object.entries(lastPot).map(([potNumber, results]) => {
            return (
              <Container mx={0} px={0}>
                <Divider
                  my={3}
                  label={potNumber == "0" ? "Main Pot" : `Side Pot ${potNumber}`}
                  labelPosition="left"
                  styles={{
                    label: {
                      fontSize: 14,
                      fontWeight: 600,
                    },
                  }}
                />
                {Object.entries(results).map(([playerId, amount]) => {
                  let player = getPlayer(playerId, players);
                  if (!player) return "Player not found";
                  return (
                    <Paper
                      py={4}
                      px={6}
                      key={playerId}
                      radius="md"
                      style={{
                        backgroundColor: darken(theme.colors.dark[6], 0.2),
                      }}
                    >
                      <Group justify="space-between">
                        <Text>{player.name}</Text>

                        <Text
                          c="green"
                          fw={600}
                          style={{
                            cursor: "pointer",
                          }}
                          title="View chip breakdown"
                          onClick={() => {
                            setChipBreakdownOpen(true);
                            setChipBreakdownAmount(amount);
                            setModelOpen(false);
                          }}
                        >
                          +{formatMoney(amount)}
                        </Text>
                      </Group>
                    </Paper>
                  );
                })}
              </Container>
            );
          })}
        </Stack>
      </>
    </Modal>
  );
}
