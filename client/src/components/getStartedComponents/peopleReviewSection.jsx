import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Image,
  Text,
  VStack,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

const PeopleReviews = () => {
  const reviews = [
    { src: "path/to/avatar1", alt: "Avatar 1", text: "Review 1" },
    { src: "path/to/avatar2", alt: "Avatar 2", text: "Review 2" },
    { src: "path/to/avatar3", alt: "Avatar 3", text: "Review 3" },
    { src: "path/to/avatar4", alt: "Avatar 4", text: "Review 4" },
    { src: "path/to/avatar5", alt: "Avatar 5", text: "Review 5" },
    { src: "path/to/avatar6", alt: "Avatar 6", text: "Review 6" },
    { src: "path/to/avatar7", alt: "Avatar 7", text: "Review 7" },
    { src: "path/to/avatar8", alt: "Avatar 8", text: "Review 8" },
    { src: "path/to/avatar9", alt: "Avatar 9", text: "Review 9" },
    { src: "path/to/avatar10", alt: "Avatar 10", text: "Review 10" },
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const getVisibleReviews = () => {
    const visibleReviews = [];
    for (let i = 0; i < 5; i++) {
      const index = (currentIndex + i) % reviews.length;
      visibleReviews.push(reviews[index]);
    }
    return visibleReviews;
  };

  const visibleReviews = getVisibleReviews();

  return (
    <Box mb={8}>
      <Flex justify="space-between" align="center" mb={4}>
        <IconButton
          icon={<ChevronLeftIcon />}
          onClick={handlePrev}
          aria-label="Previous"
        />
        <IconButton
          icon={<ChevronRightIcon />}
          onClick={handleNext}
          aria-label="Next"
        />
      </Flex>
      <Box overflow="hidden" width="100%">
        <HStack
          spacing={4}
          justify="center"
          transition="transform 0.5s ease-in-out"
          width="100%"
        >
          {visibleReviews.map((review, index) => (
            <VStack
              key={index}
              p={4}
              borderWidth={1}
              borderRadius="md"
              minWidth="20%"
              textAlign="center"
              transform={index === 2 ? "scale(1.2)" : "scale(1)"}
              transition="transform 0.5s, opacity 0.5s"
              opacity={index === 2 ? 1 : 0.7}
            >
              <Image
                src={review.src}
                alt={review.alt}
                boxSize={index === 2 ? "120px" : "100px"}
                borderRadius="full"
                transition="box-size 0.5s"
              />
              <Text>{review.text}</Text>
            </VStack>
          ))}
        </HStack>
      </Box>
    </Box>
  );
};

export default PeopleReviews;
