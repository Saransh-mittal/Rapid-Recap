import { LockIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Flex,
  ListItem,
  Text,
  Tooltip,
  UnorderedList,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { BackgroundCircles, Rings, SideLines } from "../../design/Header";
import { AppContext } from "../../../contextAPI/appContext";
import LogoutButton from "./LogoutButton";
import GetStarted from "./GetStarted";

const HamburgerMenu = ({
  navItems,
  notLogined,
  navLinkRefs,
  setIsHamburgerOpen,
  handleLogout,
}) => {
  const { state } = useContext(AppContext);
  const navigate = useNavigate();
  return (
    <Flex
      backgroundImage={
        "linear-gradient(-180deg, rgba(26, 21, 39, 0.9), rgba(14, 12, 22, 0.9) 88%, rgba(14, 12, 22, 0.9) 99%)"
      }
      height={"100%"}
      width={"100%"}
      position={"relative"}
      justifyContent={"center"}
      alignItems={"center"}
      flexDirection={"column"}
      marginTop={"2rem"}
    >
      {!notLogined && (
        <Flex
          position={"absolute"}
          top={"6rem"}
          zIndex={1}
          flexDirection={"column"}
          gap={4}
          justifyContent={"center"}
          alignItems={"center"}
          onClick={() => {
            setIsHamburgerOpen(false);
            navigate(`/profile/${state.user.inGameName}`);
          }}
          cursor={"pointer"}
        >
          <Avatar src={state.user.pic} h={"6rem"} w={"6rem"} rounded={"50%"} />
          <Text letterSpacing={"2px"} fontWeight={"bold"}>
            {" "}
            <span
              style={{
                background: "#5ac8fa",
                color: "#0f0d15",
                borderRadius: "10px",
                padding: "5px",
              }}
            >
              {state.user.name}{" "}
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
        gap={"3rem"}
        letterSpacing={"2px"}
        flexDirection="column"
        zIndex={1}
        position={"absolute"}
        top={notLogined ? "30%" : ""}
      >
        {/* Navigation items */}
        {navItems.map((item, index) => (
          <ListItem
            className={`nav-item `}
            key={index}
            onClick={() => setIsHamburgerOpen(false)}
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
                  notLogined && item.label === "Leaderboard" ? "locked" : ""
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
        {/* Sign in link or email icon */}
      </UnorderedList>
      <Rings />

      <SideLines />

      <BackgroundCircles />
      <Flex position={"absolute"} bottom={notLogined ? "35%" : "28%"}>
        {notLogined ? (
          <GetStarted />
        ) : (
          <LogoutButton handleLogout={handleLogout} />
        )}
      </Flex>
    </Flex>
  );
};

export default HamburgerMenu;
