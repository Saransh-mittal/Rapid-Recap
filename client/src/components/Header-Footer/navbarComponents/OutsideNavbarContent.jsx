import { Button, Flex } from "@chakra-ui/react";
import React from "react";
import Inbox from "./Inbox";
import StreakFire from "./StreakFire";
import ProfileDropDownMenu from "../../profileComponents/ProfileDropDownMenu";
import { HamburgerIcon } from "@chakra-ui/icons";
import GetStarted from "./GetStarted";
import XPLevel from "./XPLevel";

const OutsideNavbarContent = ({
  setIsDrawerOpen,
  notifyCont,
  setShowDailyStreakModal,
  setShowXPLevelModal,
  tourComplete,
  streak,
  isBoosted,
  getBackgroundColor,
  notLogined,
  isHamburgerOpen,
  handleLogout,
  navLinkRefs,
  setIsHamburgerOpen,
  level,
}) => {
  return (
    <>
      <Flex
        gap={3}
        alignItems={"center"}
        display={isHamburgerOpen ? "none" : "flex"}
      >
        {/* Profile dropdown menu */}
        {notLogined && (
          <GetStarted
            display={{ base: "none", lg: "flex" }}
            innerText={"Get Started"}
          />
        )}
        {!notLogined && (
          <>
            <XPLevel
              level={level}
              _hover={{
                cursor: "pointer",
              }}
              className={"xp-level"}
              onClick={() => {
                setShowXPLevelModal(true);
              }}
            />{" "}
            <StreakFire
              marginAroundBox={"auto"}
              widthOfBox={"1.6em"}
              heightOfBox={"1.6em"}
              _hover={{
                cursor: "pointer",
                backgroundColor: "#0f0d15",
                backgroundImage:
                  "linear-gradient(-180deg, #1a1527, #0e0c16 88%, #0e0c16 99%)",
              }}
              className={"streak-tracker-lg"}
              onClick={() => {
                setShowDailyStreakModal(true);
                tourComplete();
              }}
              streak={streak}
              isBoosted={isBoosted}
              getBackgroundColor={getBackgroundColor}
            />
            <Inbox
              className={"inbox-button-lg"}
              onClick={() => setIsDrawerOpen(true)}
              notifyCont={notifyCont}
            />
          </>
        )}
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
        {!isHamburgerOpen ? (
          <>
            <Flex className="menu-button">
              <Button
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
                aria-controls="navbarNav"
                aria-label="Toggle navigation"
                display={{ base: "flex", lg: "none" }}
                onClick={() => setIsHamburgerOpen(true)}
                marginBottom={isHamburgerOpen ? "2rem" : "0"}
                // boxSize={2}
                height={"35px"}
                width={"10px"}
              >
                <HamburgerIcon height={"35px"} width={"20px"} />
              </Button>
            </Flex>
          </>
        ) : null}
      </Flex>
    </>
  );
};

export default OutsideNavbarContent;
