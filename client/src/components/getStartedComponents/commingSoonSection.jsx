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
import roadmap5 from "../../assets/roadmap/xp-min.jpeg";
import grid from "../../assets/grid.png";
import gradientImage from "../../assets/gradient.png";
import { useRef } from "react";
import Section from "../miscellaneous/Section";
import { RepeatClockIcon, CheckIcon } from "@chakra-ui/icons";
import { BottomLine, Gradient } from "./design/Roadmap";

const roadmap = [
  {
    id: "0",
    title: "Sleek and Intuitive UI Design",
    text: "Experience our revamped user interface! The new design is visually appealing and more intuitive, making navigation seamless and interaction smoother.",
    date: "May 2023",
    status: "done",
    imageUrl: roadmap2,
    colorful: true,
  },
  {
    id: "1",
    title: "Experience Level (xP)",
    text: "Measure the journey, not just the end, see how far you've come, my friend. A hidden gauge, a subtle sign, to show your mastery, in a line. What could it be that marks your path and charts your growth on this unique graph?",
    date: "May 2023",
    status: "progress",
    imageUrl: roadmap5,
  },
  {
    id: "2",
    title: "Expanded Categories & Streak System",
    text: "Explore new categories and keep your learning streak alive! Our new streak system rewards consistent participation, helping you boost your Information Quotient (IQ) score.",
    date: "May 2023",
    status: "done",
    imageUrl: roadmap3,
  },
  {
    id: "3",
    title: "Wise Web",
    text: "In a realm where knowledge flows, connections grow. Soon, you'll weave a web so wise, where friends gather under digital skies. What is it that lets you chat, share, and thrive in this new social hive?",
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
            <Heading
              tag="Discover What's New and What's Coming Soon"
              title="Feature Highlights
"
            />
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
                          <Flex
                            w={"100%"}
                            justifyContent={"center"}
                            alignItems={"center"}
                          >
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              width={item.id === "1" ? "80%" : "100%"}
                              height="auto"
                              objectFit="cover"
                              mb={4}
                              background={"transparent"}
                            />
                          </Flex>
                          <Flex>
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
