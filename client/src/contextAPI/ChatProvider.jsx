import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "./appContext";

const ChatContext = createContext();

//-----dummy user------
const currentUser = {
  _id: "user1",
  name: "Current User",
  email: "currentuser@example.com",
};
//---------------------

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState();

  const history = useNavigate();

  const { state } = useContext(AppContext);

  useEffect(() => {
    // const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    // setUser(state.user);
    setUser(currentUser);
    if (!state.user) history.push("/home/all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

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
