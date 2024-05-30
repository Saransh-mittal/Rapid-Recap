import { Box } from "@chakra-ui/react";
import brackets from "../../assets/svg/Brackets";

const TagLine = ({ className, children }) => {
  return (
    <Box display="flex" alignItems="center" className={className}>
      {brackets("left")}
      <Box mx={3} fontSize="sm">
        {children}
      </Box>
      {brackets("right")}
    </Box>
  );
};

export default TagLine;
