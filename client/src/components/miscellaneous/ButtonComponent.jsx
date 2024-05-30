import { Button as ChakraButton } from "@chakra-ui/react";
import ButtonSvg from "../../assets/svg/ButtonSvg";

const Button = ({ className, href, onClick, children, px, white }) => {
  const buttonProps = {
    colorScheme: "teal",
    size: "md",
    onClick: onClick,
    href: href,
    as: href ? "a" : "button",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color",
    _hover: { color: "color-1" },
    paddingLeft: px || "7",
    paddingRight: px || "7",
    color: white ? "text-n-8" : "text-n-1",
    className: className || "",
  };

  return (
    <ChakraButton {...buttonProps}>
      <span className="relative z-10">{children}</span>
      {ButtonSvg(white)}
    </ChakraButton>
  );
};

export default Button;
