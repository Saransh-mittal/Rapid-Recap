import React, { useEffect } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  Image,
  Box,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

const DailyStreakModal = ({ setShowDailyStreakModal, getBackgroundColor }) => {
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
              setShowDailyStreakModal(false);
            }}
            size={"4xl"}
          >
            <ModalOverlay />
            <ModalContent
              initial={{ y: "-100vh" }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 150 }}
              background="linear-gradient(-45deg, #092635, #9EC8B9, #1B4242, #9EC8B9)"
              borderRadius="10px"
            >
              <ModalHeader
                as="h3"
                size="lg"
                color="white"
                textAlign="center"
                fontWeight="bold"
                borderBottom="1px solid rgba(255,255,255,0.1)"
                pb={2}
                mb={4}
              >
                Your Streak Insights
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody
                pb={4}
                display={"flex"}
                gap={4}
                flexDirection={"column"}
                p={1}
              >
                <Text
                  color="white"
                  fontSize="20px"
                  textAlign="center"
                  fontWeight="medium"
                  mb={4}
                >
                  You've maintained a streak for{" "}
                  <Text
                    as="span"
                    color="green.300"
                    backgroundColor="rgba(255,255,255,0.1)"
                    borderRadius="md"
                    px={2}
                    fontWeight="semibold"
                    textShadow="1px 1px 2px rgba(0, 0, 0, 0.4)"
                  >
                    2 days
                  </Text>
                  . Keep it up!
                </Text>
                <Text
                  color="white"
                  fontSize="24px"
                  textAlign="center"
                  fontWeight="medium"
                  mb={6}
                >
                  Your longest streak is{" "}
                  <Text
                    as="span"
                    color="green.300"
                    backgroundColor="rgba(255,255,255,0.1)"
                    borderRadius="md"
                    px={2}
                    fontWeight="semibold"
                    textShadow="1px 1px 2px rgba(0, 0, 0, 0.4)"
                  >
                    7 days
                  </Text>
                  .
                </Text>

                <Text
                  color="white"
                  fontSize="16px"
                  textAlign="center"
                  mb={4}
                  lineHeight="1.5"
                >
                  Keep up the consistency to reach a 7-day streak and unlock a{" "}
                  <Text
                    as="span"
                    fontWeight="semibold"
                    color="green.300"
                    textShadow="1px 1px 2px rgba(0, 0, 0, 0.4)"
                  >
                    1.5x multiplier
                  </Text>{" "}
                  on your quizzes!
                </Text>
                <Text
                  color="white"
                  fontSize="16px"
                  textAlign="center"
                  lineHeight="1.5"
                >
                  Challenge yourself to explore new topics every day.
                </Text>
              </ModalBody>
              <ModalFooter justifyContent="center">
                <Button
                  colorScheme="green"
                  onClick={() => {
                    onClose();
                    setShowDailyStreakModal(false);
                  }}
                >
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DailyStreakModal;
