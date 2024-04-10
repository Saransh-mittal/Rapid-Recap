import React, { useContext, useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { AppContext } from "../../contextAPI/appContext";
import axios from "axios";
import { useToast, Button, Flex } from "@chakra-ui/react";
import useDrag from "../../customHooks/useDrag";
import ProfileDropDownMenu from "../profileComponents/ProfileDropDownMenu";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import Categories from "./Categories";

const Navbar = () => {
  const navItems = [
    { to: "/", label: "Home" },
    // { to: '/About', label: 'About Us' }, // Commented out
    { to: "/contact", label: "Contact Us" },
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "", label: "category" },
    { to: "/profile", label: "Profile" },
  ];
  const [showCategory, setShowCategory] = useState(false);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false); // State variable to track hamburger menu state
  const navigate = useNavigate();
  const toast = useToast();
  const { state, dispatch, navLinkRefs } = useContext(AppContext);
  const { startDrag, drag, endDrag } = useDrag();
  useEffect(() => {}, [state.show]);
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
          //description: ,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
        dispatch({ type: "SHOW" });
        dispatch({
          type: "setUser",
          payloadUser: null,
        });
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

  return (
    <Flex
      className={`navbar navbar-expand-lg navbar-light bg-light px-5 ${
        isHamburgerOpen ? "full-screen" : ""
      }`} // Conditionally apply "full-screen" class when hamburger menu is open
      onTouchStart={startDrag}
      onTouchMove={(e) => drag(e.touches[0])}
      onTouchEnd={endDrag}
    >
      {isHamburgerOpen ? (
        <Button
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-label="Toggle navigation"
          display={{ base: "flex", lg: "none" }}
          onClick={() => setIsHamburgerOpen(false)} // Toggle hamburger menu state
          marginBottom={isHamburgerOpen ? "2rem" : "0"}
          width={isHamburgerOpen ? "100px" : "auto"}
          marginLeft={"auto"} // Align the button to the right
        >
          <CloseIcon />
        </Button>
      ) : null}
      <Flex
        justifyContent={!isHamburgerOpen ? "space-between" : "flex-start"}
        width={"100%"}
        height={"100%"}
        flexDirection={isHamburgerOpen ? "column" : "row"}
        padding={isHamburgerOpen ? "1rem" : "0"}
      >
        <NavLink
          to="/"
          className={`navbar-brand${isHamburgerOpen ? " mb-5" : ""}`}
        >
          📻 Rapid Recap
        </NavLink>
        <Flex
          flexDirection={{
            base: isHamburgerOpen ? "column" : "row-reverse",
            lg: "row-reverse",
          }}
          height={"100%"}
          alignItems={"center"}
        >
          {!isHamburgerOpen ? (
            <Button
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-label="Toggle navigation"
              display={{ base: "flex", lg: "none" }}
              onClick={() => setIsHamburgerOpen(true)} // Toggle hamburger menu state
              marginBottom={isHamburgerOpen ? "2rem" : "0"}
            >
              <HamburgerIcon />
            </Button>
          ) : null}
          {!state.show && !isHamburgerOpen ? (
            <ProfileDropDownMenu
              handleLogout={handleLogout}
              toProfile={"/profile"}
              refProfile={(ref) => (navLinkRefs.current[4] = ref)}
            />
          ) : null}
          <Flex
            display={{ base: isHamburgerOpen ? "flex" : "none", lg: "flex" }}
            flexDirection={{ base: "column", lg: "row" }}
            // className="collapse navbar-collapse"
            id="navbarNav"
            // justifyContent="space-between"
            alignItems={"center"}
            h={"100%"}
          >
            <ul
              className={`navbar-nav h-100 w-100 ${
                isHamburgerOpen ? "d-flex gap-5" : ""
              }`}
            >
              {navItems.map((item, index) => (
                <li
                  className="nav-item"
                  key={index}
                  onClick={() => setIsHamburgerOpen(false)}
                >
                  {item.label === "Profile" &&
                  !state.show ? null : item.label === "category" &&
                    !state.show ? (
                    <>
                      <Button
                        colorScheme="teal"
                        onClick={() => setShowCategory(!showCategory)}
                      >
                        Category <HamburgerIcon marginLeft={"5px"} />{" "}
                      </Button>
                      {showCategory && (
                        <Categories
                          setShowCategory={setShowCategory}
                          isHamburgerOpen={isHamburgerOpen}
                          setIsHamburgerOpen={setIsHamburgerOpen}
                        />
                      )}
                    </>
                  ) : (
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
    </Flex>
  );
};

export default Navbar;
