import React, { useContext, useEffect } from "react";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Text,
  useDisclosure,
  Box,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { AppContext } from "../../../contextAPI/appContext";

const XPLevelModal = ({ setShowXPLevelModal }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { state } = useContext(AppContext);

  useEffect(() => {
    onOpen();
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={() => {
            onClose();
            setShowXPLevelModal(false);
          }}
          size="full"
        >
          <ModalOverlay />
          <ModalContent
            background="transparent"
            boxShadow="none"
            display="flex"
            justifyContent="center"
            alignItems="center"
            overflow="hidden"
          >
            <Box position="relative" width="600px" height="600px">
              {/* Rotated SVG in the background */}
              <Box
                as="svg"
                viewBox="0 0 200 200"
                width={{ base: "600px", md: "1000px" }}
                height={{ base: "600px", md: "1000px" }}
                position="absolute"
                top="27%"
                // left={{ base: "75%", md: "50%" }}
                left="50%"
                transform="translate(-50%, -50%) rotate(180deg)"
              >
                <polygon
                  points="100,10 120,50 160,50 130,80 140,120 100,100 60,120 70,80 40,50 80,50"
                  fill="#42A2DB"
                />
                <polygon
                  points="100,20 115,50 150,50 125,75 135,110 100,90 65,110 75,75 50,50 85,50"
                  fill="#42A2DB"
                />
              </Box>
              {/* Main SVG */}
              <Box
                as="svg"
                viewBox="0 0 200 200"
                width={{ base: "600px", md: "1000px" }}
                height={{ base: "600px", md: "1000px" }}
                position="absolute"
                top={{ base: "55%", md: "75%" }}
                left="50%"
                transform="translate(-50%, -50%)"
              >
                <polygon
                  points="100,10 120,50 160,50 130,80 140,120 100,100 60,120 70,80 40,50 80,50"
                  fill="#42A2DB"
                />
                <polygon
                  points="100,20 115,50 150,50 125,75 135,110 100,90 65,110 75,75 50,50 85,50"
                  fill="#42A2DB"
                />
              </Box>
              {/* Content */}
              <Box
                position="absolute"
                top="0"
                left="50%"
                transform="translateX(-50%)"
                right="0"
                bottom="0"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                borderRadius="10px"
                textAlign="center"
              >
                <ModalCloseButton color="white" />
                <ModalBody
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                  textAlign="center"
                  mt={{ base: "-3.5rem", md: "2.5rem" }}
                >
                  <Text
                    color="white"
                    fontSize={{ base: "1.5rem", md: "1.875rem" }}
                    fontWeight="Bold"
                    fontFamily={`"Oswald", sans-serif`}
                    letterSpacing={2}
                    textTransform={"uppercase"}
                    mb={{ base: "1.5rem", md: "3rem" }}
                  >
                    Experience Level: 4
                  </Text>
                  <Text
                    color="white"
                    fontSize={{ base: "1rem", md: "1.5rem" }}
                    fontWeight="Bold"
                    fontFamily={`"Oswald", sans-serif`}
                    letterSpacing={2}
                    textTransform={"uppercase"}
                    mb={{ base: "0.5rem", md: "1rem" }}
                  >
                    XP
                    <Box as="sub" fontSize="xs">
                      current
                    </Box>
                    : 30
                  </Text>
                  <Text
                    color="white"
                    fontSize={{ base: "1rem", md: "1.5rem" }}
                    fontWeight="Bold"
                    fontFamily={`"Oswald", sans-serif`}
                    letterSpacing={2}
                    textTransform={"uppercase"}
                  >
                    XP
                    <Box as="sub" fontSize="xs">
                      Required to level up
                    </Box>
                    : 10
                  </Text>
                </ModalBody>
                <ModalFooter justifyContent="center">
                  {/* <Button
                      colorScheme="green"
                      onClick={() => {
                        onClose();
                        setShowDailyStreakModal(false);
                      }}
                    >
                      Close
                    </Button> */}
                </ModalFooter>
              </Box>
            </Box>
          </ModalContent>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default XPLevelModal;
