import React, { useState, useContext } from "react";

import validator from "validator";

import UserContext from "../../context/userContext";

import "./Login.scss";

const Login = props => {
  const userContext = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const loginHandler = data => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("isAuth", "true");
    const remainingMilliseconds = 60 * 60 * 24 * 1000;
    const expiryDate = new Date(new Date().getTime() + remainingMilliseconds);
    localStorage.setItem("expiryDate", expiryDate);
    userContext.setUser(data.user);
    userContext.setToken(data.token);
    userContext.setIsAuth(true);
  };

  const changeInputValue = e => {
    if (e.target.name === "loginEmail") {
      setEmail(e.target.value);
    }
    if (e.target.name === "loginPassword") {
      setPassword(e.target.value);
    }
  };

  const logIn = async e => {
    e.preventDefault();

    const clientErrors = {};
    const normalizedEmail = validator.normalizeEmail(email);
    if (!validator.isEmail(normalizedEmail)) {
      clientErrors.email = {
        msg: "Введите email"
      };
    }

    if (password.length === 0) {
      clientErrors.password = {
        msg: "Введите пароль"
      };
    }

    if (Object.keys(clientErrors).length > 0) {
      return setErrors(clientErrors);
    }

    const userData = {
      email: email,
      password: password
    };

    try {
      const response = await fetch(`${window.domain}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      });
      console.log(response);
      if (response.status !== 200 && response.status !== 404 && response.status !== 422) {
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      console.log(resData);
      if (resData.errors) {
        setErrors(resData.errors);
        return;
      } else {
        if (props.hideLoginForm) {
          props.hideLoginForm();
        }
        loginHandler(resData);
        return;
      }
    } catch (error) {
      console.log(error);
      userContext.setIsError(true);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const focusEmail = () => {
    const newErrors = { ...errors };
    delete newErrors.email;
    setErrors(newErrors);
  };

  const focusPassword = () => {
    const newErrors = { ...errors };
    delete newErrors.password;
    setErrors(newErrors);
  };

  return (
    <div className="login">
      <div className="login__header">Авторизация</div>
      <form className="login__form" noValidate onSubmit={logIn}>
        <div className="input-group">
          <input
            type="email"
            className={"input" + (errors.email ? " input_invalid" : "")}
            placeholder="Email"
            name="loginEmail"
            value={email}
            onChange={changeInputValue}
            onFocus={focusEmail}
            autoComplete="off"
          />
          {errors.email ? <div className="input__invalid-feedback">{errors.email.msg}</div> : null}
        </div>
        <div className="input-group">
          <div className="input-group__password">
            <input
              type={!showPassword ? "password" : "text"}
              className={"input input__password" + (errors.password ? " input_invalid" : "")}
              placeholder="Password"
              name="loginPassword"
              value={password}
              onChange={changeInputValue}
              onFocus={focusPassword}
            />
            <div className="input-group__type-toggle">
              {!showPassword ? (
                <div
                  className="input-group__show-chars"
                  title="показать"
                  onClick={toggleShowPassword}
                />
              ) : (
                <div
                  className="input-group__hide-chars"
                  title="скрыть"
                  onClick={toggleShowPassword}
                />
              )}
            </div>
          </div>

          {errors.password ? (
            <div className="input__invalid-feedback">{errors.password.msg}</div>
          ) : null}
        </div>
        <button type="submit" className="login__form-button">
          Войти
        </button>
      </form>
      <div className="login__register" onClick={props.loginModeOff}>
        Регистрация
      </div>
    </div>
  );
};

export default Login;
