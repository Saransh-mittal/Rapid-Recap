// components/articleComponents/Sidebar.js

import React from "react";
import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Image,
  Flex,
  Tooltip,
} from "@chakra-ui/react";
import { LockIcon, TriangleDownIcon } from "@chakra-ui/icons";
import Alt_img from "../../assets/alt_image.jpg";
import GivenQuiz from "./GivenQuiz";
import QuizExpired from "./QuizExpired";
import GenerateQuizButton from "./GenerateQuizButton";
import TotalUserAttempted from "./TotalUserAttempted";

const Sidebar = ({
  givenQuiz,
  percentile,
  RQM_score,
  onGoingQuiz,
  quizExpired,
  isQuinBoostAvailable,
  tour,
  trackGenerateQuizClick,
  setShowQuizLangModal,
  setShowQuiz,
  showQuiz,
  onOpen,
  totalUsersGivenQuiz,
  latestNews,
  articleHeight,
  article,
  id,
  state,
}) => {
  const notLoggedIn = state.show;
  return (
    <Box
      boxShadow={"0 100px 200px rgba(1, 1, 1, 1.1)"}
      borderRadius={"15px"}
      p={1.5}
    >
      {givenQuiz ? (
        <GivenQuiz
          articleId={id}
          percentile={percentile}
          RQM_score={RQM_score}
        />
      ) : onGoingQuiz ? (
        <Heading size="md" margin={"5px"} mb={5} height={"100px"} color={"red"}>
          Quiz is Already going on in some other tab or device
        </Heading>
      ) : quizExpired ? (
        <QuizExpired />
      ) : (
        <Flex position={"relative"}>
          <Box
            style={
              notLoggedIn
                ? { filter: "blur(5px)", userSelect: "none" }
                : { userSelect: "text" }
            }
          >
            <GenerateQuizButton
              isQuinBoostAvailable={isQuinBoostAvailable}
              onClick={() => {
                if (notLoggedIn) {
                  return;
                }
                tour.complete();
                trackGenerateQuizClick();
                setShowQuizLangModal(true);
                setShowQuiz(!showQuiz);
                onOpen();
              }}
            />
          </Box>
          {notLoggedIn && (
            <Tooltip label="Please log in to give quiz" placement="top">
              <LockIcon
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                color="white"
                boxSize={8}
                zIndex={2}
              />
            </Tooltip>
          )}
        </Flex>
      )}
      <Box>
        <TotalUserAttempted
          totalUsersGivenQuiz={totalUsersGivenQuiz}
          notLoggedIn={notLoggedIn}
        />
      </Box>
      <Heading as="h3" fontSize="25px" color="white" letterSpacing={1}>
        <TriangleDownIcon color="#F2D7D9" /> Latest Articles
      </Heading>
      <SimpleGrid
        columns={1}
        marginTop={5}
        display={"flex"}
        flexDirection={"column"}
        alignItems={"justify"}
        position={"relative"}
      >
        {latestNews
          .filter(
            (_, idx) =>
              idx < Math.floor(articleHeight / 100) && _._id !== article._id
          )
          .map((item) => {
            return (
              <Box
                minHeight="100px"
                key={item._id}
                onClick={(e) => {
                  if (notLoggedIn) {
                    e.preventDefault();
                    return;
                  }
                  window.location.href = `/article/${item._id}`;
                }}
                style={
                  notLoggedIn
                    ? { filter: "blur(5px)", userSelect: "none" }
                    : { userSelect: "text", cursor: "pointer" }
                }
                borderTop={"2px solid lightblue"}
                p={2}
                w={"100%"}
                display={"flex"}
                alignItems={"center"}
              >
                <Image
                  width="100px"
                  mr={3}
                  mt={-3}
                  height={"60px"}
                  float="left"
                  src={item.imgURL}
                  alt="Article img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = Alt_img;
                    e.target.style.height = `100%`;
                  }}
                />
                <Text mt={2}>{item.title}</Text>
              </Box>
            );
          })}
        {notLoggedIn && (
          <Tooltip label="Please log in to navigate" placement="top">
            <LockIcon
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              color="white"
              boxSize={8}
              zIndex={2}
            />
          </Tooltip>
        )}
      </SimpleGrid>
    </Box>
  );
};

export default Sidebar;
