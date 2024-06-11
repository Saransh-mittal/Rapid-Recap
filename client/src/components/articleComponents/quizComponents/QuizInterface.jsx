import React from "react";
import {
  Button,
  Grid,
  GridItem,
  Text,
  Box,
  Progress,
  Flex,
  Skeleton,
} from "@chakra-ui/react";
const QuizInterface = ({
  load,
  currentQuestionIndex,
  totalQuestions,
  quizData,
  handleAnswer,
  userAnswers,
}) => {
  return (
    <>
      <Skeleton w={"100%"} borderRadius={"10px"} isLoaded={!load}>
        <Flex
          width={"100%"}
          justifyContent={"center"}
          gap={"10px"}
          alignItems={"center"}
          marginBottom={"20px"}
        >
          <Progress
            hasStripe
            value={(currentQuestionIndex / totalQuestions) * 100}
            width={{ base: "100%", md: "80%" }}
            height={"10px"}
            marginBottom={"20px"}
            borderRadius={"50px"}
            colorScheme="blue"
            marginY={"auto"}
          />

          <Text marginY={"auto"} color={"white"} textAlign={"center"}>
            {`${currentQuestionIndex} / ${totalQuestions}`}
          </Text>
        </Flex>
      </Skeleton>
      <Skeleton
        isLoaded={!load}
        display={!load ? "none" : "flex"}
        marginBottom={load ? "10px" : "0"} // remove this when skeleton isLoaded
        marginTop={load ? "10px" : "0"} // remove this when skeleton isLoaded
        borderRadius={"10px"}
        flexDirection={"column"}
        alignItems={"center"}
        minHeight={"300px"}
        width={"100%"}
      />
      {quizData !== null && (
        <>
          {/* <Image
                        src={article.imgURL}
                        alt="Article Image"
                        borderRadius="md"
                        marginBottom="5"
                        width={{ base: "100%", md: "50%" }}
                        height="auto"
                      /> */}
          <Text
            p={2}
            letterSpacing={0.5}
            marginBottom={"50px"}
            overflowWrap="break-word"
            color={"black"}
            fontSize={"20px"}
            userSelect={"none"}
          >
            {quizData.questions.length > 0
              ? quizData.questions[currentQuestionIndex].question
              : ""}
          </Text>
          <Grid templateColumns={{ md: "1fr 1fr" }} gap="25px">
            {Object.entries(
              quizData.questions.length > 0
                ? quizData.questions[currentQuestionIndex].options
                : {}
            ).map(([optionKey, optionText]) => (
              <GridItem key={optionKey} display={"flex"}>
                <Box
                  display={"flex"}
                  flexDirection={"row"}
                  alignItems={"center"}
                  marginRight={2}
                  color={"black"}
                  fontWeight={"bold"}
                  minW={"25px"}
                  userSelect={"none"}
                >{`${optionKey.toLocaleUpperCase()} :`}</Box>
                <Button
                  border={"1px solid lightgray"}
                  overflowWrap="break-word"
                  display={"flex"}
                  whiteSpace="normal"
                  justifyContent={"flex-start"}
                  onClick={() => handleAnswer(optionKey)}
                  bg={
                    userAnswers[currentQuestionIndex] === optionKey
                      ? "#DDE6ED" // Background color when selected
                      : "#183D3D" // Default background color
                  }
                  variant={"outline"}
                  width={"100%"}
                  maxWidth={"400px"}
                  textAlign={"left"}
                  height={"auto"}
                  px={2}
                  py={2}
                  color={
                    userAnswers[currentQuestionIndex] === optionKey
                      ? "#27374D" // Text color when selected
                      : "#FAF0E6" // Default text color
                  }
                  _hover={{ color: "#163020", bg: "#ADC4CE" }} // Hover effect
                >
                  {`${optionText}`}
                </Button>
              </GridItem>
            ))}
          </Grid>
        </>
      )}
    </>
  );
};

export default QuizInterface;
