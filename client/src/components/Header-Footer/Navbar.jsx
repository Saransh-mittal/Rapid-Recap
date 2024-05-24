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
} from "@chakra-ui/react";
import useDrag from "../../customHooks/useDrag";
import ProfileDropDownMenu from "../profileComponents/ProfileDropDownMenu";
import { HamburgerIcon, CloseIcon, EmailIcon } from "@chakra-ui/icons";
import Categories from "./Categories";
import NotificationDrawer from "./Inbox/NotificationDrawer";
import DailyStreakModal from "../streakComponents/DailyStreakModal";
import NotificationModal from "./Inbox/NotificationModal";
import { useDailyStreakTour } from "../../customHooks/useTours";
import StreakFire from "./navbarComponents/StreakFire";
import Inbox from "./navbarComponents/Inbox";
import NavbarContent from "./navbarComponents/NavbarContent";
import OutsideNavbarContent from "./navbarComponents/OutsideNavbarContent";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { state, dispatch, navLinkRefs } = useContext(AppContext);
  const [visible, setVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const { startDrag, drag, endDrag } = useDrag();
  const [notifyCont, setNotifyCnt] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDailyStreakModal, setShowDailyStreakModal] = useState(false);
  const { tour, isTutorialTakenCheck } = useDailyStreakTour();
  // Dummy notification data

  // useEffect(() => {
  //   setNotificationData(dummyNotificationData);
  // }, []); // Fetch or set dummy data on component mount

  useEffect(() => {
    const isEmptyObject = (obj) => {
      return obj && Object.keys(obj).length === 0;
    };

    if (
      !state.show &&
      state.user &&
      state.user.tutorial.dailyStreakPage &&
      !state.user.tutorial.homePage &&
      (isEmptyObject(state.news) || !state.news)
    )
      isTutorialTakenCheck({ page: "dailyStreakPage", tour });
  }, [state.user, state.show, state?.user?.tutorial?.homePage, state?.news]);

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
      <NavbarContent
        isHamburgerOpen={isHamburgerOpen}
        notLogined={state.show}
        setIsDrawerOpen={setIsDrawerOpen}
        notifyCont={notifyCont}
        setIsHamburgerOpen={setIsHamburgerOpen}
        setShowDailyStreakModal={setShowDailyStreakModal}
        tourComplete={tour.complete}
        streak={state.streak}
        isBoosted={state.isBoosted}
        getBackgroundColor={getBackgroundColor}
        handleLogout={handleLogout}
        navLinkRefs={navLinkRefs}
        navItems={navItems}
        setShowCategory={setShowCategory}
        showCategory={showCategory}
      />
      {!state.show && (
        <OutsideNavbarContent
          setIsDrawerOpen={setIsDrawerOpen}
          notifyCont={notifyCont}
          setShowDailyStreakModal={setShowDailyStreakModal}
          tourComplete={tour.complete}
          streak={state.streak}
          isBoosted={state.isBoosted}
          getBackgroundColor={getBackgroundColor}
          notLogined={state.show}
          isHamburgerOpen={isHamburgerOpen}
          handleLogout={handleLogout}
          navLinkRefs={navLinkRefs}
        />
      )}
      {isModalOpen && (
        <NotificationModal
          selectedNotification={selectedNotification}
          setIsModalOpen={setIsModalOpen}
          setIsDrawerOpen={setIsDrawerOpen}
        />
      )}
      {isDrawerOpen && (
        <NotificationDrawer
          setIsDrawerOpen={setIsDrawerOpen}
          setIsModalOpen={setIsModalOpen}
          setSelectedNotification={setSelectedNotification}
        />
      )}
    </Box>
  );
};

export default Navbar;
