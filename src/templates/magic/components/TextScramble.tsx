"use client";

import React, { useState, useEffect, useCallback } from "react";

interface TextScrambleProps {
  text: string;
  className?: string;
  characterSet?: string;
  speed?: number;
  triggerOnHover?: boolean;
}

const DEFAULT_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

export function TextScramble({
  text,
  className = "",
  characterSet = DEFAULT_CHARS,
  speed = 28,
  triggerOnHover = true,
}: TextScrambleProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);

  const scramble = useCallback(() => {
    if (isScrambling) return;
    setIsScrambling(true);

    let iteration = 0;
    const maxIterations = text.length * 2;

    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < iteration / 2) {
              return text[index];
            }
            return characterSet[Math.floor(Math.random() * characterSet.length)];
          })
          .join("")
      );

      iteration++;

      if (iteration >= maxIterations) {
        clearInterval(interval);
        setDisplayText(text);
        setIsScrambling(false);
      }
    }, speed);
  }, [text, characterSet, speed, isScrambling]);

  useEffect(() => {
    setDisplayText(text);
  }, [text]);

  return (
    <span
      onMouseEnter={triggerOnHover ? scramble : undefined}
      className={`inline-block cursor-default select-none ${className}`}
    >
      {displayText}
    </span>
  );
}
