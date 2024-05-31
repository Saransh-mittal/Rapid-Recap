import { Box, Flex, Image, useColorModeValue, Badge } from "@chakra-ui/react";
// import Button from "../miscellaneous/ButtonComponent";
import Heading from "../miscellaneous/HeadingComponent";
import TagLine from "../miscellaneous/TaglineComponent";
import check2 from "../../assets/check-02.svg";
import loading1 from "../../assets/loading-01.svg";
import roadmap1 from "../../assets/roadmap/image-1.png";
import roadmap2 from "../../assets/roadmap/image-2.png";
import roadmap3 from "../../assets/roadmap/image-3.png";
import roadmap4 from "../../assets/roadmap/image-4.png";
import gradientImage from "../../assets/gradient.png";
import { useRef } from "react";
import Section from "../miscellaneous/Section";
import { RepeatClockIcon, CheckIcon } from "@chakra-ui/icons";

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
                    mx={4}
                    mb={8}
                    maxW={{ base: "100%", md: "45%" }}
                    background={"transparent"}
                    border={"1px solid transparent"}
                    style={{
                      borderRadius: "2.5rem",
                      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
                      transform: `translateY(${translateY})`, // Apply translateY transformation
                    }}
                    bgGradient="linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)"
                    bgColor="#0f0d15"
                  >
                    <Box
                      p={{ base: 6, md: 8 }}
                      bg={useColorModeValue("gray.50", "gray.700")}
                      overflow="hidden"
                      boxShadow="lg"
                      background={"transparent"}
                      borderRadius={"2.5rem"}
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        width="100%"
                        height="auto"
                        objectFit="cover"
                        mb={4}
                        background={"transparent"}
                      />
                      <TagLine fontSize="sm" mb={2}>
                        {item.date}
                      </TagLine>
                      <Flex align="center" mb={4}>
                        {/* <Image
                          src={item.status === "done" ? check2 : loading1}
                          width={5}
                          height={5}
                          alt={status}
                          mr={2.5}
                          background={"transparent"}
                          color={"white"}
                        /> */}
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
                      <Heading as="h4" fontSize="lg" mb={2}>
                        {item.title}
                      </Heading>
                      <Box fontSize="md" color="gray.600">
                        {item.text}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
              <Box
                position="absolute"
                top="0"
                left="0"
                right="0"
                bottom="0"
                zIndex="-1"
                pointerEvents="none"
              >
                <Image
                  src={gradientImage}
                  alt="Gradient"
                  objectFit="cover"
                  w="full"
                  h="full"
                />
              </Box>
            </Flex>
          </Box>
        </Box>
      </Box>
    </Section>
  );
};

export default CommigSoonSection;
