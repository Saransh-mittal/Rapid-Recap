import React from "react";
import { Flex, Image, Text, Box } from "@chakra-ui/react";
import Typewriter from "typewriter-effect";
import seasonGIF from "/GIFs/season.gif";
import Section from "../components/miscellaneous/Section";
import { BottomLine } from "../components/getStartedComponents/design/Hero";
import Heading from "../components/miscellaneous/HeadingComponent";

const Season = () => {
  return (
    <Flex minH={"90vh"} justifyContent={"center"} marginTop={"4.5rem"}>
      <Flex w={"100%"} alignItems={"center"}>
        <Section
          crosses
          customPaddings={`3rem 0 4rem 0`}
          id="season"
          width={"100%"}
          height={"85%"}
        >
          <Flex
            w={"100%"}
            justifyContent={"center"}
            alignItems={"center"}
            height={"100%"}
          >
            <Flex
              w={"75%"}
              justifyContent={"space-between"}
              alignItems={"center"}
              height={"100%"}
              gap={2}
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
                  <Box>
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
                        delay: 75,
                      }}
                    />
                  </Box>
                </Box>
              </Flex>
            </Flex>
          </Flex>
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
