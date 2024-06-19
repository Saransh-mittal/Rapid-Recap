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
  keyframes,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { FaMedal, FaGamepad, FaTrophy } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import seasonGIF from "/GIFs/season.gif";
import decayImage from "/images/decay.png";
import arrowImage from "/images/arrow.png";
import decrease from "/images/decrease.png";
import { AiOutlineArrowDown } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import axios from "axios"; // Import axios for API calls

const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const arrowMotion = {
  animate: {
    x: [0, 10, 0],
  },
  transition: {
    repeat: Infinity,
    duration: 2,
    ease: "easeInOut",
  },
};

const SeasonalUpdateModal = ({ isOpen, onClose }) => {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const nextPage = () => setPage((prev) => (prev < 3 ? prev + 1 : prev));
  const prevPage = () => setPage((prev) => (prev > 1 ? prev - 1 : prev));

  const handlers = useSwipeable({
    onSwipedLeft: () => nextPage(),
    onSwipedRight: () => prevPage(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

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
              textDecoration={"underline"}
            >
              SEASON 2: THE CYCLE OF KNOWLEDGE!
            </Text>
            <Box mt={4}>
              <Text
                fontSize="md"
                mt={2}
                color="#2C7865"
                fontStyle="italic"
                fontWeight={"bold"}
              >
                The adventure continues as we dive into the new season, "THE
                CYCLE OF KNOWLEDGE."
              </Text>
              <Flex flexDirection={"row"}>
                <Flex mt={4} ml={4}>
                  <FaMedal color="black" />
                </Flex>
                <Text
                  fontSize="md"
                  mt={2}
                  color="blue.800"
                  textAlign={"center"}
                  fontWeight={"bold"}
                >
                  Get ready for a thrilling season of challenges and
                  opportunities that will push your skills and intellect to new
                  heights!
                </Text>
              </Flex>
            </Box>
            <Box mt={4}>
              <Animation src={seasonGIF} />
              <Text
                fontSize="md"
                fontWeight="bold"
                color="yellow.800"
                fontStyle="italic"
              >
                Compete, learn, and grow as you navigate through the dynamic
                landscape of knowledge and strategy.
              </Text>
            </Box>
          </>
        );
      case 2:
        return (
          <>
            <Flex flexDirection={"row"} justifyContent={"center"}>
              <Text
                fontSize="lg"
                fontWeight="bold"
                color="purple.700"
                fontStyle="italic"
                textDecoration={"underline"}
              >
                IQ SCORE DECAY
              </Text>
              <Flex mb={2}>
                <Image src={decrease} alt="Decrease" h="2rem" w="2rem" ml={2} />
              </Flex>
            </Flex>

            <Box mt={4} textAlign="left">
              <List spacing={3}>
                <ListItem>
                  <Text fontSize="md" color="blue.800">
                    <ListIcon as={FaGamepad} color="teal.500" />
                    <Text as="span" fontWeight="bold">
                      IQ scores will decrease
                    </Text>{" "}
                    at the end of every season. So, make sure to make the most
                    out of the season and keep your score high!
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
                    <ListIcon as={FaTrophy} color="teal.500" />
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
              <Text
                fontSize="md"
                fontWeight="bold"
                color="yellow.800"
                fontStyle="italic"
              >
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
                      <Flex width={{ base: "2.5rem", md: "3.5rem" }}>
                        <motion.div {...arrowMotion}>
                          <Image
                            src={arrowImage}
                            alt="Arrow"
                            h="3.5rem"
                            w="10rem"
                          />
                        </motion.div>
                      </Flex>
                    </Td>
                    <Td>Mavericks society (Visionaries circle)</Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">
                      Mavericks society (Visionaries circle and Pioneers circle)
                    </Td>
                    <Td>
                      <Flex width={{ base: "2.5rem", md: "3.5rem" }}>
                        <motion.div {...arrowMotion}>
                          <Image
                            src={arrowImage}
                            alt="Arrow"
                            h="3.5rem"
                            w="10rem"
                          />
                        </motion.div>
                      </Flex>
                    </Td>
                    <Td>Elites society (Scholars circle)</Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">
                      Elites society (Scholars circle and Master circle)
                    </Td>
                    <Td>
                      <Flex width={{ base: "2.5rem", md: "3.5rem" }}>
                        <motion.div {...arrowMotion}>
                          <Image
                            src={arrowImage}
                            alt="Arrow"
                            h="3.5rem"
                            w="10rem"
                          />
                        </motion.div>
                      </Flex>
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
                      <Flex width={{ base: "2.5rem", md: "3.5rem" }}>
                        <motion.div {...arrowMotion}>
                          <Image
                            src={arrowImage}
                            alt="Arrow"
                            h="3.5rem"
                            w="10rem"
                          />
                        </motion.div>
                      </Flex>
                    </Td>
                    <Td>Strivers (Progressors circle)</Td>
                  </Tr>
                  <Tr>
                    <Td fontWeight="bold">Explorers</Td>
                    <Td>
                      <Flex width={{ base: "2.5rem", md: "3.5rem" }}>
                        <motion.div {...arrowMotion}>
                          <Image
                            src={arrowImage}
                            alt="Arrow"
                            h="3.5rem"
                            w="10rem"
                          />
                        </motion.div>
                      </Flex>
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

  const handleLetsGoClick = async () => {
    try {
      const response = await axios.get(
        "/api/user/newSeasonModal" // Adjust the URL as needed
      );

      if (response.status === 200 && !response.data.show) {
        navigate("/home");
        onClose();
      } else {
        console.error("Failed to update new season modal status");
      }
    } catch (error) {
      console.error("Error updating new season modal status", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          {...handlers}
        >
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            numberOfPieces={200}
          />
          <Modal
            isOpen={isOpen}
            onClose={onClose}
            size={{ base: "full", md: "2xl" }}
            closeOnOverlayClick={false}
          >
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
                fontSize="3xl"
                fontWeight="bold"
                bgGradient="linear(to-r, #191919, #BED754)"
                bgClip="text"
                animation={`${gradientAnimation} 5s ease infinite`}
                backgroundSize="200% 200%"
                fontFamily="'Courier New', Courier, monospace"
                textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)"
                lineHeight="1.5"
              >
                WELCOME TO THE NEW SEASON!!!
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
                  <Button
                    colorScheme="teal"
                    onClick={handleLetsGoClick} // Call the function on button click
                    size="lg"
                  >
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
