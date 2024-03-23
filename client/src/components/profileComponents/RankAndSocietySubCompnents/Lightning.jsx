import React from "react";
import { motion } from "framer-motion";

const Lightning = () => {
  return (
    <motion.div
      style={{
        position: "absolute",
        width: "100px",
        height: "100px",
        background:
          "radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 70%)",
        borderRadius: "50%",
        pointerEvents: "none",
      }}
      animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 1] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  );
};

export default Lightning;
