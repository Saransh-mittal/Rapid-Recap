import React, { useState } from "react";
import {
  ChakraProvider,
  Box,
  Flex,
  Input,
  Text,
  Container,
  extendTheme,
  keyframes,
} from "@chakra-ui/react";
import Heading from "../miscellaneous/HeadingComponent";

const ProgressBubble = ({ xp, level }) => {
  const calculateProgress = (xp, level) => {
    return (xp / (level * 10)) * 100;
  };

  const [percent, setPercent] = useState(calculateProgress(xp, level));
  const colorInc = 100 / 3;
  const requiredXP = level * 10 - xp;

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
    <Container padding={0}>
      <Flex flexDirection="column" width="100%" h={"100%"} m={0}>
        <Text textAlign="left" color="#9CAFAA" p={0} m={0}>
          Experience
        </Text>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent={"space-between"}
          alignItems="center"
          mt={4}
        >
          <Flex
            justify="space-between"
            align="left"
            width="120px"
            flexDirection="column"
          >
            <Box>
              <Text
                textAlign="center"
                fontSize="16px"
                fontWeight="bold"
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
            <Box textAlign="left">
              <Text
                textAlign="center"
                fontSize="16px"
                fontWeight="bold"
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
              {/* <Text
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
                  Required Level Up xP: {level * 10 - xp}
                </Text> */}
              <Heading
                tag={`Required Level Up xP :`}
                marginBottom="0"
                textTransform="uppercase"
              >
                <span
                  style={{
                    color: "blue",
                    fontSize: "1.15rem",
                    fontWeight: "bold",
                  }}
                >
                  {requiredXP}
                </span>
              </Heading>
              <Heading
                tag={`Current XP :`}
                marginBottom="0"
                textTransform="uppercase"
              >
                <span
                  style={{
                    color: "blue",
                    fontSize: "1.15rem",
                    fontWeight: "bold",
                  }}
                >
                  {xp}
                </span>
              </Heading>
            </Box>
          </Flex>
        </Box>
      </Flex>
    </Container>
  );
};

export default ProgressBubble;
