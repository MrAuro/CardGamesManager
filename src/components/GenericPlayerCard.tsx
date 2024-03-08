import { Card, Group, Text, rem } from "@mantine/core";

export default function GenericPlayerCard({
  header,
  subtext,
  rightSection,
  children,
}: {
  header: string;
  subtext?: string;
  rightSection?: JSX.Element;
  children?: JSX.Element[] | JSX.Element;
}) {
  return (
    <Card withBorder radius="md" key={""}>
      <Group justify="space-between">
        <div>
          <Text size={rem(22)} fw="bold">
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
