import { Box } from "@chakra-ui/react";
import brackets from "../../assets/svg/Brackets";

const TagLine = ({ className, children }) => {
  return (
    <Box className={`tagline flex items-center ${className || ""}`}>
      {brackets("left")}
      <Box mx={3} className="text-n-3">
        {children}
      </Box>
      {brackets("right")}
    </Box>
  );
};

export default TagLine;
