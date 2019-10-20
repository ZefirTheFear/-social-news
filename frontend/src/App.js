import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

// import SimpleBar from "simplebar-react";
// import "simplebar/dist/simplebar.min.css";

import UserContext from "./context/userContext";

import "./App.scss";

import Navbar from "./components/Navbar/Navbar";
import AppInner from "./components/AppInner/AppInner";
import NewPost from "./components/NewPost/NewPost";
import SomethingWentWrong from "./components/SomethingWentWrong/SomethingWentWrong";

// import TestComponent from "./components/TestComponent/TestComponent";
// import DnDMouseNTouch from "./components/DnDMouseNTouch/DnDMouseNTouch";

const App = () => {
  const [isAuth, setIsAuth] = useState(localStorage.getItem("isAuth") ? true : false);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  // const [isAuth, setIsAuth] = useState(false);
  // const [token, setToken] = useState(null);
  // const [user, setUser] = useState(null);

  const [isLogoClicked, setIsLogoClicked] = useState(null);
  const [isError, setIsError] = useState(false);

  window.domain = "http://localhost:5001";

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
    // console.log(
    //   "%c+",
    //   `font-size: 1px; padding: 150px 87px; line-height: 0; background: url(${window.domain}/uploads/general/dev.png); background-size: 175px 300px; color: transparent; background-repeat: no-repeat;`
    // );
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
    setIsLogoClicked(Date.now());
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
        logoutHandler: logoutHandler,
        setIsError: setIsError
      }}
    >
      <BrowserRouter>
        <div className="app">
          {isError ? (
            <SomethingWentWrong />
          ) : (
            <>
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
                {isAuth ? (
                  <Route
                    path="/edit/post/:postId"
                    render={props => <NewPost {...props} editMode={true} />}
                  />
                ) : null}

                <Route
                  path="/"
                  render={props => (
                    <AppInner
                      {...props}
                      isAuth={isAuth}
                      logoutHandler={logoutHandler}
                      isLogoClicked={isLogoClicked}
                    />
                  )}
                />
              </Switch>
            </>
          )}
        </div>
      </BrowserRouter>
    </UserContext.Provider>
    // </SimpleBar>
  );
};

export default App;
