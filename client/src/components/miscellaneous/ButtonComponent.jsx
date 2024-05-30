import { Button as ChakraButton } from "@chakra-ui/react";
import ButtonSvg from "../../assets/svg/ButtonSvg";

const Button = ({ className, href, onClick, children, px, white }) => {
  const buttonProps = {
    className: `relative inline-flex items-center justify-center h-11 transition-colors hover:text-color-1 ${
      px || "px-7"
    } ${white ? "text-n-8" : "text-n-1"} ${className || ""}`,
    onClick: onClick,
    href: href,
    as: href ? "a" : "button",
  };

  return (
    <ChakraButton {...buttonProps}>
      <span className="relative z-10">{children}</span>
      {ButtonSvg(white)}
    </ChakraButton>
  );
};

export default Button;
