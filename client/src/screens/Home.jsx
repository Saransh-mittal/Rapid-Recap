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
import { Helmet } from "react-helmet-async";

const Home = () => {
  const { state, dispatch } = useContext(AppContext);
  let notLoggedIn = state.show;

  const [items, setItems] = useState(state.items);
  const [page, setPage] = useState(state.page + 1);
  const toast = useToast();
  const [load, setLoad] = useState(true);
  const { startDrag, drag, endDrag } = useDrag();
  const navigate = useNavigate();
  const { category } = useParams();
  const [showUpgradeModal, setShowUpgradeModal] = useState(true);
  const [hasMoreItems, setHasMoreItems] = useState(true); // Flag to check if there are more items

  const USER_IQ = state.user?.IQ_score ?? null;

  async function fetchData() {
    if (!hasMoreItems) {
      setLoad(false);
      return; // Exit if no more items to load
    }

    try {
      const response =
        category === "all"
          ? await axios.get(`/api/recommendation?page=${page}&pageSize=9`)
          : await axios.get(
              `/api/articles?page=${page}&pageSize=9&category=${
                category ? category : "general"
              }`
            );

      const newItems = response.data;
      if (newItems.length === 0) {
        setHasMoreItems(false); // Set flag if no more items
      } else {
        dispatch({ type: "PAGE", payloadPage: page - 1 });
        dispatch({
          type: "ITEMS",
          payloadItems: [...state.items, ...newItems],
        });
        setItems((prev) => [...state.items, ...newItems]);
      }
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
          document.documentElement.scrollHeight &&
        hasMoreItems // Check if there are more items to load
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
  }, [state.show]);

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
      <Helmet>
        <title>Home - Rapid Recap</title>
        <meta
          name="description"
          content="Explore the latest news and articles on Rapid Recap. Stay informed and test your knowledge with our engaging quizzes."
        />
        <meta
          name="keywords"
          content="Rapid Recap, news, articles, quizzes, Information Quotient, IQ score"
        />
        <meta property="og:title" content="Home - Rapid Recap" />
        <meta
          property="og:description"
          content="Explore the latest news and articles on Rapid Recap. Stay informed and test your knowledge with our engaging quizzes."
        />
      </Helmet>
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
      <Timeline
        setHasMoreItems={setHasMoreItems}
        hasMoreItems={hasMoreItems}
        data={items}
        load={load}
      />
    </Box>
  );
};

export default Home;
