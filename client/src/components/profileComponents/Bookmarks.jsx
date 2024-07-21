import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ArticleCard from "../miscellaneous/ArticleCard";

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
                    <ArticleCard key={index} isLoading={true} />
                  ))
                : bookmarks.map((bookmark) => (
                    <ArticleCard
                      key={bookmark._id}
                      article={bookmark}
                      onClick={() => handleBookmarkClick(bookmark._id)}
                      onRemove={handleRemoveBookmark}
                    />
                  ))}
            </Grid>
          ) : (
            <VStack>
              {isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <ArticleCard key={index} isLoading={true} viewMode="list" />
                  ))
                : bookmarks.map((bookmark) => (
                    <ArticleCard
                      key={bookmark._id}
                      article={bookmark}
                      onClick={() => handleBookmarkClick(bookmark._id)}
                      onRemove={handleRemoveBookmark}
                      viewMode="list"
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
