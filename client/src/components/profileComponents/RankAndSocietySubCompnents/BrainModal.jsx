import React, { useState } from "react";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Flex, Box } from "@chakra-ui/react";

const BrainModal = ({ isOpen, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => (prevPage === 1 ? 5 : prevPage - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => (prevPage === 5 ? 1 : prevPage + 1));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <Flex justifyContent="space-between" alignItems="center" marginBottom="10px">
          {/* Previous button */}
          <Box
            w="0"
            h="0"
            borderTop="5px solid transparent"
            borderBottom="5px solid transparent"
            borderRight="8px solid #000"
            cursor="pointer"
            onClick={handlePreviousPage}
          />
          <ModalHeader>Brain Details</ModalHeader>
          {/* Next button */}
          <Box
            w="0"
            h="0"
            borderTop="5px solid transparent"
            borderBottom="5px solid transparent"
            borderLeft="8px solid #000"
            cursor="pointer"
            onClick={handleNextPage}
          />
        </Flex>
        <ModalCloseButton />
        <ModalBody>
          {/* Render different content based on the current page */}
          {currentPage === 1 && <p>Page 1 content goes here.</p>}
          {currentPage === 2 && <p>Page 2 content goes here.</p>}
          {currentPage === 3 && <p>Page 3 content goes here.</p>}
          {currentPage === 4 && <p>Page 4 content goes here.</p>}
          {currentPage === 5 && <p>Page 5 content goes here.</p>}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default BrainModal;
