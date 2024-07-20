import React, { useState, useMemo } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Input,
  Box,
  useMediaQuery,
  Spinner,
  Center,
} from "@chakra-ui/react";

const NotificationStatus = ({ isOpen, onClose, data, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile] = useMediaQuery("(max-width: 48em)");

  const filteredUsers = useMemo(() => {
    if (!data) return [];
    const allUsers = [...data.usersEnabled, ...data.usersDisabled];
    return allUsers.filter((user) =>
      [user.name, user.inGameName, user.email].some((field) =>
        field.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", lg: "5xl" }}>
      <ModalOverlay />
      <ModalContent bg="#1a1527" color="#ffffff">
        <ModalHeader>Notification Status</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoading ? (
            <Center h="200px">
              <Spinner size="xl" color="#66d9ef" />
            </Center>
          ) : (
            <>
              <Flex justifyContent="space-around" mb={6} flexWrap="wrap">
                <Stat mb={isMobile ? 2 : 0}>
                  <StatLabel color="#a097c2">Enabled</StatLabel>
                  <StatNumber color="#66d9ef">
                    {data?.totalEnabled || 0}
                  </StatNumber>
                </Stat>
                <Stat>
                  <StatLabel color="#a097c2">Disabled</StatLabel>
                  <StatNumber color="#f92672">
                    {data?.totalDisabled || 0}
                  </StatNumber>
                </Stat>
              </Flex>

              <Box mb={4}>
                <Input
                  placeholder="Search by name, in-game name, or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  bg="#2a2337"
                  border="none"
                  _focus={{ boxShadow: "0 0 0 1px #66d9ef" }}
                />
              </Box>

              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th color="#a097c2">Name</Th>
                      {!isMobile && (
                        <>
                          <Th color="#a097c2">In-Game Name</Th>
                          <Th color="#a097c2">Email</Th>
                        </>
                      )}
                      <Th color="#a097c2">Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredUsers.map((user, index) => (
                      <Tr key={index} _hover={{ bg: "#2a2337" }}>
                        <Td>{user.name}</Td>
                        {!isMobile && (
                          <>
                            <Td>{user.inGameName}</Td>
                            <Td>{user.email}</Td>
                          </>
                        )}
                        <Td
                          color={
                            data.usersEnabled.includes(user)
                              ? "#66d9ef"
                              : "#f92672"
                          }
                        >
                          {data.usersEnabled.includes(user)
                            ? "Enabled"
                            : "Disabled"}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NotificationStatus;
