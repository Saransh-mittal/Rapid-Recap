import React, { useState } from "react";
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
import Circles from "../../../assets/Circles"; // Import the Circles array

const CircleModal = ({ isOpen, onClose }) => {
  const [currentPage, setCurrentPage] = useState(7); // Set initial page to 7 (Progressors)

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => (prevPage === 7 ? 1 : prevPage + 1)); // Reverse logic for previous page
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => (prevPage === 1 ? 7 : prevPage - 1)); // Reverse logic for next page
  };
  const currentCircle = Circles[currentPage - 1];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent
        style={{
          backgroundColor: "#0f0d15",
          color: "white",
          borderRadius: "10px",
        }}
      >
        <ModalHeader
          style={{
            textAlign: "center",
            fontSize: "36px",
            fontWeight: "bold",
            color: "transparent" /* Transparent text color */,
            fontFamily: "'Poppins', sans-serif",
            backgroundImage:
              "linear-gradient(45deg, #ff7e5f, #feb47b)" /* Gradient background */,
            backgroundClip: "text" /* Clip text to background gradient */,
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
            {/* Previous button */}
            <IconButton
              icon={<ChevronLeftIcon />}
              aria-label="Previous Page"
              onClick={handlePreviousPage}
              isDisabled={currentPage === 7}
              opacity={currentPage === 7 ? 0.5 : 1}
              _hover={{
                bgGradient: "linear(to-r, #7928CA, #FF0080)",
                color: "white",
                boxShadow: "xl",
              }}
              transition="all 0.2s"
            />
            {/* Next button */}
            <IconButton
              icon={<ChevronRightIcon />}
              aria-label="Next Page"
              onClick={handleNextPage}
              isDisabled={currentPage === 1}
              opacity={currentPage === 1 ? 0.5 : 1}
              _hover={{
                bgGradient: "linear(to-r, #7928CA, #FF0080)",
                color: "white",
                boxShadow: "xl",
              }}
              transition="all 0.2s"
            />
          </Flex>
          {/* Render circle image with text overlay */}
          <div
            style={{
              position: "relative",
              textAlign: "center",
              animation: "glow 1.5s infinite alternate",
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
            {/* Overlay text */}
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
          {/* Circle information */}
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
        </ModalBody>
        {/* Define the glow animation */}
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
