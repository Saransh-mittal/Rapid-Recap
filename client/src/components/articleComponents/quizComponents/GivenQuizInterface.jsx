import React, { useEffect, useState } from "react";
import {
  Button,
  Grid,
  GridItem,
  Text,
  Box,
  Progress,
  Flex,
} from "@chakra-ui/react";

const GivenQuizInterface = ({ currentQuestionIndex, quizGivenSummary }) => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (quizGivenSummary.length > 0) {
      setLoading(false);
    }
  }, [currentQuestionIndex, quizGivenSummary]);
  return (
    <>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <>
          <Flex
            width={"100%"}
            justifyContent={"center"}
            gap={"10px"}
            alignItems={"center"}
            marginBottom={"20px"}
          >
            <Progress
              hasStripe
              value={
                ((currentQuestionIndex + 1) / quizGivenSummary.length) * 100
              }
              width={{ base: "100%", md: "80%" }}
              height={"10px"}
              marginBottom={"20px"}
              borderRadius={"50px"}
              colorScheme="blue"
              marginY={"auto"}
            />

            <Text marginY={"auto"} color={"white"} textAlign={"center"}>
              {`${currentQuestionIndex + 1} / ${quizGivenSummary.length}`}
            </Text>
          </Flex>
          {quizGivenSummary.length > 0 && (
            <>
              <Text
                p={2}
                letterSpacing={0.5}
                marginBottom={"50px"}
                overflowWrap="break-word"
                color={"black"}
                fontSize={"20px"}
                userSelect={"none"}
              >
                {quizGivenSummary.length > 0
                  ? quizGivenSummary[currentQuestionIndex].question
                  : ""}
              </Text>
              <Grid templateColumns={{ md: "1fr 1fr" }} gap="25px">
                {quizGivenSummary[currentQuestionIndex]?.options &&
                  Object.entries(
                    quizGivenSummary?.length > 0
                      ? quizGivenSummary[currentQuestionIndex]?.options
                      : []
                  )?.map(([optionKey, optionText]) => (
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
                        _hover={"none"}
                        isDisabled={
                          quizGivenSummary[
                            currentQuestionIndex
                          ].answer.toLocaleUpperCase() ===
                            optionKey.toLocaleUpperCase() ||
                          quizGivenSummary[
                            currentQuestionIndex
                          ].userAnswer.toLocaleUpperCase() ===
                            optionKey.toLocaleUpperCase()
                            ? false
                            : true
                        }
                        border={"1px solid lightgray"}
                        overflowWrap="break-word"
                        display={"flex"}
                        whiteSpace="normal"
                        justifyContent={"flex-start"}
                        bg={
                          quizGivenSummary[
                            currentQuestionIndex
                          ].answer.toLocaleUpperCase() ===
                          optionKey.toLocaleUpperCase()
                            ? "green.300" // Background color when selected
                            : quizGivenSummary[
                                currentQuestionIndex
                              ].userAnswer.toLocaleUpperCase() ===
                              optionKey.toLocaleUpperCase()
                            ? "red.300"
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
                          "#FAF0E6" // Default text color
                        }
                      >
                        {`${optionText}`}
                      </Button>
                    </GridItem>
                  ))}
              </Grid>
            </>
          )}
        </>
      )}
    </>
  );
};

export default GivenQuizInterface;
