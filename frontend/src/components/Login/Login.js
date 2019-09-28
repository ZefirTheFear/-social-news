import React, { useState, useContext } from "react";

import validator from "validator";

import "./Login.scss";

import UserContext from "../../context/userContext";

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
    userContext.setIsAuth(true); // в последнюю очередь, т.к. на смене IsAuth срабатывает триггер на ререндер и не будет ждать остальных изменений (хотя они и были бы сразу после)
  };

  const onChange = e => {
    if (e.target.name === "loginEmail") {
      setEmail(e.target.value);
    }
    if (e.target.name === "loginPassword") {
      setPassword(e.target.value);
    }
  };

  const logIn = e => {
    e.preventDefault();

    const clientErrors = {};
    const normalizedEmail = validator.normalizeEmail(email);
    if (!validator.isEmail(normalizedEmail)) {
      clientErrors.email = {
        msg: "Введите email"
      };
    }

    if (Object.keys(clientErrors).length > 0) {
      return setErrors(clientErrors);
    }

    const userData = {
      email: email,
      password: password
    };

    fetch("http://localhost:5001/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    })
      .then(res => {
        console.log(res);
        if (res.status === 200 || res.status === 422 || res.status === 404) {
          return res.json();
        } else {
          // TODO вывести UI , что что-то пошло не так
          console.log("что что-то пошло не так");
          return;
        }
      })
      .then(resData => {
        if (!resData) {
          return;
        }
        console.log(resData);
        if (resData.errors) {
          setErrors(resData.errors);
        } else {
          loginHandler(resData);
          if (props.hideLoginForm) {
            props.hideLoginForm();
          }
        }
      })
      .catch(err => console.log(err));
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
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
            onChange={onChange}
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
              onChange={onChange}
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
