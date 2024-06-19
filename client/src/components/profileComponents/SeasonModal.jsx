// /components/SeasonModal.jsx
import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Flex,
  Skeleton,
  useMediaQuery,
} from "@chakra-ui/react";
import IQLineGraph from "./IQLineGraph";
import IQBarGraph from "./IQBarGraph";
import SolvedQuizzes from "./SolvedQuizzes";
import RankAndSociety from "./RankAndSociety";
import Heading from "../miscellaneous/HeadingComponent";

const SeasonModal = ({
  isOpen,
  onClose,
  season,
  isLoading,
  profile,
  privacyProfileData,
  loginedUserProfile,
  inGameName,
}) => {
  const [isLargerThan992px] = useMediaQuery("(min-width: 992px)");
  const [initialTouchY, setInitialTouchY] = useState(null);

  useEffect(() => {
    const styleScrollbar = () => {
      const style = document.createElement("style");
      style.innerHTML = `
        .chakra-modal__body.css-132ma0y::-webkit-scrollbar {
          width: 8px;
        }
        .chakra-modal__body.css-132ma0y::-webkit-scrollbar-thumb {
          background-color: #333;
          border-radius: 4px;
        }
        .chakra-modal__body.css-132ma0y::-webkit-scrollbar-thumb:hover {
          background-color: #555;
        }
        .chakra-modal__body.css-132ma0y::-webkit-scrollbar-track {
          background-color: #0f0d15;
        }
      `;
      document.head.appendChild(style);

      return () => {
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      };
    };

    const handleWheel = (event) => {
      const modalBody = document.querySelector(
        ".chakra-modal__body.css-132ma0y"
      );
      if (modalBody) {
        modalBody.scrollTop += event.deltaY;
      }
    };

    const handleTouchStart = (event) => {
      if (event.touches.length === 1) {
        setInitialTouchY(event.touches[0].clientY);
      }
    };

    const handleTouchMove = (event) => {
      if (event.touches.length === 1) {
        const modalBody = document.querySelector(
          ".chakra-modal__body.css-132ma0y"
        );
        if (modalBody && initialTouchY !== null) {
          const currentTouchY = event.touches[0].clientY;
          modalBody.scrollTop += initialTouchY - currentTouchY;
          setInitialTouchY(currentTouchY);
        }
      }
    };

    if (isOpen) {
      const cleanUpStyles = styleScrollbar();
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length > 0) {
            const modalContainer = document.querySelector(
              ".chakra-modal__content-container.css-1ocl83d"
            );

            if (modalContainer) {
              modalContainer.style.width = isLargerThan992px ? "65vw" : "100vw";
              modalContainer.style.marginLeft = isLargerThan992px
                ? "20rem"
                : "0";
              modalContainer.style.marginTop = isLargerThan992px
                ? "0"
                : "7.5rem";
            }
          }
        });
      });

      const config = { childList: true, subtree: true };
      const targetNode = document.body;

      observer.observe(targetNode, config);

      document.addEventListener("wheel", handleWheel);
      document.addEventListener("touchstart", handleTouchStart);
      document.addEventListener("touchmove", handleTouchMove);

      return () => {
        observer.disconnect();
        cleanUpStyles();
        document.removeEventListener("wheel", handleWheel);
        document.removeEventListener("touchstart", handleTouchStart);
        document.removeEventListener("touchmove", handleTouchMove);
      };
    }
  }, [isOpen, isLargerThan992px, initialTouchY]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      allowPinchZoom
      motionPreset="slideInBottom"
      size={{ base: "full", lg: "4xl" }}
      scrollBehavior="inside"
    >
      <ModalContent
        backgroundColor="#0f0d15"
        color="white"
        borderRadius="10px"
        pb={{ base: "10rem", lg: "0" }}
      >
        <ModalHeader textTransform={"uppercase"}>
          <Heading
            title={season ? `Season ${season}` : "Season Modal"}
            tag={"History"}
          />
        </ModalHeader>
        {isLargerThan992px && <ModalCloseButton />}
        <ModalBody mb={"2rem"} overflowX={"hidden"} overflowY="auto" w={"100%"}>
          <Flex
            w={"100%"}
            h={""}
            marginTop={"10px"}
            marginInline={"1%"}
            padding={{ xl: isLoading ? 0 : "20px", base: "0" }}
            borderRadius="10px"
            flexDirection={{ base: "column", xl: "row" }}
            backgroundColor={{ base: "transparent", xl: "#0f0d15" }}
            backgroundImage={{
              base: "none",
              xl: "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
            }}
            boxShadow={{
              base: "none",
              xl: "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)",
            }}
            gap={{ base: "20px", xl: "0" }}
          >
            {isLoading ? (
              <>
                <Skeleton
                  height="200px"
                  width="100%"
                  borderRadius="10px"
                  marginRight={5}
                />
                <Skeleton height="200px" width="100%" borderRadius="10px" />
              </>
            ) : (
              <>
                <IQLineGraph
                  lineGraph={profile.lineGraph}
                  privateLineGraph={privacyProfileData.lineGraph}
                  loginedUserProfile={loginedUserProfile}
                />
                <IQBarGraph
                  barGraph={profile.barGraph}
                  privateBarGraph={privacyProfileData.lineGraph}
                  loginedUserProfile={loginedUserProfile}
                />
              </>
            )}
          </Flex>

          <Flex
            w={"100%"}
            margin="10px"
            marginBottom="5px"
            flexDirection={{ xl: "row", base: "column" }}
            justifyContent="space-between"
            gap={5}
          >
            {isLoading ? (
              <>
                <Skeleton height="150px" width="100%" borderRadius="10px" />
                <Skeleton height="150px" width="100%" borderRadius="10px" />
              </>
            ) : (
              <>
                <Flex
                  borderRadius="10px"
                  width={"100%"}
                  style={{
                    backgroundColor: "#0f0d15",
                    backgroundImage:
                      "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
                    boxShadow:
                      "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)",
                  }}
                  className="solved-quizzes"
                  _hover={
                    !privacyProfileData.solvedQuizzes
                      ? {
                          transform: "scale(1.01)",
                        }
                      : null
                  }
                  _active={
                    !privacyProfileData.solvedQuizzes
                      ? {
                          transform: "scale(0.9)",
                          borderColor: "#bec3c9",
                        }
                      : null
                  }
                >
                  <SolvedQuizzes
                    privateSolvedQuiz={privacyProfileData.solvedQuizzes}
                    loginedUserProfile={loginedUserProfile}
                    solvedQuizzes={profile.solvedQuizzes}
                    inGameName={inGameName}
                  />
                </Flex>
                <Flex
                  borderRadius="10px"
                  width={"100%"}
                  style={{
                    backgroundColor: "#0f0d15",
                    backgroundImage:
                      "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
                    boxShadow:
                      "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)",
                  }}
                  className="rank-and-society"
                >
                  <RankAndSociety
                    privateSociety={privacyProfileData.society}
                    loginedUserProfile={loginedUserProfile}
                    USER_IQ={profile?.barGraph?.USER_IQ}
                  />
                </Flex>
              </>
            )}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SeasonModal;
