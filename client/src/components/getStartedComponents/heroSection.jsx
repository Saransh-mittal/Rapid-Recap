import React, { useRef } from "react";
import {
  Box,
  Heading,
  Text,
  Image,
  Button,
  UnorderedList,
  ListItem,
  useBreakpointValue,
  Flex,
} from "@chakra-ui/react";
import Section from "../miscellaneous/Section";
import curve from "../../assets/curve.png";
import robot from "../../assets/hero/robot.jpeg";
import homeSmile from "../../assets/home-smile.svg";
import file02 from "../../assets/file-02.svg";
import searchMd from "../../assets/search-md.svg";
import plusSquare from "../../assets/plus-square.svg";
import { ScrollParallax } from "react-just-parallax";
import heroBackground from "../../assets/hero/hero-background.jpg";
import { Gradient, BackgroundCircles } from "./design/Hero";

const heroIcons = [homeSmile, file02, searchMd, plusSquare];

const heroSection = () => {
  const parallaxRef = useRef(null);
  const crossesOffset = useBreakpointValue({
    base: "translateY(0)",
    lg: "translateY(5.25rem)",
  });
  return (
    <Section crosses customPaddings={`2.85rem 0 0 0`} id="hero">
      <Box
        // className="container"

        position="relative"
        textAlign="center"
        maxW="container.xl"
        mx="auto"
        mb={"2rem"}
        ref={parallaxRef}
      >
        <Box
          maxW="62rem"
          maxH={{ base: "auto", lg: "30rem" }}
          mx="auto"
          mb={{ base: "3.875rem", md: "5rem" }}
          zIndex={99}
          position={"relative"}
          letterSpacing={"2px"}
        >
          <Heading as="h1" size="2xl" mb="6">
            Explore the Potential of your brain with{" "}
            <Box as="span" display="inline-block" position="relative">
              Rapid Recap{" "}
              <Image
                src={curve}
                position="absolute"
                mt={{ base: "0.5rem", lg: "0.85rem" }}
                top="100%"
                left="0"
                background={{ base: "none", lg: "transparent" }}
                height={{ base: "0.5rem", lg: "0.75rem" }}
                width="full"
                transform="translateY(-0.5rem)"
                alt="Curve"
              />
            </Box>
          </Heading>
          <Text
            fontSize="lg"
            maxW="3xl"
            mx="auto"
            mb={{ base: "6", lg: "8" }}
            color={"#9CAFAA"}
            fontWeight={"bold"}
            mt={{ base: "0", lg: "2rem" }}
          >
            Unlock the potential of your intellect with Rapid Recap. Elevate
            your knowledge game with Rapid Recap, the ultimate news and quiz
            platform powered by AI.
          </Text>
          <Button as="a" href="/pricing" colorScheme="blue">
            Get started
          </Button>
        </Box>

        <Flex
          position="relative"
          maxW={{ base: "23rem", md: "5xl" }}
          mx="auto"
          justifyContent={"center"}
          alignItems={"center"}
          // mb={{ xl: 24 }}
        >
          <Box
            position="relative"
            zIndex={1}
            p={0.5}
            borderRadius="2xl"
            bgGradient="linear(to-br, #FFBF00, #D10363)"
            w={{ base: "100%", md: "80%" }}
          >
            <Box position="relative" bg="gray.600" borderRadius="1rem">
              <Box height="1.4rem" bg="gray.600" borderTopRadius="0.9rem" />

              <Box
                borderBottomRadius="0.9rem"
                overflow="hidden"
                sx={{
                  aspectRatio: "33 / 40",

                  "@media (min-width: 769px)": { aspectRatio: "688 / 390" },
                  "@media (min-width: 1240px)": {
                    aspectRatio: "800 / 390",
                  },
                }}
              >
                <Box
                  width="100%"
                  height={"100%"}
                  transform={{
                    base: "scale(1.7) translateY(8%)",
                    md: "scale(1) translateY(-10%)",
                  }}
                >
                  <Image
                    src={robot}
                    width={{ base: 688, lg: 1024 }}
                    height={790}
                    alt="AI"
                  />
                </Box>

                <ScrollParallax isAbsolutelyPositioned>
                  <UnorderedList
                    listStyleType={"none"}
                    display={{ base: "none", xl: "flex" }}
                    position="absolute"
                    left="-5.5rem"
                    bottom="7.5rem"
                    px={1}
                    py={1}
                    bg="rgba(0, 0, 0, 0.4)" // Assuming 'n-9/40' is a semi-transparent black background
                    backdropFilter="blur(10px)" // Adjust the blur value as needed
                    border="1px solid rgba(0, 0, 0, 0.1)" // Assuming 'n-1/10' is a semi-transparent border
                    borderRadius="2xl"
                  >
                    {heroIcons.map((icon, index) => (
                      <ListItem p={5} key={index}>
                        <Image
                          src={icon}
                          width={12}
                          height={25}
                          alt={icon}
                          background={"transparent"}
                        />
                      </ListItem>
                    ))}
                  </UnorderedList>
                </ScrollParallax>
              </Box>
            </Box>

            <Gradient />
          </Box>
          <Box
            position="absolute"
            left="50%"
            transform="translateX(-50%)"
            sx={{
              "@media (max-width: 992px)": {
                display: "none",
              },
              "@media (max-width: 1240px)": {
                top: "-120% !important",
                width: "138%",
              },
              "@media (min-width: 62em)": {
                top: "-151%",
                width: "234%",
                left: "85%",
                height: "auto",
              },
            }}
          >
            <Image src={heroBackground} width={1640} height={1200} alt="hero" />
          </Box>

          <BackgroundCircles />
        </Flex>
      </Box>
    </Section>
  );
};

export default heroSection;
