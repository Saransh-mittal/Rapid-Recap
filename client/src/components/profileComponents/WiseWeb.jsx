import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  forwardRef,
} from "react";
import { UserPlus, Users, MessageCircle, User, Unlink } from "lucide-react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Flex,
  Text,
  Avatar,
  VStack,
  useColorModeValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Button,
  Skeleton,
  SkeletonCircle,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SageItem = React.memo(
  ({ sage, index, openPopoverId, setOpenPopoverId, onSeverTies }) => {
    const [hoveredOption, setHoveredOption] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const cancelRef = useRef();
    const itemRef = useRef(null);
    const navigate = useNavigate();

    const handleSeverTies = useCallback(() => {
      setOpenPopoverId(null);
      setIsConfirmOpen(true);
    }, [setOpenPopoverId]);

    const onConfirmSeverTies = useCallback(() => {
      setIsConfirmOpen(false);
      onSeverTies(sage._id);
    }, [sage._id, onSeverTies]);

    const handleToggle = useCallback(() => {
      setOpenPopoverId((prevId) => (prevId === index ? null : index));
    }, [index, setOpenPopoverId]);

    const handleCommune = useCallback(() => {
      setOpenPopoverId(null);
      navigate(`/chats?chatId=${sage.chatId}`);
    }, [sage.name, setOpenPopoverId]);

    const handleGlimpseWisdom = useCallback(() => {
      setOpenPopoverId(null);
      navigate(`/profile/${sage.inGameName}`);
    }, [sage.name, setOpenPopoverId]);

    const calculatePlacement = useCallback(() => {
      if (!itemRef.current || !itemRef.current.closest(".chakra-modal__body"))
        return "bottom";
      const itemRect = itemRef.current.getBoundingClientRect();
      const modalRect = itemRef.current
        .closest(".chakra-modal__body")
        .getBoundingClientRect();
      const spaceBelow = modalRect.bottom - itemRect.bottom;
      const spaceAbove = itemRect.top - modalRect.top;
      return spaceBelow >= 100 || spaceBelow > spaceAbove ? "bottom" : "top";
    }, []);

    const hoverBg = useColorModeValue("#2a2438", "#2a2438");
    const textColor = useColorModeValue("white", "white");
    const subTextColor = useColorModeValue("#a0a0a0", "#a0a0a0");

    return (
      <>
        <Popover
          isOpen={openPopoverId === index}
          onClose={() => setOpenPopoverId(null)}
          placement={calculatePlacement()}
          closeOnBlur={false}
        >
          <PopoverTrigger>
            <Flex
              ref={itemRef}
              alignItems="center"
              p={3}
              borderRadius="lg"
              transition="all 0.3s"
              _hover={{
                bg: hoverBg,
                transform: "scale(1.05)",
                boxShadow: "md",
              }}
              cursor="pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleToggle();
              }}
            >
              <Avatar
                name={sage.name}
                src={
                  sage.pic
                    ? sage.pic
                    : `https://api.dicebear.com/6.x/initials/svg?seed=${sage.name}`
                }
              />
              <Box ml={4}>
                <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                  {sage.name}
                </Text>
                <Text fontSize="xs" color={subTextColor}>
                  IQ: {sage.IQ_score} | {sage.inGameName}
                </Text>
              </Box>
            </Flex>
          </PopoverTrigger>

          <PopoverContent
            bg="#2a2438"
            borderColor="#3d355a"
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
            _focus={{ boxShadow: "none" }}
            width="100%"
            zIndex={1500}
          >
            <PopoverBody p={2} width="100%">
              <Flex
                align="center"
                p={2}
                cursor="pointer"
                transition="all 0.3s ease"
                color="#e0e0e0"
                borderRadius="md"
                bg={hoveredOption === "commune" ? "#3d355a" : "transparent"}
                transform={
                  hoveredOption === "commune"
                    ? "translateX(5px)"
                    : "translateX(0)"
                }
                onClick={handleCommune}
                onMouseEnter={() => setHoveredOption("commune")}
                onMouseLeave={() => setHoveredOption(null)}
              >
                <MessageCircle
                  color="#a49eb9"
                  size={16}
                  style={{ marginRight: "8px" }}
                />
                <Text textAlign={"center"} m={0}>
                  Commune
                </Text>
              </Flex>
              <Box
                height="1px"
                width="100%"
                bg="linear-gradient(to right, #2a2438, #a49eb9, #2a2438)"
                my={2}
              />
              <Flex
                align="center"
                p={2}
                cursor="pointer"
                transition="all 0.3s ease"
                color="#e0e0e0"
                borderRadius="md"
                bg={hoveredOption === "glimpse" ? "#3d355a" : "transparent"}
                transform={
                  hoveredOption === "glimpse"
                    ? "translateX(5px)"
                    : "translateX(0)"
                }
                onClick={handleGlimpseWisdom}
                onMouseEnter={() => setHoveredOption("glimpse")}
                onMouseLeave={() => setHoveredOption(null)}
              >
                <User
                  color="#a49eb9"
                  size={16}
                  style={{ marginRight: "8px" }}
                />
                <Text textAlign={"center"} m={0}>
                  Glimpse Wisdom
                </Text>
              </Flex>
              <Box
                height="1px"
                width="100%"
                bg="linear-gradient(to right, #2a2438, #a49eb9, #2a2438)"
                my={2}
              />
              <Flex
                align="center"
                p={2}
                cursor="pointer"
                transition="all 0.3s ease"
                color="#ff6b6b"
                borderRadius="md"
                bg={hoveredOption === "sever" ? "#3d355a" : "transparent"}
                transform={
                  hoveredOption === "sever"
                    ? "translateX(5px)"
                    : "translateX(0)"
                }
                onClick={handleSeverTies}
                onMouseEnter={() => setHoveredOption("sever")}
                onMouseLeave={() => setHoveredOption(null)}
              >
                <Unlink
                  color="#ff6b6b"
                  size={16}
                  style={{ marginRight: "8px" }}
                />
                <Text textAlign={"center"} m={0} fontWeight="bold">
                  Sever Ties
                </Text>
              </Flex>
            </PopoverBody>
          </PopoverContent>
        </Popover>
        <AlertDialog
          isOpen={isConfirmOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsConfirmOpen(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent bg="#2a2438" color="white">
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Sever Ties with {sage.name}
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure? This action cannot be undone. You will no longer
                be friends with {sage.name}.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => setIsConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={onConfirmSeverTies} ml={3}>
                  Sever Ties
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </>
    );
  }
);

const SageList = forwardRef(
  (
    { items, startIndex = 0, openPopoverId, setOpenPopoverId, onSeverTies },
    ref
  ) => (
    <VStack
      ref={ref}
      spacing={0}
      align="stretch"
      maxH="300px"
      overflowY="auto"
      borderColor={useColorModeValue("#2a2438", "#2a2438")}
      borderWidth={1}
      borderRadius="md"
      p={2}
      css={{
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-track": {
          background: "#1a1527",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#2a2438",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "#3d355a",
        },
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={startIndex + index}>
          <SageItem
            sage={item}
            index={startIndex + index}
            openPopoverId={openPopoverId}
            setOpenPopoverId={setOpenPopoverId}
            onSeverTies={onSeverTies}
          />
        </React.Fragment>
      ))}
    </VStack>
  )
);

const FriendRequestItem = ({ request, onAccept, onReject }) => {
  const bgColor = useColorModeValue("#2a2438", "#2a2438");
  const textColor = useColorModeValue("white", "white");
  const subTextColor = useColorModeValue("#a0a0a0", "#a0a0a0");
  const iqColor = useColorModeValue("#ffd700", "#ffd700");

  const handleAccept = () => onAccept(request._id);
  const handleReject = () => onReject(request._id);

  return (
    <Box
      bg={bgColor}
      borderRadius="md"
      p={2}
      mb={2}
      boxShadow="md"
      color={textColor}
      w={"100%"}
    >
      <Flex>
        <Flex alignItems={"flex-start"} h={"100%"}>
          <Avatar
            size="sm"
            name={request.from.name}
            src={request.from.pic}
            mt={1}
            mr={3}
          />
        </Flex>
        <Box flex={1} mr={2}>
          <Flex alignItems="baseline" flexDirection={"column"}>
            <Text fontWeight="bold" fontSize="sm" mr={1} mb={0}>
              {request.from.name}
            </Text>
            <Text fontSize="xs" color={subTextColor} mb={0}>
              @{request.from.inGameName}
            </Text>
          </Flex>
          <Text fontSize="xs" color={iqColor} mb={0}>
            IQ: {request.from.IQ_score}
          </Text>
        </Box>
        <Flex alignItems={"center"} gap={2}>
          <Button colorScheme="green" size="xs" mr={1} onClick={handleAccept}>
            Accept
          </Button>
          <Button colorScheme="red" size="xs" onClick={handleReject}>
            Reject
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

const LoadingSkeleton = ({ count = 3 }) => (
  <VStack spacing={4} align="stretch" width="100%">
    {[...Array(count)].map((_, index) => (
      <Flex key={index} alignItems="center" p={2}>
        <SkeletonCircle size="10" />
        <Box ml={4} width="100%">
          <Skeleton height="20px" width="60%" mb={1} />
          <Skeleton height="16px" width="40%" />
        </Box>
      </Flex>
    ))}
  </VStack>
);

const WiseWeb = ({ isOpen, onClose, requestNotif, markRequestAsRead }) => {
  const [sages, setSages] = useState([]);
  const [requests, setRequests] = useState([]);
  const [openPopoverId, setOpenPopoverId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isLoadingSages, setIsLoadingSages] = useState(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [requestTabVisited, setRequestTabVisited] = useState(false);
  const toast = useToast();

  const sageListRef = useRef(null);

  const handleSeverTies = async (friendId) => {
    try {
      await axios.post("/api/friends/sever-ties", { friendId });
      fetchFriends();
      toast({
        title: "Ties Severed",
        description: "You have successfully unfriended the sage.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error severing ties:", error);
      toast({
        title: "Error",
        description: "Failed to sever ties. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleTabChange = (index) => {
    if (index === 1) {
      setRequestTabVisited(true);
    } else if (index === 0 && requestTabVisited) {
      markRequestAsRead();
      setRequestTabVisited(false);
    }
    setActiveTab(index);
  };

  const handleClose = () => {
    if (requestTabVisited) {
      markRequestAsRead();
      setRequestTabVisited(false);
    }
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sageListRef.current &&
        !sageListRef.current.contains(event.target) &&
        openPopoverId !== null
      ) {
        setOpenPopoverId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openPopoverId]);

  const fetchRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const response = await axios.get(`/api/friends/get-requests`);
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const fetchFriends = async () => {
    setIsLoadingSages(true);
    try {
      const response = await axios.get(`/api/friends/`);
      setSages(response.data);
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setIsLoadingSages(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.post("/api/friends/accept-request", { requestId });
      fetchRequests();
      fetchFriends();
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.post("/api/friends/reject-request", { requestId });
      fetchRequests();
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRequests();
      fetchFriends();
    }
  }, [isOpen]);

  const bgGradient = useColorModeValue(
    "linear(to-b, #1a1527, #0e0c16 88%, #0e0c16 99%)",
    "linear(to-b, #1a1527, #0e0c16 88%, #0e0c16 99%)"
  );

  const borderColor = useColorModeValue("#2a2438", "#2a2438");
  const textColor = useColorModeValue("white", "white");
  const headerColor = useColorModeValue("#a49eb9", "#a49eb9");

  const tabStyle = useCallback(
    (isActive) => ({
      padding: "8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      backgroundColor: isActive ? "#2a2438" : "transparent",
      color: isActive ? "#ffffff" : "#a49eb9",
      border: "none",
      transition: "all 0.3s ease",
      borderRadius: "4px",
      transform: isActive ? "scale(1.05)" : "scale(1)",
      boxShadow: isActive ? "0 2px 4px rgba(0,0,0,0.2)" : "none",
    }),
    []
  );

  const memoizedSageList = useMemo(
    () =>
      isLoadingSages ? (
        <LoadingSkeleton />
      ) : sages.length > 0 ? (
        <SageList
          items={sages}
          openPopoverId={openPopoverId}
          setOpenPopoverId={setOpenPopoverId}
          ref={sageListRef}
          onSeverTies={handleSeverTies}
        />
      ) : (
        <Text>No friends found.</Text>
      ),
    [sages, openPopoverId, isLoadingSages]
  );

  const memoizedRequestList = useMemo(
    () =>
      isLoadingRequests ? (
        <LoadingSkeleton />
      ) : requests.length > 0 ? (
        <VStack spacing={4}>
          {requests.map((request) => (
            <FriendRequestItem
              key={request._id}
              request={request}
              onAccept={handleAcceptRequest}
              onReject={handleRejectRequest}
            />
          ))}
        </VStack>
      ) : (
        <Text>No friend requests found.</Text>
      ),
    [requests, isLoadingRequests]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      onCloseComplete={() => setOpenPopoverId(null)}
    >
      <ModalOverlay />
      <ModalContent
        bgGradient={bgGradient}
        color={textColor}
        borderColor={borderColor}
        borderWidth={1}
        borderRadius="md"
        maxW="400px"
        css={{ "&::-webkit-scrollbar": { display: "none" } }}
      >
        <ModalHeader>Wise Web</ModalHeader>
        <ModalCloseButton />
        <ModalBody
          maxH="75vh"
          overflowY="auto"
          w={"100%"}
          position="relative"
          css={{ "&::-webkit-scrollbar": { display: "none" } }}
          pb={"4rem"}
        >
          <Tabs
            isFitted
            variant="enclosed"
            index={activeTab}
            onChange={handleTabChange}
          >
            <TabList
              mb="1em"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                backgroundColor: "#1a1527",
                borderRadius: "4px",
                overflow: "hidden",
                padding: "4px",
              }}
            >
              <Tab style={tabStyle(activeTab === 0)}>
                <Users size={16} style={{ marginRight: "8px" }} />
                Sages
              </Tab>
              <Tab style={tabStyle(activeTab === 1)} position={"relative"}>
                {requestNotif && (
                  <Box
                    h="8px"
                    w="8px"
                    bg={"red"}
                    borderRadius={"50%"}
                    position={"absolute"}
                    right={"20%"}
                    top={"25%"}
                    zIndex={2}
                  />
                )}
                <UserPlus size={16} style={{ marginRight: "8px" }} />
                Requests
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel p={0}>
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  mb={4}
                  color={headerColor}
                >
                  Your Sages
                </Text>
                {memoizedSageList}
              </TabPanel>
              <TabPanel p={0}>
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  mb={4}
                  color={headerColor}
                >
                  Friend Requests
                </Text>
                {memoizedRequestList}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default WiseWeb;
