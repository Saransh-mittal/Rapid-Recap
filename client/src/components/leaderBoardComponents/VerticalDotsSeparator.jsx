import React from "react";
import "./VerticalDotsSeparator.css";

const VerticalDotsSeparator = () => {
  return (
    <tr>
      <td colSpan="6" textAlign="center">
        <div className="vertical-dots"></div>
      </td>
    </tr>
  );
};

export default VerticalDotsSeparator;
