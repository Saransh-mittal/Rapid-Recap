import {
  Box,
  Flex,
  useColorModeValue,
  Badge,
  useMediaQuery,
  Text,
  Image,
} from "@chakra-ui/react";
import Heading from "../miscellaneous/HeadingComponent";
import TagLine from "../miscellaneous/TaglineComponent";
import check2 from "../../assets/check-02.svg";
import loading1 from "../../assets/loading-01.svg";
import roadmap1 from "../../assets/roadmap/image-1.png";
import roadmap2 from "../../assets/roadmap/image-2.png";
import roadmap3 from "../../assets/roadmap/image-3.png";
import roadmap4 from "../../assets/roadmap/image-4.png";
import grid from "../../assets/grid.png";
import gradientImage from "../../assets/gradient.png";
import { useRef } from "react";
import Section from "../miscellaneous/Section";
import { RepeatClockIcon, CheckIcon } from "@chakra-ui/icons";
import { BottomLine, Gradient } from "./design/Roadmap";

const roadmap = [
  {
    id: "0",
    title: "Voice Recognition",
    text: "Enable the chatbot to understand and respond to voice commands, making it easier for users to interact with the app hands-free.",
    date: "May 2023",
    status: "done",
    imageUrl: roadmap1,
    colorful: true,
  },
  {
    id: "1",
    title: "Gamification",
    text: "Add game-like elements, such as badges or leaderboards, to incentivize users to engage with the chatbot more frequently.",
    date: "May 2023",
    status: "progress",
    imageUrl: roadmap2,
  },
  {
    id: "2",
    title: "Chatbot Customization",
    text: "Allow users to customize the chatbot's appearance and behavior, making it more engaging and fun to interact with.",
    date: "May 2023",
    status: "done",
    imageUrl: roadmap3,
  },
  {
    id: "3",
    title: "Integration with APIs",
    text: "Allow the chatbot to access external data sources, such as weather APIs or news APIs, to provide more relevant recommendations.",
    date: "May 2023",
    status: "progress",
    imageUrl: roadmap4,
  },
];

const CommigSoonSection = () => {
  const isScreenGreaterThan820 = useMediaQuery("(min-width: 820px)")[0];
  const parallaxRef = useRef(null);

  return (
    <Section crosses customPaddings={`2.85rem 0 0 0`} id="whyUse">
      <Box
        mb={"2rem"}
        textAlign="center"
        maxW="62rem"
        mx="auto"
        ref={parallaxRef}
      >
        <Box className="overflow-hidden" id="roadmap">
          <Box maxW="container" pb={{ md: 10 }}>
            <Heading tag="Ready to get started" title="What we’re working on" />
            <Flex
              position="relative"
              gap={{ base: 6, md: 4 }}
              pb={{ md: "7rem" }}
              direction="row"
              flexWrap="wrap"
              justifyContent="center"
            >
              {roadmap.map((item, index) => {
                const status = item.status === "done" ? "Done" : "In Progress";
                const translateY = index % 2 !== 0 ? "6rem" : "0"; // Shift every second card down
                return (
                  <Box
                    key={item.id}
                    bgGradient="linear(to-br, #FFBF00, #D10363)"
                    maxW={{ base: "100%", md: "45%" }}
                    mx={4}
                    mb={8}
                    height={"37rem"}
                    style={{
                      borderRadius: "2.5rem",
                      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
                      transform: isScreenGreaterThan820
                        ? `translateY(${translateY})`
                        : "", // Apply translateY transformation
                      transition: "transform 0.3s ease-in-out", // Add transition for smooth effect
                    }}
                    _hover={{
                      transform: `scale(1.05) translateY(${translateY})`, // Scale up on hover
                    }}
                  >
                    <Box
                      m={"1px"}
                      height={"36.8rem"}
                      background={"transparent"}
                      style={{
                        borderRadius: "2.5rem",
                      }}
                      bgGradient="linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)"
                    >
                      <Box
                        p={{ base: 6, md: 8 }}
                        overflow="hidden"
                        boxShadow="lg"
                        background={"transparent"}
                        borderRadius={"2.5rem"}
                      >
                        <Box position={"absolute"}>
                          <Image
                            src={grid}
                            w={550}
                            h={550}
                            bg={"transparent"}
                          />
                        </Box>
                        <Box>
                          <Flex
                            justifyContent={"space-between"}
                            alignItems={"center"}
                          >
                            <TagLine fontSize="sm" mb={2}>
                              {item.date}
                            </TagLine>
                            <Flex align="center" mb={4}>
                              {item.status === "done" ? (
                                <Box mr={2}>
                                  <CheckIcon />
                                </Box>
                              ) : (
                                <Box mr={2}>
                                  <RepeatClockIcon />
                                </Box>
                              )}
                              <Badge
                                variant="subtle"
                                colorScheme={
                                  item.status === "done" ? "green" : "orange"
                                }
                              >
                                {status}
                              </Badge>
                            </Flex>
                          </Flex>
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            width="100%"
                            height="auto"
                            objectFit="cover"
                            mb={4}
                            background={"transparent"}
                          />
                          <Flex mb={"-4rem"}>
                            <Heading title={item.title} />
                          </Flex>
                          <Box fontSize="md" color="gray.600">
                            {item.text}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
              <Gradient
                top={"18.25rem"}
                left={"-20.375rem"}
                width={"56.625rem"}
              />
              <Gradient
                top={"62.25rem"}
                left={"50.375rem"}
                width={"56.625rem"}
              />
            </Flex>
          </Box>
        </Box>
      </Box>
      <BottomLine />
    </Section>
  );
};

export default CommigSoonSection;
