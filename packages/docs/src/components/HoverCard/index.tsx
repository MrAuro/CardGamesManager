import React, { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { Card, darken, useMantineTheme } from "@mantine/core";

const ROTATION_RANGE = 25;
const HALF_ROTATION_RANGE = 12.5;

// Thanks https://hover.dev/
export function TiltCard({ children }: { children: React.ReactNode[] }) {
  const theme = useMantineTheme();

  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x);
  const ySpring = useSpring(y);

  const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

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
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        transform,
        backgroundColor: darken(theme.colors.dark[7], 0.2),
        padding: "20px",
        borderRadius: theme.radius.xl,
        outline: "1px solid var(--mantine-color-dark-6)",
        userSelect: "none",
      }}
    >
      <div
        style={{
          transform: "translateZ(12px)",
        }}
        className="mx-auto text-4xl"
      >
        {children[0]}
      </div>
      <div
        style={{
          transform: "translateZ(19px)",
        }}
      >
        {children[1]}
      </div>
      <p
        style={{
          transform: "translateZ(25px)",
        }}
        className="text-center text-2xl font-bold"
      >
        {children[2]}
      </p>
    </motion.div>
  );
}
