import { Box } from "@chakra-ui/react";
import Brackets from "../../assets/svg/Brackets";
import PropTypes from "prop-types";

const TagLine = ({
  className,
  children,
  tagFontSize = "sm",
  tagFontWeight = "",
}) => {
  return (
    <Box
      display="flex"
      alignItems="center"
      // justifyContent="center"
      className={className}
    >
      <Brackets position="right" />
      <Box mx={2} fontSize={tagFontSize} fontWeight={tagFontWeight}>
        {children}
      </Box>
      <Brackets position="left" />
    </Box>
  );
};

TagLine.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default TagLine;
