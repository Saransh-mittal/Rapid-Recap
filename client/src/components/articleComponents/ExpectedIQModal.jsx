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
} from "@chakra-ui/react";
import React, { useEffect } from "react";

const ExpectedIQModal = ({ expectedIQ, setShowExpectedIQ }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  useEffect(() => {
    onOpen();
  }, []);
  return (
    <>
      <Modal
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setShowExpectedIQ(false);
        }}
        size={{ base: "full", md: "3xl" }}
      >
        <ModalOverlay />
        <ModalContent
          // background="linear-gradient(-45deg, #092635, #9EC8B9, #1B4242, #9EC8B9)"
          backgroundColor={{ base: "#0f0d15", xl: "transparent" }}
          backgroundImage={{
            xl: "none",
            base: "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
          }}
          boxShadow={{
            xl: "none",
            base: "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)",
          }}
          backgroundSize="400% 400%"
          borderRadius="10px"
          //boxShadow="0 0 10px rgba(0, 0, 0, 0.5)" // Added boxShadow to make it standout
        >
          <ModalHeader as="h3" size="lg" color="white" textAlign="center">
            Your Expected Information Quotient (IQ)
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text color="white" fontSize="20px" textAlign="center" mt={4}>
              Your Expected IQ is based on your performance in past quizzes,
              including this one. It predicts your IQ after 10 quizzes with
              similar results.
            </Text>
            <Text color="white" fontSize="30px" textAlign="center" mt={4}>
              Expected Information Quotient (IQ):{" "}
              <span
                style={{
                  backgroundColor: "Green",
                  borderRadius: "15px",
                  padding: "3px",
                }}
              >
                {expectedIQ}
              </span>
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={() => {
                onClose();
                setShowExpectedIQ(false);
              }}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ExpectedIQModal;
