import React, { useState } from "react";
import ReactDom from "react-dom";

const MODAL_STYLES = {
  position: "fixed",
  top: "50%",
  left: "50%",
  backgroundColor: "rgb(34,34,34)",
  transform: "translate(-50%, -50%)",
  zIndex: 2000,
  height: "90%",
  width: "90%",
};

const OVERLAY_STYLES = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, .7)",
  zIndex: 2000,
};

export default function Modal({ children, onClose }) {
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle = {
    marginLeft: "100%",
    marginTop: "-5px",
    zIndex: 2001,
    position: "absolute",
    top: "22px",
    right: "10px",
    color: isHovered ? "#f0f0f0" : "#253547",
    backgroundColor: isHovered ? "#37474f" : "white",
    transition: "background-color 0.3s, color 0.3s", // Hover effect transition
  };

  return ReactDom.createPortal(
    <>
      <div style={OVERLAY_STYLES} />
      <div style={MODAL_STYLES}>
        <button
          className="btn fs-6"
          style={buttonStyle}
          onClick={onClose}
          onMouseOver={() => setIsHovered(true)}
          onMouseOut={() => setIsHovered(false)}
        >
          X
        </button>
        {children}
      </div>
    </>,
    document.getElementById("overlay")
  );
}
