import React, { useContext, useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { AppContext } from "../../contextAPI/appContext";
import axios from "axios";
import { useToast, Button } from "@chakra-ui/react";
import useDrag from "../../customHooks/useDrag";
import ProfileDropDownMenu from "../profileComponents/ProfileDropDownMenu";
import { ViewIcon, HamburgerIcon } from "@chakra-ui/icons";
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
  const navigate = useNavigate();
  const toast = useToast();
  const { state, dispatch, navLinkRefs } = useContext(AppContext);
  const { startDrag, drag, endDrag } = useDrag();
  useEffect(() => {}, [state.show]);

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
    <nav
      className="navbar navbar-expand-lg navbar-light bg-light px-5"
      onTouchStart={startDrag}
      onTouchMove={(e) => drag(e.touches[0])}
      onTouchEnd={endDrag}
    >
      <div className="container-fluid">
        <NavLink to="/" className="navbar-brand">
          📻 Rapid Recap
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            {navItems.map((item, index) => (
              <li className="nav-item" key={index}>
                {item.label === "Profile" && !state.show ? (
                  <ProfileDropDownMenu
                    handleLogout={handleLogout}
                    toProfile={item.to}
                    refProfile={(ref) => (navLinkRefs.current[index] = ref)}
                  />
                ) : item.label === "category" && !state.show ? (
                  <>
                    <Button
                      colorScheme="teal"
                      onClick={() => setShowCategory(!showCategory)}
                    >
                      Category <HamburgerIcon marginLeft={"5px"} />{" "}
                    </Button>
                    {showCategory && (
                      <Categories setShowCategory={setShowCategory} />
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
