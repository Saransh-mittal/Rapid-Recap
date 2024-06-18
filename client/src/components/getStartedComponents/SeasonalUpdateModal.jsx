import React, { useState } from "react";
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
  Flex,
  IconButton,
  List,
  ListItem,
  ListIcon,
  Table,
  Tbody,
  Tr,
  Td,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { FaMedal, FaGamepad } from "react-icons/fa"; // Import the new icons
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import seasonGIF from "/GIFs/season.gif";
import decayImage from "/images/decay.png";
import arrowImage from "/images/arrow.png"; // Import the arrow image

const SeasonalUpdateModal = ({ isOpen, onClose }) => {
  const [page, setPage] = useState(1);

  const nextPage = () => setPage((prev) => (prev < 3 ? prev + 1 : prev));
  const prevPage = () => setPage((prev) => (prev > 1 ? prev - 1 : prev));

  const Animation = ({ src, height = "20rem" }) => (
    <motion.div
      animate={{ scale: [0.5, 1], opacity: [0, 1] }}
      transition={{ duration: 0.5 }}
    >
      <Flex justifyContent="center" alignItems="center">
        <Image src={src} alt="Animation" h={height} borderRadius="5%" />
      </Flex>
    </motion.div>
  );

  const renderPageContent = () => {
    switch (page) {
      case 1:
        return (
          <>
            <Text
              fontSize="lg"
              fontWeight="bold"
              color="purple.700"
              fontStyle="italic"
            >
              SEASON 2: THE CYCLE OF KNOWLEDGE!
            </Text>
            <Box mt={4}>
              <Text fontSize="md" mt={2} color="blue.800">
                The adventure continues as we dive into the new season, "THE
                CYCLE OF KNOWLEDGE."
              </Text>
              <Flex flexDirection={"row"} gap={2}>
                <Flex mt={4}>
                  <FaMedal color="black" />
                </Flex>
                <Text fontSize="md" mt={2} color="blue.800" textAlign={"left"}>
                  Prepare yourself for an exhilarating journey where your
                  intellect and skills will be put to the test like never
                  before!
                </Text>
              </Flex>
              {/* <Text fontSize="md" mt={2} color="blue.800" textAlign={"left"}>
                In this season, you'll experience new challenges and
                opportunities that will keep you engaged and striving for
                greatness.
              </Text> */}
            </Box>
            <Box mt={4}>
              <Animation src={seasonGIF} />
              <Text fontSize="md" fontWeight="bold" color="yellow.800">
                Compete, learn, and grow as you navigate through the dynamic
                landscape of knowledge and strategy.
              </Text>
            </Box>
          </>
        );
      case 2:
        return (
          <>
            <Text
              fontSize="lg"
              fontWeight="bold"
              color="purple.700"
              fontStyle="italic"
              //make a underline
            >
              IQ Score Decay
            </Text>
            <Box mt={4} textAlign="left">
              <List spacing={3}>
                <ListItem>
                  <Text fontSize="md" color="blue.800">
                    <ListIcon as={FaGamepad} color="teal.500" />
                    <Text as="span" fontWeight="bold">
                      IQ scores may decrease over time
                    </Text>{" "}
                    based on your activity levels.
                  </Text>
                </ListItem>
                <ListItem>
                  <Text fontSize="md" color="blue.800">
                    <ListIcon as={FaMedal} color="teal.500" />
                    <Text as="span" fontWeight="bold">
                      This process ensures
                    </Text>{" "}
                    a fresh and competitive environment for all users.
                  </Text>
                </ListItem>
                <ListItem>
                  <Text fontSize="md" color="blue.800">
                    <ListIcon as={FaGamepad} color="teal.500" />
                    <Text as="span" fontWeight="bold">
                      Societies such as Titans, Mavericks, Elites, Strivers, and
                      Explorers
                    </Text>{" "}
                    will see their scores adjusted to maintain balanced
                    competition.
                  </Text>
                </ListItem>
              </List>
            </Box>
            <Box mt={4}>
              <Animation src={decayImage} />
              <Text fontSize="md" fontWeight="bold" color="yellow.800">
                Stay engaged to maintain your IQ score and climb the ranks!
                Remember, the decay will vary with each season, adding a new
                layer of challenge and excitement.
              </Text>
            </Box>
          </>
        );
      case 3:
        return (
          <>
            <Text
              fontSize="lg"
              fontWeight="bold"
              color="purple.700"
              fontStyle="italic"
            >
              Real-Time Society Decay
            </Text>
            <Text fontSize="md" mt={2} color="blue.800" fontStyle="oblique">
              Here's how the societies are adjusting in real-time:
            </Text>
            <Box mt={4}>
              <Table variant="simple" color="blue.800">
                <Tbody>
                  <Tr>
                    <Td fontWeight="bold">Titans society</Td>
                    <Td>
                      <Image
                        src={arrowImage}
                        alt="Arrow"
                        h="3.5rem"
                        w="10rem"
                      />
                    </Td>
                    <Td>Mavericks society (Visionaries circle)</Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">
                      Mavericks society (Visionaries circle and Pioneers circle)
                    </Td>
                    <Td>
                      <Image
                        src={arrowImage}
                        alt="Arrow"
                        h="3.5rem"
                        w="10rem"
                      />
                    </Td>
                    <Td>Elites society (Scholars circle)</Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">
                      Elites society (Scholars circle and Master circle)
                    </Td>
                    <Td>
                      <Image
                        src={arrowImage}
                        alt="Arrow"
                        h="3.5rem"
                        w="10rem"
                      />
                    </Td>
                    <Td>
                      Elites society (Master circle) or Strivers (Enthusiasts
                      circle)
                    </Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">
                      Strivers (Enthusiasts circle, Achievers circle, and
                      Progressors circle)
                    </Td>
                    <Td>
                      <Image
                        src={arrowImage}
                        alt="Arrow"
                        h="3.5rem"
                        w="10rem"
                      />
                    </Td>
                    <Td>Strivers (Progressors circle)</Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">Explorers</Td>
                    <Td>
                      <Image
                        src={arrowImage}
                        alt="Arrow"
                        h="3.5rem"
                        w="10rem"
                      />
                    </Td>
                    <Td>
                      Very small decay (only for the people having high score)
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </Box>
          </>
        );
      default:
        return null;
    }
  };

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
          <Modal isOpen={isOpen} onClose={onClose} size="xl">
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
                fontSize="2xl"
                fontWeight="bold"
                color="linear(to-r, purple.400, pink.400)"
              >
                Welcome to the new Season!
              </ModalHeader>
              <ModalBody textAlign="center" color="white">
                <IconButton
                  aria-label="Previous"
                  icon={<ChevronLeftIcon />}
                  onClick={prevPage}
                  isDisabled={page === 1}
                  position="absolute"
                  left="1rem"
                />
                <IconButton
                  aria-label="Next"
                  icon={<ChevronRightIcon />}
                  onClick={nextPage}
                  isDisabled={page === 3}
                  position="absolute"
                  right="1rem"
                />
                {renderPageContent()}
              </ModalBody>
              <ModalFooter justifyContent="space-between">
                {page === 3 && (
                  <Button colorScheme="teal" onClick={onClose} size="lg">
                    Let's Go!
                  </Button>
                )}
              </ModalFooter>
            </ModalContent>
          </Modal>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SeasonalUpdateModal;
