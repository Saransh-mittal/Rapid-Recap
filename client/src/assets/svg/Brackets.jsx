// File: components/Brackets.js

import { Box } from "@chakra-ui/react";
import PropTypes from "prop-types";

const Brackets = ({ position }) => (
  <Box as="svg" width="3" height="14" viewBox="0 0 5 14" fill="none">
    {position === "left" ? (
      <path
        d="M0 0.822266H4V12.8223H0"
        stroke="url(#brackets-left)"
        strokeWidth="2"
      />
    ) : (
      <path
        d="M5 0.822266H1V12.8223H5"
        stroke="url(#brackets-right)"
        strokeWidth="2"
      />
    )}
    <defs>
      <linearGradient id="brackets-left" x1="50%" x2="50%" y1="0%" y2="100%">
        <stop offset="0%" stopColor="#89F9E8" />
        <stop offset="100%" stopColor="#FACB7B" />
      </linearGradient>
      <linearGradient
        id="brackets-right"
        x1="14.635%"
        x2="14.635%"
        y1="0%"
        y2="100%"
      >
        <stop offset="0%" stopColor="#9099FC" />
        <stop offset="100%" stopColor="#D87CEE" />
      </linearGradient>
    </defs>
  </Box>
);

Brackets.propTypes = {
  position: PropTypes.oneOf(["left", "right"]).isRequired,
};

export default Brackets;
