import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Flex,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import Circles from "../../../assets/Circles";
import { useSwipeable } from "react-swipeable";

const CircleModal = ({
  isOpen,
  onClose,
  currentUserCircle,
  setShowCircleModal,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [glowAnimation, setGlowAnimation] = useState(false);

  useEffect(() => {
    if (!isOpen || !currentUserCircle || Circles.length === 0) return;
    const circleIndex = Circles.findIndex(
      (circle) =>
        circle.circle.toLowerCase() === currentUserCircle.toLowerCase()
    );

    const intervalId = setInterval(() => {
      setCurrentPage((prevPage) => {
        if (prevPage === circleIndex + 1) {
          clearInterval(intervalId);
          return prevPage;
        } else {
          return prevPage + 1;
        }
      });
    }, 200);
    return () => {
      clearInterval(intervalId);
    };
  }, [isOpen, currentUserCircle]);

  useEffect(() => {
    if (isOpen) {
      setGlowAnimation(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (glowAnimation) {
      const timeout = setTimeout(() => {
        setGlowAnimation(false);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [glowAnimation]);

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => (prevPage === 1 ? 7 : prevPage - 1));
    setGlowAnimation(true);
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => (prevPage === 7 ? 1 : prevPage + 1));
    setGlowAnimation(true);
  };

  const currentCircle = Circles[currentPage - 1];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setShowCircleModal(false);
        onClose();
      }}
      size={{ base: "full", lg: "3xl" }}
    >
      <ModalOverlay />
      <ModalContent
        style={{
          backgroundColor: "#0f0d15",
          color: "white",
          borderRadius: "10px",
        }}
        {...useSwipeable({
          onSwipedLeft: () => handleNextPage(),
          onSwipedRight: () => handlePreviousPage(),
        })}
      >
        <ModalHeader
          style={{
            textAlign: "center",
            fontSize: "36px",
            fontWeight: "bold",
            color: "transparent",
            fontFamily: "'Poppins', sans-serif",
            backgroundImage: "linear-gradient(45deg, #ff7e5f, #feb47b)",
            backgroundClip: "text",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
            backgroundColor: "#0f0d15",
            padding: "10px",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          Circle Details
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex
            justifyContent="space-between"
            alignItems="center"
            marginBottom="10px"
          >
            <IconButton
              icon={<ChevronLeftIcon />}
              aria-label="Previous Page"
              onClick={handlePreviousPage}
              isDisabled={currentPage === 1}
              opacity={currentPage === 1 ? 0.5 : 1}
              _hover={{
                bgGradient: "linear(to-r, #7928CA, #FF0080)",
                color: "white",
                boxShadow: "xl",
              }}
              transition="all 0.2s"
            />
            <IconButton
              icon={<ChevronRightIcon />}
              aria-label="Next Page"
              onClick={handleNextPage}
              isDisabled={currentPage === 7}
              opacity={currentPage === 7 ? 0.5 : 1}
              _hover={{
                bgGradient: "linear(to-r, #7928CA, #FF0080)",
                color: "white",
                boxShadow: "xl",
              }}
              transition="all 0.2s"
            />
          </Flex>
          {currentPage ===
            Circles.findIndex(
              (circle) =>
                circle.circle.toLowerCase() === currentUserCircle.toLowerCase()
            ) +
              1 && (
            <Text
              textAlign="center"
              color="yellow"
              fontWeight="bold"
              marginTop={"-10%"}
              fontSize="24px"
              marginBottom={0}
            >
              <span style={{ fontSize: "36px", marginRight: "5px" }}>📍</span>
              You are here!
            </Text>
          )}
          {currentCircle && (
            <div
              style={{
                position: "relative",
                textAlign: "center",
                animation: glowAnimation ? "glow 1.5s 2 alternate" : "none",
              }}
            >
              <img
                src="../../../../images/circle.png"
                alt={currentCircle.circle}
                style={{
                  background: "transparent",
                  display: "block",
                  margin: "0 auto",
                  position: "relative",
                  zIndex: "1",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: "2",
                }}
              >
                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  ml={1}
                  color={currentCircle.textColor}
                >
                  {currentCircle.circle}
                </Text>
                <Text
                  color={currentCircle.textColor}
                  fontWeight="bold"
                  mt={-4}
                  ml={1}
                  fontSize="lg"
                >
                  Circle
                </Text>
                <Text
                  mt={-2}
                  ml={1}
                  mb={2}
                  color={currentCircle.textColor}
                  fontSize="1rem"
                >
                  IQ Range: {currentCircle.IQ_Lower} -{" "}
                  {currentCircle.IQ_Upper || "Above"}
                </Text>
              </div>
            </div>
          )}
          {currentCircle && (
            <p style={{ textAlign: "left", color: currentCircle.textColor }}>
              {currentCircle.CircleInfo.split(".").map((point, index) => {
                const lines = point.trim().split("\n");
                return lines.map(
                  (line, lineIndex) =>
                    line.trim() && (
                      <div style={{ flexDirection: "row !important" }}>
                        <p style={{ padding: "0", margin: "0.2rem" }}></p>
                        <span
                          key={index + "-" + lineIndex}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "5px",
                            borderRadius: "5px",
                            fontStyle: "italic",
                          }}
                        >
                          ➤ {line}
                          {lineIndex === lines.length - 1 ? "." : <br />}
                        </span>
                      </div>
                    )
                );
              })}
              <br />
            </p>
          )}
        </ModalBody>
        <style>
          {`
            @keyframes glow {
              0% {
                filter: brightness(100%);
                transform: scale(1);
              }
              50% {
                filter: brightness(150%);
                transform: scale(1.1);
              }
              100% {
                filter: brightness(100%);
                transform: scale(1);
              }
            }
          `}
        </style>
      </ModalContent>
    </Modal>
  );
};

export default CircleModal;
