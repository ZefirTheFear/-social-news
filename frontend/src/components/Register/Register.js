import React, { useState, useContext } from "react";

import validator from "validator";

import UserContext from "../../context/userContext";

import "./Register.scss";

const Register = props => {
  const userContext = useContext(UserContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const changeInputValue = e => {
    if (e.target.name === "registerName") {
      setName(e.target.value);
    }
    if (e.target.name === "registerEmail") {
      setEmail(e.target.value);
    }
    if (e.target.name === "registerPassword") {
      setPassword(e.target.value);
    }
    if (e.target.name === "registerConfirmPassword") {
      setConfirmPassword(e.target.value);
    }
  };

  const registerUser = async e => {
    e.preventDefault();

    const clientErrors = {};
    if (!validator.isLength(name, { min: 1, max: 15 })) {
      clientErrors.name = {
        msg: "Надо от 1 до 15 символов"
      };
    }
    const normalizedEmail = validator.normalizeEmail(email);
    if (!validator.isEmail(normalizedEmail)) {
      clientErrors.email = {
        msg: "Введите email"
      };
    }
    if (validator.isAlphanumeric(password)) {
      clientErrors.password = {
        msg: "Минимум 1 спецсимвол и 1 заглавный символ"
      };
    }
    if (validator.isLowercase(password)) {
      clientErrors.password = {
        msg: "Минимум 1 спецсимвол и 1 заглавный символ"
      };
    }
    if (password !== confirmPassword) {
      clientErrors.confirmPassword = {
        msg: "Пароль должен совпадать"
      };
    }

    if (Object.keys(clientErrors).length > 0) {
      return setErrors(clientErrors);
    }

    const newUserData = {
      name: name,
      email: email,
      password: password,
      confirmPassword: confirmPassword
    };

    try {
      const response = await fetch(`${window.domain}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newUserData)
      });
      console.log(response);
      if (response.status !== 201 && response.status !== 422) {
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      console.log(resData);
      if (resData.errors) {
        setErrors(resData.errors);
        return;
      } else {
        props.loginModeOn();
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

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const focusName = () => {
    const newErrors = { ...errors };
    delete newErrors.name;
    setErrors(newErrors);
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

  const focusConfirmPassword = () => {
    const newErrors = { ...errors };
    delete newErrors.confirmPassword;
    setErrors(newErrors);
  };

  return (
    <div className="register">
      <div className="register__header">Регистрация</div>
      <form className="register__form" noValidate onSubmit={registerUser}>
        <div className="input-group">
          <input
            className={"input" + (errors.name ? " input_invalid" : "")}
            placeholder="Имя"
            name="registerName"
            value={name}
            onChange={changeInputValue}
            onFocus={focusName}
            autoComplete="off"
          />
          {errors.name ? <div className="input__invalid-feedback">{errors.name.msg}</div> : null}
        </div>
        <div className="input-group">
          <input
            type="email"
            className={"input" + (errors.email ? " input_invalid" : "")}
            placeholder="Email"
            name="registerEmail"
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
              placeholder="Пароль"
              name="registerPassword"
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
        <div className="input-group">
          <div className="input-group__password">
            <input
              type={!showConfirmPassword ? "password" : "text"}
              className={"input input__password" + (errors.confirmPassword ? " input_invalid" : "")}
              placeholder="Повторите пароль"
              name="registerConfirmPassword"
              value={confirmPassword}
              onChange={changeInputValue}
              onFocus={focusConfirmPassword}
            />
            <div className="input-group__type-toggle">
              {!showConfirmPassword ? (
                <div
                  className="input-group__show-chars"
                  title="показать"
                  onClick={toggleShowConfirmPassword}
                />
              ) : (
                <div
                  className="input-group__hide-chars"
                  title="скрыть"
                  onClick={toggleShowConfirmPassword}
                />
              )}
            </div>
          </div>
          {errors.confirmPassword ? (
            <div className="input__invalid-feedback">{errors.confirmPassword.msg}</div>
          ) : null}
        </div>
        <button type="submit" className="register__form-button">
          Создать аккаунт
        </button>
      </form>
      <div className="register__login" onClick={props.loginModeOn}>
        Авторизация
      </div>
    </div>
  );
};

export default Register;
