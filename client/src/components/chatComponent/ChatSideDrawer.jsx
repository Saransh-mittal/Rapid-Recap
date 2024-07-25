import { Button as ChakraButton } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  DrawerCloseButton,
} from "@chakra-ui/modal";
import { Flex, useBreakpointValue } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon, ChevronDownIcon, Search2Icon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
//import ChatLoading from "../ChatLoading";
import { Spinner } from "@chakra-ui/spinner";
//import ProfileModal from "./ProfileModal";
import { ChatState } from "../../contextAPI/ChatProvider";
import Button from "../miscellaneous/ButtonComponent";
import ButtonGradient from "../../assets/svg/ButtonGradient";
import { debounce } from "lodash";
//import { getSender } from "../../config/ChatLogics";
import UserListItem from "./userAvatar/UserListItem";

// Mock Data
const mockUsers = [
  { _id: 1, name: "User1", email: "user1@example.com" },
  { _id: 2, name: "User2", email: "user2@example.com" },
  // Add more mock users here
];

const debouncedSearch = debounce(async (query, callback) => {
  try {
    if (!query || query === "") return;
    const response = await axios.get(`/api/user/search?query=${query}`);
    callback(response.data);
  } catch (error) {
    console.error("Error searching users:", error);
  }
}, 800);
const ChatSideDrawer = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const toast = useToast();

  const history = useNavigate();
  const handleSearch = async (event) => {
    setLoading(true);
    const { value } = event.target;
    setSearch(value);
    if (value === "") {
      setLoading(false);
      setSearchResult([]);
      debouncedSearch.cancel();
      return;
    }
    debouncedSearch(value, (responseData) => {
      if (!value || value === "") return;
      setSearchResult([...responseData]);
      if (responseData.length === 0)
        toast({
          title: "No user found",
          status: "info",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      setLoading(false);
    });
  };

  const accessChat = async (userId) => {
    console.log(userId);

    try {
      setLoadingChat(true);
      const { data } = await axios.post(`/api/chat`, { userId });

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent
          style={{
            backgroundColor: "#0f0d15",
            backgroundImage:
              "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
            boxShadow:
              "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)", // Increased intensity of the shadow
          }}
          color={"white"}
        >
          <DrawerCloseButton />
          <DrawerHeader>Search Users</DrawerHeader>
          <DrawerBody
            css={{
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            <Box display="flex" pb={2} gap={2}>
              <Input
                placeholder="Search by name or email..."
                mr={2}
                value={search}
                onChange={handleSearch}
              />
            </Box>
            {loading ? (
              <Spinner />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" d="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default ChatSideDrawer;
