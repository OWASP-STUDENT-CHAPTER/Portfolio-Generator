"use client";

import React, { createContext, useContext, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

interface DockProps {
  className?: string;
  children: React.ReactNode;
  magnification?: number;
  distance?: number;
}

interface DockIconProps {
  className?: string;
  children?: React.ReactNode;
  tooltip?: string;
  onClick?: () => void;
  href?: string;
}

const DEFAULT_MAGNIFICATION = 52;
const DEFAULT_DISTANCE = 90;
const BASE_SIZE = 38;
const BASE_ICON_SIZE = 18;
const ICON_SIZE_RATIO = 0.5;
const SPRING = { mass: 0.1, stiffness: 170, damping: 12 };

interface DockContextValue {
  mouseX: MotionValue<number>;
  magnification: number;
  distance: number;
}

const DockContext = createContext<DockContextValue | null>(null);

export function Dock({
  className,
  children,
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <DockContext.Provider value={{ mouseX, magnification, distance }}>
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className={cn(
          "mx-auto w-max h-12 p-1.5 flex items-center justify-center gap-2 overflow-visible rounded-full border border-border/60 bg-background/80 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/40",
          className
        )}
      >
        {children}
      </motion.div>
    </DockContext.Provider>
  );
}

export function DockIcon({
  className,
  children,
  tooltip,
  onClick,
  href,
}: DockIconProps) {
  const ref = useRef<HTMLDivElement>(null);
  const context = useContext(DockContext);

  if (!context) {
    throw new Error("DockIcon must be used within a Dock component");
  }

  const { mouseX, magnification, distance } = context;

  const distanceCalc = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const containerSize = useSpring(
    useTransform(distanceCalc, [-distance, 0, distance], [BASE_SIZE, magnification, BASE_SIZE]),
    SPRING
  );
  const iconSize = useSpring(
    useTransform(
      distanceCalc,
      [-distance, 0, distance],
      [BASE_ICON_SIZE, magnification * ICON_SIZE_RATIO, BASE_ICON_SIZE]
    ),
    SPRING
  );

  const content = (
    <motion.div
      ref={ref}
      style={{ width: containerSize, height: containerSize }}
      onClick={onClick}
      className={cn(
        "group relative flex aspect-square items-center justify-center rounded-full shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer select-none",
        className
      )}
    >
      {/* Tooltip */}
      {tooltip && (
        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-foreground text-background px-1.5 py-0.5 text-[10px] font-medium tracking-tight whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100 shadow-sm z-50">
          {tooltip}
        </span>
      )}

      <motion.div
        style={{ width: iconSize, height: iconSize }}
        className="flex items-center justify-center"
      >
        {children}
      </motion.div>
    </motion.div>
  );

  if (href) {
    const isExternal = href.startsWith("http") || href.startsWith("mailto:");
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="outline-none"
      >
        {content}
      </a>
    );
  }

  return content;
}
