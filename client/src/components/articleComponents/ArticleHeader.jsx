// components/articleComponents/ArticleHeader.js

import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowBackIcon, LockIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Select,
  Text,
  Image,
  Badge,
  Tooltip,
} from "@chakra-ui/react";
import TextBackgound from "/images/textBackground.png";
import starBoost from "/GIFs/starBoost.gif";
import QuinBoost from "./quizComponents/QuinBoost";

const ArticleHeader = ({
  handleLanguageChange,
  isQuinBoostAvailable,
  openModal,
  quizLeftToGetQuizBoost,
  state,
  quinTour,
}) => {
  const notLoggedIn = state.show;
  const navigate = useNavigate();
  return (
    <Flex
      w={"100%"}
      marginTop={"2rem"}
      marginBottom={"0"}
      gap={10}
      flexDirection={{ base: "column", md: "row" }}
      alignItems={"center"}
    >
      <Flex
        h={"100%"}
        w={{ base: "100%", md: "auto" }}
        gap={10}
        className="lang-back-flex"
      >
        <Box
          marginLeft={{ base: "40px", md: "80px" }}
          top={"6rem"}
          border={"solid"}
          p={1}
          borderRadius="5px"
          boxShadow="md"
          cursor="pointer"
          _hover={{ bg: "#37474f", color: "#f0f0f0" }}
          onClick={() => navigate(-1)}
          height={"40px"}
          w={"40px"}
        >
          <ArrowBackIcon />
        </Box>
        <Box position={"relative"}>
          <Select
            variant="outline"
            w={"150px"}
            backgroundColor={"#2A2F4F"}
            defaultValue="english"
            onChange={handleLanguageChange}
            style={notLoggedIn ? { filter: "blur(5px)" } : {}}
          >
            <option style={{ backgroundColor: "#2A2F4F" }} value="english">
              English
            </option>
            <option style={{ backgroundColor: "#2A2F4F" }} value="hindi">
              Hindi
            </option>
          </Select>
          {notLoggedIn && (
            <Tooltip label="Please log in to change language" placement="top">
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
        </Box>
      </Flex>
      <Flex
        flexDirection={"column"}
        position={"relative"}
        className="quin-boost-tag"
      >
        {isQuinBoostAvailable ? (
          <QuinBoost />
        ) : (
          !state.isBoosted && (
            <>
              <Text
                m={0}
                p={0}
                textAlign={"left"}
                paddingLeft={"30px"}
                position={"absolute"}
                color={"#9CAFAA"}
                fontWeight={"bold"}
              >
                Quin Boost
              </Text>
              <Flex
                marginTop={"5px"}
                position={"relative"}
                justifyContent={"center"}
                alignItems={"center"}
                onClick={(e) => {
                  if (notLoggedIn) {
                    e.preventDefault();
                    return;
                  }
                  quinTour.complete();
                  openModal();
                }}
                style={{ cursor: "pointer" }}
              >
                <Image
                  src={TextBackgound}
                  background={"none"}
                  height={"100px"}
                  width={"200px"}
                  className="quin-boost-tracker"
                  style={notLoggedIn ? { filter: "blur(5px)" } : {}}
                />
                <Text
                  m={0}
                  p={0}
                  textAlign={"left"}
                  position={"absolute"}
                  color={"black"}
                  fontSize={"20px"}
                  fontWeight={"bold"}
                >
                  {quizLeftToGetQuizBoost} Quiz Left
                </Text>
                {notLoggedIn && (
                  <Tooltip
                    label="Please log in to use the feature"
                    placement="top"
                  >
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
            </>
          )
        )}
      </Flex>
      {state.isBoosted && (
        <Flex
          justifyContent={"center"}
          alignItems={"center"}
          gap={2}
          marginTop={"10px"}
          onClick={openModal}
          style={{ cursor: "pointer" }}
        >
          <Image
            src={starBoost}
            background={"none"}
            height={"60px"}
            w={"60px"}
          />
          <Badge fontSize={"1.2rem"} color={"yellow"} background={"none"}>
            Enjoy!! 1.5x multiplier
          </Badge>
        </Flex>
      )}
    </Flex>
  );
};

export default ArticleHeader;
