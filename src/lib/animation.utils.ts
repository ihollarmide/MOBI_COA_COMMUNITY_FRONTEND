import { domMax } from "motion/react";

export const fade = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

export const transition = {
  ease: "linear",
  duration: 0.5,
  type: "tween",
};

export default domMax;
