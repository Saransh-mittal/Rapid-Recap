import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../contextAPI/appContext";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowBackIcon, TriangleDownIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  Highlight,
  Image,
  SimpleGrid,
  Text,
  useToast,
  useDisclosure,
  Tooltip,
} from "@chakra-ui/react";
import Loading from "../components/miscellaneous/Loading";
import Quiz from "../components/articleComponents/Quiz";
import GenerateQuizButton from "../components/articleComponents/GenerateQuizButton";

import QuizExpired from "../components/articleComponents/QuizExpired";
import Alt_img from "../assets/alt_image.jpg";
import GivenQuiz from "../components/articleComponents/GivenQuiz";
import imageData from "../assets/AltNewsImage";
import { useShepherdTour } from "react-shepherd";
import stepsGuideArticle from "../components/articleComponents/stepsGuideArticle";
import ExpectedIQModal from "../components/articleComponents/ExpectedIQModal";
const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: true,
    },
  },
  useModalOverlay: true,
};

const Article = () => {
  const tour = useShepherdTour({ tourOptions, steps: stepsGuideArticle });
  const toast = useToast();
  const { state, dispatch } = useContext(AppContext);
  const data = state.news;
  const alt_image = imageData.find(
    (img) =>
      img.category.toLocaleLowerCase() === data.category.toLocaleLowerCase()
  )?.image;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [latestNews, setLatestNews] = useState([]);
  const [load, setLoad] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [textHeight, setTextHeight] = useState(0);
  const [articleHeight, setArticleHeight] = useState(0);
  const [givenQuiz, setGivenQuiz] = useState(false);
  const textRef = useRef();
  const articleRef = useRef();
  const [percentile, setPercentile] = useState(null);
  const [RQM_score, setRQM_score] = useState(null);
  const [onGoingQuiz, setOnGoingQuiz] = useState(false);
  const [quizExpired, setQuizExpired] = useState(false);
  const [showExpectedIQ, setShowExpectedIQ] = useState(false);
  const [expectedIQ, setExpectedIQ] = useState(null);
  //const [showInstruction, setShowInstruction] = useState(false);

  const fetchArticle = async () => {
    try {
      const response = await axios.get(`/api/articles/article/${id}`);
      const news = await axios.get(`/api/articles?page=1&pageSize=9`);

      setLatestNews(news.data);
      //console.log(news.data);
      setArticle(response.data.newArticle);
      setQuizExpired(response.data.quizExpired);
    } catch (error) {
      // Handle errors
      toast({
        title: "Error",
        description: error.response.data.error || "Error fetching article",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      console.log(error.response.data.error);
    } finally {
      setLoad(false);
    }
  };

  const isQuizGiven = async () => {
    const userId = state.user._id;
    const articleId = id;

    try {
      const response = await axios.get(
        `/api/quiz/given/${articleId}/${userId}`
      );
      if (response.data.given) {
        setPercentile(response.data.percentile);
        setRQM_score(response.data.RQM_score);
        setGivenQuiz(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response.data.error || "Error checking for given quiz",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      console.log(error.message);
    }
  };

  const checkOnGoingQuiz = async () => {
    //const hasBeenCalled = localStorage.getItem("isQuizGivenCalled");
    //if (!hasBeenCalled) {
    try {
      const response = await axios.get(`/api/articles/quizStatus/${id}`);
      if (response.data.status) {
        setOnGoingQuiz(true);
      } else {
        setOnGoingQuiz(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response.data.error || "Error checking for on going quiz",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      console.log(error.message);
    } finally {
      localStorage.setItem("isQuizGivenCalled", true);
    }
    //}
  };

  const getExpectedIQ = async () => {
    try {
      const articlePage = document?.querySelector(".article-page");
      document.querySelector("body").style.overflow = "hidden"; // Remove scroll behavior from body
      const overlay = document.createElement("div");
      overlay.classList.add("custom-overlay");
      const overlayNav = document.createElement("div");
      overlayNav.classList.add("custom-overlay-nav");
      articlePage?.appendChild(overlay);
      document.querySelector(".navbar").appendChild(overlayNav);
      articlePage?.classList.add("shepherd-active");
      const loadingOverlay = document.createElement("div");
      loadingOverlay.classList.add("loading-overlay");
      const spinnerContainer = document.createElement("div");
      spinnerContainer.classList.add("spinner-container");
      const loadingSpinner = document.createElement("div");
      loadingSpinner.classList.add("loading-spinner");
      spinnerContainer.appendChild(loadingSpinner);
      loadingOverlay.appendChild(spinnerContainer);
      articlePage?.appendChild(loadingOverlay);
      const response = await axios.get(`/api/user/expectedIQScore`);
      setShowExpectedIQ(true);
      setExpectedIQ(response.data.ExpectedIQScore);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response.data.error || "Error checking for expected IQ",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      console.log(error.message);
    } finally {
      // Remove loading overlay
      const loadingOverlay = document.querySelector(".loading-overlay");
      if (loadingOverlay) {
        loadingOverlay.remove();
      }
      // Restore scroll behavior
      document.querySelector("body").style.overflow = "auto";
      const overlay = document.querySelector(".custom-overlay");
      if (overlay) overlay.remove();
      const overlayNav = document.querySelector(".custom-overlay-nav");
      if (overlayNav) overlayNav.remove();
      const articlePage = document?.querySelector(".article-page");
      articlePage?.classList.remove("shepherd-active");
    }
  };

  useEffect(() => {
    const body = document.querySelector("body");
    const handleTourStart = () => {
      body.style.overflow = "hidden"; // Reapply scroll behavior
      const overlay = document.createElement("div");
      overlay.classList.add("custom-overlay");
      const overlayNav = document.createElement("div");
      overlayNav.classList.add("custom-overlay-nav");
      document.querySelector(".article-page")?.appendChild(overlay);
      document.querySelector(".navbar").appendChild(overlayNav);
    };

    const handleTourComplete = () => {
      body.style.overflow = "auto";
      const generateQuizButton = document.querySelector(
        ".generate-quiz-button"
      );
      if (generateQuizButton) {
        generateQuizButton.classList.remove("highlighted-button-0");
      }
      const overlay = document.querySelector(".custom-overlay");
      if (overlay) overlay.remove();
      const overlayNav = document.querySelector(".custom-overlay-nav");
      if (overlayNav) overlayNav.remove();
    };

    const handleTourCancel = () => {
      body.style.overflow = "auto";
      const generateQuizButton = document.querySelector(
        ".generate-quiz-button"
      );
      if (generateQuizButton) {
        generateQuizButton.classList.remove("highlighted-button-0");
      }

      const overlay = document.querySelector(".custom-overlay");
      if (overlay) overlay.remove();
      const overlayNav = document.querySelector(".custom-overlay-nav");
      if (overlayNav) overlayNav.remove();
    };

    tour.on("start", handleTourStart);
    tour.on("complete", handleTourComplete);
    tour.on("cancel", handleTourCancel);

    return () => {
      tour.off("start", handleTourStart);
      tour.off("complete", handleTourComplete);
      tour.off("cancel", handleTourCancel);
    };
  }, [tour]);

  useEffect(() => {
    fetchArticle();
    checkOnGoingQuiz();
    tour.start();
  }, []);
  // useEffect(() => {
  //   getExpectedIQ();
  // }, [load]);
  useEffect(() => {
    isQuizGiven();
  }, [givenQuiz]);
  useEffect(() => {
    if (textRef.current) {
      setTextHeight(textRef.current.getBoundingClientRect().height);
    }
    if (articleRef.current) {
      setArticleHeight(articleRef.current.getBoundingClientRect().height);
    }
  }, [article, textHeight]);

  return (
    <>
      {showExpectedIQ && expectedIQ ? (
        <ExpectedIQModal
          expectedIQ={expectedIQ}
          setShowExpectedIQ={setShowExpectedIQ}
        />
      ) : null}
      {showQuiz && !givenQuiz ? (
        <Quiz
          article={article}
          isOpen={isOpen}
          onClose={onClose}
          ofShowQuiz={() => {
            setShowQuiz(false);
            setGivenQuiz(true);
            state.user.IQ_score === 0 && getExpectedIQ();
          }}
        />
      ) : null}
      {load ? (
        <Loading />
      ) : (
        <Flex className="article-page">
          <Box
            marginLeft={{ base: "20px", md: "80px" }}
            position={"absolute"}
            top={"6rem"}
            border={"solid"}
            p={1}
            borderRadius="5px"
            boxShadow="md"
            cursor="pointer"
            _hover={{ bg: "#37474f", color: "#f0f0f0" }}
            onClick={() => navigate(-1)}
          >
            <ArrowBackIcon />
          </Box>
          <Grid
            templateColumns={
              window.innerWidth > 820 ? "minmax(0, 9fr) 5fr" : "1fr"
            }
            gap={10}
            minH={"85vh"}
            p={{ base: "20px", md: "80px" }}
            marginTop={{ base: "50px", md: "0px" }}
          >
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
                  {article.title}
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
                    styles={{
                      px: "2",
                      py: "1",
                      rounded: "full",
                      bg: "#F7EFE5",
                    }}
                  >
                    Author:
                  </Highlight>
                  <span style={{ fontSize: "20px", marginLeft: "10px" }}>
                    {article.author}
                  </span>
                </Heading>
                {article.mainText.length === 3 ? (
                  <Box marginTop={5} ref={articleRef}>
                    <Text align="justify" letterSpacing={0}>
                      {article.mainText[0]}
                    </Text>
                    <Box
                      marginTop="2"
                      marginBottom="2"
                      display={"flex"}
                      alignItems={"justify"}
                      height={"100%"}
                    >
                      <Image
                        css={{
                          "@media screen and (max-width: 1366px)": {
                            display: "none",
                          },
                        }}
                        src={
                          typeof data.imgURL === "Array" &&
                          data.imgURL.length > 0 &&
                          data.imgURL[0]
                            ? data.imgURL[0]
                            : typeof data.imgURL !== "Array" && data.imgURL
                            ? data.imgURL
                            : alt_image
                        }
                        alt="Article Image"
                        borderRadius="md"
                        float={"left"}
                        marginRight={"3"}
                        height={`${textHeight}px`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = alt_image;
                          e.target.style.height = `${textHeight}px`;
                        }}
                      />

                      <Text ref={textRef} align="justify" letterSpacing={0}>
                        {article.mainText[1]}
                      </Text>
                    </Box>
                    <Text align="justify" letterSpacing={0}>
                      {article.mainText[2]}
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
                        typeof data.imgURL === "Array" &&
                        data.imgURL.length > 0 &&
                        data.imgURL[0]
                          ? data.imgURL[0]
                          : typeof data.imgURL !== "Array" && data.imgURL
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
                      {article.mainText[0]}
                    </Text>
                    <Text align="left" letterSpacing={1}>
                      {article.mainText[1]}
                    </Text>
                  </Box>
                )}
              </GridItem>
            )}
            <GridItem
              w="100%"
              css={{
                "@media screen and (max-width: 821px)": {
                  display: "none",
                },
              }}
            >
              {givenQuiz ? (
                <>
                  <GivenQuiz
                    articleId={id}
                    percentile={percentile}
                    RQM_score={RQM_score}
                  />
                </>
              ) : onGoingQuiz ? (
                <Heading
                  size="md"
                  margin={"5px"}
                  mb={5}
                  height={"100px"}
                  color={"red"}
                >
                  Quiz is Already going on in some other tab or device
                </Heading>
              ) : quizExpired ? (
                <QuizExpired />
              ) : (
                <GenerateQuizButton
                  onClick={() => {
                    setShowQuiz(!showQuiz);
                    onOpen();
                  }}
                />
              )}
              <Box
                boxShadow={"0 100px 200px rgba(1, 1, 1, 1.1)"}
                borderRadius={"15px"}
                p={1.5}
              >
                <Heading
                  as="h3"
                  fontSize="25px"
                  color="white"
                  letterSpacing={1}
                >
                  <TriangleDownIcon color="#F2D7D9" /> Latest Articles
                </Heading>

                <SimpleGrid
                  columns={1}
                  marginTop={5}
                  display={"flex"}
                  flexDirection={"column"}
                  alignItems={"justify"}
                >
                  {latestNews
                    .filter(
                      (_, idx) =>
                        idx < Math.floor(articleHeight / 100) &&
                        _._id !== article._id
                    )
                    .map((item) => {
                      return (
                        <Box
                          minHeight="100px"
                          key={item._id}
                          onClick={() => {
                            window.location.href = `/article/${item._id}`;
                          }}
                          style={{ cursor: "pointer" }}
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
                </SimpleGrid>
              </Box>
            </GridItem>
            {givenQuiz ? (
              <>
                <Flex
                  css={{
                    "@media screen and (min-width: 821px)": {
                      display: "none",
                    },
                  }}
                  flexDirection="column"
                  alignItems="center"
                  bgGradient="linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)"
                  color="white"
                  borderRadius="lg"
                  p={6}
                  boxShadow="0 4px 8px rgba(0, 0, 0, 0.1)"
                  marginBottom={5}
                >
                  <Heading
                    as="h6"
                    size="lg"
                    textAlign="center"
                    mb={4}
                    color="cyan.400"
                  >
                    Explore Your Quiz Performance
                  </Heading>
                  <Flex flexDirection="column" alignItems="center">
                    <Heading
                      textAlign={"left"}
                      as="h6"
                      fontSize="20px"
                      mb={2}
                      color="green.300"
                    >
                      Current Percentile: {percentile}%
                    </Heading>
                    <Heading
                      textAlign={"left"}
                      as="h6"
                      fontSize="20px"
                      mb={4}
                      color="green.300"
                    >
                      RQM-Score: {RQM_score}
                    </Heading>
                  </Flex>
                </Flex>
              </>
            ) : onGoingQuiz ? (
              <Heading
                css={{
                  "@media screen and (min-width: 821px)": {
                    display: "none",
                  },
                }}
                size="md"
                margin={"20px"}
                color={"red"}
              >
                Quiz is Already going on in some other tab or device
              </Heading>
            ) : quizExpired ? (
              <QuizExpired
                css={{
                  "@media screen and (min-width: 821px)": {
                    display: "none",
                  },
                }}
              />
            ) : (
              <GenerateQuizButton
                css={{
                  "@media screen and (min-width: 821px)": {
                    display: "none",
                  },
                }}
                onClick={() => {
                  setShowQuiz(!showQuiz);
                  onOpen();
                }}
              />
            )}
          </Grid>
        </Flex>
      )}
    </>
  );
};

export default Article;
