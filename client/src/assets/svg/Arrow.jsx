import { chakra } from "@chakra-ui/react";

const Arrow = () => {
  return (
    <chakra.svg
      ml={5}
      fill="currentColor"
      width="24"
      height="24"
      color="gray.600" // Equivalent to class fill-n-1 in Tailwind
    >
      <path d="M8.293 5.293a1 1 0 0 1 1.414 0l6 6a1 1 0 0 1 0 1.414l-6 6a1 1 0 0 1-1.414-1.414L13.586 12 8.293 6.707a1 1 0 0 1 0-1.414z" />
    </chakra.svg>
  );
};

export default Arrow;
