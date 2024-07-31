import { Card, Group, MantineStyleProp, Text } from "@mantine/core";

export default function GenericPlayerCard({
  header,
  subtext,
  subsection,
  rightSection,
  children,
  backgroundColor,
  styles,
  onClick,
}: {
  header: string | JSX.Element;
  subtext?: string;
  subsection?: JSX.Element[] | JSX.Element;
  rightSection?: JSX.Element;
  children?: JSX.Element[] | JSX.Element;
  backgroundColor?: string;
  styles?: MantineStyleProp;
  onClick?: () => void;
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
      onClick={onClick}
    >
      <Group justify="space-between">
        <div
          style={{
            userSelect: "none",
          }}
        >
          {typeof header === "string" ? (
            <Text size="xl" fw="bold">
              {header}
            </Text>
          ) : (
            header
          )}

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
              width: "75%",
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
