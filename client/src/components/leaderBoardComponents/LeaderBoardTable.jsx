import {
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Skeleton,
} from "@chakra-ui/react";
import LeaderBoardRow from "./LeaderBoardRow";
import LoadingState from "./LoadingState";
import VerticalDotsSeparator from "./VerticalDotsSeparator";

const LeaderBoardTable = ({
  leaders,
  searchResults,
  searchLoad,
  isBaseScreen,
  isLgScreen,
  isMdScreen,
  state,
  currUserChar,
  navigate,
  loadNextPage,
  PAGE_LIMIT,
  hasMore,
}) => {
  const data = searchResults.length > 0 ? searchResults : leaders;

  // Use a Set to track unique user IDs
  const seenUserIds = new Set();

  // Filter out duplicates
  const uniqueData = data.filter((user) => {
    if (seenUserIds.has(user._id)) {
      return false;
    } else {
      seenUserIds.add(user._id);
      return true;
    }
  });

  return (
    <TableContainer width={"100%"} className="mainBoard" overflowX="auto">
      <Table variant={"unstyled"}>
        <TableCaption color={"white"} placement="top">
          "Where Champions Stand Out!"
        </TableCaption>
        <Thead>
          <Tr boxShadow={"dark-lg"} letterSpacing={"2px"}>
            <Th textAlign={"center"} bg={"green.300"} color={"white"}>
              Rank
            </Th>
            {!isBaseScreen && (
              <Th textAlign={"center"} bg={"red.300"}>
                Name
              </Th>
            )}
            <Th textAlign={"center"} bg={"blue.300"} px={"0.5rem"}>
              In Game Name
            </Th>
            <Th textAlign={"center"} bg={"orange.300"}>
              IQ Scores
            </Th>
            {!isLgScreen && (
              <Th textAlign={"center"} bg={"teal.300"}>
                Quiz Submissions
              </Th>
            )}
            {!isMdScreen && (
              <Th textAlign={"center"} bg={"pink.300"}>
                Avg. RQM Scores
              </Th>
            )}
          </Tr>
        </Thead>
        {searchLoad ? (
          <LoadingState />
        ) : (
          <Tbody marginTop={"20px"} className="Entries">
            {uniqueData.length > 0 &&
              uniqueData.map((user, index) => (
                <LeaderBoardRow
                  key={`${user._id}-${index}`}
                  user={user}
                  index={index}
                  state={state}
                  currUserChar={currUserChar}
                  isBaseScreen={isBaseScreen}
                  isLgScreen={isLgScreen}
                  isMdScreen={isMdScreen}
                  navigate={navigate}
                />
              ))}
            {state.user.rank > 500 && (
              <>
                <Tr>
                  <Td colSpan={6}>
                    <VerticalDotsSeparator />
                  </Td>
                </Tr>
                <LeaderBoardRow
                  key={`currentUser-${state.user._id}`}
                  user={state.user}
                  index={50}
                  state={state}
                  currUserChar={currUserChar}
                  isBaseScreen={isBaseScreen}
                  navigate={navigate}
                  isLgScreen={isLgScreen}
                  isMdScreen={isMdScreen}
                />
              </>
            )}
            {loadNextPage &&
              hasMore &&
              Array.from({ length: PAGE_LIMIT }).map((_, index) => (
                <Tr key={index}>
                  <Td colSpan={6}>
                    <Skeleton height="50px" borderRadius={"10px"} />
                  </Td>
                </Tr>
              ))}
          </Tbody>
        )}
      </Table>
    </TableContainer>
  );
};

export default LeaderBoardTable;
