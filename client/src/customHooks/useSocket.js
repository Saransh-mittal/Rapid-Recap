import { useEffect, useState, useRef, useCallback } from "react";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:3000"; // Update this with your actual endpoint

export const useSocket = (user) => {
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);

  const getSocket = useCallback(() => {
    if (!socketRef.current && user) {
      socketRef.current = io(ENDPOINT);
      socketRef.current.emit("setup", user);
      socketRef.current.on("connected", () => setSocketConnected(true));
    }
    return socketRef.current;
  }, [user]);

  useEffect(() => {
    const socket = getSocket();

    return () => {
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
        setSocketConnected(false);
      }
    };
  }, [getSocket]);

  return { socket: socketRef.current, socketConnected, getSocket };
};
