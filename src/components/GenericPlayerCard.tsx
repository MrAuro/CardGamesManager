import { Card, Group, Text } from "@mantine/core";

export default function GenericPlayerCard({
  header,
  subtext,
  subsection,
  rightSection,
  children,
  backgroundColor,
  styles,
}: {
  header: string;
  subtext?: string;
  subsection?: JSX.Element[] | JSX.Element;
  rightSection?: JSX.Element;
  children?: JSX.Element[] | JSX.Element;
  backgroundColor?: string;
  styles?: any;
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
        ...styles,
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
          {subsection}
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
