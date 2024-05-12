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
  Select,
  Skeleton,
  Tag,
  Badge,
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
import TotalUserAttempted from "../components/articleComponents/TotalUserAttempted";
import SelectQuizLangModal from "../components/articleComponents/SelectQuizLangModal";
import ReactGA from "react-ga4";
import starBoost from "/GIFs/starBoost.gif";
// hello
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
  const [alt_image, setAlt_image] = useState(
    imageData.find(
      (img) =>
        img?.category?.toLocaleLowerCase() ===
        data?.category?.toLocaleLowerCase()
    )?.image
  );
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
  const [totalUsersGivenQuiz, setTotalUsersGivenQuiz] = useState(0);
  const [title, setTitle] = useState({
    english: "",
    hindi: "",
  });
  const [author, setAuthor] = useState({
    english: "",
    hindi: "",
  });
  const [mainText, setMainText] = useState({
    english: [],
    hindi: [],
  });
  const [translateLoading, setTranslateLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [showQuizLangModal, setShowQuizLangModal] = useState(false);
  const [selectLanForQuiz, setSelectLanForQuiz] = useState("english");
  //const [showInstruction, setShowInstruction] = useState(false);

  const isTutorialTakenCheck = async () => {
    try {
      const Page = "articlePage";
      const response = await axios.get(
        `/api/user/isTutorialTakenCheck/${Page}`
      );
      console.log(response.data);
      if (response.data.status) tour.start();
    } catch (err) {
      toast({
        title: "Error in Checking tutorial taken",
        description: err,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };
  const isTutorialTakenUpdate = async () => {
    try {
      const page = "articlePage";
      const response = await axios.post(`/api/user/isTutorialTakenUpdate`, {
        page,
      });
      console.log(response.data);
    } catch (err) {
      toast({
        title: "Error in updating tutorial taken",
        description: err,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const fetchArticle = async () => {
    try {
      const response = await axios.get(`/api/articles/article/${id}`);
      const news = await axios.get(
        `/api/articles?page=1&pageSize=9&category=${
          state.category ? state.category : "general"
        }`
      );
      setTotalUsersGivenQuiz(response.data.totalUsersGivenQuiz);
      setLatestNews(news.data);
      //console.log(news.data);
      setArticle(response.data.newArticle);
      setTitle({
        english: response.data.newArticle.title,
        hindi: response.data.newArticle.hindiTitle,
      });
      setAuthor({
        english: response.data.newArticle.author,
        hindi: response.data.newArticle.hindiAuthor,
      });
      setMainText({
        english: response.data.newArticle.mainText,
        hindi: response.data.newArticle.hindiMainText,
      });
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
      isTutorialTakenUpdate();
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
      isTutorialTakenUpdate();
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
    document.title = "Article page";
    fetchArticle();
    checkOnGoingQuiz();

    // tour.start();
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

  useEffect(() => {
    if (!load && !state.show && state.user && state.user.tutorial.articlePage)
      isTutorialTakenCheck();
  }, [load]);

  useEffect(() => {
    setAlt_image(
      imageData.find(
        (img) =>
          img?.category?.toLocaleLowerCase() ===
          data.category?.toLocaleLowerCase()
      )?.image
    );
  }, [data.category]);

  const handleLanguageChange = async (event) => {
    setTranslateLoading(true);
    try {
      if (event.target.value === "hindi") {
        //console.log(article);
        if (article.hindiTitle) {
          setTitle({ ...title, hindi: article.hindiTitle });
          setAuthor({ ...author, hindi: article.hindiAuthor });
          setMainText({ ...mainText, hindi: article.hindiMainText });
        } else {
          toast({
            title: "Wait",
            description: "Hindi translation Might Take 1 minute",
            status: "info",
            duration: 9000,
            isClosable: true,
            position: "top",
          });
          const response = await axios.get(
            `/api/articles/hindiTranslation/${id}`
          );

          if (response.data.status === "ok") {
            setArticle(response.data.article);
            setTitle({ ...title, hindi: response.data.article.hindiTitle });
            setAuthor({ ...author, hindi: response.data.article.hindiAuthor });
            setMainText({
              ...mainText,
              hindi: response.data.article.hindiMainText,
            });
          }
        }
        setSelectedLanguage("hindi");
      } else {
        setSelectedLanguage("english");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "error setting language",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      console.log(error);
    } finally {
      setTranslateLoading(false);
    }
  };
  const trackGenerateQuizClick = () => {
    ReactGA.send({
      hitType: "event",
      eventCategory: "Generate Quiz Click",
      eventAction: "Click",
      eventLabel: "Generate Quiz Button",
    });
  };
  return (
    <>
      {showQuizLangModal && (
        <SelectQuizLangModal
          setSelectLanForQuiz={setSelectLanForQuiz}
          setShowQuizLangModal={setShowQuizLangModal}
        />
      )}
      {showExpectedIQ && expectedIQ ? (
        <ExpectedIQModal
          expectedIQ={expectedIQ}
          setShowExpectedIQ={setShowExpectedIQ}
        />
      ) : null}
      {showQuiz && !givenQuiz && !showQuizLangModal ? (
        <Quiz
          article={article}
          isOpen={isOpen}
          onClose={() => {
            onClose();
            setShowQuiz(false);
          }}
          ofShowQuiz={() => {
            setShowQuiz(false);
            setGivenQuiz(true);
            state.user.IQ_score === 0 && getExpectedIQ();
          }}
          language={selectLanForQuiz}
        />
      ) : null}
      {load ? (
        <Loading />
      ) : (
        <Flex
          className="article-page"
          marginTop={"4.5rem"}
          flexDirection={"column"}
        >
          <Flex
            w={"100%"}
            marginTop={"2rem"}
            marginBottom={"0"}
            gap={10}
            flexDirection={{ base: "column", md: "row" }}
            // justifyContent={"center"}
            alignItems={"center"}
          >
            <Flex
              h={"100%"}
              // justifyContent={"center"}
              // alignItems={"center"}
              w={{ base: "100%", md: "auto" }}
              gap={10}
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
              <Box>
                <Select
                  variant="outline"
                  w={"150px"}
                  backgroundColor={"#2A2F4F"}
                  defaultValue="english"
                  onChange={handleLanguageChange}
                >
                  <option
                    style={{ backgroundColor: "#2A2F4F" }}
                    value="english"
                  >
                    English
                  </option>
                  <option style={{ backgroundColor: "#2A2F4F" }} value="hindi">
                    Hindi
                  </option>
                </Select>
              </Box>
            </Flex>
            {state.isBoosted && (
              <Flex
                justifyContent={"center"}
                alignItems={"center"}
                gap={2}
                marginTop={"10px"}
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
          <Grid
            templateColumns={
              window.innerWidth > 820 ? "minmax(0, 9fr) 5fr" : "1fr"
            }
            gap={10}
            minH={"85vh"}
            p={{ base: "20px", md: "50px" }}
            marginTop={{ base: "30px", md: "0px" }}
          >
            {article && (
              <GridItem w="100%" className="article-container">
                <Skeleton isLoaded={!translateLoading}>
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
                </Skeleton>

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
                    margin="5px"
                  >
                    Author:
                  </Highlight>

                  <span style={{ fontSize: "20px", marginLeft: "10px" }}>
                    <Skeleton isLoaded={!translateLoading} display={"inline"}>
                      {author[selectedLanguage]}
                    </Skeleton>
                  </span>
                </Heading>
                <Skeleton isLoaded={!translateLoading}>
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
                          {mainText[selectedLanguage][1]}
                        </Text>
                      </Box>
                      <Text align="justify" letterSpacing={0}>
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
                      <Text align="left" letterSpacing={1}>
                        {mainText[selectedLanguage][1]}
                      </Text>
                    </Box>
                  )}
                </Skeleton>
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
                    trackGenerateQuizClick();
                    setShowQuizLangModal(true);
                    setShowQuiz(!showQuiz);
                    onOpen();
                  }}
                />
              )}
              <TotalUserAttempted totalUsersGivenQuiz={totalUsersGivenQuiz} />

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
                <GivenQuiz
                  articleId={id}
                  percentile={percentile}
                  RQM_score={RQM_score}
                  css={{
                    "@media screen and (min-width: 821px)": {
                      display: "none",
                    },
                  }}
                />
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
                  trackGenerateQuizClick();
                  setShowQuizLangModal(true);
                  setShowQuiz(!showQuiz);
                  onOpen();
                }}
              />
            )}
            <TotalUserAttempted
              totalUsersGivenQuiz={totalUsersGivenQuiz}
              css={{
                "@media screen and (min-width: 821px)": {
                  display: "none",
                },
              }}
            />
          </Grid>
        </Flex>
      )}
    </>
  );
};

export default Article;
