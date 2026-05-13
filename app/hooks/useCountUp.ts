"use client";

import { useEffect, useState } from "react";

export default function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    const step = target / (duration / 16);
    const timer = window.setInterval(() => {
      setCount((previous) => {
        if (previous >= target) {
          window.clearInterval(timer);
          return target;
        }

        return Math.min(previous + step, target);
      });
    }, 16);

    return () => window.clearInterval(timer);
  }, [duration, target]);

  return Math.floor(count);
}
