import React, { useEffect, useState, useContext, useRef } from "react";

import Post from "../Posts/Post/Post";
import NotFound from "../../pages/NotFoundPage/NotFound";

import numberFormatter from "../../utils/NumberFormatter";
import timeFormatterFull from "../../utils/TimeFormatterFull";

import UserContext from "../../context/userContext";

import "./Profile.scss";

const Profile = props => {
  const userContext = useContext(UserContext);

  const textarea = useRef();

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
    fetch(`http://localhost:5001/users/user/${props.match.params.username}`)
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
    fetch(`http://localhost:5001/posts/userposts/${user._id}`)
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
    if (user) {
      setNote("");
      const userNote = userContext.user.notesAboutUsers.find(note => note.userId === user._id);
      if (userNote) {
        setInitialUserNote(userNote.body);
        setNote(userNote.body);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUserLoading]);

  useEffect(() => {
    if (note) {
      textarea.current.style.height = "auto";
      textarea.current.style.height = textarea.current.scrollHeight + "px";
    }
  }, [note]);

  const subscribeToUserToggle = () => {
    fetch(`http://localhost:5001/users/toggle-subscribe-to-user/${user._id}`, {
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
          return;
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
    fetch(`http://localhost:5001/users/toggle-ignore/${user._id}`, {
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
          return;
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
    textarea.current.style.height = "auto";
    textarea.current.style.height = e.currentTarget.scrollHeight + "px";
  };

  const saveNote = () => {
    if (note === initialUserNote) {
      return;
    }
    const noteData = {
      notedUserId: user._id,
      noteBody: note
    };
    fetch(`http://localhost:5001/users/set-note`, {
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
    <div>Loading...</div>
  ) : notFoundError ? (
    <NotFound />
  ) : (
    <div className="profile">
      <div className="porfile__info">
        <div className="profile__header">
          <div className="profile__avatar">
            <img className="profile__img" src={user.avatar} alt="avatar" />
          </div>
          <div className="profile__user">
            <div className="profile__nickname">{user.name}</div>
            <div className="profile__createdAt">ZTFник {timeFormatterFull(user.createdAt)}</div>
          </div>
          {userContext.isAuth ? (
            userContext.user._id === user._id ? (
              <div className="profile__user-settings">settings</div>
            ) : (
              <div className="profile__user-buttons">
                <button
                  className={
                    "profile__subscribe" + (isSubscribed ? " profile__subscribe_subscribed" : "")
                  }
                  onClick={subscribeToUserToggle}
                >
                  {isSubscribed ? "отписаться" : "подписаться"}
                </button>
                <button
                  className={"profile__ignore" + (isBlocked ? " profile__ignore_ignored" : "")}
                  onClick={blockUserToggle}
                >
                  {isBlocked ? "разблокировать" : "заблокировать"}
                </button>
              </div>
            )
          ) : null}
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
            placeholder="Заметка об этом пользователе. Будет видна только Вам. Нажмите, чтобы ввести текст"
            ref={textarea}
          />
        </div>
      ) : (
        <div className="profile__bottom-border" />
      )}
      <div className="profile__posts">
        <div className="posts">
          {isPostsLoading ? (
            <div>Loading...</div>
          ) : posts.length > 0 ? (
            posts.map(post => (
              <div key={post._id} className="posts__post">
                <Post post={post} />
              </div>
            ))
          ) : (
            <h1>There is no posts yet</h1>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
