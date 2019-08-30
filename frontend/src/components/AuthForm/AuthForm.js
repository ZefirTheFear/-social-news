import React, { useState } from "react";

import "./AuthForm.scss";

import Login from "../Login/Login";
import Register from "../Register/Register";

const AuthForm = props => {
  const [loginMode, setLoginMode] = useState(true);

  const loginModeOn = () => {
    setLoginMode(true);
  };

  const loginModeOff = () => {
    setLoginMode(false);
  };

  return (
    <div className="auth-form">
      {loginMode ? (
        <Login loginModeOff={loginModeOff} hideLoginForm={props.hideLoginForm} />
      ) : (
        <Register loginModeOn={loginModeOn} hideLoginForm={props.hideLoginForm} />
      )}
    </div>
  );
};

export default AuthForm;
