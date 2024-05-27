import { LockIcon } from "@chakra-ui/icons";
import {
  Container,
  Flex,
  ListItem,
  Tooltip,
  UnorderedList,
} from "@chakra-ui/react";
import React from "react";
import { NavLink } from "react-router-dom";
import { BackgroundCircles, Rings, SideLines } from "../../design/Header";

const HamburgerMenu = ({
  navItems,
  notLogined,
  navLinkRefs,
  setIsHamburgerOpen,
}) => {
  return (
    <Flex
      backgroundImage={
        "linear-gradient(-180deg, rgba(26, 21, 39, 0.9), rgba(14, 12, 22, 0.9) 88%, rgba(14, 12, 22, 0.9) 99%)"
      }
      height={"100%"}
      width={"100%"}
      position={"relative"}
    >
      <UnorderedList
        display={"flex"}
        p={0}
        m={0}
        w={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
        height={"100%"}
        listStyleType={"none"}
        gap={"3rem"}
        letterSpacing={"2px"}
        flexDirection="column"
        zIndex={1}
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
    </Flex>
  );
};

export default HamburgerMenu;
