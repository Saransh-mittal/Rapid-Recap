import React from "react";
import { motion } from "framer-motion";
import TitansFrame from "/images/TitansFrame.png";
import { Image } from "@chakra-ui/react";

const NameLightning = ({ boxShadow, MAX_IQ }) => {
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
      animate={{ opacity: [0.6, 1.5, 0.6] }}
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
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {MAX_IQ >= 150 && (
          <Image
            src={TitansFrame}
            position={"absolute"}
            background={"transparent"}
            height={"200%"}
            minW={"115%"}
          />
        )}
      </div>
    </motion.div>
  );
};

export default NameLightning;
