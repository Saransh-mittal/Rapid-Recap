import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Image,
  VStack,
  HStack,
  Icon,
  Button,
} from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";
import Section from "../miscellaneous/Section";
import Quote from "../../assets/Testimonials/blockquote.svg";

const PeopleReviews = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeProp, setFadeProp] = useState({ fade: "fade-in" });

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

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setFadeProp({ fade: "fade-out" });
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
      setFadeProp({ fade: "fade-in" });
    }, 500);
  };

  const handlePrev = () => {
    setFadeProp({ fade: "fade-out" });
    setTimeout(() => {
      setCurrentIndex(
        (prevIndex) => (prevIndex - 1 + reviews.length) % reviews.length
      );
      setFadeProp({ fade: "fade-in" });
    }, 500);
  };

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

  return (
    <Section crosses customPaddings="0 0 0 0" id="whyUse">
      <Box textAlign="center" maxW="62rem" mx="auto">
        <Box
          maxW="800px"
          mx="auto"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          height="80vh"
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

          <Box position="relative" userSelect="none" px={4}>
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

            <VStack
              className={fadeProp.fade}
              p={8}
              borderRadius="2.5rem"
              alignItems="center"
              spacing={4}
              boxShadow="md"
              transition="box-shadow 0.3s ease, transform 0.3s ease"
              _hover={{ boxShadow: "lg", transform: "scale(1.02)" }}
              bgGradient="linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)"
              bgColor="#0f0d15"
              border="2px solid transparent"
              backgroundClip="padding-box, border-box"
              backgroundOrigin="padding-box, border-box"
              backgroundImage="linear-gradient(#0f0d15, #0f0d15), linear-gradient(to right, #00f, #f0f)"
            >
              <Image
                borderRadius="full"
                boxSize="140px"
                src={reviews[currentIndex].image}
                alt={`Image of ${reviews[currentIndex].name}`}
                objectFit="cover"
                mb={4}
              />
              <Text fontSize="lg" color="gray.300">
                {reviews[currentIndex].text}
              </Text>
              <HStack>{renderStars(reviews[currentIndex].rating)}</HStack>
              <Text fontWeight="bold" color="white">
                {reviews[currentIndex].name}
              </Text>
            </VStack>

            <Button
              onClick={handlePrev}
              position="absolute"
              top="50%"
              left="0"
              transform="translateY(-50%)"
              zIndex="1"
              bgGradient="linear(to-r, #7928CA, #FF0080)"
              color="white"
              borderRadius="50%"
              boxShadow="lg"
              _hover={{ transform: "scale(1.1)", boxShadow: "xl" }}
              transition="all 0.3s ease"
            >
              &lt;
            </Button>
            <Button
              onClick={handleNext}
              position="absolute"
              top="50%"
              right="0"
              transform="translateY(-50%)"
              zIndex="1"
              bgGradient="linear(to-r, #7928CA, #FF0080)"
              color="white"
              borderRadius="50%"
              boxShadow="lg"
              _hover={{ transform: "scale(1.1)", boxShadow: "xl" }}
              transition="all 0.3s ease"
            >
              &gt;
            </Button>
          </Box>
        </Box>
      </Box>

      <style jsx>{`
        .fade-in {
          opacity: 1;
          transition: opacity 0.5s ease-in;
        }

        .fade-out {
          opacity: 0;
          transition: opacity 0.5s ease-out;
        }
      `}</style>
    </Section>
  );
};

export default PeopleReviews;
