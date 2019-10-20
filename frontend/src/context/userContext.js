import React from "react";

export default React.createContext({
  isAuth: false,
  user: null,
  token: null,
  setIsAuth: () => {},
  setUser: () => {},
  setToken: () => {},
  logoutHandler: () => {},
  setIsError: () => {}
});
