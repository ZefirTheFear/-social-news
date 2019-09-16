import React, { useState, useEffect, useContext, useRef } from "react";

import UserContext from "../../context/userContext";

import "./ProfileSettings.scss";

const ProfileSettings = () => {
  const userContext = useContext(UserContext);

  const textarea = useRef();
  const inputEl = useRef();

  const [note, setNote] = useState(userContext.user.aboutMe);

  useEffect(() => {
    textarea.current.style.height = "auto";
    textarea.current.style.height = textarea.current.scrollHeight + "px";
  }, []);

  const clickImgInput = () => {
    inputEl.current.click();
  };

  const changeAvatarHandler = e => {
    const formData = new FormData();
    formData.append("avatar", e.target.files[0]);
    fetch("http://localhost:5001/users/change-avatar", {
      headers: {
        Authorization: userContext.token
      },
      method: "POST",
      body: formData
    })
      .then(res => {
        console.log(res);
        if (res.status === 200) {
          return res.json();
        } else {
          // TODO вывести UI , что что-то пошло не так
          console.log("что что-то пошло не так");
          return;
        }
      })
      .then(resData => {
        console.log(resData);
        localStorage.setItem("user", JSON.stringify(resData));
        userContext.setUser(resData);
      })
      .catch(err => console.log(err));
    e.target.value = null;
  };

  const deleteAvatar = () => {
    fetch("http://localhost:5001/users/delete-avatar", {
      headers: {
        Authorization: userContext.token
      },
      method: "PATCH"
    })
      .then(res => {
        console.log(res);
        if (res.status === 200) {
          return res.json();
        } else {
          // TODO вывести UI , что что-то пошло не так
          console.log("что что-то пошло не так");
          return;
        }
      })
      .then(resData => {
        console.log(resData);
        localStorage.setItem("user", JSON.stringify(resData));
        userContext.setUser(resData);
      })
      .catch(err => console.log(err));
  };

  const changeSexHandler = e => {
    console.log(e.target.value);
    fetch("http://localhost:5001/users/change-sex", {
      headers: {
        Authorization: userContext.token
      },
      method: "PATCH",
      body: e.target.value
    })
      .then(res => {
        console.log(res);
        if (res.status === 200) {
          return res.json();
        } else {
          // TODO вывести UI , что что-то пошло не так
          console.log("что что-то пошло не так");
          return;
        }
      })
      .then(resData => {
        console.log(resData);
        localStorage.setItem("user", JSON.stringify(resData));
        userContext.setUser(resData);
      })
      .catch(err => console.log(err));
  };

  const onChangeNote = e => {
    setNote(e.target.value);
    textarea.current.style.height = "auto";
    textarea.current.style.height = e.currentTarget.scrollHeight + "px";
  };

  const saveNote = () => {
    if (note.trim() === userContext.user.aboutMe) {
      return;
    }
    fetch(`http://localhost:5001/users/set-about-me-note`, {
      headers: {
        Authorization: userContext.token
      },
      method: "PATCH",
      body: note.trim()
    })
      .then(res => {
        if (res.status === 200) {
          return res.json();
        } else {
          // TODO вывести UI , что что-то пошло не так
          console.log("что что-то пошло не так");
          return;
        }
      })
      .then(resData => {
        console.log(resData);
        localStorage.setItem("user", JSON.stringify(resData));
      })
      .catch(error => console.log(error));
  };

  return (
    <div className="settings">
      <div className="settings__name">{userContext.user.name}</div>
      <div className="settings__image-block">
        <img
          className="settings__img"
          src={"http://localhost:5001/" + userContext.user.avatar}
          alt="ava"
        />
        <button
          className="settings__change-img-btn"
          title="сменить аватарку"
          onClick={clickImgInput}
        ></button>
        {userContext.user.avatar !== "uploads/avatars/default_avatar.png" ? (
          <button
            className="settings__delete-img-btn"
            title="удалить аватарку"
            onClick={deleteAvatar}
          ></button>
        ) : null}
      </div>
      <div className="settings__sex">
        <div className="settings__label">Пол</div>
        <select
          name="sex"
          className="settings__sex-selector"
          onChange={changeSexHandler}
          value={userContext.user.sex}
        >
          <option value="nd">не указано</option>
          <option value="m">мужской</option>
          <option value="w">женский</option>
        </select>
      </div>
      <div className="settings__about-me">
        <div className="settings__label">О себе</div>
        <textarea
          className="settings__about-me-textarea"
          value={note}
          rows="1"
          onChange={onChangeNote}
          onBlur={saveNote}
          placeholder="Не более 250 символов."
          ref={textarea}
        />
      </div>
      <input type="file" accept="image/*" hidden onChange={changeAvatarHandler} ref={inputEl} />
    </div>
  );
};

export default ProfileSettings;
