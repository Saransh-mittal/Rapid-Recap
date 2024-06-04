import { Button, Flex } from "@chakra-ui/react";

const SocietyButtons = ({
  activeSociety,
  handleSocietyButtonClick,
  searchLoad,
  isLoading,
}) => (
  <Flex justifyContent={"center"} gap={5} flexDirection={"row"}>
    <Flex justifyContent={"center"} gap={5} flexDirection={"column"}>
      <Button
        isDisabled={searchLoad || isLoading}
        isLoading={activeSociety === "titans" && searchLoad}
        onClick={() => handleSocietyButtonClick("titans")}
        w={"100%"}
        m={2}
        backgroundColor={"goldenrod"}
        boxShadow="0 0 10px 5px rgba(255, 215, 0, 0.8)"
        h={"30px"}
        borderBottom={activeSociety === "titans" ? "5px solid gold" : null}
      >
        Titans
      </Button>
      <Button
        isDisabled={searchLoad || isLoading}
        isLoading={activeSociety === "mavericks" && searchLoad}
        onClick={() => handleSocietyButtonClick("mavericks")}
        w={"100%"}
        m={2}
        backgroundColor={"darkorange"}
        boxShadow="0 0 10px 5px rgba(255, 150, 0, 0.5)"
        h={"30px"}
        borderBottom={
          activeSociety === "mavericks" ? "5px solid 	#C13315" : null
        }
      >
        Maverick
      </Button>
    </Flex>
    <Flex justifyContent={"center"} gap={5} flexDirection={"column"}>
      <Button
        isDisabled={searchLoad || isLoading}
        isLoading={activeSociety === "elites" && searchLoad}
        onClick={() => handleSocietyButtonClick("elites")}
        w={"100%"}
        m={2}
        backgroundColor={"lightgreen"}
        boxShadow="0 0 10px 5px rgba(0, 255, 100, 0.5)"
        h={"30px"}
        borderBottom={activeSociety === "elites" ? "5px solid darkgreen" : null}
      >
        Elites
      </Button>
      <Button
        isDisabled={searchLoad || isLoading}
        isLoading={activeSociety === "strivers" && searchLoad}
        onClick={() => handleSocietyButtonClick("strivers")}
        w={"100%"}
        m={2}
        backgroundColor={"cornflowerblue"}
        h={"30px"}
        borderBottom={
          activeSociety === "strivers" ? "5px solid darkblue" : null
        }
      >
        Strivers
      </Button>
    </Flex>
    <Flex justifyContent={"center"} gap={5}>
      <Button
        isDisabled={searchLoad || isLoading}
        isLoading={activeSociety === "explorers" && searchLoad}
        textColor={"black"}
        w={"100%"}
        m={2}
        h={"30px"}
        onClick={() => handleSocietyButtonClick("explorers")}
        borderBottom={
          activeSociety === "explorers" ? "5px solid #C6C5C5" : null
        }
      >
        Explorers
      </Button>
    </Flex>
  </Flex>
);

export default SocietyButtons;
