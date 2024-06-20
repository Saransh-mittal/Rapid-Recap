import { Box, Flex } from "@chakra-ui/react";
import ButtonGradient from "../../assets/svg/ButtonGradient";
import { useEffect } from "react";
import Button from "../miscellaneous/ButtonComponent";

const Categories = ({
  activeCategory,
  handleActiveCategory,
  categories,
  setActiveCategoryIndex,
  categoryRefs,
  trackCategoryClick,
}) => {
  useEffect(() => {
    const activeCategoryRef = categoryRefs.current.find(
      (ref) =>
        ref &&
        ref.textContent.trim().toLowerCase() === activeCategory.toLowerCase()
    );
    if (activeCategoryRef) {
      activeCategoryRef.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeCategory, categoryRefs]);

  return (
    <Box
      paddingInline={{ base: 0, lg: "10%" }}
      paddingTop={{ base: "5%", lg: "15%" }}
      className="categories-container"
    >
      <Flex
        flexDirection={{ base: "row", lg: "column" }}
        w={"100%"}
        alignItems={"center"}
        paddingBottom={{ base: "1.5rem", lg: "8rem" }}
      >
        <ButtonGradient />
        {/* <Heading as={"h4"} fontSize={"1.75rem"} marginBottom={"2rem"}>
          Categories
        </Heading> */}
        <Flex flexDirection={{ base: "row", lg: "column" }} gap={4}>
          {categories.map((category, idx) => (
            <Button
              ref={(el) => (categoryRefs.current[idx] = el)}
              key={idx}
              white={
                category.toLocaleLowerCase() ===
                activeCategory.toLocaleLowerCase()
                  ? true
                  : false
              }
              onClick={() => {
                setActiveCategoryIndex(idx);
                trackCategoryClick(category);
                handleActiveCategory({ category });
              }}
            >
              {" "}
              {category}{" "}
            </Button>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Categories;
