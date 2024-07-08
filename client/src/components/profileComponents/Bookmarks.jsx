import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  HStack,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  VStack,
  Skeleton,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import rrImage from "/images/rr.png";

const BookmarkCard = ({ bookmark, onClick, onRemove, isLoading }) => (
  <Box
    borderRadius="8px"
    overflow="hidden"
    backgroundColor={"#0f0d15"}
    backgroundImage={
      "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)"
    }
    boxShadow={
      "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)"
    }
    border="1px solid #2a2438"
    display="flex"
    flexDirection="column"
    cursor={isLoading ? "default" : "pointer"}
    _hover={{
      transform: isLoading ? "none" : "translateY(-5px)",
      transition: "transform 0.3s",
    }}
    onClick={isLoading ? undefined : onClick}
    position="relative"
  >
    <Box position="relative" pt="56.25%" overflow="hidden">
      {isLoading ? (
        <Skeleton height="100%" width="100%" />
      ) : (
        <Image
          src={
            bookmark.image &&
            bookmark.image !== undefined &&
            bookmark.image !== ""
              ? bookmark.image
              : rrImage
          }
          alt={bookmark.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = rrImage;
          }}
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          objectFit="cover"
        />
      )}
    </Box>
    <Box p="15px">
      {isLoading ? (
        <>
          <Skeleton height="20px" mb="10px" />
          <Skeleton height="15px" mb="8px" />
          <Skeleton height="15px" />
        </>
      ) : (
        <>
          <Heading fontSize="18px" mb="10px" color="#ffffff">
            {bookmark.title}
          </Heading>
          <Text
            bg="#2a2438"
            color="#8e7cc3"
            display="inline-block"
            px="8px"
            py="3px"
            borderRadius="4px"
            fontSize="14px"
            mb="8px"
          >
            {bookmark.category}
          </Text>
          <Text color="#a199b0" fontSize="14px">
            {bookmark.date}
          </Text>
        </>
      )}
    </Box>
    {!isLoading && (
      <IconButton
        icon={<CloseIcon />}
        aria-label="Remove bookmark"
        position="absolute"
        top="5px"
        right="5px"
        size="sm"
        colorScheme="red"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(bookmark._id);
        }}
      />
    )}
  </Box>
);

const BookmarkListItem = ({ bookmark, onClick, onRemove, isLoading }) => (
  <HStack
    align="center"
    p="10px"
    borderBottom="1px solid #2a2438"
    backgroundColor={"#0f0d15"}
    backgroundImage={
      "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)"
    }
    boxShadow={
      "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)"
    }
    w={"80%"}
    margin={"5px"}
    borderRadius="8px"
    cursor={isLoading ? "default" : "pointer"}
    _hover={{
      transform: isLoading ? "none" : "translateY(-5px)",
      transition: "transform 0.3s",
    }}
    onClick={isLoading ? undefined : onClick}
    position="relative"
  >
    {isLoading ? (
      <Skeleton
        width={{ base: "60px", md: "80px", lg: "90px", xl: "100px" }}
        height={{ base: "60px", md: "80px", lg: "90px", xl: "100px" }}
        borderRadius="4px"
        mr={{ base: "15px", md: "19px", lg: "22px", xl: "25px" }}
      />
    ) : (
      <Image
        src={
          bookmark.image &&
          bookmark.image !== undefined &&
          bookmark.image !== ""
            ? bookmark.image
            : rrImage
        }
        alt={bookmark.title}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = rrImage;
        }}
        width={{ base: "60px", md: "80px", lg: "90px", xl: "100px" }}
        height={{ base: "60px", md: "80px", lg: "90px", xl: "100px" }}
        objectFit="cover"
        mr={{ base: "15px", md: "19px", lg: "22px", xl: "25px" }}
        borderRadius="4px"
      />
    )}
    <Box>
      {isLoading ? (
        <>
          <Skeleton height="20px" mb="5px" width="150px" />
          <Skeleton height="15px" mb="5px" width="100px" />
          <Skeleton height="15px" width="100px" />
        </>
      ) : (
        <>
          <Heading fontSize="18px" mb="5px" color="#ffffff" pr={"20px"}>
            {bookmark.title}
          </Heading>
          <Text
            bg="#2a2438"
            color="#8e7cc3"
            display="inline-block"
            px="6px"
            py="2px"
            borderRadius="4px"
            fontSize="12px"
            mr="10px"
          >
            {bookmark.category}
          </Text>
          <Text color="#a199b0" fontSize="12px">
            {bookmark.date}
          </Text>
        </>
      )}
    </Box>
    {!isLoading && (
      <IconButton
        icon={<CloseIcon />}
        aria-label="Remove bookmark"
        position="absolute"
        top="5px"
        right="5px"
        size="sm"
        colorScheme="red"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(bookmark._id);
        }}
      />
    )}
  </HStack>
);

const Bookmarks = ({ isOpen, onClose }) => {
  const [viewMode, setViewMode] = useState("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);
  const navigate = useNavigate();
  const toast = useToast();

  const fetchBookmarks = async () => {
    try {
      const response = await axios.get("/api/user/getBookmarks");
      setBookmarks(response.data.bookmarks);
    } catch (error) {
      console.error(error);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchBookmarks();
  }, [isOpen]);

  const handleBookmarkClick = (id) => {
    navigate(`/article/${id}`);
  };

  const handleRemoveBookmark = async (articleId) => {
    try {
      await axios.get(`/api/user/removeBookmark?articleId=${articleId}`);
      setBookmarks(bookmarks.filter((bookmark) => bookmark._id !== articleId));
      toast({
        title: "Bookmark removed",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error removing bookmark",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "full", md: "xl", lg: "3xl", xl: "4xl" }}
      scrollBehavior={"inside"}
    >
      <ModalOverlay />
      <ModalContent
        bg="#0f0d15"
        bgGradient="linear(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)"
      >
        <ModalHeader color="#ffffff">Your Bookmarks</ModalHeader>
        <ModalCloseButton color="#ffffff" />
        <ModalBody
          w={"100%"}
          css={{
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          <Flex align="center" mb="20px">
            <Button
              marginLeft={"auto"}
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              bg="#2a2438"
              color="#ffffff"
              _hover={{ bg: "#1f1b2e" }}
            >
              {viewMode === "grid"
                ? "Switch to List View"
                : "Switch to Grid View"}
            </Button>
          </Flex>
          {viewMode === "grid" ? (
            <Grid
              templateColumns="repeat(auto-fill, minmax(250px, 1fr))"
              gap="20px"
            >
              {isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <BookmarkCard key={index} isLoading={isLoading} />
                  ))
                : bookmarks.map((bookmark) => (
                    <BookmarkCard
                      key={bookmark._id}
                      bookmark={bookmark}
                      onClick={() => handleBookmarkClick(bookmark._id)}
                      onRemove={handleRemoveBookmark}
                    />
                  ))}
            </Grid>
          ) : (
            <VStack>
              {isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <BookmarkListItem key={index} isLoading={isLoading} />
                  ))
                : bookmarks.map((bookmark) => (
                    <BookmarkListItem
                      key={bookmark._id}
                      bookmark={bookmark}
                      onClick={() => handleBookmarkClick(bookmark._id)}
                      onRemove={handleRemoveBookmark}
                    />
                  ))}
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={onClose}
            bg="#2a2438"
            color="#ffffff"
            _hover={{ bg: "#1f1b2e" }}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default Bookmarks;
