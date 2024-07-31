import { CHIPS_STATE } from "@/Root";
import { formatMoney } from "@/utils/MoneyHelper";
import { Stack, Flex, ColorSwatch, Badge, Text } from "@mantine/core";
import { atom, useRecoilState, useRecoilValue } from "recoil";
import { MONOSPACE } from "./TouchscreenMenu";
import { Chip } from "@/types/Settings";
import { useEffect, useState } from "react";
import { UUID } from "crypto";

export const CHIP_BREAKDOWN_OPEN = atom<boolean>({
  key: "CHIP_BREAKDOWN_OPEN",
  default: false,
});

export const CHIPS_CHECKED = atom<Record<UUID, boolean>>({
  key: "CHIPS_CHECKED",
  default: {},
});

export const CHIP_BREAKDOWN_AMOUNT = atom<number>({
  key: "CHIP_BREAKDOWN_AMOUNT",
  default: 0,
});

const REMAINING: UUID = "remaining" as UUID;

export default function ChipBreakdown() {
  const chips = useRecoilValue(CHIPS_STATE);
  const chipBreakdownOpen = useRecoilValue(CHIP_BREAKDOWN_OPEN);
  const [chipChecked, setChipChecked] = useRecoilState(CHIPS_CHECKED);
  const [amount] = useRecoilState(CHIP_BREAKDOWN_AMOUNT);

  const [chipBreakdown, setChipBreakdown] = useState<{ [key: UUID]: number }>({});

  useEffect(() => {
    for (const chip of chips) {
      if (chipChecked[chip.id] === undefined) {
        setChipChecked({ ...chipChecked, [chip.id]: true });
      }
    }
  }, [chipChecked]);

  useEffect(() => {
    setChipBreakdown(
      getChipBreakdown(
        chips.filter((chip) => chipChecked[chip.id]),
        amount
      )
    );
  }, [chipChecked, chipBreakdownOpen, amount, chips]);

  return (
    <>
      <Stack>
        <Text size="lg" fw="bold">
          {formatMoney(amount)}
        </Text>
        {chips.map((chip) => {
          return (
            <Flex direction="row" gap="xs" align="center" key={chip.id}>
              <ColorSwatch
                color={chip.color}
                component="button"
                size={50}
                style={{
                  opacity: chipChecked[chip.id] ? 1 : 0.1,
                  cursor: "pointer",
                }}
                onClick={() => {
                  setChipChecked({
                    ...chipChecked,
                    [chip.id]: !chipChecked[chip.id],
                  });
                }}
              >
                <Badge
                  autoContrast
                  color={chip.color}
                  p={0}
                  size="xl"
                  td={chipChecked[chip.id] ? undefined : "line-through"}
                >
                  {formatMoney(chip.denomination, true, true)}
                </Badge>
              </ColorSwatch>
              <Text size="xl" style={{ fontFamily: MONOSPACE }}>
                {chipBreakdown[chip.id] &&
                  `${chipBreakdown[chip.id]} (${formatMoney(
                    chip.denomination * chipBreakdown[chip.id]
                  )})`}
              </Text>
            </Flex>
          );
        })}
        {chipBreakdown[REMAINING] ? (
          <Text>
            Could not break down remaining {formatMoney(chipBreakdown[REMAINING], true, true)}
          </Text>
        ) : null}
      </Stack>
    </>
  );
}

function getChipBreakdown(chips: Chip[], amount: number): { [key: string]: number } {
  const sortedChips = chips.sort((a, b) => b.denomination - a.denomination);
  const breakdown: { [key: UUID]: number } = {};
  let remaining = amount;
  sortedChips.forEach((chip) => {
    breakdown[chip.id] = Math.floor(remaining / chip.denomination);
    remaining -= breakdown[chip.id] * chip.denomination;
  });

  if (remaining > 0) {
    breakdown[REMAINING] = remaining;
  }
  return breakdown;
}
