import React from "react";
import {
  Box,
  Image,
  Heading,
  Text,
  Skeleton,
  IconButton,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";

const ArticleCard = ({
  article,
  onClick,
  onRemove,
  isLoading,
  viewMode = "grid",
  height,
  width,
  cancelHoverEffect,
  showShareButton = false,
}) => {
  const CardContent = () => (
    <>
      <Heading fontSize="18px" mb="10px" color="#ffffff">
        {article.title}
      </Heading>
      <Text
        bg="#2a2438"
        color="#8e7cc3"
        display="inline-block"
        px="8px"
        py="3px"
        borderRadius="4px"
        fontSize="14px"
        mb="8px"
      >
        {article.category}
      </Text>
      <Text color="#a199b0" fontSize="14px">
        {article.date || new Date(article.createdAt).toLocaleDateString()}
      </Text>
    </>
  );

  if (viewMode === "list") {
    return (
      <Box
        as="article"
        display="flex"
        alignItems="center"
        p="10px"
        borderBottom="1px solid #2a2438"
        backgroundColor="#0f0d15"
        backgroundImage="linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)"
        boxShadow="0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)"
        width={width ? width : "80%"}
        margin="5px"
        borderRadius="8px"
        cursor={isLoading ? "default" : "pointer"}
        _hover={
          !cancelHoverEffect && {
            transform: isLoading ? "none" : "translateY(-5px)",
            transition: "transform 0.3s",
          }
        }
        onClick={isLoading ? undefined : onClick}
        position="relative"
      >
        {isLoading ? (
          <Skeleton
            width={{ base: "60px", md: "80px", lg: "90px", xl: "100px" }}
            height={{ base: "60px", md: "80px", lg: "90px", xl: "100px" }}
            borderRadius="4px"
            mr={{ base: "15px", md: "19px", lg: "22px", xl: "25px" }}
          />
        ) : (
          <Image
            src={article.image || "/images/rr.png"}
            alt={article.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/images/rr.png";
            }}
            width={{ base: "60px", md: "80px", lg: "90px", xl: "100px" }}
            height={{ base: "60px", md: "80px", lg: "90px", xl: "100px" }}
            objectFit="cover"
            mr={{ base: "15px", md: "19px", lg: "22px", xl: "25px" }}
            borderRadius="4px"
          />
        )}
        <Box>
          {isLoading ? (
            <>
              <Skeleton height="20px" mb="5px" width="150px" />
              <Skeleton height="15px" mb="5px" width="100px" />
              <Skeleton height="15px" width="100px" />
            </>
          ) : (
            <CardContent />
          )}
        </Box>
        {!isLoading && onRemove && (
          <IconButton
            icon={<CloseIcon />}
            aria-label="Remove article"
            position="absolute"
            top="5px"
            right="5px"
            size="sm"
            colorScheme="red"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(article._id);
            }}
          />
        )}
      </Box>
    );
  }

  return (
    <Box
      as="article"
      borderRadius="8px"
      overflow="hidden"
      backgroundColor="#0f0d15"
      backgroundImage="linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)"
      boxShadow="0px 4px 8px rgba(0, 0, 0, 0.3), 0px 8px 16px rgba(0, 0, 0, 0.3), 0px 12px 24px rgba(0, 0, 0, 0.3)"
      border="1px solid #2a2438"
      display="flex"
      flexDirection="column"
      cursor={isLoading ? "default" : "pointer"}
      _hover={
        !cancelHoverEffect && {
          transform: isLoading ? "none" : "translateY(-5px)",
          transition: "transform 0.3s",
        }
      }
      onClick={isLoading ? undefined : onClick}
      position="relative"
    >
      <Box position="relative" pt="56.25%" overflow="hidden">
        {isLoading ? (
          <Skeleton height="100%" width="100%" />
        ) : (
          <Image
            src={article.image || "/images/rr.png"}
            alt={article.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/images/rr.png";
            }}
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            objectFit="cover"
          />
        )}
      </Box>
      <Box p="15px">
        {isLoading ? (
          <>
            <Skeleton height="20px" mb="10px" />
            <Skeleton height="15px" mb="8px" />
            <Skeleton height="15px" />
          </>
        ) : (
          <CardContent />
        )}
      </Box>
      {!isLoading && onRemove && (
        <IconButton
          icon={<CloseIcon />}
          aria-label="Remove article"
          position="absolute"
          top="5px"
          right="5px"
          size="sm"
          colorScheme="red"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(article._id);
          }}
        />
      )}
    </Box>
  );
};

export default ArticleCard;
