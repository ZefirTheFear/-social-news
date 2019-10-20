import React, { useState, useEffect, useContext, useRef } from "react";

import UserContext from "../../context/userContext";

import "./ProfileSettings.scss";

const ProfileSettings = () => {
  const userContext = useContext(UserContext);

  const textarea = useRef();
  const inputEl = useRef();

  const [note, setNote] = useState(userContext.user.aboutMe);

  useEffect(() => {
    window.onresize = () => {
      if (textarea.current) {
        textarea.current.style.height = "auto";
        textarea.current.style.height = textarea.current.scrollHeight + "px";
      }
    };
    textarea.current.style.height = "auto";
    textarea.current.style.height = textarea.current.scrollHeight + "px";
  }, []);

  const clickImgInput = () => {
    inputEl.current.click();
  };

  const changeAvatarHandler = async e => {
    const formData = new FormData();
    formData.append("avatar", e.target.files[0]);
    e.target.value = null;
    try {
      const response = await fetch(`${window.domain}/users/change-avatar`, {
        headers: {
          Authorization: userContext.token
        },
        method: "POST",
        body: formData
      });
      console.log(response);
      if (response.status !== 200) {
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      console.log(resData);
      localStorage.setItem("user", JSON.stringify(resData));
      userContext.setUser(resData);
    } catch (error) {
      console.log(error);
      userContext.setIsError(true);
    }
  };

  const deleteAvatar = async () => {
    try {
      const response = await fetch(`${window.domain}/users/delete-avatar`, {
        headers: {
          Authorization: userContext.token
        },
        method: "PATCH"
      });
      if (response.status !== 200) {
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      console.log(resData);
      localStorage.setItem("user", JSON.stringify(resData));
      userContext.setUser(resData);
    } catch (error) {
      console.log(error);
      userContext.setIsError(true);
    }
  };

  const changeSexHandler = async e => {
    try {
      const response = await fetch(`${window.domain}/users/change-sex`, {
        headers: {
          Authorization: userContext.token
        },
        method: "PATCH",
        body: e.target.value
      });
      if (response.status !== 200) {
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      console.log(resData);
      localStorage.setItem("user", JSON.stringify(resData));
      userContext.setUser(resData);
    } catch (error) {
      console.log(error);
      userContext.setIsError(true);
    }
  };

  const onChangeNote = e => {
    setNote(e.target.value);
    textarea.current.style.height = "auto";
    textarea.current.style.height = e.currentTarget.scrollHeight + "px";
  };

  const saveNote = async () => {
    if (note.trim() === userContext.user.aboutMe) {
      return;
    }
    try {
      const response = await fetch(`${window.domain}/users/set-about-me-note`, {
        headers: {
          Authorization: userContext.token
        },
        method: "PATCH",
        body: note.trim()
      });
      if (response.status !== 200) {
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      console.log(resData);
      localStorage.setItem("user", JSON.stringify(resData));
    } catch (error) {
      console.log(error);
      userContext.setIsError(true);
    }
  };

  return (
    <div className="settings">
      <div className="settings__name">{userContext.user.name}</div>
      <div className="settings__image-block">
        <img
          className="settings__img"
          src={`${window.domain}/` + userContext.user.avatar}
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
