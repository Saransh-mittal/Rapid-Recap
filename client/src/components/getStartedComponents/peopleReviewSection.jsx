import React, { useEffect, useRef } from "react";
import {
  Box,
  Heading,
  Text,
  Image,
  VStack,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/splide/dist/css/splide.min.css";
import Section from "../miscellaneous/Section";
import Quote from "../../assets/Testimonials/blockquote.svg";

const PeopleReviews = () => {
  const splideRef = useRef(null);
  const reviews = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: "John Doe",
      text: "I was extremely pleased with the quality of the product. It exceeded my expectations and provided great value for the price.",
      rating: 4,
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: "Jane Smith",
      text: "The customer service was excellent. They were responsive and helpful throughout the entire process, making it a smooth experience for me.",
      rating: 5,
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1463453091185-61582044d556?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: "Alex Johnson",
      text: "The attention to detail in their work is impressive. Every aspect of the project was handled with precision and care. I highly recommend their services.",
      rating: 5,
    },
    {
      id: 4,
      image:
        "https://plus.unsplash.com/premium_photo-1671823917954-dc943c1bd9df?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: "Emily Davis",
      text: "The team demonstrated a deep understanding of my requirements. They were able to capture the essence of my vision and deliver a product that exceeded my expectations.",
      rating: 4,
    },
    {
      id: 5,
      image:
        "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?q=80&w=1776&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      name: "David Miller",
      text: "The product not only met but exceeded my expectations. It's clear that the team is dedicated to delivering high-quality work. I'm a satisfied customer.",
      rating: 5,
    },
  ];

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Icon
          as={StarIcon}
          key={i}
          color={i < rating ? "orange.400" : "gray.300"}
        />
      );
    }
    return stars;
  };

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (splideRef.current) {
  //       splideRef.current.go("+1");
  //     }
  //   }, 3000); // Change slide every 3 seconds

  //   return () => clearInterval(interval); // Cleanup interval on component unmount
  // }, []);

  return (
    <Section crosses customPaddings="2.85rem 0 0 0" id="whyUse">
      <Box mb="2rem" textAlign="center" maxW="62rem" mx="auto">
        <Box
          maxW="800px"
          mx="auto"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          height="100vh"
          p={4}
          // style={{
          //   backgroundColor: "#0f0d15",
          //   backgroundImage:
          //     "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
          // }}
        >
          <Box textAlign="center" mb={8}>
            <Heading
              as="h2"
              size="xl"
              textTransform="capitalize"
              fontWeight="bold"
              lineHeight="1.1"
            >
              Testimonials
            </Heading>
            <Text>What members are saying.</Text>
          </Box>

          <Box
            position="relative"
            userSelect="none"
            px={4}
            // style={{
            //   backgroundColor: "#0f0d15",
            //   backgroundImage:
            //     "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
            // }}
          >
            <Image
              src={Quote}
              alt="Opening quote"
              position="absolute"
              top="-1rem"
              left="-1rem"
              zIndex="-1"
            />
            <Image
              src={Quote}
              alt="Closing quote"
              position="absolute"
              bottom="-3rem"
              right="-0.5rem"
              transform="rotate(180deg)"
              zIndex="-1"
            />

            <Splide
              ref={splideRef}
              options={{
                type: "loop",
                perPage: 1,
                autoplay: false, // Disable Splide's built-in autoplay
                interval: 3000,
                speed: 1000,
                easing: "ease-in-out",
                rewind: true,
                rewindByDrag: true,
                pauseOnHover: true,
                pauseOnFocus: true,
                arrows: true,
                pagination: true,
              }}
            >
              {reviews.map((review) => (
                <SplideSlide key={review.id} style={{ padding: "0" }}>
                  <VStack
                    bg="white"
                    p={8}
                    borderRadius="lg"
                    alignItems="center"
                    spacing={4}
                    boxShadow="md"
                    transition="box-shadow 0.3s ease, transform 0.3s ease"
                    _hover={{ boxShadow: "lg", transform: "scale(1.02)" }}
                  >
                    <Image
                      borderRadius="full"
                      boxSize="140px"
                      src={review.image}
                      alt={`Image of ${review.name}`}
                      objectFit="cover"
                      mb={4}
                    />
                    <Text fontSize="lg" color="gray.700">
                      {review.text}
                    </Text>
                    <HStack>{renderStars(review.rating)}</HStack>
                    <Text fontWeight="bold">{review.name}</Text>
                  </VStack>
                </SplideSlide>
              ))}
            </Splide>
          </Box>
        </Box>
      </Box>
    </Section>
  );
};

export default PeopleReviews;
