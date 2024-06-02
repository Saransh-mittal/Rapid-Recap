import React, { useRef } from "react";
import { Box, Flex } from "@chakra-ui/react";
import Section from "../miscellaneous/Section";
import Heading from "../miscellaneous/HeadingComponent";
import BenefitCard from "../miscellaneous/CardComponent";
import benefitIcon1 from "../../assets/benefits/icon-1.svg";
import benefitIcon2 from "../../assets/benefits/icon-2.svg";
import benefitIcon3 from "../../assets/benefits/icon-3.svg";
import benefitIcon4 from "../../assets/benefits/icon-4.svg";
import benefitImage2 from "../../assets/benefits/image-2.png";
import card1 from "../../assets/benefits/card-1.svg";
import card2 from "../../assets/benefits/card-2.svg";
import card3 from "../../assets/benefits/card-3.svg";
import card4 from "../../assets/benefits/card-4.svg";
import card5 from "../../assets/benefits/card-5.svg";
import card6 from "../../assets/benefits/card-6.svg";

const WhyToUseSection = () => {
  const parallaxRef = useRef(null);

  const benefits = [
    {
      id: "0",
      title: "Stay Informed and Engaged",
      text: "Rapid Recap keeps you up-to-date with the latest news and articles from diverse fields. Our engaging quizzes turn learning into an interactive experience, making it fun to stay informed.",
      backgroundUrl: card1,
      iconUrl: benefitIcon1,
      imageUrl: benefitImage2,
    },
    {
      id: "1",
      title: "Challenge Your Knowledge",
      text: "Test your comprehension and retention with quizzes designed to challenge you. Each quiz is an opportunity to deepen your understanding and enhance your knowledge.",
      backgroundUrl: card2,
      iconUrl: benefitIcon2,
      imageUrl: benefitImage2,
      light: true,
    },
    {
      id: "2",
      title: "Track and Visualize Your Progress",
      text: " Monitor your growth with personalized IQ scores and detailed progress charts. Visualize your achievements and see how you improve over time.",
      backgroundUrl: card3,
      iconUrl: benefitIcon3,
      imageUrl: benefitImage2,
    },
    {
      id: "3",
      title: "Compete and Connect",
      text: "Join the competitive leaderboards to see where you stand among peers. Connect with friends and other users, sharing your scores and achievements on social media.",
      backgroundUrl: card4,
      iconUrl: benefitIcon4,
      imageUrl: benefitImage2,
      light: true,
    },
    {
      id: "4",
      title: "Achieve and Belong",
      text: "Unlock access to exclusive societies based on your IQ scores. Whether you're an Explorer or a Pioneer, find your place in a community of like-minded individuals.",
      backgroundUrl: card5,
      iconUrl: benefitIcon1,
      imageUrl: benefitImage2,
    },
    {
      id: "5",
      title: "Earn Rewards and Recognition",
      text: "Earn badges and rewards as you achieve milestones and excel in quizzes. Celebrate your accomplishments and showcase your expertise to the community.",
      backgroundUrl: card6,
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
        flexDirection="column"
      >
        <Box position="relative" zIndex="2">
          <Heading
            tag={"Engage, Learn, and Excel"}
            title={"Discover the Power of Rapid Recap"}
          />
          <Flex
            flexWrap="wrap"
            justifyContent="center"
            gap={6} // Adjust gap for equal spacing
            mx={"auto"}
            px={4} // Add some padding for responsiveness
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
