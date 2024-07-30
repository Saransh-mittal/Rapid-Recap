import { Image, Box } from "@chakra-ui/react";
import gradient from "../../../assets/gradient.webp";
import PlusSvg from "../../../assets/svg/PlusSvg";

export const Gradient = ({ top, left, width }) => {
  return (
    <Box
      position="absolute"
      //   top="18.25rem"
      //   left="-30.375rem"
      top={top}
      left={left}
      //   width="56.625rem"
      width={width}
      opacity="0.6"
      mixBlendMode="color-dodge"
      pointerEvents="none"
    >
      <Box
        position="absolute"
        top="50%"
        left="50%"
        width="58.85rem"
        height="58.85rem"
        transform="translate(-75%, -50%)"
      >
        <Image
          src={gradient}
          width="942px"
          height="942px"
          alt="Gradient"
          bg={"transparent"}
        />
      </Box>
    </Box>
  );
};

export const BottomLine = () => {
  return (
    <>
      <Box
        display={{ base: "none", md: "block" }}
        position="absolute"
        bottom={0}
        left={{ base: "5", lg: "7", xl: "10" }}
        right={{ base: "5", lg: "7", xl: "10" }}
        h="1px"
        bg="gray.600"
        pointerEvents="none"
      />
      <Box
        display={{ base: "none", md: "block" }}
        as={PlusSvg}
        className={`pointer-events-none`}
        position="absolute"
        bottom={"-0.3rem"}
        left={{ base: "4", lg: "6", xl: "9" }}
      />

      <Box
        display={{ base: "none", md: "block" }}
        as={PlusSvg}
        className={`pointer-events-none`}
        position="absolute"
        bottom={"-0.3rem"}
        right={{ base: "4", lg: "6", xl: "9" }}
      />
    </>
  );
};
