import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Text,
  useToast,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../contextAPI/appContext";
import axios from "axios";

const LeftProfileBox = () => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [rank, setRank] = useState(null);
  const { state, dispatch } = useContext(AppContext);
  const fetchRank = async () => {
    try {
      const response = await axios.get("/api/user/calculateUserRank");
      setRank(response.data.rank);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong in fetching Rank",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      console.log(error.response.data.error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    //console.log(state.user);
    fetchRank();
  }, []);
  return (
    <>
      <Flex w={"100%"}>
        <Image
          src={state.user.pic}
          alt="Profile"
          borderRadius="10%"
          width="80px"
          height="80px"
          marginRight="20px"
        />
        <Box margin={"5px"}>
          <Heading as="h4" size={"md"}>
            {state.user.name}
          </Heading>
          <Heading as="h6" fontSize={"12px"}>
            {state.user.inGameName}
          </Heading>
          {isLoading ? (
            <Text>Loading...</Text>
          ) : (
            <Heading as="h6" fontSize={"12px"}>
              Rank : {rank}
            </Heading>
          )}
        </Box>
      </Flex>
      <Box marginTop={"10px"} w={{ lg: "300px", base: "100%" }}>
        <Text align={"justify"}>{state.user.bio}</Text>
        <Button
          size="md"
          height="35px"
          width="90%"
          border="5px"
          borderColor="green.200"
          backgroundColor="#F2D8D8" // Initial background color
          color="#374259" // Initial text color
          css={{
            "&:hover": {
              backgroundColor: "#316B83", // Change background color to green on hover
              color: "#11324D", // Change text color to white on hover
            },
          }}
        >
          Edit Profile
        </Button>
      </Box>
    </>
  );
};

export default LeftProfileBox;
