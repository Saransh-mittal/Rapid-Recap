import {
  Box,
  Image,
  Flex,
  Text,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";
import notification1 from "../../assets/notification/image-1.png";
import notification2 from "../../assets/notification/image-2.png";
import notification3 from "../../assets/notification/image-3.png";
import notification4 from "../../assets/notification/image-4.png";

const notificationImages = [notification4, notification3, notification2];

const Notification = ({ className, title }) => {
  return (
    <Flex
      className={className}
      p={4}
      pr={6}
      bg="rgba(0,0,0,0.4)"
      backdropFilter="blur(10px)"
      border="1px solid rgba(0,0,0,0.1)"
      rounded="2xl"
      gap={5}
      alignItems="center"
    >
      <Image
        src={notification1}
        width={62}
        height={62}
        alt="image"
        rounded="xl"
      />

      <Box flex="1">
        <Text mb={1} fontWeight="semibold" fontSize="base">
          {title}
        </Text>

        <Flex alignItems="center" justifyContent="space-between">
          <UnorderedList display="flex" m="-0.5" styleType="none">
            {notificationImages.map((item, index) => (
              <ListItem
                key={index}
                w={6}
                h={6}
                border="2px solid rgba(0,0,0,0.12)"
                rounded="full"
                overflow="hidden"
                mx="0.5"
              >
                <Image
                  src={item}
                  width={20}
                  height={20}
                  alt={`notification-${index}`}
                />
              </ListItem>
            ))}
          </UnorderedList>
          <Text fontSize="sm" color="gray.500">
            1m ago
          </Text>
        </Flex>
      </Box>
    </Flex>
  );
};

export default Notification;
