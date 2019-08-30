import React, { useState } from "react";

import "./Register.scss";

const Register = props => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onChange = e => {
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

  const onSubmit = e => {
    e.preventDefault();
    const newUserData = {
      name: name,
      email: email,
      password: password,
      confirmPassword: confirmPassword
    };

    fetch("http://localhost:5001/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newUserData)
    })
      .then(res => {
        console.log(res);
        if (res.status === 201 || res.status === 422) {
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
          return;
        } else {
          props.loginModeOn();
        }
      })
      .catch(err => console.log(err));
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="register">
      <div className="register__header">Регистрация</div>
      <form className="register__form" noValidate onSubmit={onSubmit}>
        <div className="input-group">
          <input
            className={"input" + (errors.name ? " input_invalid" : "")}
            placeholder="Name"
            name="registerName"
            value={name}
            onChange={onChange}
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
              name="registerPassword"
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
        <div className="input-group">
          <div className="input-group__password">
            <input
              type={!showConfirmPassword ? "password" : "text"}
              className={"input input__password" + (errors.confirmPassword ? " input_invalid" : "")}
              placeholder="Confirm Password"
              name="registerConfirmPassword"
              value={confirmPassword}
              onChange={onChange}
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
