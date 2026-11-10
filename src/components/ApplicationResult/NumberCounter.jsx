import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect } from "react";

// A number that counts up from 0 to its value. If the person wants less motion, it just shows the value.
export default function NumberCounter({ value, formatValue = String }) {
  const shouldReduceMotion = useReducedMotion();
  const runningNumber = useMotionValue(0);
  const runningText = useTransform(runningNumber, formatValue);

  useEffect(() => {
    if (shouldReduceMotion) return;
    return animate(runningNumber, value, { duration: 0.9 }).stop; // 0.9 seconds
  }, [value, shouldReduceMotion, runningNumber]);

  if (shouldReduceMotion) return <span>{formatValue(value)}</span>;
  return <motion.span>{runningText}</motion.span>;
}
