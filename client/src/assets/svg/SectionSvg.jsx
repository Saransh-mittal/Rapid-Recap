import React from "react";
import { Box } from "@chakra-ui/react";
import PlusSvg from "./PlusSvg";

const SectionSvg = ({ crossesOffset }) => {
  return (
    <>
      <Box
        as={PlusSvg}
        className={`pointer-events-none`}
        display={{ base: "none", lg: "block" }}
        position="absolute"
        top="-0.3125rem"
        left={{ base: "4", lg: "6", xl: "9" }}
        transform={crossesOffset ? crossesOffset : undefined}
      />

      <Box
        as={PlusSvg}
        className={`pointer-events-none`}
        display={{ base: "none", lg: "block" }}
        position="absolute"
        top="-0.3125rem"
        right={{ base: "4", lg: "6", xl: "9" }}
        transform={crossesOffset ? crossesOffset : undefined}
      />
    </>
  );
};

export default SectionSvg;
