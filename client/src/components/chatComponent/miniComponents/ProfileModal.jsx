import { DragHandleIcon, ViewIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  IconButton,
  Text,
  Image,
} from "@chakra-ui/react";

const ProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton
          d={{ base: "flex" }}
          icon={<DragHandleIcon />}
          onClick={onOpen}
        />
      )}
      <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent
          h="410px"
          style={{
            backgroundColor: "#0f0d15",
            backgroundImage:
              "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
            boxShadow:
              "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)",
          }}
        >
          <ModalHeader
            fontSize="40px"
            fontFamily="Work sans"
            color={"white"}
            display="flex"
            justifyContent="center"
          >
            {user.name}
            {/* Gaurav Sahu */}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="space-between"
          >
            <Image
              borderRadius="full"
              boxSize="150px"
              src={user.pic}
              alt={user.name}
            />
            <Text
              fontSize={{ base: "28px", md: "25px" }}
              fontFamily="Work sans"
              color={"white"}
            >
              Email: {user.email}
            </Text>
            <Text
              fontSize={{ base: "28px", md: "25px" }}
              fontFamily="Work sans"
              color={"white"}
            >
              inGameName: {user.inGameName}
            </Text>
          </ModalBody>
          <ModalFooter>
            {/* <Button onClick={onClose}>Close</Button> */}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
