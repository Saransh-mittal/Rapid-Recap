import { Box, Flex, Image } from "@chakra-ui/react";
import Button from "../miscellaneous/ButtonComponent";
import Heading from "../miscellaneous/HeadingComponent";
// import Section from "./Section";
import TagLine from "../miscellaneous/TaglineComponent";
// import { roadmap } from "../constants";
// import { check2, grid, loading1 } from "../assets";
import check2 from "../../assets/check-02.svg";
import grid from "../../assets/grid.png";
import loading1 from "../../assets/loading-01.svg";
import gradientImage from "../../assets/gradient.png";
import Section from "../miscellaneous/Section";
import roadmap1 from "../../assets/roadmap/image-1.png";
import roadmap2 from "../../assets/roadmap/image-2.png";
import roadmap3 from "../../assets/roadmap/image-3.png";
import roadmap4 from "../../assets/roadmap/image-4.png";
import { useRef } from "react";

const roadmap = [
  {
    id: "0",
    title: "Voice recognition",
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
    title: "Chatbot customization",
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
        <Section className="overflow-hidden" id="roadmap">
          <Box className="container md:pb-10">
            <Heading tag="Ready to get started" title="What we’re working on" />

            <Flex
              className="relative grid gap-6 md:grid-cols-2 md:gap-4 md:pb-[7rem]"
              direction={{ base: "column", md: "row" }}
            >
              {roadmap.map((item) => {
                const status = item.status === "done" ? "Done" : "In progress";

                return (
                  <Box
                    className={`md:flex even:md:translate-y-[7rem] p-0.25 rounded-[2.5rem] ${
                      item.colorful ? "bg-conic-gradient" : "bg-n-6"
                    }`}
                    key={item.id}
                  >
                    <Box className="relative p-8 bg-n-8 rounded-[2.4375rem] overflow-hidden xl:p-15">
                      <Box className="absolute top-0 left-0 max-w-full">
                        <Image src={grid} width={550} height={550} alt="Grid" />
                      </Box>
                      <Box className="relative z-1">
                        <Flex
                          className="items-center justify-between max-w-[27rem] mb-8 md:mb-20"
                          direction={{ base: "column", md: "row" }}
                        >
                          <TagLine>{item.date}</TagLine>

                          <Flex
                            className="items-center px-4 py-1 bg-n-1 rounded text-n-8"
                            direction="row"
                          >
                            <Image
                              src={item.status === "done" ? check2 : loading1}
                              width={16}
                              height={16}
                              alt={status}
                              mr={2.5}
                            />
                            <TagLine>{status}</TagLine>
                          </Flex>
                        </Flex>

                        <Box className="mb-10 -my-10 -mx-15">
                          <Image
                            src={item.imageUrl}
                            width={628}
                            height={426}
                            alt={item.title}
                            className="w-full"
                          />
                        </Box>
                        <Box as="h4" className="h4 mb-4">
                          {item.title}
                        </Box>
                        <Box as="p" className="body-2 text-n-4">
                          {item.text}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
              })}

              {/* <Gradient /> */}
              <img src={gradientImage} alt="Gradient" />
            </Flex>

            <Flex justifyContent="center" mt={12} md={{ mt: 15, xl: 20 }}>
              <Button href="/roadmap">Our roadmap</Button>
            </Flex>
          </Box>
        </Section>
      </Box>
    </Section>
  );
};

export default CommigSoonSection;
