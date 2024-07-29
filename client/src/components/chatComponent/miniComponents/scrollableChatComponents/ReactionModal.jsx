// src/components/chat/ReactionModal.js
import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tab,
  Flex,
  Avatar,
  Text,
} from "@chakra-ui/react";
import { Emoji } from "emoji-picker-react";
import {
  getDistinctEmojis,
  filterReactionsByEmoji,
} from "../../../../utils/chat.utils";

const ReactionModal = ({
  isOpen,
  onClose,
  selectedReactions,
  handleRemoveReaction,
  user,
}) => {
  const renderReactions2 = (reactions) => {
    return reactions.length > 0 ? (
      reactions.map((reaction) => (
        <Flex
          key={reaction.user._id}
          p="10px"
          borderRadius="10px"
          mb={4}
          _hover={{ bg: "#2a2440" }}
          cursor={reaction.user._id === user._id ? "pointer" : "not-allowed"}
          onClick={() => {
            if (reaction.user._id === user._id) {
              handleRemoveReaction(selectedReactions.message._id, user._id);
              onClose();
            }
          }}
        >
          <Avatar
            size="md"
            src={reaction.user.pic}
            name={reaction.user.name}
            mr={2}
          />
          <Flex flexDirection="column">
            <Text fontWeight="bold" m={0}>
              {reaction.user._id === user._id ? "YOU" : reaction.user.name}
            </Text>
            {reaction.user._id === user._id && (
              <Text color="#9CAFAA" m={0}>
                Tap to remove
              </Text>
            )}
          </Flex>
          <Flex marginLeft="auto" alignItems="center">
            <Emoji unified={reaction.emoji} size="25" />
          </Flex>
        </Flex>
      ))
    ) : (
      <Text>No reactions in this category</Text>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent
        bg="#1e1a2e"
        color="white"
        borderRadius="10px"
        boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
      >
        <ModalHeader
          bg="#2a2440"
          borderTopLeftRadius="10px"
          borderTopRightRadius="10px"
          w="100%"
        >
          Reaction Details
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody maxH="60vh" overflowY="auto" w="100%" mt="1.5rem">
          {selectedReactions && (
            <Tabs
              isFitted
              variant="solid-rounded"
              onChange={(index) =>
                setActiveTab(
                  index === 0
                    ? "All"
                    : getDistinctEmojis(selectedReactions.reactions)[index - 1]
                )
              }
            >
              <TabList mb="1em">
                <Tab>All</Tab>
                {getDistinctEmojis(selectedReactions.reactions).map(
                  (emoji, index) => (
                    <Tab key={index}>
                      <Emoji unified={emoji} size="20" />
                    </Tab>
                  )
                )}
              </TabList>
              <TabPanels>
                <TabPanel>
                  {renderReactions2(selectedReactions.reactions)}
                </TabPanel>
                {getDistinctEmojis(selectedReactions.reactions).map(
                  (emoji, index) => (
                    <TabPanel key={index}>
                      {renderReactions2(
                        filterReactionsByEmoji(
                          selectedReactions.reactions,
                          emoji
                        )
                      )}
                    </TabPanel>
                  )
                )}
              </TabPanels>
            </Tabs>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ReactionModal;
