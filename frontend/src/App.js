import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

// import SimpleBar from "simplebar-react";
// import "simplebar/dist/simplebar.min.css";

import UserContext from "./context/userContext";

import "./App.scss";

import Navbar from "./components/Navbar/Navbar";
import AppInner from "./components/AppInner/AppInner";
import NewPost from "./pages/NewPostPage/NewPost";
import EditPost from "./pages/EditPost/EditPost";

// import TestComponent from "./components/TestComponent/TestComponent";
// import DnDMouseNTouch from "./components/DnDMouseNTouch/DnDMouseNTouch";

const App = () => {
  const [isAuth, setIsAuth] = useState(localStorage.getItem("isAuth") ? true : false);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  const [isLogoClicked, setIsLogoClicked] = useState(0);

  // componentDidMount
  // useEffect(() => {
  //   effect
  // }, [])

  // componentDidUpdate
  // useEffect(() => {
  //   effect
  // }, [input])

  // componentDidUpdate with cleaning fnc
  // useEffect(() => {
  //   effect
  //   return () => {
  //     cleaning
  //   };
  // }, [input])

  // componentWillUnmount
  // useEffect(() => {
  //   return () => {
  //     effect
  //   };
  // }, [])

  useEffect(() => {
    if (
      !localStorage.getItem("token") ||
      !localStorage.getItem("isAuth") ||
      !localStorage.getItem("expiryDate") ||
      !localStorage.getItem("user")
    ) {
      return logoutHandler();
    }
    // setIsAuth(localStorage.getItem("isAuth"));
    // setToken(localStorage.getItem("token"));
    // setUser(JSON.parse(localStorage.getItem("user")));
    setAutoLogoutHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth]);

  const logoutHandler = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("expiryDate");
    localStorage.removeItem("isAuth");
    localStorage.removeItem("user");
    setIsAuth(false);
    setToken(null);
    setUser(null);
    console.log("logouting");
  };

  const setAutoLogoutHandler = () => {
    const expiryDate = localStorage.getItem("expiryDate");
    const delayInms = new Date(new Date(expiryDate).getTime() - new Date());
    console.log(delayInms / 1000 / 60 + " min left");
    setTimeout(() => {
      logoutHandler();
    }, delayInms);
  };

  const logoClicked = () => {
    setIsLogoClicked(isLogoClicked + 1);
  };

  return (
    // <SimpleBar className="scrollbarContainer" data-simplebar-auto-hide="false">
    <UserContext.Provider
      value={{
        isAuth: isAuth,
        user: user,
        token: token,
        setIsAuth: setIsAuth,
        setUser: setUser,
        setToken: setToken,
        logoutHandler: logoutHandler
      }}
    >
      <BrowserRouter>
        <div className="app">
          <Navbar
            isAuth={isAuth}
            user={user}
            logoutHandler={logoutHandler}
            logoClicked={logoClicked}
          />

          <Switch>
            {/* <Route path="/test" component={TestComponent} /> */}
            {/* <Route path="/test" component={DnDMouseNTouch} /> */}

            {isAuth ? <Route exact path="/new-post" component={NewPost} /> : null}
            {isAuth ? <Route path="/edit/post/:postId" component={EditPost} /> : null}

            <Route
              path="/"
              render={props => (
                <AppInner {...props} logoutHandler={logoutHandler} isLogoClicked={isLogoClicked} />
              )}
            />
          </Switch>
        </div>
      </BrowserRouter>
    </UserContext.Provider>
    // </SimpleBar>
  );
};

export default App;
