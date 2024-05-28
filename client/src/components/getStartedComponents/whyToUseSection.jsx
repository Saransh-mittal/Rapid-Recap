import React, { useRef } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  Icon,
  useColorModeValue,
  Flex,
  Image,
} from "@chakra-ui/react";
import { FaCheckCircle } from "react-icons/fa";
import Section from "../miscellaneous/Section";
import ArrowIcon from "../../assets/svg/Arrow";
import ClipPath from "../../assets/svg/ClipPath";

const WhyToUseSection = () => {
  const parallaxRef = useRef(null);
  // const textColor = useColorModeValue("gray.700", "gray.200");

  const cardData = [
    {
      id: "0",
      title: "Ask anything",
      text: "Lets users quickly find answers to their questions without having to search through multiple sources.",
      backgroundUrl: "./src/assets/benefits/card-1.svg",
      // iconUrl: benefitIcon1,
      // imageUrl: benefitImage2,
    },
    {
      id: "1",
      title: "Improve everyday",
      text: "The app uses natural language processing to understand user queries and provide accurate and relevant responses.",
      backgroundUrl: "./src/assets/benefits/card-2.svg",
      // iconUrl: benefitIcon2,
      // imageUrl: benefitImage2,
      light: true,
    },
    {
      id: "2",
      title: "Connect everywhere",
      text: "Connect with the AI chatbot from anywhere, on any device, making it more accessible and convenient.",
      backgroundUrl: "./src/assets/benefits/card-3.svg",
      // iconUrl: benefitIcon3,
      // imageUrl: benefitImage2,
    },
    {
      id: "3",
      title: "Fast responding",
      text: "Lets users quickly find answers to their questions without having to search through multiple sources.",
      backgroundUrl: "./src/assets/benefits/card-4.svg",
      // iconUrl: benefitIcon4,
      // imageUrl: benefitImage2,
      light: true,
    },
    {
      id: "4",
      title: "Ask anything",
      text: "Lets users quickly find answers to their questions without having to search through multiple sources.",
      backgroundUrl: "./src/assets/benefits/card-5.svg",
      // iconUrl: benefitIcon1,
      // imageUrl: benefitImage2,
    },
    {
      id: "5",
      title: "Improve everyday",
      text: "The app uses natural language processing to understand user queries and provide accurate and relevant responses.",
      backgroundUrl: "./src/assets/benefits/card-6.svg",
      // iconUrl: benefitIcon2,
      // imageUrl: benefitImage2,
    },
  ];

  return (
    <Section crosses customPaddings={`2.85rem 0 0 0`} id="whyUse">
      <Box
        mb={"2rem"}
        textAlign="center"
        maxW="62rem"
        mx="auto"
        ref={parallaxRef}
      >
        <Heading as="h2" size="lg" mb={4} textAlign="center">
          Why Use It?
        </Heading>
        <Flex flexWrap="wrap" gap="10" marginBottom="10">
          {cardData.map((item) => (
            <Box
              display="block"
              position="relative"
              p="0.5"
              bgImage={`url(${item.backgroundUrl})`}
              bgSize="100% 100%"
              maxW={["100%", "100%", "24rem"]}
              key={item.id}
            >
              <Flex
                position="relative"
                zIndex={2}
                flexDirection="column"
                minH="22rem"
                p="2.4rem"
                pointerEvents="none"
                // flexDirection="column"
                alignItems="flex-start"
                justifyContent="flex-start"
              >
                <Text as="h5" fontSize="lg" marginBottom="5">
                  {item.title}
                </Text>
                <Text fontSize="md" marginBottom="6">
                  {item.text}
                </Text>
                <Flex alignItems="center" marginTop="auto">
                  <Image
                    src={item.iconUrl}
                    alt={item.title}
                    width={48}
                    height={48}
                    mr="auto"
                  />
                  <Text
                    as="p"
                    fontSize="xs"
                    fontWeight="bold"
                    textTransform="uppercase"
                    color="gray.600"
                    letterSpacing="wider"
                    marginLeft="auto"
                  >
                    Explore more
                  </Text>
                  <ArrowIcon />
                </Flex>
              </Flex>

              {item.light && (
                <Box
                  position="absolute"
                  top="0"
                  left="25%"
                  width="100%"
                  sx={{
                    aspectRatio: "1",
                    bgGradient:
                      "radial-gradient(circle, #28206C, #28206C 70%, transparent 70%)",
                    pointerEvents: "none",
                  }}
                />
              )}

              <Box
                position="absolute"
                top="0.125rem"
                right="0.125rem"
                bottom="0.125rem"
                left="0.125rem"
                bg="#1a1a1a"
                style={{ clipPath: "url(#benefits)" }}
              >
                <Box
                  position="absolute"
                  top="0"
                  right="0"
                  bottom="0"
                  left="0"
                  opacity="0"
                  transition="opacity 0.2s"
                  _hover={{ opacity: "0.1" }}
                >
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      width={380}
                      height={362}
                      objectFit="cover"
                    />
                  )}
                </Box>
              </Box>

              <ClipPath />
            </Box>
          ))}
        </Flex>
        {/* {cardData.map((card, index) => (
          <Flex
            key={index}
            direction={{
              base: "column",
              md: index % 2 === 0 ? "row" : "row-reverse",
            }}
            alignItems="center"
            justifyContent="space-between"
            mb={8}
            p={5}
            borderRadius="md"
            shadow="md"
          >
            <VStack spacing={4} align="start" flex={{ base: "none", md: "1" }}>
              <Heading as="h3" size="md" mb={2}>
                {card.title}
              </Heading>
              <Text>{card.description}</Text>
            </VStack>
            <Box flex={{ base: "none", md: "1" }}>
              <img src={card.image} alt={card.title} />
            </Box>
          </Flex>
        ))} */}
      </Box>
    </Section>
  );
};

export default WhyToUseSection;
