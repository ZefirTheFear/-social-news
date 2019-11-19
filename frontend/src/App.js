import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import UserContext from "./context/userContext";

import "./App.scss";

import Navbar from "./components/Navbar/Navbar";
import AppInner from "./components/AppInner/AppInner";
import NewPost from "./components/NewPost/NewPost";
import SomethingWentWrong from "./components/SomethingWentWrong/SomethingWentWrong";
import NotFound from "./components/NotFound/NotFound";

const App = () => {
  const [isAuth, setIsAuth] = useState(localStorage.getItem("isAuth") ? true : false);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  const [isLogoClicked, setIsLogoClicked] = useState(null);
  const [isError, setIsError] = useState(false);
  const [isPageNotFound, setIsPageNotFound] = useState(false);

  window.domain = "";

  useEffect(() => {
    console.log(
      "%c+",
      `font-size: 1px; padding: 150px 87px; line-height: 0; background: url(https://res.cloudinary.com/ztf/image/upload/v1573314232/social-news/general/console.png); background-size: 175px 300px; color: transparent; background-repeat: no-repeat;`
    );
    if (
      !localStorage.getItem("token") ||
      !localStorage.getItem("isAuth") ||
      !localStorage.getItem("expiryDate") ||
      !localStorage.getItem("user")
    ) {
      return logoutHandler();
    }
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
  };

  const setAutoLogoutHandler = () => {
    const expiryDate = localStorage.getItem("expiryDate");
    const delayInms = new Date(new Date(expiryDate).getTime() - new Date());
    setTimeout(() => {
      logoutHandler();
    }, delayInms);
  };

  const logoClicked = () => {
    setIsLogoClicked(Date.now());
  };

  return (
    <UserContext.Provider
      value={{
        isAuth: isAuth,
        user: user,
        token: token,
        setIsAuth: setIsAuth,
        setUser: setUser,
        setToken: setToken,
        logoutHandler: logoutHandler,
        setIsError: setIsError,
        setIsPageNotFound: setIsPageNotFound
      }}
    >
      <BrowserRouter>
        <div className="app">
          {isError ? (
            <SomethingWentWrong />
          ) : isPageNotFound ? (
            <NotFound />
          ) : (
            <>
              <Navbar
                isAuth={isAuth}
                user={user}
                logoutHandler={logoutHandler}
                logoClicked={logoClicked}
              />
              <Switch>
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
  );
};

export default App;
