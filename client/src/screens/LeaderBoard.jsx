import {
  Flex,
  Heading as ChakraHeading,
  Image,
  useMediaQuery,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useState, useEffect, useContext } from "react";
import { AppContext } from "../contextAPI/appContext";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/leaderBoardComponents/SearchBar";
import SocietyButtons from "../components/leaderBoardComponents/SocietyButtons";
import LeaderBoardTable from "../components/leaderBoardComponents/LeaderBoardTable";
import { useLeaderBoardTour } from "../customHooks/useTours";
import medalIcon from "../assets/medal.webp";
import { debounce } from "lodash";
import Heading from "../components/miscellaneous/HeadingComponent";

const LeaderBoard = () => {
  const PAGE_LIMIT = 20;
  const navigate = useNavigate();
  const { state } = useContext(AppContext);
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [searchLoad, setSearchLoad] = useState(false);
  const [leaders, setLeaders] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [activeSociety, setActiveSociety] = useState(null);
  const { tour, isTutorialTakenCheck } = useLeaderBoardTour();
  const [isLgScreen] = useMediaQuery("(max-width: 1024px)");
  const [isMdScreen] = useMediaQuery("(max-width: 820px)");
  const [isBaseScreen] = useMediaQuery("(max-width: 768px)");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadNextPage, setLoadNextPage] = useState(true);

  const fetchLeaderBoard = async (society = "", page = 1) => {
    if (!hasMore) {
      setIsLoading(false);
      setLoadNextPage(false);
      return; // Exit if no more items to load
    }
    try {
      const response = await axios.get(
        `/api/user/leaderboard?society=${society}&page=${page}&limit=${PAGE_LIMIT}`
      );
      const fetchedLeaders = response.data.users;
      if (fetchedLeaders.length === 0) {
        setHasMore(false);
        return;
      }
      setLeaders((prevLeaders) => {
        if (page === 1) return fetchedLeaders;
        return [...prevLeaders, ...fetchedLeaders];
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch leaderboard",
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setLoadNextPage(false);
      setIsLoading(false);
    }
  };

  const handleLoginAlert = () => {
    if (state.show) {
      navigate("/signin");
      toast({
        title: "Please Sign In First",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleSocietyButtonClick = (society) => {
    setPage(1); // Reset page when society changes
    if (activeSociety === society) {
      setActiveSociety(null);
      fetchLeaderBoard();
    } else {
      setActiveSociety(society);
      fetchLeaderBoard(society);
    }
  };

  const handleScroll = async () => {
    try {
      if (
        window.innerHeight + document.documentElement.scrollTop + 500 >
          document.documentElement.scrollHeight &&
        hasMore
      ) {
        setLoadNextPage(true);
        setPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const debouncedHandleScroll = debounce(handleScroll, 300);

  useEffect(() => {
    handleLoginAlert();
  }, [state.show]);

  useEffect(() => {
    document.title = "LeaderBoard Page";
    if (!state.show) {
      fetchLeaderBoard();
    }
    window.addEventListener("scroll", debouncedHandleScroll);
    return () => {
      window.removeEventListener("scroll", debouncedHandleScroll);
    };
  }, [state.show]);

  useEffect(() => {
    if (
      !isLoading &&
      !state.show &&
      state.user &&
      state.user.tutorial.leaderBoardPage
    ) {
      isTutorialTakenCheck({ page: "leaderBoardPage", tour });
    }
  }, [isLoading]);

  useEffect(() => {
    if (page > 1) {
      fetchLeaderBoard(activeSociety, page);
    }
  }, [page]);

  return (
    <Flex
      minH={"85vh"}
      justifyContent={"center"}
      className="leaderboard"
      marginTop={"4.5rem"}
    >
      <Flex
        margin={"20px"}
        justifyContent={"center"}
        // alignItems={"center"}
        w={"100%"}
        flexDirection={"column"}
      >
        <Flex alignItems={"center"} justifyContent={"center"}>
          <ChakraHeading>
            <Flex
              alignItems={"center"}
              w={"100%"}
              justifyContent={"center"}
              // alignItems={"center"}
            >
              <Image
                src={medalIcon}
                alt="Rating"
                width={"35px"}
                height={"35px"}
                bg={"none"}
                mt={"2.5rem"}
              />
              <Heading
                title={"LEADERBOARD"}
                tag={"SEASON 2"}
                tagFontSize={"1.05rem"}
              />
              <Image
                src={medalIcon}
                alt="Rating"
                width={"35px"}
                height={"35px"}
                bg={"none"}
                mt={"2.5rem"}
              />
            </Flex>
          </ChakraHeading>
        </Flex>
        <Flex
          alignItems="center"
          justifyContent="center"
          marginBottom="20px"
          marginTop={"20px"}
        >
          <SearchBar
            setSearchResults={setSearchResults}
            setSearchLoad={setSearchLoad}
          />
        </Flex>
        {/* <SocietyButtons
          activeSociety={activeSociety}
          handleSocietyButtonClick={handleSocietyButtonClick}
          searchLoad={searchLoad}
          isLoading={isLoading}
        /> */}
        <LeaderBoardTable
          hasMore={hasMore}
          PAGE_LIMIT={PAGE_LIMIT}
          loadNextPage={loadNextPage}
          leaders={leaders}
          searchResults={searchResults}
          searchLoad={searchLoad}
          isBaseScreen={isBaseScreen}
          isLgScreen={isLgScreen}
          isMdScreen={isMdScreen}
          state={state}
          currUserChar={state.user}
          navigate={navigate}
          setLoadNextPage={setLoadNextPage}
        />
      </Flex>
    </Flex>
  );
};

export default LeaderBoard;
