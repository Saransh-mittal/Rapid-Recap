import React, { useContext, useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Box,
  Flex,
  Heading,
  Radio,
  RadioGroup,
  Stack,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import Section from "../../miscellaneous/Section";
import SliderWithMarks from "./SliderWithMarks";
import {
  initialFormState,
  handleSliderChange,
  getLabelForValue,
} from "./utils/formState";
import { AppContext } from "../../../contextAPI/appContext";

const FeedbackModal = ({ isOpen, onClose }) => {
  const toast = useToast();
  const { state } = useContext(AppContext);
  const loggedIn = !state.show;
  const [formState, setFormState] = useState(initialFormState);
  const [quizIssueAnswer, setQuizIssueAnswer] = useState("no");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (loggedIn && state.user) setEmail(state.user?.email);
  }, [state.show, state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      email: e.target.email.value,
      answers: Object.keys(formState).reduce(
        (acc, key) => {
          acc[key] = getLabelForValue(key, formState[key]);
          return acc;
        },
        {
          scoringSystemLikes: e.target.scoringSystemLikes.value,
          mostUsedFeature: e.target.mostUsedFeature.value,
          missingFeatures: e.target.missingFeatures.value,
          quizIssues: {
            issue: e.target?.quizIssues?.value || "",
            inGameName: e.target?.inGameName?.value || "",
          },
          improvements: e.target.improvements.value,
          additionalComments: e.target.additionalComments.value,
        }
      ),
    };

    try {
      const response = await axios.post(
        "/api/contact/feedback/submit",
        formData
      );
      if (response.status !== 201) {
        throw new Error("Failed to submit feedback");
      }
      toast({
        title: "Feedback submitted successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      onClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Failed to submit feedback",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const sliderMarks = [
    { value: 1, label: "Poor" },
    { value: 2, label: "Average" },
    { value: 3, label: "Good" },
    { value: 4, label: "Excellent" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "full", md: "4xl" }}
    >
      <ModalOverlay />
      <ModalContent
        sx={{
          fontFamily: "'Roboto Condensed', 'Lato', sans-serif",
          color: "white",
          backgroundColor: "#0f0d15",
          backgroundImage:
            "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
        }}
        overflow={"hidden"}
      >
        <ModalHeader
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          w={"100%"}
          mb={3}
        >
          <Heading
            fontSize="3xl"
            fontWeight="bold"
            letterSpacing="3px"
            textTransform="uppercase"
            borderBottom="2px solid"
            pb={"0.2rem"}
            px={0}
            style={{
              background: "linear-gradient(90deg, teal, cyan, purple, pink)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
            textAlign={"center"}
          >
            Feedback
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <Section
          crosses
          customPaddings={`0 4rem 0 4rem`}
          id="feedback"
        >
          <ModalBody
            letterSpacing={"0.105rem"}
            px={0}
          >
            <form onSubmit={handleSubmit}>
              <Box
                mb={4}
                p={"2rem"}
              >
                <FormControl
                  id="email"
                  isRequired
                  mt={4}
                >
                  <FormLabel
                    fontSize="lg"
                    fontWeight="medium"
                    color="cyan.300"
                  >
                    Email
                  </FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      !loggedIn && setEmail(e.target.value);
                    }}
                    color={loggedIn && "grey"}
                  />
                </FormControl>
              </Box>

              <FormLabel
                fontSize="lg"
                fontWeight="medium"
                color="cyan.300"
                ml={"1rem"}
                mt={"2rem"}
              >
                1. How would you rate your overall experience with Rapid Recap?
              </FormLabel>
              <SliderWithMarks
                name="experience"
                defaultValue={3}
                min={1}
                max={4}
                step={1}
                marks={sliderMarks}
                formState={formState}
                handleSliderChange={handleSliderChange(setFormState)}
              />

              <FormLabel
                mt={"3rem"}
                fontSize="lg"
                fontWeight="medium"
                color="cyan.300"
                ml={"1rem"}
              >
                2. How often do you use Rapid Recap?
              </FormLabel>
              <SliderWithMarks
                name="usageFrequency"
                defaultValue={2}
                min={1}
                max={4}
                step={1}
                marks={[
                  { value: 1, label: "Rarely" },
                  { value: 2, label: "Monthly" },
                  { value: 3, label: "Weekly" },
                  { value: 4, label: "Daily" },
                ]}
                formState={formState}
                handleSliderChange={handleSliderChange(setFormState)}
              />

              <FormLabel
                mt={"3rem"}
                fontSize="lg"
                fontWeight="medium"
                color="cyan.300"
                ml={"1rem"}
              >
                3. How satisfied are you with the difficulty level of the
                quizzes?
              </FormLabel>
              <SliderWithMarks
                name="difficultySatisfaction"
                defaultValue={3}
                min={1}
                max={5}
                step={1}
                marks={[
                  { value: 1, label: "Very Dissatisfied" },
                  { value: 2, label: "Dissatisfied" },
                  { value: 3, label: "Neutral" },
                  { value: 4, label: "Satisfied" },
                  { value: 5, label: "Very Satisfied" },
                ]}
                formState={formState}
                handleSliderChange={handleSliderChange(setFormState)}
              />

              <FormLabel
                mt={"3rem"}
                fontSize="lg"
                fontWeight="medium"
                color="cyan.300"
                ml={"1rem"}
              >
                4. Do you feel the IQ score accurately reflects your knowledge
                and understanding of the articles/news?
              </FormLabel>
              <SliderWithMarks
                name="iqAccuracy"
                defaultValue={3}
                min={1}
                max={5}
                step={1}
                marks={[
                  { value: 1, label: "Strongly Disagree" },
                  { value: 2, label: "Disagree" },
                  { value: 3, label: "Neutral" },
                  { value: 4, label: "Agree" },
                  { value: 5, label: "Strongly Agree" },
                ]}
                formState={formState}
                handleSliderChange={handleSliderChange(setFormState)}
              />

              <Box mb={4}>
                <FormControl id="scoringSystemLikes">
                  <FormLabel
                    fontSize="lg"
                    fontWeight="medium"
                    color="cyan.300"
                    ml={"1rem"}
                    mt={"3rem"}
                  >
                    5. What features do you like the most about the scoring
                    system and leaderboard?
                  </FormLabel>
                  <Textarea />
                </FormControl>
              </Box>

              <FormLabel
                fontSize="lg"
                fontWeight="medium"
                color="cyan.300"
                ml={"1rem"}
                mt={"3rem"}
              >
                6. How would you rate the user interface and design of the app?
              </FormLabel>
              <SliderWithMarks
                name="uiDesignRating"
                defaultValue={3}
                min={1}
                max={4}
                step={1}
                marks={sliderMarks}
                formState={formState}
                handleSliderChange={handleSliderChange(setFormState)}
              />

              <FormLabel
                fontSize="lg"
                fontWeight="medium"
                color="cyan.300"
                ml={"1rem"}
                mt={"3rem"}
              >
                7. Is the IQ graph on your profile helpful in tracking your
                progress?
              </FormLabel>
              <SliderWithMarks
                name="iqGraphHelpfulness"
                defaultValue={3}
                min={1}
                max={5}
                step={1}
                marks={[
                  { value: 1, label: "Very Unhelpful" },
                  { value: 2, label: "Unhelpful" },
                  { value: 3, label: "Neutral" },
                  { value: 4, label: "Helpful" },
                  { value: 5, label: "Very Helpful" },
                ]}
                formState={formState}
                handleSliderChange={handleSliderChange(setFormState)}
              />

              <FormLabel
                fontSize="lg"
                fontWeight="medium"
                color="cyan.300"
                ml={"1rem"}
                mt={"3rem"}
              >
                8. Do you find the IQ bar graph showing the top percentage of
                the population useful?
              </FormLabel>
              <SliderWithMarks
                name="iqBarGraphUsefulness"
                defaultValue={3}
                min={1}
                max={5}
                step={1}
                marks={[
                  { value: 1, label: "Very Not Useful" },
                  { value: 2, label: "Not Useful" },
                  { value: 3, label: "Neutral" },
                  { value: 4, label: "Useful" },
                  { value: 5, label: "Very Useful" },
                ]}
                formState={formState}
                handleSliderChange={handleSliderChange(setFormState)}
              />

              <Box
                mb={4}
                ml={"1rem"}
                mt={"3rem"}
              >
                <FormControl id="mostUsedFeature">
                  <FormLabel
                    fontSize="lg"
                    fontWeight="medium"
                    color="cyan.300"
                  >
                    9. Which feature do you use the most?
                  </FormLabel>
                  <Input type="text" />
                </FormControl>
              </Box>

              <Box
                mb={4}
                ml={"1rem"}
                mt={"3rem"}
              >
                <FormControl id="missingFeatures">
                  <FormLabel
                    fontSize="lg"
                    fontWeight="medium"
                    color="cyan.300"
                  >
                    10. Are there any features you find missing or would like to
                    see added?
                  </FormLabel>
                  <Textarea />
                </FormControl>
              </Box>

              <FormLabel
                fontSize="lg"
                fontWeight="medium"
                color="cyan.300"
                ml={"1rem"}
                mt={"3rem"}
              >
                11. Do you find the concept of societies (Explorers, Strivers,
                Elites, Mavericks) motivating?
              </FormLabel>
              <SliderWithMarks
                name="societyMotivation"
                defaultValue={3}
                min={1}
                max={5}
                step={1}
                marks={[
                  { value: 1, label: "Very Not Motivating" },
                  { value: 2, label: "Not Motivating" },
                  { value: 3, label: "Neutral" },
                  { value: 4, label: "Motivating" },
                  { value: 5, label: "Very Motivating" },
                ]}
                formState={formState}
                handleSliderChange={handleSliderChange(setFormState)}
              />

              <FormLabel
                fontSize="lg"
                fontWeight="medium"
                color="cyan.300"
                ml={"1rem"}
                mt={"3rem"}
              >
                12. How often do you encounter technical issues (e.g., app
                crashes, slow loading times)?
              </FormLabel>
              <SliderWithMarks
                name="technicalIssuesFrequency"
                defaultValue={3}
                min={1}
                max={5}
                step={1}
                marks={[
                  { value: 1, label: "Never" },
                  { value: 2, label: "Rarely" },
                  { value: 3, label: "Sometimes" },
                  { value: 4, label: "Often" },
                  { value: 5, label: "Always" },
                ]}
                formState={formState}
                handleSliderChange={handleSliderChange(setFormState)}
              />

              <Box
                mb={4}
                ml={"1rem"}
                mt={"3rem"}
              >
                <FormControl as="fieldset">
                  <FormLabel
                    as="legend"
                    fontSize="lg"
                    fontWeight="medium"
                    color="cyan.300"
                  >
                    13. Have you ever faced issues with quiz scoring or
                    leaderboard updates? If yes, please describe.
                  </FormLabel>
                  <RadioGroup
                    defaultValue="no"
                    onChange={setQuizIssueAnswer}
                    value={quizIssueAnswer}
                  >
                    <Stack direction="row">
                      <Radio value="yes">Yes</Radio>
                      <Radio value="no">No</Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>
                {quizIssueAnswer === "yes" && (
                  <>
                    <FormControl
                      id="inGameName"
                      mt={4}
                      isRequired
                    >
                      <FormLabel
                        fontSize="lg"
                        fontWeight="medium"
                        color="cyan.300"
                      >
                        In-Game Name
                      </FormLabel>
                      <Input type="text" />
                    </FormControl>
                    <FormControl
                      id="quizIssues"
                      mt={4}
                      isRequired
                    >
                      <Textarea placeholder="Describe the issues..." />
                    </FormControl>
                  </>
                )}
              </Box>

              <Box
                mb={4}
                ml={"1rem"}
                mt={"3rem"}
              >
                <FormControl id="improvements">
                  <FormLabel
                    fontSize="lg"
                    fontWeight="medium"
                    color="cyan.300"
                  >
                    14. What improvements would you suggest for Rapid Recap?
                  </FormLabel>
                  <Textarea />
                </FormControl>
              </Box>

              <FormLabel
                fontSize="lg"
                fontWeight="medium"
                color="cyan.300"
                ml={"1rem"}
                mt={"3rem"}
              >
                15. Would you recommend Rapid Recap to a friend or colleague?
              </FormLabel>
              <SliderWithMarks
                name="recommendationLikelihood"
                defaultValue={3}
                min={1}
                max={5}
                step={1}
                marks={[
                  { value: 1, label: "Definitely Not" },
                  { value: 2, label: "Probably Not" },
                  { value: 3, label: "Not Sure" },
                  { value: 4, label: "Probably" },
                  { value: 5, label: "Definitely" },
                ]}
                formState={formState}
                handleSliderChange={handleSliderChange(setFormState)}
              />

              <Box
                mb={4}
                ml={"1rem"}
                mt={"3rem"}
              >
                <FormControl id="additionalComments">
                  <FormLabel
                    fontSize="lg"
                    fontWeight="medium"
                    color="cyan.300"
                  >
                    16. Any additional comments or feedback?
                  </FormLabel>
                  <Textarea />
                </FormControl>
              </Box>
              <Flex
                justifyContent={"center"}
                alignItems={"center"}
              >
                <Button
                  my={"2rem"}
                  colorScheme="teal"
                  type="submit"
                >
                  Submit
                </Button>
              </Flex>
            </form>
          </ModalBody>
        </Section>
      </ModalContent>
    </Modal>
  );
};

export default FeedbackModal;
