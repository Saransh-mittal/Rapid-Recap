import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Grid,
} from "@chakra-ui/react";
import ArticleCard from "../../../miscellaneous/ArticleCard";

const BookmarksModal = ({
  showBookmarksModal,
  setShowBookmarksModal,
  isLoadingBookmarks,
  bookmarks,
  handleShareBookmark,
}) => {
  return (
    <Modal
      isOpen={showBookmarksModal}
      onClose={() => setShowBookmarksModal(false)}
      size={{ base: "full", md: "xl", lg: "3xl", xl: "4xl" }}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent
        bg="#0f0d15"
        bgGradient="linear(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)"
      >
        <ModalHeader color="#ffffff">Share Bookmarked Article</ModalHeader>
        <ModalCloseButton color="#ffffff" />
        <ModalBody
          w="100%"
          css={{ "&::-webkit-scrollbar": { display: "none" } }}
        >
          <Grid
            templateColumns="repeat(auto-fill, minmax(250px, 1fr))"
            gap="20px"
          >
            {isLoadingBookmarks
              ? Array.from({ length: 6 }).map((_, index) => (
                  <ArticleCard key={index} isLoading={true} />
                ))
              : bookmarks.map((bookmark) => (
                  <ArticleCard
                    key={bookmark._id}
                    article={bookmark}
                    onClick={() => handleShareBookmark(bookmark._id, bookmark)}
                  />
                ))}
          </Grid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default BookmarksModal;
