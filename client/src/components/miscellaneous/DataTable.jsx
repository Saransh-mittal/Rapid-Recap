// /src/components/DataTable.jsx
import React from "react";
import { Table, Thead, Tbody, Tr, Th, Td, Box } from "@chakra-ui/react";

const DataTable = ({ columns, data }) => {
  return (
    <Box overflowX="auto">
      <Table variant="striped" colorScheme="teal">
        <Thead>
          <Tr>
            {columns?.map((column) => (
              <Th key={column}>
                {column === "timeSpent" ? `${column} (in Minutes)` : column}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data?.map((row, rowIndex) => (
            <Tr
              key={rowIndex}
              sx={{
                color: rowIndex % 2 !== 0 ? "white" : "black",
              }}
            >
              {columns?.map((column) => (
                <Td key={column}>{row[column]}</Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default DataTable;
