import { Flex } from "@chakra-ui/react";
import React from "react";
import Inbox from "./Inbox";
import StreakFire from "./StreakFire";
import ProfileDropDownMenu from "../../profileComponents/ProfileDropDownMenu";

const OutsideNavbarContent = ({
  setIsDrawerOpen,
  notifyCont,
  setShowDailyStreakModal,
  tourComplete,
  streak,
  isBoosted,
  getBackgroundColor,
  notLogined,
  isHamburgerOpen,
  handleLogout,
  navLinkRefs,
}) => {
  return (
    <>
      <Flex gap={3}>
        <Inbox
          className={"inbox-button-lg"}
          display={{ base: "none", lg: "flex" }}
          onClick={() => setIsDrawerOpen(true)}
          notifyCont={notifyCont}
        />
        {/* Profile dropdown menu */}
        <StreakFire
          marginAroundBox={"auto"}
          widthOfBox={{ base: "1.2rem", lg: "1.6em" }}
          heightOfBox={{ base: "1.2rem", lg: "1.6em" }}
          _hover={{
            cursor: "pointer",
            backgroundColor: "#0f0d15",
            backgroundImage:
              "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
          }}
          display={{ base: "none", lg: "flex" }}
          className={"streak-tracker-lg"}
          onClick={() => {
            setShowDailyStreakModal(true);
            tourComplete();
          }}
          streak={streak}
          isBoosted={isBoosted}
          getBackgroundColor={getBackgroundColor}
        />
        {!notLogined && !isHamburgerOpen ? (
          <Flex display={{ base: "none", lg: "flex" }}>
            <ProfileDropDownMenu
              className="profile-dropdown-lg"
              handleLogout={handleLogout}
              toProfile={"/profile"}
              refProfile={(ref) => (navLinkRefs.current[4] = ref)}
            />
          </Flex>
        ) : null}
      </Flex>
    </>
  );
};

export default OutsideNavbarContent;
