import { useEffect, useState } from "react";
import { MouseParallax } from "react-just-parallax";
import { Box, Flex } from "@chakra-ui/react";
import PlusSvg from "../../../assets/svg/PlusSvg";

export const Gradient = () => {
  return (
    <>
      <Box
        position="relative"
        zIndex={1}
        h={6}
        mx={2.5}
        bg="n.11"
        shadow="xl"
        roundedBottom="1.25rem"
        lg={{ h: 6, mx: 8 }}
      />
      <Box
        position="relative"
        zIndex={1}
        h={6}
        mx={6}
        bg="rgba(0, 0, 0, 0.7)"
        shadow="xl"
        roundedBottom="1.25rem"
        lg={{ h: 6, mx: 20 }}
      />
    </>
  );
};

export const BottomLine = () => {
  return (
    <>
      <Box
        display={{ xl: "block", base: "none" }}
        position="absolute"
        top="55.25rem"
        left={10}
        right={10}
        h="0.25rem"
        bg="n.6"
        pointerEvents="none"
      />
      <Box
        display={{ xl: "block", base: "none" }}
        position="absolute"
        top="54.9375rem"
        left="2.1875rem"
        zIndex={2}
        pointerEvents="none"
      >
        <PlusSvg />
      </Box>
      <Box
        display={{ xl: "block", base: "none" }}
        position="absolute"
        top="54.9375rem"
        right="2.1875rem"
        zIndex={2}
        pointerEvents="none"
      >
        <PlusSvg />
      </Box>
    </>
  );
};

const Rings = () => {
  return (
    <>
      <Box
        position="absolute"
        top="50%"
        left="50%"
        w="65.875rem"
        aspectRatio="1"
        border="1px"
        borderColor="rgba(0, 0, 0, 0.1)"
        rounded="full"
        transform="translate(-50%, -50%)"
      />
      <Box
        position="absolute"
        top="50%"
        left="50%"
        w="51.375rem"
        aspectRatio="1"
        border="1px"
        borderColor="rgba(0, 0, 0, 0.1)"
        rounded="full"
        transform="translate(-50%, -50%)"
      />
      <Box
        position="absolute"
        top="50%"
        left="50%"
        w="36.125rem"
        aspectRatio="1"
        border="1px"
        borderColor="rgba(0, 0, 0, 0.1)"
        rounded="full"
        transform="translate(-50%, -50%)"
      />
      <Box
        position="absolute"
        top="50%"
        left="50%"
        w="23.125rem"
        aspectRatio="1"
        border="1px"
        borderColor="rgba(0, 0, 0, 0.1)"
        rounded="full"
        transform="translate(-50%, -50%)"
      />
    </>
  );
};

export const BackgroundCircles = ({ parallaxRef }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Box
      position="absolute"
      top={{ base: "-42.375rem", md: "-38.5rem", xl: "-32rem" }}
      left="50%"
      w="78rem"
      aspectRatio="1"
      border="1px"
      borderColor="rgba(0, 0, 0, 0.5)"
      rounded="full"
      transform="translateX(-50%)"
    >
      <Rings />

      <MouseParallax strength={0.07} parallaxContainerRef={parallaxRef}>
        <Box
          position="absolute"
          bottom="50%"
          left="50%"
          w="0.25rem"
          h="50%"
          transformOrigin="bottom"
          transform="rotate(46deg)"
        >
          <Box
            w="2"
            h="2"
            ml="-1"
            mt="-36"
            bgGradient="linear(to-b, #DD734F, #1A1A32)"
            rounded="full"
            transition="transform 0.5s ease-out, opacity 0.5s ease-out"
            transform={mounted ? "translateY(0)" : "translateY(10)"}
            opacity={mounted ? "1" : "0"}
          />
        </Box>

        <Box
          position="absolute"
          bottom="50%"
          left="50%"
          w="0.25rem"
          h="50%"
          transformOrigin="bottom"
          transform="rotate(-56deg)"
        >
          <Box
            w="4"
            h="4"
            ml="-1"
            mt="-32"
            bgGradient="linear(to-b, #DD734F, #1A1A32)"
            rounded="full"
            transition="transform 0.5s ease-out, opacity 0.5s ease-out"
            transform={mounted ? "translateY(0)" : "translateY(10)"}
            opacity={mounted ? "1" : "0"}
          />
        </Box>

        <Box
          position="absolute"
          bottom="50%"
          left="50%"
          w="0.25rem"
          h="50%"
          transformOrigin="bottom"
          transform="rotate(54deg)"
        >
          <Box
            display={{ xl: "block", base: "none" }}
            w="4"
            h="4"
            ml="-1"
            mt="12.9rem"
            bgGradient="linear(to-b, #B9AEDF, #1A1A32)"
            rounded="full"
            transition="transform 0.5s ease-out, opacity 0.5s ease-out"
            transform={mounted ? "translateY(0)" : "translateY(10)"}
            opacity={mounted ? "1" : "0"}
          />
        </Box>

        <Box
          position="absolute"
          bottom="50%"
          left="50%"
          w="0.25rem"
          h="50%"
          transformOrigin="bottom"
          transform="rotate(-65deg)"
        >
          <Box
            w="3"
            h="3"
            ml="-1.5"
            mt="52"
            bgGradient="linear(to-b, #B9AEDF, #1A1A32)"
            rounded="full"
            transition="transform 0.5s ease-out, opacity 0.5s ease-out"
            transform={mounted ? "translateY(0)" : "translateY(10)"}
            opacity={mounted ? "1" : "0"}
          />
        </Box>

        <Box
          position="absolute"
          bottom="50%"
          left="50%"
          w="0.25rem"
          h="50%"
          transformOrigin="bottom"
          transform="rotate(-85deg)"
        >
          <Box
            w="6"
            h="6"
            ml="-3"
            mt="-3"
            bgGradient="linear(to-b, #88E5BE, #1A1A32)"
            rounded="full"
            transition="transform 0.5s ease-out, opacity 0.5s ease-out"
            transform={mounted ? "translateY(0)" : "translateY(10)"}
            opacity={mounted ? "1" : "0"}
          />
        </Box>

        <Box
          position="absolute"
          bottom="50%"
          left="50%"
          w="0.25rem"
          h="50%"
          transformOrigin="bottom"
          transform="rotate(70deg)"
        >
          <Box
            w="6"
            h="6"
            ml="-3"
            mt="-3"
            bgGradient="linear(to-b, #88E5BE, #1A1A32)"
            rounded="full"
            transition="transform 0.5s ease-out, opacity 0.5s ease-out"
            transform={mounted ? "translateY(0)" : "translateY(10)"}
            opacity={mounted ? "1" : "0"}
          />
        </Box>
      </MouseParallax>
    </Box>
  );
};
