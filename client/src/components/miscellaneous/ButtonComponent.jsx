import { useBreakpointValue } from "@chakra-ui/react";
import ButtonSvg from "../../assets/svg/ButtonSvg";
import React from "react";

const Button = React.forwardRef((props, ref) => {
  const {
    className,
    onClick,
    children,
    px,
    pl,
    pr,
    white,
    textColor = "",
    buttonW = "",
    display = "inline-flex",
  } = props;

  // Define responsive width using Chakra UI's useBreakpointValue hook
  const buttonWidth =
    buttonW !== ""
      ? buttonW
      : useBreakpointValue({
          lg: "110px", // width for large screens (>= 62em or 992px)
          xl: "150px", // width for extra-large screens (>= 80em or 1280px)
        });

  const buttonStyles = {
    width: buttonWidth,
    position: "relative",
    display: display,
    alignItems: "center",
    justifyContent: "center",
    height: "2.75rem", // 11 / 4 = 2.75rem
    transition: "color 0.2s",
    paddingLeft: px || pl || "10px", // default padding if px is not provided
    paddingRight: px || pr || "10px", // default padding if px is not provided
    letterSpacing: "2px",
    fontWeight: "bold",
  };

  const spanStyles = {
    position: "relative",
    zIndex: "1",
    fontSize: white ? "1rem" : "0.75rem",
    color: white ? "black" : textColor !== "" ? textColor : "#9CAFAA",
    textTransform: "uppercase",
  };

  return (
    <button ref={ref} onClick={onClick} style={buttonStyles}>
      <span style={spanStyles}>{children}</span>
      {ButtonSvg(white)}
    </button>
  );
});

export default Button;
