import { Flex, ListItem, UnorderedList } from "@chakra-ui/react";
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LockIcon } from "@chakra-ui/icons";
import { Tooltip } from "@chakra-ui/react";
import { BackgroundCircles, Rings, SideLines } from "../../design/Header";

const NavbarContent = ({
  isHamburgerOpen,
  setIsHamburgerOpen,
  navLinkRefs,
  navItems,
  notLogined,
}) => {
  const location = useLocation();

  return (
    <>
      <Flex
        justifyContent={{
          base: !isHamburgerOpen ? "space-between" : "flex-start",
          lg: "center",
        }}
        alignItems={"center"}
        width={"100%"}
        flexDirection={isHamburgerOpen ? "column" : "row"}
        padding={isHamburgerOpen ? "2rem" : "0"}
        gap={"2rem"}
        className="navbar-content-lg"
        textTransform={"uppercase"}
      >
        {/* Dropdown menu for small screens */}
        <Flex
          display={{ base: "none", lg: "flex" }}
          flexDirection={{ base: "column", lg: "row" }}
          id="navbarNav"
          alignItems={"center"}
          h={"100%"}
          w={"100%"}
          justifyContent={"center"}
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
            flexDirection={{ base: "column", lg: "row" }}
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
        </Flex>
      </Flex>
    </>
  );
};

export default NavbarContent;
