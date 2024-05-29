// import React from "react";
// import { Box, Text } from "@chakra-ui/react";

// const CardComponent = ({ id, title, text, backgroundUrl, imageUrl, light }) => {
//   return (
//     <Box
//       position="relative"
//       overflow="hidden"
//       borderRadius="0.5rem"
//       maxW="24rem"
//       bg="linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)"
//       backgroundSize="cover"
//       transition="all 0.3s ease-in-out"
//       _hover={{
//         transform: "scale(1.05)",
//         boxShadow: "0 0 20px rgba(0, 0, 0, 0.2)",
//         zIndex: 1,
//         border: "2px solid transparent",
//       }}
//     >
//       <Box
//         pos="relative"
//         zIndex={2}
//         display="flex"
//         flexDirection="column"
//         minHeight="22rem"
//         p="2.4rem"
//         pointerEvents="none"
//         alignItems="flex-start"
//         justifyContent="flex-start"
//         borderRadius="0.5rem"
//         bg="rgba(15, 13, 21, 0.5)" // Transparent background
//       >
//         <Text fontSize="1.125rem" mb="1.25rem" color="white">
//           {title}
//         </Text>
//         <Text fontSize="1rem" mb="1.5rem" color="white">
//           {text}
//         </Text>
//         <Box display="flex" alignItems="center" mt="auto">
//           <Text
//             fontSize="0.75rem"
//             fontWeight="bold"
//             textTransform="uppercase"
//             color="gray"
//             letterSpacing="0.05em"
//             mr="auto"
//           >
//             Explore more
//           </Text>
//           {/* <ArrowIcon /> */}
//         </Box>
//       </Box>
//       <Box
//         position="absolute"
//         top="-2px"
//         right="-2px"
//         bottom="-2px"
//         left="-2px"
//         zIndex={1}
//         _before={{
//           content: '""',
//           position: "absolute",
//           top: 0,
//           right: 0,
//           bottom: 0,
//           left: 0,
//           background:
//             "linear-gradient(to top right, #ff6347, #ff00ff, #6495ed)",
//           borderRadius: "0.5rem",
//         }}
//         clipPath="polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)"
//       />
//     </Box>
//   );
// };

// export default CardComponent;

// src/components/miscellaneous/CardComponent.jsx

import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";

const CardComponent = ({ title, text }) => {
  return (
    <Box
      maxW="sm"
      borderRadius="lg"
      overflow="hidden"
      p="6"
      m="2"
      textAlign="left"
      bg="transparent"
      position="relative"
      border="5px solid orange"
      boxShadow="inset 0 0 10px rgba(0, 0, 0, 0.1), inset 0 0 15px rgba(0, 0, 0, 0.2), 0 0 20px rgba(26, 21, 39, 0.5)"
    >
      <Heading as="h3" size="md" mb="2">
        {title}
      </Heading>
      <Text color="gray.600">{text}</Text>
    </Box>
  );
};

export default CardComponent;
