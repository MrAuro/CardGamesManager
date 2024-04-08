import { CHIPS_STATE } from "@/Root";
import { formatMoney } from "@/utils/MoneyHelper";
import { Stack, Flex, ColorSwatch, Badge, Text } from "@mantine/core";
import { atom, useRecoilState, useRecoilValue } from "recoil";
import { MONOSPACE } from "./TouchscreenMenu";
import { Chip } from "@/types/Settings";
import { useEffect, useState } from "react";

export const CHIP_BREAKDOWN_OPEN = atom<boolean>({
  key: "CHIP_BREAKDOWN_OPEN",
  default: false,
});

export const CHIPS_CHECKED = atom<Record<string, boolean>>({
  key: "CHIPS_CHECKED",
  default: {},
});

export const CHIP_BREAKDOWN_AMOUNT = atom<number>({
  key: "CHIP_BREAKDOWN_AMOUNT",
  default: 0,
});

export default function ChipBreakdown() {
  const chips = useRecoilValue(CHIPS_STATE);
  const chipBreakdownOpen = useRecoilValue(CHIP_BREAKDOWN_OPEN);
  const [chipChecked, setChipChecked] = useRecoilState(CHIPS_CHECKED);
  const [amount] = useRecoilState(CHIP_BREAKDOWN_AMOUNT);

  const [chipBreakdown, setChipBreakdown] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    for (const chip of chips) {
      if (chipChecked[chip.color] === undefined) {
        setChipChecked({ ...chipChecked, [chip.color]: true });
      }
    }
  }, [chipChecked]);

  useEffect(() => {
    setChipBreakdown(
      getChipBreakdown(
        chips.filter((chip) => chipChecked[chip.color]),
        amount
      )
    );
  }, [chipChecked, chipBreakdownOpen, amount, chips]);

  return (
    <>
      <Stack>
        {chips.map((chip) => {
          return (
            <Flex direction="row" gap="xs" align="center" key={chip.color}>
              <ColorSwatch
                color={chip.color}
                component="button"
                size={50}
                style={{
                  opacity: chipChecked[chip.color] ? 1 : 0.1,
                  cursor: "pointer",
                }}
                onClick={() => {
                  setChipChecked({
                    ...chipChecked,
                    [chip.color]: !chipChecked[chip.color],
                  });
                }}
              >
                <Badge
                  autoContrast
                  color={chip.color}
                  p={0}
                  size="xl"
                  td={chipChecked[chip.color] ? undefined : "line-through"}
                >
                  {formatMoney(chip.denomination, true, true)}
                </Badge>
              </ColorSwatch>
              <Text size="xl" style={{ fontFamily: MONOSPACE }}>
                {chipBreakdown[chip.color] || ""}
              </Text>
            </Flex>
          );
        })}
        {chipBreakdown["Remaining"] ? (
          <Text>
            Could not break down remaining {formatMoney(chipBreakdown["Remaining"], true, true)}
          </Text>
        ) : null}
      </Stack>
    </>
  );
}

function getChipBreakdown(chips: Chip[], amount: number): { [key: string]: number } {
  const sortedChips = chips.sort((a, b) => b.denomination - a.denomination);
  const breakdown: { [key: string]: number } = {};
  let remaining = amount;
  sortedChips.forEach((chip) => {
    breakdown[chip.color] = Math.floor(remaining / chip.denomination);
    remaining -= breakdown[chip.color] * chip.denomination;
  });

  if (remaining > 0) {
    breakdown["Remaining"] = remaining;
  }
  return breakdown;
}
