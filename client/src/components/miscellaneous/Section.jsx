import React from "react";
import { Box } from "@chakra-ui/react";
import SectionSvg from "../../assets/svg/SectionSvg";

const Section = ({
  id,
  crosses,
  crossesOffset,
  customPaddings,
  children,
  paddingTopSection,
  marginTopSection,
  width,
  height,
}) => {
  return (
    <Box
      id={id}
      position="relative"
      py={
        customPaddings
          ? 0
          : {
              base: 10,
              lg: crosses ? 38 : 16,
              xl: crosses ? 46 : 20,
            }
      }
      p={customPaddings ? customPaddings : 0}
      height={height ? height : "100%"}
      //   borderColor={"gray.600"}
      width={width ? width : "auto"}
      margin={0}
      marginTop={marginTopSection ? marginTopSection : 0}
    >
      {children}

      <Box
        display={{ base: "none", md: "block" }}
        position="absolute"
        top={0}
        left={{ base: "5", lg: "7", xl: "10" }}
        width="1px"
        height="100%"
        bg="gray.600"
        pointerEvents="none"
        // borderColor={"gray.600"}
      />
      <Box
        display={{ base: "none", md: "block" }}
        position="absolute"
        top={0}
        right={{ base: "5", lg: "7", xl: "10" }}
        width="1px"
        height="100%"
        bg="gray.600"
        pointerEvents="none"
      />

      {crosses && (
        <>
          <Box
            display={{ base: "none", lg: "block" }}
            position="absolute"
            top={0}
            left={{ lg: "7", xl: "10" }}
            right={{ lg: "7", xl: "10" }}
            // width={"1px"}
            mt={{ base: "0", lg: "-1rem" }}
            height="1px"
            bg="gray.600"
            transform={crossesOffset ? crossesOffset : undefined}
            pointerEvents="none"
          />
          <SectionSvg crossesOffset={crossesOffset} />
        </>
      )}
    </Box>
  );
};

export default Section;
