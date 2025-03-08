"use client";

import Confetti from "react-confetti-boom";

export function FatturaConfetti() {
  return (
    <Confetti
      particleCount={350}
      spreadDeg={100}
      y={0.3}
      launchSpeed={1.5}
    />
  );
}
