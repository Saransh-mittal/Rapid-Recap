import React, { useRef } from "react";
import { Box, Heading, Flex } from "@chakra-ui/react";
import Section from "../miscellaneous/Section";
import BenefitCard from "../miscellaneous/CardComponent";
import benefitIcon1 from "../../assets/benefits/icon-1.svg";
import benefitIcon2 from "../../assets/benefits/icon-2.svg";
import benefitIcon3 from "../../assets/benefits/icon-3.svg";
import benefitIcon4 from "../../assets/benefits/icon-4.svg";
import benefitImage2 from "../../assets/benefits/image-2.png";

const WhyToUseSection = () => {
  const parallaxRef = useRef(null);

  const benefits = [
    {
      id: "0",
      title: "Stay Informed",
      text: "Get the latest news articles from diverse sources all in one place, ensuring you stay updated on current events. Whether it's politics, technology, sports, or entertainment, Rapid Recap has you covered.",
      backgroundUrl: "./src/assets/benefits/card-1.svg",
      iconUrl: benefitIcon1,
      imageUrl: benefitImage2,
    },
    {
      id: "1",
      title: "Test Your Knowledge",
      text: "Take quizzes based on the articles you read to test your comprehension and retention of information. Our quizzes are designed to be engaging and informative, helping you reinforce what you've learned.",
      backgroundUrl: "./src/assets/benefits/card-2.svg",
      iconUrl: benefitIcon2,
      imageUrl: benefitImage2,
      light: true,
    },
    {
      id: "2",
      title: "Track Your Progress",
      text: "Monitor your Information Quotient (IQ) score over time with detailed graphs and statistics. See how your knowledge and understanding evolve as you continue to engage with the app.",
      backgroundUrl: "./src/assets/benefits/card-3.svg",
      iconUrl: benefitIcon3,
      imageUrl: benefitImage2,
    },
    {
      id: "3",
      title: "Compete and Rank",
      text: "See how you stack up against other users with our leaderboard and percentile ranking system. Compete for the top spot and earn recognition for your knowledge and expertise.",
      backgroundUrl: "./src/assets/benefits/card-4.svg",
      iconUrl: benefitIcon4,
      imageUrl: benefitImage2,
      light: true,
    },
    {
      id: "4",
      title: "Join Societies",
      text: "Belong to exclusive societies based on your IQ score and connect with like-minded individuals. Whether you're an Explorer, Striver, Elite, Maverick, or Visionary, there's a community waiting for you.",
      backgroundUrl: "./src/assets/benefits/card-5.svg",
      iconUrl: benefitIcon1,
      imageUrl: benefitImage2,
    },
    {
      id: "5",
      title: "Improve Daily",
      text: "Consistently challenge yourself with new quizzes and track your improvement over time. With daily practice, you can expand your knowledge and enhance your cognitive abilities.",
      backgroundUrl: "./src/assets/benefits/card-6.svg",
      iconUrl: benefitIcon2,
      imageUrl: benefitImage2,
    },
  ];

  return (
    <Section crosses customPaddings={`2.85rem 0 0 0`} id="whyToUse">
      <Flex
        position="relative"
        textAlign="center"
        mx="auto"
        mb={"2rem"}
        ref={parallaxRef}
      >
        <Box position="relative" zIndex="2">
          <Heading mb={10}>Get Gaming with Rapid Recap</Heading>

          <Flex
            flexWrap="wrap"
            justifyContent="space-between"
            gap={4}
            mb={10}
            ml={"4rem"} // Adjusted left margin
            mr={"4rem"} // Adjusted right margin
          >
            {benefits.map((item) => (
              <BenefitCard
                key={item.id}
                id={item.id}
                title={item.title}
                text={item.text}
                backgroundUrl={item.backgroundUrl}
                iconUrl={item.iconUrl}
                imageUrl={item.imageUrl}
                light={item.light}
              />
            ))}
          </Flex>
        </Box>
      </Flex>
    </Section>
  );
};

export default WhyToUseSection;
