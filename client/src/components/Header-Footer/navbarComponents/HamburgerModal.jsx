import { LockIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Flex,
  ListItem,
  Text,
  Tooltip,
  UnorderedList,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Box,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { BackgroundCircles, Rings, SideLines } from "../../design/Header";
import { AppContext } from "../../../contextAPI/appContext";
import LogoutButton from "./LogoutButton";
import GetStarted from "./GetStarted";
import NavBrand from "./NavBrand";
import Inbox from "./Inbox";
import { FaFacebookMessenger } from "react-icons/fa";

const HamburgerModal = ({
  isOpen,
  onClose,
  navItems,
  notLogined,
  navLinkRefs,
  handleLogout,
  notifyCont,
  setIsDrawerOpen,
}) => {
  const { state } = useContext(AppContext);
  const navigate = useNavigate();
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent
        backgroundImage={
          "linear-gradient(-180deg, rgba(26, 21, 39, 0.9), rgba(14, 12, 22, 0.9) 88%, rgba(14, 12, 22, 0.9) 99%)"
        }
      >
        <ModalHeader
          backgroundImage={
            "linear-gradient(-180deg, rgba(26, 21, 39, 0.9), rgba(14, 12, 22, 0.9) 88%, rgba(14, 12, 22, 0.9) 99%)"
          }
          boxShadow={"0 2px 4px rgba(0, 0, 0, 0.1)"}
          w={"100%"}
          alignItems={"center"}
          p={"20px"}
          display={"flex"}
        >
          <NavBrand isHamburgerOpen={true} />
          <ModalCloseButton
            marginTop={"15px"}
            marginRight={"10px"}
            bg={"white"}
            color={"black"}
            height={"35px"}
            width={"40px"}
          />
        </ModalHeader>
        <ModalBody p={0} w={"100%"}>
          <Flex
            height={"100vh"}
            backgroundImage={
              "linear-gradient(-180deg, rgba(26, 21, 39, 0.9), rgba(14, 12, 22, 0.9) 88%, rgba(14, 12, 22, 0.9) 99%)"
            }
            width={"100%"}
            position={"relative"}
            justifyContent={"center"}
            alignItems={"center"}
            flexDirection={"column"}
            className="hamburger-menu"
            overflow={"hidden"}
          >
            {!notLogined && (
              <Flex
                position={"absolute"}
                top={"3rem"}
                zIndex={1}
                flexDirection={"column"}
                gap={4}
                justifyContent={"center"}
                alignItems={"center"}
                onClick={() => {
                  onClose();
                  navigate(`/profile/${state.user.inGameName}`);
                }}
                cursor={"pointer"}
              >
                <Flex w={"100%"} h={"100%"} position={"relative"}>
                  {state.unreadFriendRequests > 0 && (
                    <Box
                      h="14px"
                      w="14px"
                      bg={"red"}
                      borderRadius={"50%"}
                      position={"absolute"}
                      right={"30%"}
                      top={"1rem"}
                      zIndex={2}
                    />
                  )}
                </Flex>
                <Avatar
                  src={state.user.pic}
                  h={"6rem"}
                  w={"6rem"}
                  rounded={"50%"}
                />
                <Text letterSpacing={"2px"} fontWeight={"bold"}>
                  <span
                    style={{
                      background: "#5ac8fa",
                      color: "#0f0d15",
                      borderRadius: "10px",
                      padding: "5px",
                    }}
                  >
                    {state.user.name}
                  </span>
                </Text>
              </Flex>
            )}

            <UnorderedList
              display={"flex"}
              p={0}
              m={0}
              w={"100%"}
              justifyContent={"center"}
              alignItems={"center"}
              listStyleType={"none"}
              gap={"2rem"}
              letterSpacing={"2px"}
              flexDirection="column"
              zIndex={1}
              position={"absolute"}
              top={notLogined ? "30%" : "32%"}
            >
              <ListItem
                className={`nav-item `}
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
                gap={"0.25rem"}
              >
                <Box
                  _hover={{
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    onClose();
                    navigate("/chats");
                  }}
                  display={notLogined ? "none" : "block"}
                  color={"white"}
                >
                  <FaFacebookMessenger size={25} />
                </Box>
              </ListItem>
              <ListItem
                className={`nav-item `}
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
                gap={"0.25rem"}
              >
                <Inbox
                  className={"inbox-button-lg"}
                  onClick={() => {
                    setIsDrawerOpen(true);
                    onClose();
                  }}
                  notifyCont={notifyCont}
                  display={notLogined ? "none" : "flex"}
                />
              </ListItem>
              {navItems.map((item, index) => (
                <ListItem
                  className={`nav-item `}
                  key={index}
                  onClick={() => onClose()}
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  gap={"0.25rem"}
                >
                  <Tooltip
                    label="You need to sign in to access this page"
                    isDisabled={!(notLogined && item.label === "Leaderboard")}
                    placement="bottom"
                    hasArrow
                  >
                    <NavLink
                      to={item.to}
                      className={`nav-link ${
                        notLogined && item.label === "Leaderboard"
                          ? "locked"
                          : ""
                      }`}
                      onClick={(e) =>
                        notLogined && item.label === "Leaderboard"
                          ? e.preventDefault()
                          : null
                      }
                      ref={(ref) => (navLinkRefs.current[index] = ref)}
                    >
                      {item.label}
                    </NavLink>
                  </Tooltip>
                  {notLogined && item.label === "Leaderboard" && <LockIcon />}
                </ListItem>
              ))}
            </UnorderedList>
            <Rings />
            <SideLines />
            <BackgroundCircles />
            <Flex position={"absolute"} bottom={notLogined ? "30%" : "22%"}>
              {notLogined ? (
                <GetStarted
                  innerText={"Get Started"}
                  hamburgerOnClose={onClose}
                />
              ) : (
                <LogoutButton handleLogout={handleLogout} />
              )}
            </Flex>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default HamburgerModal;
