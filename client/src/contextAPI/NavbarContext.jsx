// NavbarContext.js
import React, { createContext, useContext, useRef } from 'react'

const NavbarContext = createContext()

export const NavbarProvider = ({ children }) => {
  const isVisibleRef = useRef(true)

  return (
    <NavbarContext.Provider value={{ isVisibleRef }}>
      {children}
    </NavbarContext.Provider>
  )
}

export const useNavbar = () => useContext(NavbarContext)
