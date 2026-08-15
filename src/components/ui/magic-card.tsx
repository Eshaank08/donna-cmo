"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";

import { cn } from "@/lib/utils";

interface MagicCardProps {
  children?: React.ReactNode;
  className?: string;
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
}

export function MagicCard({
  children,
  className,
  gradientSize = 200,
  gradientColor = "var(--color-border)",
  gradientOpacity = 0.6,
}: MagicCardProps) {
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);
  const [visible, setVisible] = useState(false);

  const reset = useCallback(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
    setVisible(false);
  }, [mouseX, mouseY, gradientSize]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
      setVisible(true);
    },
    [mouseX, mouseY]
  );

  useEffect(() => {
    const handleBlur = () => reset();
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [reset]);

  const smoothX = useSpring(mouseX, { stiffness: 250, damping: 30 });
  const smoothY = useSpring(mouseY, { stiffness: 250, damping: 30 });

  return (
    <motion.div
      className={cn(
        "group relative isolate overflow-hidden rounded-[inherit] border border-border",
        className
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
    >
      {visible && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background: useMotionTemplate`
              radial-gradient(${gradientSize}px circle at ${smoothX}px ${smoothY}px,
                ${gradientColor},
                transparent 100%
              )
            `,
            opacity: gradientOpacity,
          }}
        />
      )}
      <div className="relative z-20">{children}</div>
    </motion.div>
  );
}
