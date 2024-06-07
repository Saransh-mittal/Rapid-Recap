import React, { useState } from "react";
import {
  ChakraProvider,
  Box,
  Flex,
  Input,
  Text,
  Heading,
  Container,
  extendTheme,
  keyframes,
} from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      body: {
        fontFamily: "Open Sans, sans-serif",
      },
    },
  },
});

const ProgressBubble = ({ xp, level }) => {
  const calculateProgress = (xp, level) => {
    return (xp / (level * 10)) * 100;
  };

  const [percent, setPercent] = useState(calculateProgress(xp, level));
  const colorInc = 100 / 3;

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val !== "" && !isNaN(val) && val <= 100 && val >= 0) {
      setPercent(Number(val));
    } else {
      setPercent(calculateProgress(xp, level));
    }
  };

  const getClass = () => {
    if (percent < colorInc * 1) return "red";
    else if (percent < colorInc * 2) return "orange";
    else return "green";
  };

  const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

  return (
    <ChakraProvider theme={theme}>
      <Container>
        <Heading
          size="lg"
          color="white"
          fontWeight="bold"
          textAlign="center"
          mt={12}
          mb={6}
          fontFamily="Arial, sans-serif"
          letterSpacing="2px"
          pb={5}
          textShadow="0px 0px 3px rgba(0, 0, 0, 0.2)"
          bgGradient="linear(to-r, teal.400, blue.500, purple.500)"
          bgClip="text"
          animation={`${gradientAnimation} 5s ease infinite`}
          backgroundSize="200% 200%"
        >
          Experience
        </Heading>
        <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
          <Flex
            justify="space-between"
            align="center"
            width="300px"
            flexDirection="column"
          >
            <Box textAlign="center">
              <Text
                fontSize="16px"
                // fontWeight="bold"
                color="blue.600"
                textShadow="0 0 10px blue.500"
                mb={2}
              >
                Next Level: {level + 1}
              </Text>
            </Box>
            <Box className={getClass()} position="relative" mb={4}>
              <Box
                className="progress"
                position="relative"
                borderRadius="50%"
                w="120px"
                h="120px"
                border="5px solid"
                borderColor={
                  getClass() === "green"
                    ? "green.400"
                    : getClass() === "orange"
                    ? "orange.400"
                    : "red.400"
                }
                boxShadow={`0 0 20px ${
                  getClass() === "green"
                    ? "green.400"
                    : getClass() === "orange"
                    ? "orange.400"
                    : "red.400"
                }`}
                transition="all 1s ease"
              >
                <Box
                  className="inner"
                  position="absolute"
                  overflow="hidden"
                  zIndex="2"
                  borderRadius="50%"
                  w="110px"
                  h="110px"
                  border="5px solid white"
                  transition="all 1s ease"
                >
                  <Box
                    className="percent"
                    position="absolute"
                    top="0"
                    left="0"
                    w="100%"
                    h="100%"
                    fontWeight="bold"
                    textAlign="center"
                    lineHeight="110px"
                    fontSize="40px"
                    color="blue.600"
                    textShadow="0 0 10px blue.500"
                    transition="all 1s ease"
                  >
                    <span>{percent}</span>%
                  </Box>
                  <Box
                    className="water"
                    position="absolute"
                    zIndex="1"
                    w="200%"
                    h="200%"
                    left="-50%"
                    top={`${100 - percent}%`}
                    borderRadius="40%"
                    bg="blue.400"
                    opacity="0.5"
                    animation="spin 10s linear infinite"
                    transition="all 1s ease"
                    boxShadow="0 0 20px blue.300"
                  ></Box>
                </Box>
              </Box>
            </Box>
            <Box textAlign="center">
              <Text
                fontSize="16px"
                // fontWeight="bold"
                color="blue.600"
                textShadow="0 0 10px blue.500"
                // mt={2}
              >
                Current Level: {level}
              </Text>
            </Box>
          </Flex>
          <Flex textAlign={"center"}>
            {/* <Text>
              Enter Percentage:{" "}
              <Input
                type="text"
                placeholder="67"
                value={percent}
                onChange={handleInputChange}
                w="45px"
                textAlign="center"
                fontSize="20px"
                border="0"
                borderBottom="1px solid blue.300"
                color="blue.600"
                textShadow="3px 3px 10px blue.600"
                bg="transparent"
                _focus={{
                  outline: "0",
                  borderBottom: "1px dashed red.300",
                }}
                px={0}
              />
            </Text> */}
            <Box>
              {/* write current xp and required xp to go to next level */}
              <Text
                fontSize="16px"
                fontWeight="bold"
                // color="blue.600"
                textShadow="0 0 10px blue.500"
                mt={2}
              >
                Current XP: {xp}
              </Text>
              <Text
                fontSize="16px"
                fontWeight="bold"
                // color="blue.600"
                textShadow="0 0 10px blue.500"
                mt={2}
              >
                Required XP for level up: {level * 10 - xp}
              </Text>
            </Box>
          </Flex>
        </Box>
      </Container>
    </ChakraProvider>
  );
};

export default ProgressBubble;
