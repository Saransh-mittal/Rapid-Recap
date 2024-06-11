import { Box, Flex, Heading, Image, Td, Tr } from "@chakra-ui/react";
import { findSocietyAndCircle } from "../../utils/helper.utils";
import NameLightning from "../miscellaneous/NameLightning";
import XPLevel from "../Header-Footer/navbarComponents/XPLevel";

const LeaderBoardRow = ({
  user,
  index,
  state,
  currUserChar,
  isBaseScreen,
  isLgScreen,
  isMdScreen,
  navigate,
}) => {
  const urlInGameName = user?.inGameName?.replace(/\./g, "%2E");
  return (
    <Tr
      height={"80px"}
      key={user._id}
      className={
        state.user.inGameName === user.inGameName ? "highlighted-card-2" : ""
      }
      onClick={() => navigate(`/profile/${urlInGameName}`)}
      _hover={{
        backgroundImage:
          "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
        boxShadow:
          "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)",
      }}
      cursor={"pointer"}
    >
      <Td textAlign={"center"}>
        <Flex
          justifyContent={"center"}
          alignItems={"center"}
          bgGradient="linear(to-b, #1a1527, #0e0c16 88%, #0e0c16 99%)"
          p={2}
          gap={"25px"}
          borderRadius="md"
        >
          {user.rank ? user.rank : index + 1}
          {!isBaseScreen && (
            <Flex
              border={"5px solid gold"}
              style={{ transform: "rotate(45deg)" }}
              w="45px"
              h="45px"
              justifyContent={"center"}
              alignItems={"center"}
              bg={"blue.200"}
              position={"relative"}
              overflow={"hidden"}
            >
              <Box
                position={"absolute"}
                h="50px"
                w="50px"
                style={{ transform: "rotate(-45deg)" }}
              >
                <Image
                  h={"100%"}
                  w={"100%"}
                  src={user.pic}
                  alt="User profile picture"
                  objectFit={"cover"}
                />
              </Box>
            </Flex>
          )}
          <Flex marginLeft={"-0.5rem"}>
            <XPLevel level={user.level} className={"xp-level"} />
          </Flex>
        </Flex>
      </Td>
      {!isBaseScreen && (
        <Td>
          <Flex
            justifyContent={"center"}
            alignItems={"center"}
            w={"100%"}
            position="relative"
          >
            <Heading
              as="h6"
              size={"xs"}
              color={findSocietyAndCircle(user.IQ_score)?.textColor}
              marginTop={"5px"}
            >
              {user.name}
            </Heading>
            <NameLightning
              boxShadow={findSocietyAndCircle(user.maxIQScore)?.boxShadow}
              MAX_IQ={user.maxIQScore}
            />
          </Flex>
        </Td>
      )}
      <Td textAlign="center">{user.inGameName}</Td>
      <Td textAlign="center">{user.IQ_score}</Td>
      {!isLgScreen && <Td textAlign="center">{user.quizSubmissions}</Td>}
      {!isMdScreen && <Td textAlign="center">{user.RQM_avg}</Td>}
    </Tr>
  );
};

export default LeaderBoardRow;
