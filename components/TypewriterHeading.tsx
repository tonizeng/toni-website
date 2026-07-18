"use client";

import { useEffect, useState } from "react";

export default function TypewriterHeading({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [chars, setChars] = useState(0);

  useEffect(() => {
    setChars(0);
    const id = setInterval(() => {
      setChars((c) => {
        if (c >= text.length) {
          clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, 80);
    return () => clearInterval(id);
  }, [text]);

  const done = chars >= text.length;

  return (
    <h1 className={className}>
      {text.slice(0, chars)}
      {!done && <span className="animate-pulse">|</span>}
    </h1>
  );
}
