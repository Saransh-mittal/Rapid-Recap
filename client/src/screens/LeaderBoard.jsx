import {
  Box,
  Flex,
  Heading,
  Image,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import React from "react";
import medalIcon from "../assets/medal.png";

const LeaderBoard = () => {
  return (
    <Flex minH={"85vh"} justifyContent={"center"}>
      <Flex
        margin={"20px"}
        justifyContent={"center"}
        w={"80%"}
        flexDirection={"column"}
      >
        <Heading>
          <Flex alignItems={"center"} gap={"10px"} justifyContent={"center"}>
            <Image
              src={medalIcon}
              alt="Rating"
              width={"35px"}
              height={"35px"}
              bg={"none"}
            />
            LEADERBOARD
            <Image
              src={medalIcon}
              alt="Rating"
              width={"35px"}
              height={"35px"}
              bg={"none"}
            />
          </Flex>
        </Heading>
        <TableContainer width={"100%"}>
          <Table variant={"unstyled"}>
            <TableCaption color={"white"} placement="top">
            "Where Champions Stand Out!"
            </TableCaption>

            <Thead>
              <Tr boxShadow={"dark-lg"} isNumeric>
                <Th textAlign={"center"} bg={"green.300"} color={"white"}>
                  Rank
                </Th>
                <Th textAlign={"center"} bg={"red.300"}>
                  Name
                </Th>
                <Th textAlign={"center"} bg={"blue.300"} isNumeric>
                  ID
                </Th>
                <Th textAlign={"center"} bg={"orange.300"} isNumeric>
                  IQ Scores
                </Th>
                <Th textAlign={"center"} bg={"teal.300"} isNumeric>
                Quiz Submissions
                </Th>
                <Th textAlign={"center"} bg={"pink.300"} isNumeric>
                  Avg. RQM Scores
                </Th>
              </Tr>
            </Thead>

            <Tbody marginTop={"20px"}>
              <Tr height={"80px"}>
                <Td textAlign={"center"}>
                  <Flex
                    justifyContent={"center"}
                    alignItems={"center"}
                    bgGradient="linear(to-b, #1a1527, #0e0c16 88%, #0e0c16 99%)"
                    p={2}
                    gap={"35px"}
                    borderRadius="md"
                  >
                    1
                    <Flex
                      border={"5px solid gold"}
                      style={{ transform: "rotate(45deg)" }}
                      w="45px"
                      h="45px"
                      justifyContent={"center"}
                      alignItems={"center"}
                      bg={"blue.200"}
                      position={"relative"}
                      overflow={"hidden"}
                    >
                      <Box
                        position={"absolute"}
                        h="50px"
                        w="50px"
                        style={{
                          transform: "rotate(-45deg)",
                        }}
                      >
                        <Image
                          h={"100%"}
                          w={"100%"}
                          src="https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                          alt="Dan Abramov"
                          objectFit={"cover"}
                        />
                      </Box>
                    </Flex>
                  </Flex>
                </Td>
                <Td textAlign="center">Lorem Lapum</Td>
                <Td textAlign="center" isNumeric>
                  1234567890
                </Td>
                <Td textAlign="center">188</Td>
                <Td textAlign="center">154</Td>
                <Td textAlign="center" isNumeric>
                  310
                </Td>
              </Tr>
              <Tr height={"80px"}>
                <Td textAlign="center">
                  <Flex
                    justifyContent={"center"}
                    alignItems={"center"}
                    bgGradient="linear(to-b, #1a1527, #0e0c16 88%, #0e0c16 99%)"
                    p={2}
                    gap={"35px"}
                    borderRadius="md"
                  >
                    2
                    <Flex
                      border={"5px solid gold"}
                      style={{ transform: "rotate(45deg)" }}
                      w="45px"
                      h="45px"
                      justifyContent={"center"}
                      alignItems={"center"}
                      bg={"blue.200"}
                      position={"relative"}
                      overflow={"hidden"}
                    >
                      <Box
                        position={"absolute"}
                        h="50px"
                        w="50px"
                        style={{
                          transform: "rotate(-45deg)",
                        }}
                      >
                        <Image
                          h={"100%"}
                          w={"100%"}
                          src="https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                          alt="Dan Abramov"
                          objectFit={"cover"}
                        />
                      </Box>
                    </Flex>
                  </Flex>
                </Td>
                <Td textAlign="center">Lorem Lapum</Td>
                <Td textAlign="center" isNumeric>
                  1234567890
                </Td>
                <Td textAlign="center">188</Td>
                <Td textAlign="center">154</Td>
                <Td textAlign="center" isNumeric>
                  310
                </Td>
              </Tr>
              <Tr height={"80px"}>
                <Td textAlign="center">
                  <Flex
                    justifyContent={"center"}
                    alignItems={"center"}
                    bgGradient="linear(to-b, #1a1527, #0e0c16 88%, #0e0c16 99%)"
                    p={2}
                    gap={"35px"}
                    borderRadius="md"
                  >
                    3
                    <Flex
                      border={"5px solid gold"}
                      style={{ transform: "rotate(45deg)" }}
                      w="45px"
                      h="45px"
                      justifyContent={"center"}
                      alignItems={"center"}
                      bg={"blue.200"}
                      position={"relative"}
                      overflow={"hidden"}
                    >
                      <Box
                        position={"absolute"}
                        h="50px"
                        w="50px"
                        style={{
                          transform: "rotate(-45deg)",
                        }}
                      >
                        <Image
                          h={"100%"}
                          w={"100%"}
                          src="https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                          alt="Dan Abramov"
                          objectFit={"cover"}
                        />
                      </Box>
                    </Flex>
                  </Flex>
                </Td>
                <Td textAlign="center">Lorem Lapum</Td>
                <Td textAlign="center" isNumeric>
                  1234567890
                </Td>
                <Td textAlign="center">188</Td>
                <Td textAlign="center">154</Td>
                <Td textAlign="center" isNumeric>
                  310
                </Td>
              </Tr>
              <Tr height={"80px"}>
                <Td textAlign="center">
                  <Flex
                    justifyContent={"center"}
                    alignItems={"center"}
                    bgGradient="linear(to-b, #1a1527, #0e0c16 88%, #0e0c16 99%)"
                    p={2}
                    gap={"35px"}
                    borderRadius="md"
                  >
                    4
                    <Flex
                      border={"5px solid gold"}
                      style={{ transform: "rotate(45deg)" }}
                      w="45px"
                      h="45px"
                      justifyContent={"center"}
                      alignItems={"center"}
                      bg={"blue.200"}
                      position={"relative"}
                      overflow={"hidden"}
                    >
                      <Box
                        position={"absolute"}
                        h="50px"
                        w="50px"
                        style={{
                          transform: "rotate(-45deg)",
                        }}
                      >
                        <Image
                          h={"100%"}
                          w={"100%"}
                          src="https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                          alt="Dan Abramov"
                          objectFit={"cover"}
                        />
                      </Box>
                    </Flex>
                  </Flex>
                </Td>
                <Td textAlign="center">Lorem Lapum</Td>
                <Td textAlign="center" isNumeric>
                  1234567890
                </Td>
                <Td textAlign="center">188</Td>
                <Td textAlign="center">154</Td>
                <Td textAlign="center" isNumeric>
                  310
                </Td>
              </Tr>
              <Tr height={"80px"}>
                <Td textAlign="center">
                  <Flex
                    justifyContent={"center"}
                    alignItems={"center"}
                    bgGradient="linear(to-b, #1a1527, #0e0c16 88%, #0e0c16 99%)"
                    p={2}
                    gap={"35px"}
                    borderRadius="md"
                  >
                    5
                    <Flex
                      border={"5px solid gold"}
                      style={{ transform: "rotate(45deg)" }}
                      w="45px"
                      h="45px"
                      justifyContent={"center"}
                      alignItems={"center"}
                      bg={"blue.200"}
                      position={"relative"}
                      overflow={"hidden"}
                    >
                      <Box
                        position={"absolute"}
                        h="50px"
                        w="50px"
                        style={{
                          transform: "rotate(-45deg)",
                        }}
                      >
                        <Image
                          h={"100%"}
                          w={"100%"}
                          src="https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                          alt="Dan Abramov"
                          objectFit={"cover"}
                        />
                      </Box>
                    </Flex>
                  </Flex>
                </Td>
                <Td textAlign="center">Lorem Lapum</Td>
                <Td textAlign="center" isNumeric>
                  1234567890
                </Td>
                <Td textAlign="center">188</Td>
                <Td textAlign="center">154</Td>
                <Td textAlign="center" isNumeric>
                  310
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </Flex>
    </Flex>
  );
};

export default LeaderBoard;
