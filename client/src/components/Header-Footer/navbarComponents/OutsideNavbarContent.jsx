import { Badge, Box, Button, Flex } from "@chakra-ui/react";
import React, { useContext } from "react";
import Inbox from "./Inbox";
import StreakFire from "./StreakFire";
import ProfileDropDownMenu from "../../profileComponents/ProfileDropDownMenu";
import { HamburgerIcon } from "@chakra-ui/icons";
import GetStarted from "./GetStarted";
import XPLevel from "./XPLevel";
import IQScore from "./IQScore";
import { AppContext } from "../../../contextAPI/appContext";
// import { FaFacebookMessenger } from "react-icons/fa";
// import Messenger from "../../../screens/Messenger";
import { FaFacebookMessenger } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../../../contextAPI/ChatProvider";

const OutsideNavbarContent = ({
  setIsDrawerOpen,
  notifyCont,
  setShowDailyStreakModal,
  setShowXPLevelModal,
  tourComplete,
  streak,
  isBoosted,
  getBackgroundColor,
  notLogined,
  isHamburgerOpen,
  handleLogout,
  navLinkRefs,
  setIsHamburgerOpen,
  level,
  user, // pass the user state
  profileNotif,
}) => {
  const isEmptyObject = (obj) => {
    return obj && Object.keys(obj).length === 0;
  };
  const { state } = useContext(AppContext);
  const { notification } = ChatState();
  const navigate = useNavigate();

  return (
    <>
      <Flex
        gap={{ base: 1, lg: 3 }}
        alignItems={"center"}
        display={isHamburgerOpen ? "none" : "flex"}
      >
        {/* Profile dropdown menu */}
        {notLogined && (
          <GetStarted
            display={{ base: "none", lg: "flex" }}
            innerText={"Get Started"}
          />
        )}
        {!notLogined && (
          <>
            {!isEmptyObject(user) && (
              <Box>
                {" "}
                <IQScore score={state.user.IQ_score} />
              </Box>
            )}
            {!isEmptyObject(user) && (
              <Box>
                <XPLevel
                  level={level}
                  _hover={{
                    cursor: "pointer",
                  }}
                  className={"xp-level"}
                  onClick={() => {
                    setShowXPLevelModal(true);
                  }}
                />
              </Box>
            )}
            <StreakFire
              marginAroundBox={"auto"}
              widthOfBox={"1.6em"}
              heightOfBox={"1.6em"}
              _hover={{
                cursor: "pointer",
                backgroundColor: "#0f0d15",
                backgroundImage:
                  "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
              }}
              className={"streak-tracker-lg"}
              onClick={() => {
                setShowDailyStreakModal(true);
                tourComplete();
              }}
              streak={streak}
              isBoosted={isBoosted}
              getBackgroundColor={getBackgroundColor}
            />
            {!isEmptyObject(user) && (
              <Box
                _hover={{
                  cursor: "pointer",
                }}
                display={{ base: "none", lg: "flex" }}
                onClick={() => navigate("/chats")}
                position={"relative"}
              >
                {Array.isArray(notification) && notification.length > 0 && (
                  <Badge
                    bg={"red"}
                    position={"absolute"}
                    color={"white"}
                    borderRadius={"50%"}
                    h={"18px"}
                    w={"18px"}
                    textAlign={"center"}
                    right={"-0.5rem"}
                    top={"-0.7rem"}
                  >
                    {notification.length}
                  </Badge>
                )}
                <FaFacebookMessenger size={23} />
              </Box>
            )}
            <Inbox
              className={"inbox-button-lg"}
              onClick={() => setIsDrawerOpen(true)}
              notifyCont={notifyCont}
              display={{ base: "none", md: "flex" }}
            />
          </>
        )}
        {!notLogined && !isHamburgerOpen ? (
          <Flex display={{ base: "none", lg: "flex" }}>
            <ProfileDropDownMenu
              className="profile-dropdown-lg"
              handleLogout={handleLogout}
              toProfile={"/profile"}
              refProfile={(ref) => (navLinkRefs.current[4] = ref)}
              profileNotif={profileNotif}
            />
          </Flex>
        ) : null}
        {!isHamburgerOpen ? (
          <>
            <Flex className="menu-button">
              <Button
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
                aria-controls="navbarNav"
                aria-label="Toggle navigation"
                display={{ base: "flex", lg: "none" }}
                onClick={() => setIsHamburgerOpen(true)}
                marginBottom={isHamburgerOpen ? "2rem" : "0"}
                height={"35px"}
                width={"10px"}
                position={"relative"}
              >
                {(state.unreadFriendRequests > 0 ||
                  (Array.isArray(notification) && notification.length > 0)) && (
                  <Box
                    h="14px"
                    w="14px"
                    bg={"red"}
                    borderRadius={"50%"}
                    position={"absolute"}
                    right={"-0.25rem"}
                    top={"-0.25rem"}
                    zIndex={2}
                  />
                )}
                <HamburgerIcon height={"35px"} width={"20px"} />
              </Button>
            </Flex>
          </>
        ) : null}
      </Flex>
    </>
  );
};

export default OutsideNavbarContent;
