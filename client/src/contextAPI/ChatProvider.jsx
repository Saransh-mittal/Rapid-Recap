import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "./appContext";
import { useSocket } from "../customHooks/useSocket";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState();
  const { getSocket, disconnectSocket, socket, socketConnected } =
    useSocket(user);

  const history = useNavigate();

  const { state } = useContext(AppContext);

  const sortChats = (chatsToSort) => {
    return chatsToSort.sort((a, b) => {
      const aTime = a.latestMessage
        ? new Date(a.latestMessage.createdAt).getTime()
        : 0;
      const bTime = b.latestMessage
        ? new Date(b.latestMessage.createdAt).getTime()
        : 0;
      return bTime - aTime;
    });
  };

  const updateLatestMessage = (chatId, newLatestMessage) => {
    setChats((prevChats) => {
      const updatedChats = prevChats.map((chat) =>
        chat._id === chatId
          ? { ...chat, latestMessage: newLatestMessage }
          : chat
      );
      return sortChats(updatedChats);
    });

    if (selectedChat && selectedChat._id === chatId) {
      setSelectedChat((prevSelectedChat) => ({
        ...prevSelectedChat,
        latestMessage: newLatestMessage,
      }));
    }
  };

  useEffect(() => {
    // const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(state.user);
    // check state.user for empty object

    if (!state.user || Object.keys(state.user).length === 0) history("/");
    else {
      getSocket();
    }

    return () => {
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.user, getSocket]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
        updateLatestMessage,
        socket,
        socketConnected,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
