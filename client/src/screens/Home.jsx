import React, { useContext, useEffect, useState } from "react";
import Timeline from "../components/homeComponents/Timeline";
import axios from "axios";
import Loading from "../components/miscellaneous/Loading";
import { AppContext } from "../contextAPI/appContext";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "./Modal";
import News from "../components/articleComponents/News";
import useDrag from "../customHooks/useDrag";
import { debounce } from "lodash";
import { useToast, Flex } from "@chakra-ui/react";

const Home = () => {
  const { state, dispatch } = useContext(AppContext);
  const [items, setItems] = useState(state.items);
  const [page, setPage] = useState(state.page + 1);
  const toast = useToast();
  const [load, setLoad] = useState(true);
  const { startDrag, drag, endDrag } = useDrag();
  const navigate = useNavigate();
  const { category } = useParams();
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
        document.documentElement.scrollHeight
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
    }
  };
  useEffect(() => {
    handleLoginAlert();
  }, [state.show]);
  const debouncedHandleScroll = debounce(handleScroll, 300);
  useEffect(() => {
    if (!state.show) {
      //setInitialRender(false);
      if (!category || category === "") {
        navigate("/general");
      }
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
        dispatch({ type: "category", payloadCategory: category });
        dispatch({ type: "PAGE", payloadPage: 0 });
        dispatch({
          type: "ITEMS",
          payloadItems: [],
        });
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
          }, 0);
      }
    }
  }, [state.items, state.page, state.category]);

  return (
    <Flex
      onTouchStart={startDrag}
      onTouchMove={(e) => drag(e.touches[0])}
      onTouchEnd={endDrag}
      marginTop={"4rem"}
    >
      {state.modal && (
        <Modal
          onClose={() => dispatch({ type: "showModal", payloadModal: false })}
        >
          <News />
        </Modal>
      )}
      {!state.show && <Timeline data={items} />}
      {load && <Loading />}
    </Flex>
  );
};

export default Home;
