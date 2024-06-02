import React from "react";
import { Box, Heading, Text, Flex, Image, Button } from "@chakra-ui/react";
import ClipPath from "../../assets/svg/ClipPath";
import Arrow from "../../assets/svg/Arrow";

const BenefitCard = ({
  id,
  title,
  text,
  backgroundUrl,
  iconUrl,
  imageUrl,
  light,
}) => {
  return (
    <Box
      key={id}
      position="relative"
      p={0.5}
      bgImage={`url(${backgroundUrl})`}
      bgSize="cover"
      width={"23rem"}
      height={"22rem"}
    >
      <Box
        position="relative"
        zIndex="2"
        display="flex"
        flexDirection="column"
        height="100%"
        p="1.6rem"
        pointerEvents="none"
      >
        <Heading as="h5" size="sm" mb={3}>
          {title}
        </Heading>
        <Text fontSize="sm" mb={4} color="gray.500">
          {text}
        </Text>
        <Flex
          // mt="auto" // This pushes the Flex container to the bottom
          position={"absolute"}
          bottom={"-15%"}
          alignItems="center"
          justifyContent="space-between"
        >
          <Image
            src={iconUrl}
            width={8}
            height={8}
            alt={title}
            background={"transparent"}
          />
          <Text
            fontSize="xs"
            fontWeight="bold"
            color="gray.600"
            textTransform="uppercase"
            letterSpacing="wider"
            ml={"13rem"}
          >
            Explore more
          </Text>
          <Flex mt="4.5rem">
            <Arrow />
          </Flex>
        </Flex>
      </Box>

      {light && (
        <Box
          position="absolute"
          top="0"
          left="25%"
          width="100%"
          height="0"
          paddingBottom="100%"
          bgGradient="radial-gradient(circle, #28206C, rgba(40, 32, 108, 0) 70%)"
          pointerEvents="none"
        />
      )}

      <Box
        position="absolute"
        inset="0.5"
        style={{ clipPath: "url(#benefits)" }}
      >
        <Box
          position="absolute"
          inset="0"
          opacity="0"
          transition="opacity 0.2s"
          _hover={{ opacity: 0.1 }}
        >
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={title}
              objectFit="cover"
              width="100%"
              height="100%"
            />
          )}
        </Box>
      </Box>

      <ClipPath />
    </Box>
  );
};

export default BenefitCard;
