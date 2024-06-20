import React, { useRef } from "react";
import { Flex, Image, Text, Box } from "@chakra-ui/react";
import Typewriter from "typewriter-effect";
import seasonGIF from "/GIFs/season.gif";
import Section from "../components/miscellaneous/Section";
import {
  BottomLine,
  BackgroundCircles,
  MediumScreenbgGradient,
} from "../components/getStartedComponents/design/Hero";
import Heading from "../components/miscellaneous/HeadingComponent";
import heroBackground from "../assets/hero/hero-background.jpg";

const Season = () => {
  const parallaxRef = useRef(null);
  return (
    <Flex minH={"90vh"} justifyContent={"center"} marginTop={"4.5rem"}>
      <Flex w={"100%"} alignItems={"center"}>
        <Section
          crosses
          customPaddings={`3rem 0 4rem 0`}
          id="season"
          width={"100%"}
          height={"85%"}
          backgroundImage={`url(${heroBackground})`}
          backgroundSize="cover"
          backgroundPosition="center"
        >
          <Box
            position="absolute"
            // zIndex={-1}
            left="50%"
            transform="translateX(-45%)"
            display={{ base: "block", md: "none", lg: "block" }}
            sx={{
              "@media (max-width: 768px)": {
                top: "-20% !important",
                width: "138%",
                left: "55% !important",
              },
              "@media (max-width: 1240px)": {
                top: "-24%",
                width: "138%",
                left: "50% ",
              },
              "@media (min-width: 1241px)": {
                top: "-33%",
                width: "234%",
                left: "100%",
                height: "auto",
              },
            }}
          >
            <Image
              src={heroBackground}
              width={1640}
              height={1200}
              // zIndex={-1}
              alt="hero"
            />
          </Box>
          <Flex
            // position="relative"
            w={"100%"}
            justifyContent={"center"}
            alignItems={"center"}
            height={"100%"}
            ref={parallaxRef}
          >
            <Flex
              w={"75%"}
              justifyContent={"space-between"}
              alignItems={"center"}
              height={"100%"}
              gap={2}
              zIndex={1}
            >
              <Image src={seasonGIF} background={"transparent"} h={"100%"} />

              <Flex
                w={"48%"}
                h={"100%"}
                flexDirection={"column"}
                letterSpacing={"2px"}
              >
                <Box>
                  <Heading
                    tag={"Season 2"}
                    title={"The Cycle of Knowledge"}
                    textTransform="uppercase"
                  />
                  {/* <Text fontSize="2rem" fontWeight="bold" mb={4}>
                    Season 2: "The Cycle of Knowledge"
                  </Text> */}
                  <Box lineHeight={"2rem"}>
                    <Typewriter
                      onInit={(typewriter) => {
                        typewriter
                          .typeString(
                            "Knowledge, like a garden, needs constant care. Without regular engagement, it fades. Stay sharp through continuous learning and refreshing of information."
                          )
                          .callFunction(() => {
                            // Ensure the text remains after typing is done
                            const element = document.querySelector(
                              ".Typewriter__wrapper"
                            );
                            if (element) {
                              element.style.display = "inline";
                            }
                          })
                          .start();
                      }}
                      options={{
                        autoStart: true,
                        loop: false,
                        delay: 30,
                      }}
                    />
                  </Box>
                </Box>
              </Flex>
            </Flex>
          </Flex>
          <BackgroundCircles bTop={"-30%"} bLeft={"68%"} />
          <MediumScreenbgGradient
            top="18.25rem"
            left="-25.375rem"
            width="56.625rem"
          />
          <MediumScreenbgGradient
            top="36.25rem"
            left="40.375rem"
            width="56.625rem"
          />
          <BottomLine
            lineTop={"35rem"}
            plusTop={"35.5rem"}
            persistOnEveryVP={true}
          />
        </Section>
      </Flex>
    </Flex>
  );
};

export default Season;
