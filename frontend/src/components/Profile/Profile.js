import React, { useEffect, useState, useContext, useRef } from "react";

import { Link } from "react-router-dom";

import Posts from "../Posts/Posts";
import Spinner from "../Spinner/Spinner";

import numberFormatter from "../../utils/NumberFormatter";
import timeFormatterFull from "../../utils/TimeFormatterFull";

import UserContext from "../../context/userContext";

import "./Profile.scss";

const Profile = props => {
  const userContext = useContext(UserContext);

  const userNote = useRef();
  const aboutMe = useRef();

  const [user, setUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isShownPosts, setIsShownPosts] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(null);
  const [isBlocked, setIsBlocked] = useState(null);
  const [isSubscribeBtnDisabled, setIsSubscribeBtnDisabled] = useState(false);
  const [isBlockBtnDisabled, setIsBlockBtnDisabled] = useState(false);
  const [initialUserNote, setInitialUserNote] = useState("");
  const [note, setNote] = useState("");
  let loading = true;

  const controller = new AbortController();
  const signal = controller.signal;

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.match.url]);

  useEffect(() => {
    if (userNote.current) {
      userNote.current.style.height = "auto";
      userNote.current.style.height = userNote.current.scrollHeight + "px";
    }
    if (aboutMe.current) {
      aboutMe.current.style.height = "auto";
      aboutMe.current.style.height = aboutMe.current.scrollHeight + "px";
    }
    window.onresize = () => {
      if (userNote.current) {
        userNote.current.style.height = "auto";
        userNote.current.style.height = userNote.current.scrollHeight + "px";
      }
      if (aboutMe.current) {
        aboutMe.current.style.height = "auto";
        aboutMe.current.style.height = aboutMe.current.scrollHeight + "px";
      }
    };
    if (user) {
      setIsShownPosts(true);
      if (userContext.isAuth) {
        setIsBlocked(user.ignoredBy.indexOf(userContext.user._id) > -1);
        setIsSubscribed(user.subscribers.indexOf(userContext.user._id) > -1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user) {
      aboutMe.current.style.height = "auto";
      aboutMe.current.style.height = aboutMe.current.scrollHeight + "px";
    }
    if (user && userContext.user) {
      if (userNote.current) {
        userNote.current.style.height = "auto";
        userNote.current.style.height = userNote.current.scrollHeight + "px";
      }
      setNote("");
      const noteAboutUser = userContext.user.notesAboutUsers.find(note => note.userId === user._id);
      if (noteAboutUser) {
        setInitialUserNote(noteAboutUser.body);
        setNote(noteAboutUser.body);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUserLoading]);

  useEffect(() => {
    if (note) {
      userNote.current.style.height = "auto";
      userNote.current.style.height = userNote.current.scrollHeight + "px";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note]);

  useEffect(() => {
    return () => {
      if (loading) {
        controller.abort();
        console.log("fetchUserDara прерван");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${window.domain}/users/user/${props.match.params.username}`, {
        signal: signal
      });
      console.log(response);
      if (response.status === 404) {
        // loading = false;
        // setIsUserLoading(false);
        userContext.setIsPageNotFound(true);
        return;
      }
      if (response.status !== 200) {
        loading = false;
        setIsUserLoading(false);
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      console.log(resData);
      setUser(resData);
      loading = false;
      setIsUserLoading(false);
    } catch (error) {
      console.log(error);
      loading = false;
      setIsUserLoading(false);
      userContext.setIsError(true);
    }
  };

  const subscribeToUserToggle = async () => {
    try {
      setIsSubscribeBtnDisabled(true);
      setIsBlockBtnDisabled(true);
      const response = await fetch(`${window.domain}/users/toggle-subscribe-to-user/${user._id}`, {
        headers: {
          Authorization: userContext.token
        },
        method: "PATCH"
      });
      console.log(response);
      if (response.status !== 200) {
        setIsSubscribeBtnDisabled(false);
        setIsBlockBtnDisabled(false);
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      console.log(resData);
      localStorage.setItem("user", JSON.stringify(resData));
      setIsSubscribed(!isSubscribed);
      setIsSubscribeBtnDisabled(false);
      setIsBlockBtnDisabled(false);
    } catch (error) {
      console.log(error);
      setIsSubscribeBtnDisabled(false);
      setIsBlockBtnDisabled(false);
      userContext.setIsError(true);
    }
  };

  const blockUserToggle = async () => {
    try {
      setIsBlockBtnDisabled(true);
      setIsSubscribeBtnDisabled(true);
      const response = await fetch(`${window.domain}/users/toggle-ignore/${user._id}`, {
        headers: {
          Authorization: userContext.token
        },
        method: "PATCH"
      });
      console.log(response);
      if (response.status !== 200) {
        setIsBlockBtnDisabled(false);
        setIsSubscribeBtnDisabled(false);
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      console.log(resData);
      localStorage.setItem("user", JSON.stringify(resData));
      setIsBlocked(!isBlocked);
      setIsBlockBtnDisabled(false);
      setIsSubscribeBtnDisabled(false);
    } catch (error) {
      console.log(error);
      setIsBlockBtnDisabled(false);
      setIsSubscribeBtnDisabled(false);
      userContext.setIsError(true);
    }
  };

  const onChangeNote = e => {
    setNote(e.target.value);
    userNote.current.style.height = "auto";
    userNote.current.style.height = e.currentTarget.scrollHeight + "px";
  };

  const saveNote = async () => {
    if (note.trim() === initialUserNote) {
      return;
    }
    const noteData = {
      notedUserId: user._id,
      noteBody: note.trim()
    };
    try {
      const response = await fetch(`${window.domain}/users/set-note`, {
        headers: {
          Authorization: userContext.token,
          "Content-Type": "application/json"
        },
        method: "PATCH",
        body: JSON.stringify(noteData)
      });
      console.log(response);
      if (response.status !== 200) {
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      console.log(resData);
      localStorage.setItem("user", JSON.stringify(resData));
      setInitialUserNote(note);
    } catch (error) {
      console.log(error);
      userContext.setIsError(true);
    }
  };

  return isUserLoading ? (
    <Spinner />
  ) : (
    <div className="profile">
      <div className="porfile__info">
        <div className="profile__header">
          <div className="profile__avatar">
            <img className="profile__img" src={`${window.domain}/` + user.avatar} alt="avatar" />
          </div>
          <div className="profile__user">
            <div className="profile__nickname">{user.name}</div>
            <div className="profile__createdAt">
              ZTFни{user.sex === "w" ? "ца" : "к"} {timeFormatterFull(user.createdAt)}
            </div>
          </div>
          {userContext.isAuth ? (
            userContext.user._id === user._id ? (
              <Link to="/settings" className="profile__user-settings">
                <div className="profile__settings-symbol" title="Настройки" />
              </Link>
            ) : (
              <div className="profile__user-buttons">
                <button
                  className={
                    "profile__subscribe" + (isSubscribed ? " profile__subscribe_subscribed" : "")
                  }
                  onClick={subscribeToUserToggle}
                  disabled={isBlocked || isSubscribeBtnDisabled}
                  title={isBlocked ? "сначала разблокируйте" : ""}
                >
                  {isSubscribed ? "отписаться" : "подписаться"}
                </button>
                <button
                  className={"profile__ignore" + (isBlocked ? " profile__ignore_ignored" : "")}
                  onClick={blockUserToggle}
                  disabled={isSubscribed || isBlockBtnDisabled}
                  title={isSubscribed ? "сначала отпишитесь" : ""}
                >
                  {isBlocked ? "разблокировать" : "заблокировать"}
                </button>
              </div>
            )
          ) : null}
          <textarea
            className="profile__about-user"
            value={user.aboutMe}
            rows="1"
            readOnly
            ref={aboutMe}
          />
        </div>
        <div className="profile__statistics">
          <div className="profile__statistics-item">
            <div className="profile__statistics-item-value">{user.rating}</div>
            <div className="profile__statistics-item-label">рейтинг</div>
          </div>
          <div className="profile__statistics-item">
            <div className="profile__statistics-item-value">{user.subscribers.length}</div>
            <div className="profile__statistics-item-label">
              {numberFormatter(user.subscribers.length, ["подписчик", "подписчика", "подписчиков"])}
            </div>
          </div>
          <div className="profile__statistics-item">
            <div className="profile__statistics-item-value">{user.comments.length}</div>
            <div className="profile__statistics-item-label">
              {numberFormatter(user.comments.length, [
                "комментарий",
                "комментария",
                "комментариев"
              ])}
            </div>
          </div>
          <div className="profile__statistics-item">
            <div className="profile__statistics-item-value">{user.posts.length}</div>
            <div className="profile__statistics-item-label">
              {numberFormatter(user.posts.length, ["пост", "поста", "постов"])}
            </div>
          </div>
        </div>
        <div className="profile__extra-info">
          <div className="profile__estimates">
            поставил{" "}
            <span className="profile__likes">
              {user.likedPosts.length + user.likedComments.length}
            </span>{" "}
            {numberFormatter(user.likedPosts.length + user.likedComments.length, [
              "плюс",
              "плюса",
              "плюсов"
            ])}{" "}
            и{" "}
            <span className="profile__dislikes">
              {user.dislikedPosts.length + user.dislikedComments.length}
            </span>{" "}
            {numberFormatter(user.dislikedPosts.length + user.dislikedComments.length, [
              "минус",
              "минуса",
              "минусов"
            ])}
          </div>
          <div className="profile__status">статус: {user.status}</div>
        </div>
      </div>
      {userContext.user && userContext.user._id !== user._id ? (
        <div className="profile__note">
          <textarea
            className="profile__note-textarea"
            value={note}
            rows="1"
            onChange={onChangeNote}
            onBlur={saveNote}
            placeholder="Заметка об этом пользователе. "
            title="Будет видна только Вам. Нажмите, чтобы ввести текст"
            ref={userNote}
          />
        </div>
      ) : (
        <div className="profile__bottom-border" />
      )}
      <div className="profile__posts">
        {isShownPosts ? (
          <Posts requestUrl={`${window.domain}/posts/userposts/${user._id}`} />
        ) : null}
      </div>
    </div>
  );
};

export default Profile;
