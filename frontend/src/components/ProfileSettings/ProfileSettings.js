import React, { useState, useEffect, useContext, useRef } from "react";

import Loading from "../Loading/Loading";

import UserContext from "../../context/userContext";

import "./ProfileSettings.scss";

const ProfileSettings = () => {
  const userContext = useContext(UserContext);

  const textarea = useRef();
  const inputEl = useRef();

  const [note, setNote] = useState(userContext.user.aboutMe);
  const [isNeedToWait, setIsNeedToWait] = useState(false);

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

  const changeAvatarHandler = async (e) => {
    setIsNeedToWait(true);
    const avatar = {};
    try {
      document.body.style.cursor = "wait";
      const data = new FormData();
      data.append("file", e.target.files[0]);
      data.append("upload_preset", "avatars");
      const response = await fetch("https://api.cloudinary.com/v1_1/ztf/upload", {
        method: "POST",
        body: data,
      });
      const resData = await response.json();
      avatar.url = resData.secure_url;
      avatar.public_id = resData.public_id;
      document.body.style.cursor = "";
    } catch (error) {
      document.body.style.cursor = "";
      userContext.setIsError(true);
    }

    try {
      document.body.style.cursor = "wait";
      const data = new FormData();
      console.log(avatar);
      data.append("avatar", JSON.stringify(avatar));
      const response = await fetch(`${window.domain}/users/change-avatar`, {
        headers: {
          Authorization: userContext.token,
        },
        method: "POST",
        body: data,
        // body: JSON.stringify(avatar),
      });
      if (response.status !== 200) {
        document.body.style.cursor = "";
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      document.body.style.cursor = "";
      localStorage.setItem("user", JSON.stringify(resData));
      userContext.setUser(resData);
      setIsNeedToWait(false);
    } catch (error) {
      document.body.style.cursor = "";
      userContext.setIsError(true);
    }
  };

  const deleteAvatar = async () => {
    setIsNeedToWait(true);
    try {
      const response = await fetch(`${window.domain}/users/delete-avatar`, {
        headers: {
          Authorization: userContext.token,
        },
        method: "PATCH",
      });
      if (response.status !== 200) {
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      localStorage.setItem("user", JSON.stringify(resData));
      userContext.setUser(resData);
      setIsNeedToWait(false);
    } catch (error) {
      userContext.setIsError(true);
    }
  };

  const changeSexHandler = async (e) => {
    try {
      const response = await fetch(`${window.domain}/users/change-sex`, {
        headers: {
          Authorization: userContext.token,
        },
        method: "PATCH",
        body: e.target.value,
      });
      if (response.status !== 200) {
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      localStorage.setItem("user", JSON.stringify(resData));
      userContext.setUser(resData);
    } catch (error) {
      userContext.setIsError(true);
    }
  };

  const onChangeNote = (e) => {
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
          Authorization: userContext.token,
        },
        method: "PATCH",
        body: note.trim(),
      });
      if (response.status !== 200) {
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      localStorage.setItem("user", JSON.stringify(resData));
    } catch (error) {
      userContext.setIsError(true);
    }
  };

  return (
    <div className="settings">
      <div className="settings__name">{userContext.user.name}</div>
      <div className="settings__image-block">
        <img className="settings__img" src={userContext.user.avatar.url} alt="ava" />
        <button
          className="settings__change-img-btn"
          title="сменить аватарку"
          onClick={clickImgInput}
        ></button>
        {userContext.user.avatar.url !==
        "https://res.cloudinary.com/ztf/image/upload/v1573335637/social-news/avatars/default_avatar.png" ? (
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
      {isNeedToWait ? <Loading /> : null}
    </div>
  );
};

export default ProfileSettings;
