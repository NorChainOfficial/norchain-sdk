"use client";

import React, { RefObject, useEffect, useId, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedBeamProps {
  readonly className?: string;
  readonly containerRef: RefObject<HTMLElement>;
  readonly fromRef: RefObject<HTMLElement>;
  readonly toRef: RefObject<HTMLElement>;
  readonly curvature?: number;
  readonly reverse?: boolean;
  readonly duration?: number;
  readonly delay?: number;
  readonly pathColor?: string;
  readonly pathWidth?: number;
  readonly pathOpacity?: number;
  readonly gradientStartColor?: string;
  readonly gradientStopColor?: string;
  readonly startXOffset?: number;
  readonly startYOffset?: number;
  readonly endXOffset?: number;
  readonly endYOffset?: number;
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = Math.random() * 3 + 4,
  delay = 0,
  pathColor = "gray",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "#3b82f6",
  gradientStopColor = "#8b5cf6",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}) => {
  const id = useId();
  const [pathD, setPathD] = useState("");
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updatePath = () => {
      if (containerRef.current && fromRef.current && toRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const fromRect = fromRef.current.getBoundingClientRect();
        const toRect = toRef.current.getBoundingClientRect();

        const startX =
          fromRect.left - containerRect.left + fromRect.width / 2 + startXOffset;
        const startY =
          fromRect.top - containerRect.top + fromRect.height / 2 + startYOffset;
        const endX =
          toRect.left - containerRect.left + toRect.width / 2 + endXOffset;
        const endY =
          toRect.top - containerRect.top + toRect.height / 2 + endYOffset;

        const controlPointX = startX + (endX - startX) / 2;
        const controlPointY = startY - curvature;

        const d = `M ${startX},${startY} Q ${controlPointX},${controlPointY} ${endX},${endY}`;
        setPathD(d);
        setSvgDimensions({
          width: containerRect.width,
          height: containerRect.height,
        });
      }
    };

    updatePath();

    const resizeObserver = new ResizeObserver(updatePath);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [
    containerRef,
    fromRef,
    toRef,
    curvature,
    startXOffset,
    startYOffset,
    endXOffset,
    endYOffset,
  ]);

  if (!pathD) return null;

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none absolute left-0 top-0 ${className || ""}`}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
    >
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
      />
      <path
        d={pathD}
        stroke={`url(#${id})`}
        strokeWidth={pathWidth}
        strokeOpacity="1"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor={gradientStartColor} stopOpacity="0" />
          <stop offset="50%" stopColor={gradientStartColor} />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={pathD}
        stroke={`url(#${id})`}
        strokeWidth={pathWidth}
        strokeLinecap="round"
        strokeDasharray="100%"
        strokeDashoffset={reverse ? "100%" : "-100%"}
        animate={{
          strokeDashoffset: reverse ? "-100%" : "100%",
        }}
        transition={{
          duration,
          delay,
          ease: "linear",
          repeat: Infinity,
          repeatDelay: 0,
        }}
      />
    </svg>
  );
};

interface CircleProps {
  readonly className?: string;
  readonly children?: React.ReactNode;
}

export const Circle = React.forwardRef<HTMLDivElement, CircleProps>(
  ({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={`z-10 flex items-center justify-center rounded-full bg-white shadow-lg ${
          className || ""
        }`}
      >
        {children}
      </div>
    );
  }
);

Circle.displayName = "Circle";
