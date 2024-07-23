import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "./appContext";
import { useSocket } from "../customHooks/useSocket";
import axios from "axios";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState();
  const [messagesFetched, setMessagesFetched] = useState(false);
  const [hasMore, setHasMore] = useState(true);
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

  const getInitialNotificationCnt = async () => {
    const { data } = await axios.get("/api/notify/new-message-chats");
    setNotification(data.unreadChats);
  };

  useEffect(() => {
    getInitialNotificationCnt();
    setUser(state.user);

    if (!state.user || Object.keys(state.user).length === 0) history("/");
    else {
      getSocket();
    }

    const handleDisconnect = () => {
      disconnectSocket(state.user?._id?.toString());
    };

    const handleReconnect = () => {
      console.log("Reconnecting...");
      getSocket();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleDisconnect();
      } else {
        handleReconnect();
      }
    };

    // Use multiple events for better coverage
    window.addEventListener("beforeunload", handleDisconnect);
    window.addEventListener("pagehide", handleDisconnect);
    window.addEventListener("pageshow", handleReconnect);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // For mobile browsers
    document.addEventListener("pause", handleDisconnect);
    document.addEventListener("resume", handleReconnect);

    // Blur and focus events with logging
    window.addEventListener("blur", handleDisconnect);
    window.addEventListener("focus", handleReconnect);

    return () => {
      window.removeEventListener("beforeunload", handleDisconnect);
      window.removeEventListener("pagehide", handleDisconnect);
      window.removeEventListener("pageshow", handleReconnect);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("pause", handleDisconnect);
      document.removeEventListener("resume", handleReconnect);
      window.removeEventListener("blur", handleDisconnect);
      window.removeEventListener("focus", handleReconnect);
      handleDisconnect();
    };
  }, [state.user, getSocket]);

  useEffect(() => {
    if (socket) {
      socket.on("unread notification", (data) => {
        // console.log(data);
        setNotification((prev) => {
          return prev.includes(data.chatId) ? prev : [...prev, data.chatId];
        });
      });
    }
  });

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
        messagesFetched,
        setMessagesFetched,
        hasMore,
        setHasMore,
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
