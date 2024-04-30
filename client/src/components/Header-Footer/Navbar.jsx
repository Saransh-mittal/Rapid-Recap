import React, { useContext, useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { AppContext } from "../../contextAPI/appContext";
import axios from "axios";
import {
  useToast,
  Button,
  Flex,
  Badge,
  Heading,
  Box,
  Text,
  Image,
} from "@chakra-ui/react";
import useDrag from "../../customHooks/useDrag";
import ProfileDropDownMenu from "../profileComponents/ProfileDropDownMenu";
import { HamburgerIcon, CloseIcon, EmailIcon } from "@chakra-ui/icons";
import Categories from "./Categories";
import NotificationDrawer from "./Inbox/NotificationDrawer";
import DailyStreakModal from "../streakComponents/DailyStreakModal";
import { motion } from "framer-motion";

const Navbar = () => {
  const navItems = [
    { to: "/", label: "Home" },
    { to: "/contact", label: "Contact Us" },
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "", label: "category" },
    { to: "/profile", label: "Profile" },
  ];
  const [showCategory, setShowCategory] = useState(false);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // New state for drawer
  const [showDailyStreakModal, setShowDailyStreakModal] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();
  const { state, dispatch, navLinkRefs } = useContext(AppContext);
  const [visible, setVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const { startDrag, drag, endDrag } = useDrag();
  const [notifyCont, setNotifyCnt] = useState(0);

  // Dummy notification data

  // useEffect(() => {
  //   setNotificationData(dummyNotificationData);
  // }, []); // Fetch or set dummy data on component mount

  useEffect(() => {
    if (isHamburgerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isHamburgerOpen]);

  async function getAppUpdates() {
    try {
      const response = await axios.get(`/api/user/getUpdates`);
      dispatch({
        type: "APP_UPDATES",
        payloadAppUpdates: response.data.updates,
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  useEffect(() => {
    if (state.user) {
      getAppUpdates();
    }
  }, [state.user]);
  useEffect(() => {
    //update notification count whose update is not read
    let count = 0;
    state.updates.forEach((update) => {
      if (!update.read) {
        count++;
      }
    });
    setNotifyCnt(count);
  }, [state.updates]);

  const handleLogout = async () => {
    try {
      const response = await axios.post("/api/user/logout");
      if (response.status === 201) {
        toast({
          title: "Logout-Successfull",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
        dispatch({ type: "RESET_STATE" });
        navigate("/signin");
      } else {
        throw new Error("Logout Failed");
      }
    } catch (error) {
      toast({
        title: "Logout Failed",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      console.error(error.message);
    }
  };

  const handleScroll = () => {
    const currentScrollPos = window.scrollY;
    setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
    setPrevScrollPos(currentScrollPos);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos, visible]);

  const getBackgroundColor = ({ heatLevel }) => {
    if (heatLevel <= 0.2) {
      // Dark Red
      return "rgba(139, 0, 0, 1)"; // Dark Red in RGBA
    } else if (heatLevel <= 0.4) {
      // Red
      return "rgba(255, 0, 0, 1)"; // Red in RGBA
    } else if (heatLevel <= 0.6) {
      // Orange
      return "rgba(255, 165, 0, 1)"; // Orange in RGBA
    } else if (heatLevel <= 0.8) {
      // Yellow
      return "rgba(255, 255, 0, 1)"; // Yellow in RGBA
    } else {
      // Blue-White
      return "rgba(0, 0, 255, 1)"; // White in RGBA
    }
  };

  return (
    <Box
      className={`navbar navbar-expand-lg navbar-light bg-light ${
        isHamburgerOpen ? "full-screen" : ""
      }`}
      paddingX={{ base: "0.5rem", lg: "5rem" }}
      //padding={{ base: "0.5rem", lg: "1rem" }}
      onTouchStart={startDrag}
      onTouchMove={(e) => drag(e.touches[0])}
      onTouchEnd={endDrag}
      position={"fixed"}
      w={"100%"}
      zIndex={"1000"}
      transform={visible ? "translateY(0)" : "translateY(-100%)"}
      transition="transform 0.3s ease-in-out"
    >
      {showDailyStreakModal && (
        <DailyStreakModal
          setShowDailyStreakModal={setShowDailyStreakModal}
          getBackgroundColor={getBackgroundColor}
        />
      )}
      {/* Close button when hamburger menu is open */}
      {isHamburgerOpen ? (
        <Button
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-label="Toggle navigation"
          display={{ base: "flex", lg: "none" }}
          onClick={() => setIsHamburgerOpen(false)}
          marginBottom={isHamburgerOpen ? "2rem" : "0"}
          width={isHamburgerOpen ? "100px" : "auto"}
          marginLeft={"auto"}
        >
          <CloseIcon />
        </Button>
      ) : null}
      {/* Navbar content */}
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
      >
        {/* Navbar brand */}
        <NavLink
          to="/"
          className={`navbar-brand ${isHamburgerOpen ? " mb-5" : ""}`}
        >
          <Heading fontSize={"2rem"}>📻 {state.show && "Rapid Recap"}</Heading>
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
          {!isHamburgerOpen && !state.show ? (
            <>
              <Button
                display={{ base: "flex", lg: "none" }}
                background={"transparent"}
                padding={0}
                marginLeft={3}
                color={"white"}
                _hover={{ background: "transparent" }}
                onClick={() => setIsDrawerOpen(true)} // Open drawer onClick
              >
                <EmailIcon width={"6"} height={"6"} />
                {notifyCont > 0 && (
                  <Badge
                    borderRadius="50%"
                    h={"20px"}
                    w={"20px"}
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    backgroundColor="red"
                    color="white"
                    fontSize="md"
                    position="absolute"
                    top="-1px"
                    right="-1px"
                    padding="2px"
                  >
                    {notifyCont}
                  </Badge>
                )}
              </Button>
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
            </>
          ) : null}
          {!state.show && (
            <Flex
              justifyContent={"center"}
              alignItems={"center"}
              gap={1}
              display={{ base: "flex", lg: "none" }}
              marginRight={"1.3rem"}
              _hover={{
                cursor: "pointer",
              }}
              onClick={() => setShowDailyStreakModal(true)}
              _active={{
                transform: "scale(0.9)",
              }}
            >
              <Box
                as="svg"
                xmlns="http://www.w3.org/2000/svg"
                viewBox={state.streak === 0 ? "0 0 18 18" : "0 0 24 24"}
                width={{ base: "1.5rem", lg: "1.5em" }}
                height={{ base: "1.5rem", lg: "1.5em" }}
                fill="currentColor"
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
                margin={"1rem"}
              >
                {state.streak > 0 ? (
                  <>
                    <g filter="url(#hot-filled_svg__filter0_i_289_12318)">
                      <path
                        fillRule="evenodd"
                        d="M9.588 2.085a1 1 0 01.97.092c2.85 1.966 4.498 4.744 5.31 6.67l.854-.885a1 1 0 011.56.154c2.177 3.38 2.211 7.383.521 10.3C17.039 21.459 13.583 22 11.977 22c-1.569 0-4.905-.27-6.825-3.584-.832-1.435-1.27-3.053-1.125-4.704.146-1.66.876-3.284 2.264-4.721.86-.891 1.505-2.122 1.957-3.322.449-1.193.68-2.278.752-2.806a1 1 0 01.588-.778z"
                        clipRule="evenodd"
                        fill={getBackgroundColor({
                          heatLevel: state.streak / 7,
                        })}
                      ></path>
                    </g>
                    <defs>
                      <linearGradient
                        id="hot-filled_svg__paint0_linear_289_12318"
                        x1="12"
                        x2="12"
                        y1="2"
                        y2="22"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#FFA116"></stop>
                        <stop offset="1" stopColor="#F9772E"></stop>
                      </linearGradient>
                      <filter
                        id="hot-filled_svg__filter0_i_289_12318"
                        width="17.2"
                        height="21.2"
                        x="4"
                        y="2"
                        colorInterpolationFilters="sRGB"
                        filterUnits="userSpaceOnUse"
                      >
                        <feFlood
                          floodOpacity="0"
                          result="BackgroundImageFix"
                        ></feFlood>
                        <feBlend
                          in="SourceGraphic"
                          in2="BackgroundImageFix"
                          result="shape"
                        ></feBlend>
                        <feColorMatrix
                          in="SourceAlpha"
                          result="hardAlpha"
                          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        ></feColorMatrix>
                        <feOffset dx="1.2" dy="1.2"></feOffset>
                        <feGaussianBlur stdDeviation="0.6"></feGaussianBlur>
                        <feComposite
                          in2="hardAlpha"
                          k2="-1"
                          k3="1"
                          operator="arithmetic"
                        ></feComposite>
                        <feColorMatrix values="0 0 0 0 0.970833 0 0 0 0 0.05825 0 0 0 0 0 0 0 0 0.16 0"></feColorMatrix>
                        <feBlend
                          in2="shape"
                          result="effect1_innerShadow_289_12318"
                        ></feBlend>
                      </filter>
                    </defs>
                  </>
                ) : (
                  <>
                    <path
                      fill="white" // Set the fill color to red
                      fillRule="evenodd"
                      d="M7.19 1.564a.75.75 0 01.729.069c2.137 1.475 3.373 3.558 3.981 5.002l.641-.663a.75.75 0 011.17.115c1.633 2.536 1.659 5.537.391 7.725-1.322 2.282-3.915 2.688-5.119 2.688-1.177 0-3.679-.203-5.12-2.688-.623-1.076-.951-2.29-.842-3.528.109-1.245.656-2.463 1.697-3.54.646-.67 1.129-1.592 1.468-2.492.337-.895.51-1.709.564-2.105a.75.75 0 01.44-.583zm.784 2.023c-.1.368-.226.773-.385 1.193-.375.997-.947 2.13-1.792 3.005-.821.851-1.205 1.754-1.282 2.63-.078.884.153 1.792.647 2.645C6.176 14.81 7.925 15 8.983 15c1.03 0 2.909-.366 3.822-1.94.839-1.449.97-3.446.11-5.315l-.785.812a.75.75 0 01-1.268-.345c-.192-.794-1.04-2.948-2.888-4.625z"
                      clipRule="evenodd"
                    ></path>
                  </>
                )}
              </Box>

              <Text
                textAlign={"center"}
                fontSize={"1.5rem"}
                m={0}
                position={"absolute"}
                marginLeft={"40px"}
              >
                {" "}
                {state.streak}{" "}
              </Text>
            </Flex>
          )}

          {!state.show && !isHamburgerOpen ? (
            <Flex display={{ base: "flex", lg: "none" }}>
              <ProfileDropDownMenu
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
                  !state.show ? null : item.label === "category" &&
                    !state.show ? (
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
              {state.show && (
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
      {!state.show && (
        <Flex gap={3}>
          <Button
            display={{ base: "none", lg: "flex" }}
            background={"transparent"}
            padding={0}
            color={"white"}
            _hover={{ background: "transparent" }}
            onClick={() => setIsDrawerOpen(true)} // Open drawer onClick
          >
            <EmailIcon width={"6"} height={"6"} />
            {notifyCont > 0 && (
              <Badge
                borderRadius="50%"
                h={"20px"}
                w={"20px"}
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
                backgroundColor="red"
                color="white"
                fontSize="md"
                position="absolute"
                top="-1px"
                right="-1px"
                padding="2px"
              >
                {notifyCont}
              </Badge>
            )}
          </Button>
          {/* Profile dropdown menu */}
          <Flex
            justifyContent={"center"}
            alignItems={"center"}
            gap={1}
            display={{ base: "none", lg: "flex" }}
            borderRadius={"10px"}
            _hover={{
              cursor: "pointer",
              backgroundColor: "#0f0d15",
              backgroundImage:
                "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
            }}
            marginRight={"1.3rem"}
            onClick={() => setShowDailyStreakModal(true)}
            _active={{
              transform: "scale(0.9)",
            }}
          >
            <Box
              as="svg"
              xmlns="http://www.w3.org/2000/svg"
              viewBox={state.streak === 0 ? "0 0 18 18" : "0 0 24 24"}
              width={{ base: "1.2rem", lg: "1.6em" }}
              height={{ base: "1.2rem", lg: "1.6em" }}
              fill="currentColor"
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              zIndex={"1000"}
              borderRadius={"50%"}
              padding={"2px"}
              style={{
                boxShadow:
                  state.streak % 7 === 0 && state.streak > 0
                    ? "0 0 10px 0 rgba(0, 150, 255, 0.7), 0 4px 8px 0 rgba(0, 150, 255, 0.3), 0 8px 20px 0 rgba(0, 150, 255, 0.2)"
                    : "none",
              }}
            >
              {state.streak > 0 ? (
                <>
                  <g filter="url(#hot-filled_svg__filter0_i_289_12318)">
                    <path
                      fillRule="evenodd"
                      d="M9.588 2.085a1 1 0 01.97.092c2.85 1.966 4.498 4.744 5.31 6.67l.854-.885a1 1 0 011.56.154c2.177 3.38 2.211 7.383.521 10.3C17.039 21.459 13.583 22 11.977 22c-1.569 0-4.905-.27-6.825-3.584-.832-1.435-1.27-3.053-1.125-4.704.146-1.66.876-3.284 2.264-4.721.86-.891 1.505-2.122 1.957-3.322.449-1.193.68-2.278.752-2.806a1 1 0 01.588-.778z"
                      clipRule="evenodd"
                      fill={getBackgroundColor({ heatLevel: state.streak / 7 })}
                    ></path>
                  </g>
                  <defs>
                    <linearGradient
                      id="hot-filled_svg__paint0_linear_289_12318"
                      x1="12"
                      x2="12"
                      y1="2"
                      y2="22"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#FFA116"></stop>
                      <stop offset="1" stopColor="#F9772E"></stop>
                    </linearGradient>
                    <filter
                      id="hot-filled_svg__filter0_i_289_12318"
                      width="17.2"
                      height="21.2"
                      x="4"
                      y="2"
                      colorInterpolationFilters="sRGB"
                      filterUnits="userSpaceOnUse"
                    >
                      <feFlood
                        floodOpacity="0"
                        result="BackgroundImageFix"
                      ></feFlood>
                      <feBlend
                        in="SourceGraphic"
                        in2="BackgroundImageFix"
                        result="shape"
                      ></feBlend>
                      <feColorMatrix
                        in="SourceAlpha"
                        result="hardAlpha"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      ></feColorMatrix>
                      <feOffset dx="1.2" dy="1.2"></feOffset>
                      <feGaussianBlur stdDeviation="0.6"></feGaussianBlur>
                      <feComposite
                        in2="hardAlpha"
                        k2="-1"
                        k3="1"
                        operator="arithmetic"
                      ></feComposite>
                      <feColorMatrix values="0 0 0 0 0.970833 0 0 0 0 0.05825 0 0 0 0 0 0 0 0 0.16 0"></feColorMatrix>
                      <feBlend
                        in2="shape"
                        result="effect1_innerShadow_289_12318"
                      ></feBlend>
                    </filter>
                  </defs>
                </>
              ) : (
                <>
                  <path
                    fill="white" // Set the fill color to red
                    fillRule="evenodd"
                    d="M7.19 1.564a.75.75 0 01.729.069c2.137 1.475 3.373 3.558 3.981 5.002l.641-.663a.75.75 0 011.17.115c1.633 2.536 1.659 5.537.391 7.725-1.322 2.282-3.915 2.688-5.119 2.688-1.177 0-3.679-.203-5.12-2.688-.623-1.076-.951-2.29-.842-3.528.109-1.245.656-2.463 1.697-3.54.646-.67 1.129-1.592 1.468-2.492.337-.895.51-1.709.564-2.105a.75.75 0 01.44-.583zm.784 2.023c-.1.368-.226.773-.385 1.193-.375.997-.947 2.13-1.792 3.005-.821.851-1.205 1.754-1.282 2.63-.078.884.153 1.792.647 2.645C6.176 14.81 7.925 15 8.983 15c1.03 0 2.909-.366 3.822-1.94.839-1.449.97-3.446.11-5.315l-.785.812a.75.75 0 01-1.268-.345c-.192-.794-1.04-2.948-2.888-4.625z"
                    clipRule="evenodd"
                  ></path>
                </>
              )}
            </Box>

            <Text
              textAlign={"center"}
              fontSize={"1.5rem"}
              m={0}
              position={"absolute"}
              marginLeft={"40px"}
            >
              {" "}
              {state.streak}{" "}
            </Text>
          </Flex>
          {!state.show && !isHamburgerOpen ? (
            <Flex display={{ base: "none", lg: "flex" }}>
              <ProfileDropDownMenu
                handleLogout={handleLogout}
                toProfile={"/profile"}
                refProfile={(ref) => (navLinkRefs.current[4] = ref)}
              />
            </Flex>
          ) : null}
        </Flex>
      )}
      {isDrawerOpen && <NotificationDrawer setIsDrawerOpen={setIsDrawerOpen} />}
      {/* Modal for detailed notification */}
    </Box>
  );
};

export default Navbar;
