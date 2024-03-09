import { Card, Group, Text, rem } from "@mantine/core";

export default function GenericPlayerCard({
  header,
  subtext,
  rightSection,
  children,
  backgroundColor,
}: {
  header: string;
  subtext?: string;
  rightSection?: JSX.Element;
  children?: JSX.Element[] | JSX.Element;
  backgroundColor?: string;
}) {
  return (
    <Card
      withBorder
      radius="md"
      key={""}
      pt="xs"
      pb="xs"
      style={{
        backgroundColor: backgroundColor ? backgroundColor : undefined,
      }}
    >
      <Group justify="space-between">
        <div>
          <Text size="xl" fw="bold">
            {header}
          </Text>

          {subtext ? (
            <Text size="sm" c="dimmed">
              {subtext}
            </Text>
          ) : null}
        </div>
        {rightSection && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              width: "80%",
            }}
          >
            {rightSection}
          </div>
        )}
      </Group>
      {children}
    </Card>
  );
}
