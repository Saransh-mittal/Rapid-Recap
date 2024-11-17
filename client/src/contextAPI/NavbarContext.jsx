// // NavbarContext.js
// import React, { createContext, useContext, useRef } from 'react'

// const NavbarContext = createContext()

// export const NavbarProvider = ({ children }) => {
//   const isVisibleRef = useRef(true)

//   return (
//     <NavbarContext.Provider value={{ isVisibleRef }}>
//       {children}
//     </NavbarContext.Provider>
//   )
// }

// export const useNavbar = () => useContext(NavbarContext)

// NavbarContext.js
import { createContext, useContext, useState } from 'react'

export const NavbarContext = createContext()

export const NavbarProvider = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeLink, setActiveLink] = useState('/home/all')

  return (
    <NavbarContext.Provider
      value={{
        isMenuOpen,
        setIsMenuOpen,
        activeLink,
        setActiveLink,
      }}
    >
      {children}
    </NavbarContext.Provider>
  )
}

export const useNavbar = () => useContext(NavbarContext)
