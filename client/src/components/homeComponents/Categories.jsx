import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import { categories } from "../../assets/Categories";
import CategoryButton from "./CategoryButton";
import ButtonGradient from "../../assets/svg/ButtonGradient";
import { AppContext } from "../../contextAPI/appContext";
import ReactGA from "react-ga4"; // Import Google Analytics library
import { useNavigate } from "react-router-dom";

const Categories = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useContext(AppContext);

  const [activeCategory, setActiveCategory] = useState(state.category);

  const trackCategoryClick = (category) => {
    ReactGA.send({
      hitType: "event",
      eventCategory: "Category Click",
      eventAction: "Click",
      eventLabel: category, // Track the category that was clicked
    });
  };
  const handleActiveCategory = (category) => {
    setActiveCategory(category.toLowerCase());
    dispatch({
      type: "category",
      payloadCategory: category.toLowerCase(),
    });
    dispatch({ type: "PAGE", payloadPage: 0 });
    dispatch({ type: "ITEMS", payloadItems: [] });
  };
  return (
    <Box paddingInline={"10%"} paddingTop={"15%"}>
      <Flex
        flexDirection={"column"}
        w={"100%"}
        alignItems={"center"}
        paddingBottom={"8rem"}
      >
        <ButtonGradient />
        {/* <Heading as={"h4"} fontSize={"1.75rem"} marginBottom={"2rem"}>
          Categories
        </Heading> */}
        <Flex flexDirection={"column"} gap={4}>
          {categories.map((category, idx) => (
            <CategoryButton
              key={idx}
              white={
                category.toLocaleLowerCase() ===
                activeCategory.toLocaleLowerCase()
                  ? true
                  : false
              }
              onClick={() => {
                trackCategoryClick(category);
                handleActiveCategory(category);
                navigate(`/home/${category.toLowerCase()}`);
              }}
            >
              {" "}
              {category}{" "}
            </CategoryButton>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Categories;
