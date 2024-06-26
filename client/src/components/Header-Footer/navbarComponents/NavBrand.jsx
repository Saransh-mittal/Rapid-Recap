import { Flex, Image } from "@chakra-ui/react";
import React from "react";
import { NavLink } from "react-router-dom";
import Logo from "/images/Rapid_Recap-withoutBG.png";
import Mic from "/images/mic.png";
import RR from "/images/rr.png";
import Heading from "../../miscellaneous/HeadingComponent";

const NavBrand = ({ isHamburgerOpen }) => {
  return (
    <NavLink to="/" className={`navbar-brand`}>
      <Flex position={!isHamburgerOpen ? "absolute" : "relative"}>
        <Image
          src={RR}
          alt="Rapid Recap"
          width={{
            base: isHamburgerOpen ? "3.5rem" : "3.3rem",
            md: "3.5rem",
          }}
          height={"2.5rem"}
          background={"transparent"}
          marginRight={"-5px"}
          // rotate to left by 2 degrees
          transform={"rotate(-0.5deg)"}
        />
        {/* <Image
          src={Logo}
          alt="Rapid Recap"
          width={{
            base: isHamburgerOpen ? "5rem" : "4.8rem",
            md: "6rem",
          }}
          height={"2.5rem"}
          background={"transparent"}
        /> */}
        {/* <Heading>Rapid Recap</Heading> */}
        <Flex
          ml={3}
          display={{ base: isHamburgerOpen ? "flex" : "none", md: "block" }}
          color={"white"}
        >
          <Heading title={"Rapid Recap"} marginBottom="0" />
        </Flex>
      </Flex>
    </NavLink>
  );
};

export default NavBrand;
