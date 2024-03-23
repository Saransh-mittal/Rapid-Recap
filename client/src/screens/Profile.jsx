import React, { useContext, useEffect, useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { AppContext } from "../contextAPI/appContext";
import IQLineGraph from "../components/profileComponents/IQLineGraph";
import IQBarGraph from "../components/profileComponents/IQBarGraph";
import LeftProfileBox from "../components/profileComponents/LeftProfileBox";
import SolvedQuizzes from "../components/profileComponents/SolvedQuizzes";
import RankAndSociety from "../components/profileComponents/RankAndSociety";
import DailyActivity from "../components/profileComponents/DailyActivity";
export default function Profile() {
  const { state, dispatch } = useContext(AppContext);
  const [user, setUser] = useState({});
  useEffect(() => {
    //console.log(state.user);
    setUser(state.user);
  }, []);

  return (
    <>
      <Flex
        flexDirection={{ base: "column", md: "row" }}
        marginTop="20px"
        marginInline={{ base: "0", xl: "6.5%" }}
        alignItems={{ base: "center", md: "normal" }}
        justifyContent={{ base: "center", md: "center", lg: "normal" }}
      >
        <Flex
          margin="20px"
          padding="15px"
          borderRadius="10px"
          flexDirection="column"
          w={{ md: "300px", lg: "350px", base: "95%" }}
          height="fit-content"
          style={{
            backgroundColor: "#0f0d15",
            backgroundImage:
              "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
            boxShadow:
              "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)", // Increased intensity of the shadow
          }}
        >
          <LeftProfileBox />
        </Flex>
        <Flex
          w={{
            xl: "calc(100% - 400px)",
            md: "calc(100% - 460px)",
            sm: "100%",
            base: "100%",
          }}
          flexDirection="column"
          margin="12px"
          justifyContent={"center"}
          alignItems={"center"}
          borderRadius="10px"
        >
          <Flex
            w={"100%"}
            marginTop={"10px"}
            marginInline={"1%"}
            padding={{ xl: "20px", base: "0" }}
            borderRadius="10px"
            flexDirection={{ base: "column", xl: "row" }}
            backgroundColor={{ base: "transparent", xl: "#0f0d15" }}
            backgroundImage={{
              base: "none",
              xl: "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
            }}
            boxShadow={{
              base: "none",
              xl: "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)",
            }}
            gap={{ base: "20px", xl: "0" }}
          >
            <IQLineGraph />
            <IQBarGraph />
          </Flex>

          <Flex
            w={"100%"}
            margin="10px"
            marginBottom="5px"
            flexDirection={{ xl: "row", base: "column" }}
            justifyContent="space-between"
            gap={5}
          >
            <Flex
              borderRadius="10px"
              width={"100%"}
              style={{
                backgroundColor: "#0f0d15",
                backgroundImage:
                  "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
                boxShadow:
                  "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)", // Increased intensity of the shadow
              }}
            >
              <SolvedQuizzes />
            </Flex>
            <Flex
              borderRadius="10px"
              width={"100%"}
              style={{
                backgroundColor: "#0f0d15",
                backgroundImage:
                  "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
                boxShadow:
                  "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)", // Increased intensity of the shadow
              }}
            >
              <RankAndSociety />
            </Flex>
          </Flex>
          <Box
            w={"100%"}
            margin="10px"
            p={"10px"}
            borderRadius="10px"
            style={{
              backgroundColor: "#0f0d15",
              backgroundImage:
                "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
              boxShadow:
                "0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)", // Increased intensity of the shadow
            }}
          >
            <DailyActivity />
          </Box>
        </Flex>
      </Flex>
    </>
  );
}
