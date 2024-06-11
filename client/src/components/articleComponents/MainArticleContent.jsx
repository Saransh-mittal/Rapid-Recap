// components/articleComponents/MainArticleContent.js

import React from "react";
import {
  Box,
  Flex,
  GridItem,
  Heading,
  Highlight,
  Image,
  Skeleton,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { LockIcon } from "@chakra-ui/icons";

const MainArticleContent = ({
  article,
  translateLoading,
  selectedLanguage,
  title,
  author,
  mainText,
  data,
  alt_image,
  textRef,
  articleRef,
  textHeight,
  state,
}) => {
  const notLoggedIn = state.show;
  return (
    <Skeleton isLoaded={!translateLoading}>
      {article && (
        <GridItem w="100%" className="article-container">
          <Heading
            align="left"
            letterSpacing={1}
            as="h3"
            fontSize="25px"
            bg="#2A2F4F"
            p={2}
            color="#FDE2F3"
            borderRadius="xl"
            marginBottom="20px"
          >
            {title[selectedLanguage]}
          </Heading>

          <Heading
            align="left"
            letterSpacing={1}
            as="h4"
            fontSize="15px"
            marginTop="10px"
          >
            <Highlight
              query="Author:"
              styles={{ px: "2", py: "1", rounded: "full", bg: "#F7EFE5" }}
              margin="5px"
            >
              Author:
            </Highlight>
            <span style={{ fontSize: "20px", marginLeft: "10px" }}>
              {author[selectedLanguage]}
            </span>
          </Heading>

          {mainText[selectedLanguage].length === 3 ? (
            <Box marginTop={5} ref={articleRef}>
              <Text align="justify" letterSpacing={0}>
                {mainText[selectedLanguage][0]}
              </Text>
              <Box
                marginTop="2"
                marginBottom="2"
                display={"flex"}
                alignItems={"justify"}
                height={"100%"}
              >
                <Flex
                  w={"100%"}
                  height={"100%"}
                  marginRight={"3"}
                  css={{
                    "@media screen and (max-width: 1366px)": {
                      display: "none",
                    },
                  }}
                >
                  <Image
                    src={
                      Array.isArray(data.imgURL) && data.imgURL.length > 0
                        ? data.imgURL[0]
                        : !Array.isArray(data.imgURL) && data.imgURL
                        ? data.imgURL
                        : alt_image
                    }
                    alt="Article Image"
                    borderRadius="md"
                    float={"left"}
                    height={`${textHeight}px`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = alt_image;
                      e.target.style.height = `${textHeight}px`;
                    }}
                  />
                </Flex>
                <Flex position={"relative"}>
                  <Text
                    ref={textRef}
                    align="justify"
                    letterSpacing={0}
                    style={
                      notLoggedIn
                        ? { filter: "blur(5px)", userSelect: "none" }
                        : { userSelect: "text" }
                    }
                  >
                    {mainText[selectedLanguage][1]}
                  </Text>
                  {notLoggedIn && (
                    <Tooltip
                      label="Please log in to view content"
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
              </Box>
              <Text
                align="justify"
                letterSpacing={0}
                style={
                  notLoggedIn
                    ? { filter: "blur(5px)", userSelect: "none" }
                    : { userSelect: "text" }
                }
              >
                {mainText[selectedLanguage][2]}
              </Text>
            </Box>
          ) : (
            <Box marginTop={8} ref={articleRef}>
              <Image
                css={{
                  "@media screen and (max-width: 1366px)": {
                    display: "none",
                  },
                }}
                src={
                  Array.isArray(data.imgURL) && data.imgURL.length > 0
                    ? data.imgURL[0]
                    : !Array.isArray(data.imgURL) && data.imgURL
                    ? data.imgURL
                    : alt_image
                }
                alt="Article Image"
                borderRadius="md"
                marginBottom="5"
                marginRight="5"
                float={"left"}
                height={`${textHeight}px`}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = alt_image;
                  e.target.style.height = `${textHeight}px`;
                }}
              />
              <Text ref={textRef} align="left" letterSpacing={1}>
                {mainText[selectedLanguage][0]}
              </Text>
              <Flex position={"relative"}>
                <Text
                  align="left"
                  letterSpacing={1}
                  style={
                    notLoggedIn
                      ? { filter: "blur(5px)", userSelect: "none" }
                      : { userSelect: "text" }
                  }
                >
                  {mainText[selectedLanguage][1]}
                </Text>
                {notLoggedIn && (
                  <Tooltip
                    label="Please log in to view content"
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
            </Box>
          )}
        </GridItem>
      )}
    </Skeleton>
  );
};

export default MainArticleContent;
