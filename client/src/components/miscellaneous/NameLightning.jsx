import React from "react";
import { motion } from "framer-motion";

const NameLightning = ({ boxShadow }) => {
  return (
    <motion.div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        background: "transparent", // Set background to transparent
        pointerEvents: "none",
        borderRadius: "10px",
      }}
      animate={{ opacity: [0.6, 1.3, 0.6] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      {/* Boundary with shadow */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "10px",
          boxShadow: boxShadow, // Add shadow
          boxSizing: "border-box", // Ensure boundary remains within dimensions
        }}
      ></div>
    </motion.div>
  );
};

export default NameLightning;
