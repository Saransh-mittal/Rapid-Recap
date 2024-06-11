// import { useContext } from "react";
import { useRef, useContext, useEffect, useState } from "react";
import { AppContext } from "../../contextAPI/appContext";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Box,
  Image,
  Text,
  Button,
  Flex,
} from "@chakra-ui/react";
// import News from "./News";
import { Link, useNavigate } from "react-router-dom";
import imageData from "../../assets/AltNewsImage";

const ReadMoreNewsModal = ({ onClose }) => {
  const [isMobile, setIsMobile] = useState(false);
  const { state, dispatch } = useContext(AppContext);
  const data = state.news;
  const altImage = imageData.find(
    (img) =>
      img.category.toLocaleLowerCase() === data.category.toLocaleLowerCase()
  )?.image;
  const navigate = useNavigate();

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    }
  }, [window.innerWidth]);

  useEffect(() => {
    if (isMobile) {
      dispatch({ type: "showModal", payloadModal: false });
      navigate(`/article/${data._id}`);
    }
  }, [isMobile, data._id]);

  if (isMobile) {
    return null; // Prevent rendering the News component if redirecting
  }

  return (
    <Modal isOpen onClose={onClose}>
      <ModalOverlay />
      <ModalContent
        // className="d-flex justify-content-center flex-column align-items-center"
        backgroundColor="#1a1a2e"
        maxW="75vw"
      >
        <ModalCloseButton color={"white"} border={"ActiveBorder"} />
        <ModalBody>
          <Box
            display="flex"
            justifyContent="center"
            flexDirection="column"
            alignItems="center"
            backgroundColor="#1a1a2e"
            color="#253547"
            minHeight="90vh"
          >
            <Image
              src={data.imgURL ? data.imgURL : altImage}
              w="92%"
              mt="1rem"
              maxW="75vh"
              //   minW={"50vh"}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = altImage;
              }}
            />
            <Box w="92%">
              <Text
                mt={3}
                mb={3}
                color="#f0f0f0"
                textAlign="center"
                maxW="150vh"
                as="h1"
              >
                {data.title}
              </Text>
              <Text mb={2} color="#f0f0f0" textAlign="center" maxW="150vh">
                {data.mainText.length > 1000
                  ? `${data.mainText.substring(0, 1000)}...`
                  : data.mainText}
              </Text>
              <Link to={`/article/${data._id}`}>
                <Flex w={"100%"} justifyContent={"center"}>
                  <Button
                    mb={2}
                    _hover={{ backgroundColor: "#37474f", color: "#f0f0f0" }}
                    maxW="100%"
                    transition="background-color 0.3s, color 0.3s"
                    boxShadow="0 0 10px 5px rgba(255, 255, 255, 0.7)"
                    onClick={() =>
                      dispatch({ type: "showModal", payloadModal: false })
                    }
                  >
                    Read More
                  </Button>
                </Flex>
              </Link>
            </Box>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ReadMoreNewsModal;
