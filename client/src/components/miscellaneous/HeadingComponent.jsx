import { Box } from "@chakra-ui/react";
import TagLine from "./TaglineComponent";

const Heading = ({ className, title, text, tag }) => {
  return (
    <Box
      className={`${className} max-w-[50rem] mx-auto mb-12 lg:mb-20 text-center`}
    >
      {tag && <TagLine className="mb-4 md:justify-center">{tag}</TagLine>}
      {title && (
        <Box as="h2" className="h2">
          {title}
        </Box>
      )}
      {text && (
        <Box as="p" className="body-2 mt-4 text-n-4">
          {text}
        </Box>
      )}
    </Box>
  );
};

export default Heading;
