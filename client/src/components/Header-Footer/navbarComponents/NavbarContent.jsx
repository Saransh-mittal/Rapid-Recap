import { Button, Flex, Heading } from "@chakra-ui/react";
import React from "react";
import { NavLink } from "react-router-dom";
import Inbox from "./Inbox";
import { HamburgerIcon } from "@chakra-ui/icons";
import StreakFire from "./StreakFire";
import ProfileDropDownMenu from "../../profileComponents/ProfileDropDownMenu";
import Categories from "../Categories";

const NavbarContent = ({
  isHamburgerOpen,
  notLogined,
  setIsDrawerOpen,
  notifyCont,
  setIsHamburgerOpen,
  setShowDailyStreakModal,
  tourComplete,
  streak,
  isBoosted,
  getBackgroundColor,
  handleLogout,
  navLinkRefs,
  navItems,
  setShowCategory,
  showCategory,
}) => {
  return (
    <>
      <Flex
        justifyContent={{
          base: !isHamburgerOpen ? "space-between" : "flex-start",
          lg: "flex-start",
        }}
        alignItems={"center"}
        width={"100%"}
        height={"100%"}
        flexDirection={isHamburgerOpen ? "column" : "row"}
        padding={isHamburgerOpen ? "2rem" : "0"}
        gap={6}
        className="navbar-content-lg"
      >
        {/* Navbar brand */}
        <NavLink
          to="/"
          className={`navbar-brand ${isHamburgerOpen ? " mb-5" : ""}`}
        >
          <Heading fontSize={"2rem"}>📻 {notLogined && "Rapid Recap"}</Heading>
        </NavLink>
        {/* Right side of navbar */}
        <Flex
          flexDirection={{
            base: isHamburgerOpen ? "column" : "row-reverse",
            lg: "row-reverse",
          }}
          // ml={-10}
          height={"100%"}
          alignItems={"center"}
        >
          {/* Hamburger menu button */}
          {!isHamburgerOpen && !notLogined ? (
            <>
              <Inbox
                className={"inbox-button-base"}
                display={{ base: "flex", lg: "none" }}
                onClick={() => setIsDrawerOpen(true)}
                notifyCont={notifyCont}
                marginLeftButton={3}
              />
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
                  // boxSize={2}
                  height={"35px"}
                  width={"10px"}
                >
                  <HamburgerIcon height={"35px"} width={"20px"} />
                </Button>
              </Flex>
            </>
          ) : null}
          {!notLogined && (
            <StreakFire
              marginAroundBox={"1rem"}
              widthOfBox={{ base: "1.5rem", lg: "1.5em" }}
              heightOfBox={{ base: "1.5rem", lg: "1.5em" }}
              _hover={{
                cursor: "pointer",
              }}
              display={{ base: "flex", lg: "none" }}
              className={"streak-tracker-base"}
              onClick={() => {
                setShowDailyStreakModal(true);
                tourComplete();
              }}
              streak={streak}
              isBoosted={isBoosted}
              getBackgroundColor={getBackgroundColor}
            />
          )}

          {!notLogined && !isHamburgerOpen ? (
            <Flex display={{ base: "flex", lg: "none" }}>
              <ProfileDropDownMenu
                className="profile-dropdown-base"
                handleLogout={handleLogout}
                toProfile={"/profile"}
                refProfile={(ref) => (navLinkRefs.current[4] = ref)}
              />
            </Flex>
          ) : null}

          {/* Dropdown menu for small screens */}
          <Flex
            display={{ base: isHamburgerOpen ? "flex" : "none", lg: "flex" }}
            flexDirection={{ base: "column", lg: "row" }}
            id="navbarNav"
            alignItems={"center"}
            h={"100%"}
          >
            <ul
              className={`navbar-nav h-100 w-100 ${
                isHamburgerOpen ? "d-flex gap-5" : ""
              }`}
            >
              {/* Navigation items */}
              {navItems.map((item, index) => (
                <li
                  className="nav-item"
                  key={index}
                  onClick={() => setIsHamburgerOpen(false)}
                >
                  {item.label === "Profile" &&
                  !notLogined ? null : item.label === "category" &&
                    !notLogined ? (
                    // Category button
                    <>
                      <Button
                        colorScheme="teal"
                        onClick={() => setShowCategory(!showCategory)}
                      >
                        Category <HamburgerIcon marginLeft={"5px"} />{" "}
                      </Button>
                      {/* Categories dropdown */}
                      {showCategory && (
                        <Categories
                          setShowCategory={setShowCategory}
                          isHamburgerOpen={isHamburgerOpen}
                          setIsHamburgerOpen={setIsHamburgerOpen}
                        />
                      )}
                    </>
                  ) : (
                    // Regular nav links
                    item.label !== "Profile" &&
                    item.label !== "category" && (
                      <NavLink
                        to={item.to}
                        className="nav-link"
                        ref={(ref) => (navLinkRefs.current[index] = ref)}
                      >
                        {item.label}
                      </NavLink>
                    )
                  )}
                </li>
              ))}
              {/* Sign in link or email icon */}
              {notLogined && (
                <li className="nav-item">
                  <NavLink to="/signin" className="nav-link">
                    Sign In
                  </NavLink>
                </li>
              )}
            </ul>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};

export default NavbarContent;
