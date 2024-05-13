import React, { useContext, useEffect, useState } from "react";
import Timeline from "../components/homeComponents/Timeline";
import axios from "axios";
import Loading from "../components/miscellaneous/Loading";
import { AppContext } from "../contextAPI/appContext";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Modal from "./Modal";
import News from "../components/articleComponents/News";
import useDrag from "../customHooks/useDrag";
import { debounce } from "lodash";
import { useToast, Box, Flex, Container } from "@chakra-ui/react";
import UpgradeModal from "../components/homeComponents/UpgradeModal"; // Import UpgradeModal
import NotificationSubscription from "../components/Notifications/NotificationSubscription";
import ReadMoreNewsModal from "../components/articleComponents/ReadMoreNewsModal";

const Home = () => {
  const { state, dispatch } = useContext(AppContext);
  const [items, setItems] = useState(state.items);
  const [page, setPage] = useState(state.page + 1);
  const toast = useToast();
  const [load, setLoad] = useState(true);
  const { startDrag, drag, endDrag } = useDrag();
  const navigate = useNavigate();
  const { category } = useParams();
  const [showUpgradeModal, setShowUpgradeModal] = useState(true); // State to control the visibility of the upgrade modal

  const USER_IQ = state.user.IQ_score;
  async function fetchData() {
    try {
      const response = await axios.get(
        `/api/articles?page=${page}&pageSize=9&category=${
          category ? category : "general"
        }`
      );
      dispatch({ type: "PAGE", payloadPage: page - 1 });
      dispatch({
        type: "ITEMS",
        payloadItems: [...state.items, ...response.data],
      });

      setItems((prev) => [...state.items, ...response.data]);
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoad(false);
    }
  }

  const handleScroll = async () => {
    try {
      if (
        window.innerHeight + document.documentElement.scrollTop + 10 >
          document.documentElement.scrollHeight &&
        category === state.category
      ) {
        setLoad(true);
        setPage((ele) => ele + 1);
      }
    } catch (error) {
      console.log(error);
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
    } else if (state.user.societyUpgradeMessage !== "") {
      // Display upgrade message if available
      setShowUpgradeModal(true);
    }
  };

  useEffect(() => {
    handleLoginAlert();
  }, [state.show, state.user.societyUpgradeMessage]);

  const debouncedHandleScroll = debounce(handleScroll, 300);

  useEffect(() => {
    document.title = "Home Page";
    if (!state.show) {
      // if (!category || category === "") {
      //   navigate("/general");
      // }

      dispatch({ type: "homeInitialRender" });
      window.addEventListener("scroll", debouncedHandleScroll);
    }
    return () => window.removeEventListener("scroll", debouncedHandleScroll);
  }, []);

  useEffect(() => {
    if (!state.show) {
      if (items.length < page * 9) {
        fetchData();
      } else setLoad(false);
    }
  }, [page]);

  useEffect(() => {
    if (!state.show) {
      if (state.category !== category) {
        setLoad(true);
        dispatch({
          type: "category",
          payloadCategory: category,
        });
        dispatch({ type: "PAGE", payloadPage: 0 });
        dispatch({ type: "ITEMS", payloadItems: [] });
      }
    }
  }, [category]);

  useEffect(() => {
    if (!state.show) {
      const currPage = state.page;
      if (
        currPage === 0 &&
        !state.homeInitialRender &&
        state.items.length === 0 &&
        state.category === category
      ) {
        setPage(() => 1);
        setItems(() => []);
        if (page === 1)
          setTimeout(() => {
            fetchData();
          }, 100);
      }
    }
  }, [state.items, state.page, state.category]);
  const isSupported = () =>
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  return (
    <Box
      onTouchStart={startDrag}
      onTouchMove={(e) => drag(e.touches[0])}
      onTouchEnd={endDrag}
      marginTop={"4rem"}
      w={"100%"}
    >
      {isSupported() ? <NotificationSubscription /> : null}
      {/* Always render UpgradeModal for development */}
      {USER_IQ > 90 && state.user.societyUpgradeMessage && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
      {/* Render UpgradeModal */}
      {state.modal && (
        <ReadMoreNewsModal
          onClose={() => dispatch({ type: "showModal", payloadModal: false })}
        >
          <News />
        </ReadMoreNewsModal>
      )}
      {!state.show && <Timeline data={items} load={load} />}
      {load && <Loading />}
    </Box>
  );
};

export default Home;
