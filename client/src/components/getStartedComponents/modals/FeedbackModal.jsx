import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Box,
  Flex,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const FeedbackModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic
    onClose();
  };

  const sliderMarks = [
    { value: 1, label: "Poor" },
    { value: 2, label: "Average" },
    { value: 3, label: "Good" },
    { value: 4, label: "Excellent" },
  ];

  const renderSliderWithMarks = (defaultValue, min, max, step, marks) => (
    <Box mb={4}>
      <Slider
        defaultValue={defaultValue}
        min={min}
        max={max}
        step={step}
        width="80%"
        ml={"10%"}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb
          boxSize={4}
          _before={{
            content: '""',
            boxSize: "10px",
            borderRadius: "full",
            bg: "teal.500",
            filter: "blur(4px)",
          }}
        />
      </Slider>
      <Flex justifyContent="space-between" mt={2}>
        {marks.map((mark) => (
          <Text
            key={mark.value}
            fontSize="sm"
            width="20%"
            textAlign="center"
            color="white"
          >
            {mark.label}
          </Text>
        ))}
      </Flex>
    </Box>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent
        sx={{
          fontFamily: "'Roboto Condensed', 'Lato', sans-serif",
          color: "white",
          backgroundColor: "#0f0d15",
          backgroundImage:
            "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
        }}
      >
        <ModalHeader fontSize="2xl" fontWeight="bold" color="teal.400">
          Feedback
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <Box mb={4}>
              <FormControl id="email" isRequired mt={4}>
                <FormLabel fontSize="lg" fontWeight="medium" color="cyan.300">
                  Email
                </FormLabel>
                <Input type="email" />
              </FormControl>
            </Box>

            <FormLabel fontSize="lg" fontWeight="medium" color="cyan.300">
              How would you rate your overall experience with Rapid Recap?
            </FormLabel>
            {renderSliderWithMarks(3, 1, 4, 1, sliderMarks)}

            <FormLabel fontSize="lg" fontWeight="medium" color="cyan.300">
              How often do you use Rapid Recap?
            </FormLabel>
            {renderSliderWithMarks(2, 1, 4, 1, [
              { value: 1, label: "Rarely" },
              { value: 2, label: "Monthly" },
              { value: 3, label: "Weekly" },
              { value: 4, label: "Daily" },
            ])}

            <FormLabel fontSize="lg" fontWeight="medium" color="cyan.300">
              How satisfied are you with the difficulty level of the quizzes?
            </FormLabel>
            {renderSliderWithMarks(3, 1, 5, 1, [
              { value: 1, label: "Very Dissatisfied" },
              { value: 2, label: "Dissatisfied" },
              { value: 3, label: "Neutral" },
              { value: 4, label: "Satisfied" },
              { value: 5, label: "Very Satisfied" },
            ])}

            <FormLabel fontSize="lg" fontWeight="medium" color="cyan.300">
              Do you feel the IQ score accurately reflects your knowledge and
              understanding of the articles/news?
            </FormLabel>
            {renderSliderWithMarks(3, 1, 5, 1, [
              { value: 1, label: "Strongly Disagree" },
              { value: 2, label: "Disagree" },
              { value: 3, label: "Neutral" },
              { value: 4, label: "Agree" },
              { value: 5, label: "Strongly Agree" },
            ])}

            <Box mb={4}>
              <FormControl id="scoringSystemLikes">
                <FormLabel fontSize="lg" fontWeight="medium" color="cyan.300">
                  What features do you like the most about the scoring system
                  and leaderboard?
                </FormLabel>
                <Textarea />
              </FormControl>
            </Box>

            <FormLabel fontSize="lg" fontWeight="medium" color="cyan.300">
              How would you rate the user interface and design of the app?
            </FormLabel>
            {renderSliderWithMarks(3, 1, 4, 1, sliderMarks)}

            <FormLabel fontSize="lg" fontWeight="medium" color="cyan.300">
              Is the IQ graph on your profile helpful in tracking your progress?
            </FormLabel>
            {renderSliderWithMarks(3, 1, 5, 1, [
              { value: 1, label: "Very Unhelpful" },
              { value: 2, label: "Unhelpful" },
              { value: 3, label: "Neutral" },
              { value: 4, label: "Helpful" },
              { value: 5, label: "Very Helpful" },
            ])}

            <FormLabel fontSize="lg" fontWeight="medium" color="cyan.300">
              Do you find the IQ bar graph showing the top percentage of the
              population useful?
            </FormLabel>
            {renderSliderWithMarks(3, 1, 5, 1, [
              { value: 1, label: "Very Not Useful" },
              { value: 2, label: "Not Useful" },
              { value: 3, label: "Neutral" },
              { value: 4, label: "Useful" },
              { value: 5, label: "Very Useful" },
            ])}

            <Box mb={4}>
              <FormControl id="mostUsedFeature" isRequired>
                <FormLabel fontSize="lg" fontWeight="medium" color="cyan.300">
                  Which feature do you use the most?
                </FormLabel>
                <Input type="text" />
              </FormControl>
            </Box>

            <Box mb={4}>
              <FormControl id="missingFeatures">
                <FormLabel fontSize="lg" fontWeight="medium" color="cyan.300">
                  Are there any features you find missing or would like to see
                  added?
                </FormLabel>
                <Textarea />
              </FormControl>
            </Box>

            <FormLabel fontSize="lg" fontWeight="medium" color="cyan.300">
              Do you find the concept of societies (Explorers, Strivers, Elites,
              Mavericks) motivating?
            </FormLabel>
            {renderSliderWithMarks(3, 1, 5, 1, [
              { value: 1, label: "Very Not Motivating" },
              { value: 2, label: "Not Motivating" },
              { value: 3, label: "Neutral" },
              { value: 4, label: "Motivating" },
              { value: 5, label: "Very Motivating" },
            ])}

            <FormLabel fontSize="lg" fontWeight="medium" color="cyan.300">
              How often do you encounter technical issues (e.g., app crashes,
              slow loading times)?
            </FormLabel>
            {renderSliderWithMarks(3, 1, 5, 1, [
              { value: 1, label: "Never" },
              { value: 2, label: "Rarely" },
              { value: 3, label: "Sometimes" },
              { value: 4, label: "Often" },
              { value: 5, label: "Always" },
            ])}

            <Box mb={4}>
              <FormControl id="quizIssues">
                <FormLabel fontSize="lg" fontWeight="medium" color="cyan.300">
                  Have you ever faced issues with quiz scoring or leaderboard
                  updates? If yes, please describe.
                </FormLabel>
                <Textarea />
              </FormControl>
            </Box>

            <Box mb={4}>
              <FormControl id="improvements">
                <FormLabel fontSize="lg" fontWeight="medium" color="cyan.300">
                  What improvements would you suggest for Rapid Recap?
                </FormLabel>
                <Textarea />
              </FormControl>
            </Box>

            <FormLabel fontSize="lg" fontWeight="medium" color="cyan.300">
              Would you recommend Rapid Recap to a friend or colleague?
            </FormLabel>
            {renderSliderWithMarks(3, 1, 5, 1, [
              { value: 1, label: "Definitely Not" },
              { value: 2, label: "Probably Not" },
              { value: 3, label: "Not Sure" },
              { value: 4, label: "Probably" },
              { value: 5, label: "Definitely" },
            ])}

            <Box mb={4}>
              <FormControl id="additionalComments">
                <FormLabel fontSize="lg" fontWeight="medium" color="cyan.300">
                  Any additional comments or feedback?
                </FormLabel>
                <Textarea />
              </FormControl>
            </Box>

            <Button mt={4} colorScheme="teal" type="submit" ml={"40%"}>
              Submit
            </Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default FeedbackModal;
