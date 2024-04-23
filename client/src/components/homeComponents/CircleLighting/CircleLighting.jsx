import React from "react";
import { motion } from "framer-motion";

const Lightning = () => {
  return (
    <motion.div
      style={{
        position: "absolute",
        width: "75px",
        height: "75px",
        background:
          "radial-gradient(circle, rgba(241,185,99,0.8) 0%, rgba(241,185,99,0) 70%)", // Changed background color to #f1b963
        borderRadius: "50%",
        pointerEvents: "none",
        boxShadow: "0 0 20px 5px rgba(241, 185, 99, 0.8)", // Changed box-shadow color to #f1b963
        animation: "shine 1.5s infinite", // Added animation for shine effect
      }}
      animate={{
        opacity: [0, 1, 0],
        scale: [1, 1.2, 1],
        rotate: [0, 30, -30, 0],
      }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  );
};

export default Lightning;
