import React, { useContext, useEffect, useState } from "react";
import Timeline from "../components/homeComponents/Timeline";
import axios from "axios";
import { AppContext } from "../contextAPI/appContext";
import { useNavigate, useParams } from "react-router-dom";
import useDrag from "../customHooks/useDrag";
import { debounce } from "lodash";
import { useToast, Box } from "@chakra-ui/react";
import UpgradeModal from "../components/homeComponents/UpgradeModal";
import NotificationSubscription from "../components/Notifications/NotificationSubscription";
import ReadMoreNewsModal from "../components/articleComponents/ReadMoreNewsModal";

const Home = () => {
  const { state, dispatch } = useContext(AppContext);
  const notLoggedIn = state.show;
  const [items, setItems] = useState(state.items);
  const [page, setPage] = useState(state.page + 1);
  const toast = useToast();
  const [load, setLoad] = useState(true);
  const { startDrag, drag, endDrag } = useDrag();
  const navigate = useNavigate();
  const { category } = useParams();
  const [showUpgradeModal, setShowUpgradeModal] = useState(true);

  const USER_IQ = state.user?.IQ_score ?? null;

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
        !notLoggedIn &&
        window.innerHeight + document.documentElement.scrollTop + 1000 >
          document.documentElement.scrollHeight
      ) {
        setLoad(true);
        setPage((ele) => ele + 1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const debouncedHandleScroll = debounce(handleScroll, 300);

  useEffect(() => {
    document.title = "Home Page";
    if (!category || category === "") {
      navigate("/home/general");
    }

    dispatch({ type: "homeInitialRender" });
    window.addEventListener("scroll", debouncedHandleScroll);

    dispatch({ type: "setNews", payloadNews: {} });

    return () => window.removeEventListener("scroll", debouncedHandleScroll);
  }, []);

  useEffect(() => {
    if (!state.modal) dispatch({ type: "setNews", payloadNews: {} });
  }, [state.modal]);

  useEffect(() => {
    if (items.length < page * 9) {
      fetchData();
    } else setLoad(false);
  }, [page]);

  useEffect(() => {
    //if (!notLoggedIn) {
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
    //}
  }, [state.items, state.page, state.category]);

  const isSupported = () =>
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  return (
    <Box marginTop={"4rem"} w={"100%"}>
      {!state.show && isSupported() ? <NotificationSubscription /> : null}
      {!state.show && USER_IQ > 90 && state.user.societyUpgradeMessage && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
      {state.modal && (
        <ReadMoreNewsModal
          onClose={() => dispatch({ type: "showModal", payloadModal: false })}
        ></ReadMoreNewsModal>
      )}
      <Timeline data={items} load={load} />
    </Box>
  );
};

export default Home;
