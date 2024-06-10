import React, { useEffect } from "react";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
  useDisclosure,
  Box,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

const XPLevelModal = ({ setShowXPLevelModal, level, requiredXP, xp }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    onOpen();
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
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
            >
              <Box position="relative" width="600px" height="600px">
                {/* Rotated SVG in the background */}
                <Box
                  as="svg"
                  viewBox="0 0 200 200"
                  width="1000px"
                  height="1000px"
                  position="absolute"
                  top="27%"
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
                  width="1000px"
                  height="1000px"
                  position="absolute"
                  top="75%"
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
                  left="0"
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
                    mt={"2.5rem"}
                  >
                    <Text
                      color="white"
                      fontSize="30px"
                      fontWeight="Bold"
                      fontFamily={`"Oswald", sans-serif`}
                      letterSpacing={2}
                      textTransform={"uppercase"}
                      mb={"3rem"}
                    >
                      Experinece Level: {level}
                    </Text>
                    <Text
                      color="white"
                      fontSize="20px"
                      fontWeight="Bold"
                      fontFamily={`"Oswald", sans-serif`}
                      letterSpacing={2}
                      textTransform={"uppercase"}
                      mb={"1rem"}
                    >
                      XP
                      <Box as="sub" fontSize="xs">
                        current
                      </Box>
                      : {xp}
                    </Text>
                    <Text
                      color="white"
                      fontSize="20px"
                      fontWeight="Bold"
                      fontFamily={`"Oswald", sans-serif`}
                      letterSpacing={2}
                      textTransform={"uppercase"}
                    >
                      XP
                      <Box as="sub" fontSize="xs">
                        Required to level up
                      </Box>
                      : {requiredXP}
                    </Text>
                  </ModalBody>
                </Box>
              </Box>
            </ModalContent>
          </Modal>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default XPLevelModal;
