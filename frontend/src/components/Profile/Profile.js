import React, { useEffect, useState, useContext, useRef } from "react";

import { Link } from "react-router-dom";

import Post from "../Posts/Post/Post";
import NotFound from "../../pages/NotFoundPage/NotFound";
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
  const [posts, setPosts] = useState([]);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(null);
  const [isBlocked, setIsBlocked] = useState(null);
  const [initialUserNote, setInitialUserNote] = useState("");
  const [note, setNote] = useState("");

  const fetchUserData = () => {
    setUser(null);
    setIsUserLoading(true);
    setNotFoundError(false);
    fetch(`${window.domain}/users/user/${props.match.params.username}`)
      .then(res => {
        if (res.status === 404) {
          setNotFoundError(true);
          setIsUserLoading(false);
          return;
        } else if (res.status === 200) {
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
        if (resData.error) {
          return;
        }
        setUser(resData);
        setIsUserLoading(false);
      })
      .catch(err => console.log(err));
  };

  const fetchPosts = () => {
    console.log("fetching posts");
    fetch(`${window.domain}/posts/userposts/${user._id}`)
      .then(res => res.json())
      .then(resData => {
        console.log(resData);
        setPosts(resData);
        setIsPostsLoading(false);
      })
      .catch(error => console.log(error));
  };

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.match.url]);

  useEffect(() => {
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
      fetchPosts();
      if (userContext.isAuth) {
        setIsBlocked(user.ignoredBy.indexOf(userContext.user._id) > -1);
        setIsSubscribed(user.subscribers.indexOf(userContext.user._id) > -1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user && userContext.user) {
      aboutMe.current.style.height = "auto";
      aboutMe.current.style.height = aboutMe.current.scrollHeight + "px";

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

  const subscribeToUserToggle = () => {
    fetch(`${window.domain}/users/toggle-subscribe-to-user/${user._id}`, {
      headers: {
        Authorization: userContext.token
      },
      method: "PATCH"
    })
      .then(res => {
        if (res.status === 200) {
          return res.json();
        } else {
          // TODO вывести UI , что что-то пошло не так
          console.log("что что-то пошло не так");
          throw Error("U cant do this");
          // return;
        }
      })
      .then(resData => {
        console.log(resData);
        localStorage.setItem("user", JSON.stringify(resData));
        setIsSubscribed(!isSubscribed);
      })
      .catch(error => console.log(error));
  };

  const blockUserToggle = () => {
    fetch(`${window.domain}/users/toggle-ignore/${user._id}`, {
      headers: {
        Authorization: userContext.token
      },
      method: "PATCH"
    })
      .then(res => {
        if (res.status === 200) {
          return res.json();
        } else {
          // TODO вывести UI , что что-то пошло не так
          console.log("что что-то пошло не так");
          throw Error("U cant do this");
          // return;
        }
      })
      .then(resData => {
        console.log(resData);
        localStorage.setItem("user", JSON.stringify(resData));
        setIsBlocked(!isBlocked);
      })
      .catch(error => console.log(error));
  };

  const onChangeNote = e => {
    setNote(e.target.value);
    userNote.current.style.height = "auto";
    userNote.current.style.height = e.currentTarget.scrollHeight + "px";
  };

  const saveNote = () => {
    if (note.trim() === initialUserNote) {
      return;
    }
    const noteData = {
      notedUserId: user._id,
      noteBody: note.trim()
    };
    fetch(`${window.domain}/users/set-note`, {
      headers: {
        Authorization: userContext.token,
        "Content-Type": "application/json"
      },
      method: "PATCH",
      body: JSON.stringify(noteData)
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
        setInitialUserNote(note);
      })
      .catch(error => console.log(error));
  };

  return isUserLoading ? (
    <Spinner />
  ) : notFoundError ? (
    <NotFound />
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
                  disabled={isBlocked}
                  title={isBlocked ? "сначала разблокируйте" : ""}
                >
                  {isSubscribed ? "отписаться" : "подписаться"}
                </button>
                <button
                  className={"profile__ignore" + (isBlocked ? " profile__ignore_ignored" : "")}
                  onClick={blockUserToggle}
                  disabled={isSubscribed}
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
        <div className="posts">
          {isPostsLoading ? (
            <Spinner />
          ) : posts.length > 0 ? (
            posts.map(post => (
              <div key={post._id} className="posts__post">
                <Post post={post} />
              </div>
            ))
          ) : (
            <div className="profile__no-posts">Здесь пока что нет ни одного поста</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
