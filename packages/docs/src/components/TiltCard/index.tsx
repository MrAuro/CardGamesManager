import React, { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { Text, darken, Title, useMantineTheme, Center } from "@mantine/core";

const ROTATION_RANGE = 25;
const HALF_ROTATION_RANGE = 12.5;

// Thanks https://hover.dev/

export function TiltCard({
  feature,
}: {
  feature: {
    title: string;
    Svg: string;
    description: string;
  };
}) {
  const theme = useMantineTheme();

  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x);
  const ySpring = useSpring(y);

  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

  const [active, setActive] = React.useState(false);

  const handleMouseMove = (e) => {
    if (!ref.current) return [0, 0];

    const rect = ref.current.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = (e.clientX - rect.left) * ROTATION_RANGE;
    const mouseY = (e.clientY - rect.top) * ROTATION_RANGE;

    const rX = (mouseY / height - HALF_ROTATION_RANGE) * -1;
    const rY = mouseX / width - HALF_ROTATION_RANGE;

    x.set(rX);
    y.set(rY);

    setActive(true);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);

    setActive(false);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        // transformStyle: "preserve-3d",
        // transform,
        backgroundColor: darken(theme.colors.dark[6], 0.2),
        padding: "20px",
        borderRadius: theme.radius.xl,
        // border: "2px solid var(--mantine-color-dark-5)",
        userSelect: "none",
      }}
    >
      <div
        style={{
          transform: "translateZ(30px)",
        }}
      >
        <img
          src={feature.Svg}
          alt={feature.title}
          height="200px"
          width="200px"
          style={{
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      </div>

      <div
        style={{
          transform: "translateZ(35px)",
        }}
      >
        <Title order={4} ta="center" c="gray.3" mt="sm">
          {feature.title}
        </Title>
      </div>
      <p
        style={{
          color: "transparent",
          position: "absolute",
          top: 200,
          left: 0,
          right: 0,
          bottom: 0,
          padding: "20px",
          opacity: active ? 1 : 0,
          transition: "opacity 0.5s",
        }}
      >
        <Title order={4} ta="center" mt="sm">
          {feature.title}
        </Title>
      </p>
      <p
        style={{
          transform: "translateZ(40px)",
          position: "relative",
        }}
      >
        <Text ta="center" fw="light" size="md">
          {feature.description}
        </Text>
      </p>
      <p
        style={{
          color: "transparent",
          position: "absolute",
          top: 240,
          left: 0,
          right: 0,
          bottom: 0,
          padding: "20px",
          opacity: active ? 1 : 0,
          transition: "opacity 0.5s",
        }}
      >
        {" "}
        <Text ta="center" fw="light" size="md">
          {feature.description}
        </Text>
      </p>
    </motion.div>
  );
}
