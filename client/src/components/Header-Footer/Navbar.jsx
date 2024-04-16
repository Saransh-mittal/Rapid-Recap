import React, { useContext, useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { AppContext } from "../../contextAPI/appContext";
import axios from "axios";
import {
  useToast,
  Button,
  Flex,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  background,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import useDrag from "../../customHooks/useDrag";
import ProfileDropDownMenu from "../profileComponents/ProfileDropDownMenu";
import { HamburgerIcon, CloseIcon, EmailIcon } from "@chakra-ui/icons";
import Categories from "./Categories";

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
  const [notificationData, setNotificationData] = useState(null); // State for notification data
  const [selectedNotification, setSelectedNotification] = useState(null); // State for selected notification
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal
  const navigate = useNavigate();
  const toast = useToast();
  const { state, dispatch, navLinkRefs } = useContext(AppContext);
  const [visible, setVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const { startDrag, drag, endDrag } = useDrag();

  // Dummy notification data
  const dummyNotificationData = {
    updates: [
      {
        title: "New Feature: Dark Mode",
        mainText:
          "Experience our app in a whole new light with Dark Mode! Enable it from the settings menu for reduced eye strain and improved battery life.",
        img: "dark_mode_image_url",
        date: "2024-04-16T08:00:00Z",
        user_id: "user123",
        read: false,
        _id: "update123",
      },
      {
        title: "Bug Fix: Login Issue Resolved",
        mainText:
          "We've fixed a pesky bug that was causing some users to experience difficulties logging in. You should now be able to access your account without any problems.",
        img: "bug_fix_image_url",
        date: "2024-04-15T14:30:00Z",
        user_id: "user456",
        read: false,
        _id: "update456",
      },
      {
        title: "Performance Enhancement: Faster Loading Times",
        mainText:
          "We've optimized our app to deliver faster loading times across the board. Enjoy a smoother experience with quicker access to your favorite features.",
        img: "performance_image_url",
        date: "2024-04-14T10:45:00Z",
        user_id: "user789",
        read: false,
        _id: "update789",
      },
    ],
  };

  useEffect(() => {
    setNotificationData(dummyNotificationData);
  }, []); // Fetch or set dummy data on component mount

  useEffect(() => {
    if (isHamburgerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isHamburgerOpen]);

  const handleLogout = async () => {
    try {
      const response = await axios.post("/api/user/logout");
      if (response.status === 201) {
        toast({
          title: "Logout Successfull",
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

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  return (
    <Flex
      className={`navbar navbar-expand-lg navbar-light bg-light px-5 ${
        isHamburgerOpen ? "full-screen" : ""
      }`}
      onTouchStart={startDrag}
      onTouchMove={(e) => drag(e.touches[0])}
      onTouchEnd={endDrag}
      position={"fixed"}
      w={"100%"}
      zIndex={"1000"}
      transform={visible ? "translateY(0)" : "translateY(-100%)"}
      transition="transform 0.3s ease-in-out"
    >
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
        justifyContent={!isHamburgerOpen ? "space-between" : "flex-start"}
        width={"100%"}
        height={"100%"}
        flexDirection={isHamburgerOpen ? "column" : "row"}
        padding={isHamburgerOpen ? "1rem" : "0"}
      >
        {/* Navbar brand */}
        <NavLink
          to="/"
          className={`navbar-brand${isHamburgerOpen ? " mb-5" : ""}`}
        >
          📻 Rapid Recap
        </NavLink>
        {/* Right side of navbar */}
        <Flex
          flexDirection={{
            base: isHamburgerOpen ? "column" : "row-reverse",
            lg: "row-reverse",
          }}
          height={"100%"}
          alignItems={"center"}
        >
          {/* Hamburger menu button */}
          {!isHamburgerOpen ? (
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
              >
                <HamburgerIcon />
              </Button>
            </>
          ) : null}
          {/* Profile dropdown menu */}
          {!state.show && !isHamburgerOpen ? (
            <>
              <ProfileDropDownMenu
                handleLogout={handleLogout}
                toProfile={"/profile"}
                refProfile={(ref) => (navLinkRefs.current[4] = ref)}
              />
            </>
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
              {state.show ? (
                <li className="nav-item">
                  <NavLink to="/signin" className="nav-link">
                    Sign In
                  </NavLink>
                </li>
              ) : (
                <Button
                  display={{ base: "none", lg: "flex" }}
                  background={"transparent"}
                  padding={0}
                  marginLeft={3}
                  color={"white"}
                  _hover={{ background: "transparent" }}
                  onClick={() => setIsDrawerOpen(true)} // Open drawer onClick
                >
                  <EmailIcon width={"6"} height={"6"} />
                </Button>
              )}
            </ul>
          </Flex>
        </Flex>
      </Flex>
      {/* Drawer for notifications */}
      <Drawer
        size={{ base: "full", lg: "xs" }}
        isOpen={isDrawerOpen}
        placement="right"
        onClose={() => setIsDrawerOpen(false)} // Close drawer onClose
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Notifications</DrawerHeader>
          <DrawerBody>
            {/* Render notifications */}
            {notificationData &&
              notificationData.updates.map((update, index) => (
                <div
                  key={index}
                  style={{ marginBottom: "1rem", cursor: "pointer" }}
                  onClick={() => handleNotificationClick(update)}
                >
                  <h3>{update.title}</h3>
                  <p>{update.mainText}</p>
                  <small>{new Date(update.date).toLocaleString()}</small>{" "}
                  {/* Date */}
                  {/* Add more elements as needed */}
                </div>
              ))}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Modal for detailed notification */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedNotification && selectedNotification.title}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedNotification && (
              <>
                <p>{selectedNotification.mainText}</p>
                <small>
                  {new Date(selectedNotification.date).toLocaleString()}
                </small>{" "}
                {/* Date */}
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default Navbar;
