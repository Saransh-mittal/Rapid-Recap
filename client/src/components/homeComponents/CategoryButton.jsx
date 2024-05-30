import React from "react";
import { useBreakpointValue } from "@chakra-ui/react";
import ButtonSvg from "../../assets/svg/ButtonSvg";

const CategoryButton = ({ className, onClick, children, px, white }) => {
  // Define responsive width using Chakra UI's useBreakpointValue hook
  const buttonWidth = useBreakpointValue({
    lg: "110px", // width for large screens (>= 62em or 992px)
    xl: "150px", // width for extra-large screens (>= 80em or 1280px)
  });

  const buttonStyles = {
    width: buttonWidth,
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: "2.75rem", // 11 / 4 = 2.75rem
    transition: "color 0.2s",
    paddingLeft: px || "10px", // default padding if px is not provided
    paddingRight: px || "10px", // default padding if px is not provided
    letterSpacing: "2px",
    fontWeight: "bold",
  };

  const spanStyles = {
    position: "relative",
    zIndex: "1",
    fontSize: white ? "1rem" : "0.75rem",
    color: white ? "black" : "#9CAFAA",
    textTransform: "uppercase",
  };

  return (
    <button onClick={onClick} style={buttonStyles}>
      <span style={spanStyles}>{children}</span>
      {ButtonSvg(white)}
    </button>
  );
};

export default CategoryButton;
