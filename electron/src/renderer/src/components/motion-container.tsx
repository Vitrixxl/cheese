import { motion as m } from "motion/react";
export default function MotionContainer({
  children,
  from,
  delay,
}: React.PropsWithChildren<{
  delay: number;
  from: "top" | "bottom" | "left" | "right";
  className?: string;
}>) {
  return (
    <m.div
      initial={{
        x: from == "left" ? -30 : from == "right" ? 30 : 0,
        y: from == "top" ? -30 : from == "bottom" ? 30 : 0,
      }}
      animate={{
        x: 0,
        y: 0,
      }}
      transition={{
        delay,
      }}
    >
      {children}
    </m.div>
  );
}
