// SeasonalUpdateModal.jsx
import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Box,
  Image,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";

const SeasonalUpdateModal = ({ isOpen, onClose }) => {
  // Simple animation component using Framer Motion
  const Animation = () => (
    <motion.div
      animate={{ scale: [0.5, 1], opacity: [0, 1] }}
      transition={{ duration: 0.5 }}
    >
      <Box>
        <Image
          src="https://example.com/your-animation-url.gif"
          alt="IQ Decay Animation"
        />
      </Box>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            numberOfPieces={200}
          />
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent
              initial={{ y: "-100vh" }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 150 }}
              background="linear-gradient(135deg, #f6d365 0%, #fda085 100%)"
              borderRadius="20px"
              boxShadow="0px 10px 30px rgba(0, 0, 0, 0.2)"
            >
              <ModalHeader
                textAlign="center"
                color="white"
                fontSize="2xl"
                fontWeight="bold"
              >
                Welcome to the Seasonal Update!
              </ModalHeader>
              <ModalBody textAlign="center" color="white">
                {/* <Text fontSize="lg" fontWeight="bold">
                  Welcome to Rapid Recap's Seasonal Update!
                </Text> */}
                <Text fontSize="md" mt={2}>
                  We've got some exciting new changes to keep you on your toes.
                </Text>
                <Box mt={4}>
                  <Text fontSize="md" fontWeight="bold">
                    Here's a quick explanation of how IQ decay works and why
                    it's important to stay engaged:
                  </Text>
                  <Animation />
                </Box>
              </ModalBody>
              <ModalFooter justifyContent="center">
                <Button colorScheme="teal" onClick={onClose} size="lg">
                  Let's Go!
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SeasonalUpdateModal;
