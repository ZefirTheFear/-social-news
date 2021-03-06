import React, { useState, useContext, useEffect } from "react";
import parse from "html-react-parser";
import { Link, withRouter } from "react-router-dom";

import Confirm from "../../Confirm/Confirm";
import FullScreenImage from "../../FullScreenImage/FullScreenImage";

import UserContext from "../../../context/userContext";

import timeFormatter from "../../../utils/TimeFormatter";

import "./Post.scss";

const Post = props => {
  const userContext = useContext(UserContext);

  const [post, setPost] = useState(props.post);
  const [postBody, setPostBody] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImgFullScreen, setIsImgFullScreen] = useState(false);
  const [src, setSrc] = useState(null);
  let isFetching = null;

  const controller = new AbortController();
  const signal = controller.signal;

  useEffect(() => {
    setPostBody(createPostBody());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (isFetching) {
        controller.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createPostBody = () => {
    return props.post.body.map(item => {
      if (item.type === "text") {
        return (
          <div className="post-inner__content-text" key={item.key}>
            {parse(item.content)}
          </div>
        );
      } else {
        return (
          <div className="post-inner__content-img" key={item.key}>
            <img
              className="post-inner__img"
              src={item.url}
              alt="img"
              draggable="false"
              onClick={() => imgFullScreen(item.url)}
            />
          </div>
        );
      }
    });
  };

  const fetchPost = async () => {
    try {
      isFetching = true;
      document.body.style.cursor = "wait";
      const response = await fetch(`${window.domain}/posts/${post._id}`, { signal: signal });
      if (response.status !== 200) {
        isFetching = false;
        document.body.style.cursor = "";
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      isFetching = false;
      document.body.style.cursor = "";
      setPost(resData);
    } catch (error) {
      document.body.style.cursor = "";
      isFetching = false;
      if (error.name === "AbortError") {
        return;
      }
      userContext.setIsError(true);
    }
  };

  const imgFullScreen = src => {
    setIsImgFullScreen(true);
    setSrc(src);
  };

  const likePostToggle = async () => {
    try {
      document.body.style.cursor = "wait";
      const response = await fetch(`${window.domain}/posts/${post._id}/like`, {
        headers: {
          Authorization: userContext.token
        },
        method: "PATCH"
      });
      if (response.status !== 200) {
        document.body.style.cursor = "";
        userContext.setIsError(true);
        return;
      }
      await response.json();
      document.body.style.cursor = "";
      fetchPost();
    } catch (error) {
      document.body.style.cursor = "";
      userContext.setIsError(true);
    }
  };

  const dislikePostToggle = async () => {
    try {
      document.body.style.cursor = "wait";
      const response = await fetch(`${window.domain}/posts/${post._id}/dislike`, {
        headers: {
          Authorization: userContext.token
        },
        method: "PATCH"
      });
      if (response.status !== 200) {
        document.body.style.cursor = "";
        userContext.setIsError(true);
        return;
      }
      await response.json();
      document.body.style.cursor = "";
      fetchPost();
    } catch (error) {
      document.body.style.cursor = "";
      userContext.setIsError(true);
    }
  };

  const savePostToggle = async () => {
    try {
      document.body.style.cursor = "wait";
      const response = await fetch(`${window.domain}/posts/${post._id}/save`, {
        headers: {
          Authorization: userContext.token
        },
        method: "PATCH"
      });
      if (response.status !== 200) {
        document.body.style.cursor = "";
        userContext.setIsError(true);
        return;
      }
      await response.json();
      document.body.style.cursor = "";
      fetchPost();
    } catch (error) {
      document.body.style.cursor = "";
      userContext.setIsError(true);
    }
  };

  const openConfirmation = () => {
    setIsDeleting(true);
  };

  const deletePostHandler = async () => {
    try {
      document.body.style.cursor = "wait";
      const response = await fetch(`${window.domain}/posts/${post._id}/delete`, {
        headers: {
          Authorization: userContext.token
        },
        method: "DELETE"
      });
      if (response.status !== 200) {
        userContext.setIsError(true);
        document.body.style.cursor = "";
        return;
      }
      await response.json();
      document.body.style.cursor = "";
      if (props.match.params.postTitle) {
        return props.history.push("/");
      }
      return props.deletePost(post._id);
    } catch (error) {
      userContext.setIsError(true);
      document.body.style.cursor = "";
    }
  };

  return (
    <article className="post">
      {isDeleting ? (
        <Confirm
          title="Удаление поста"
          msg="Вы дествительно хотите удалить?"
          doBtn="Удалить"
          cancelBtn="Оставить"
          doAction={() => {
            deletePostHandler();
            setIsDeleting(false);
          }}
          cancelAction={() => setIsDeleting(false)}
        />
      ) : null}
      {isImgFullScreen ? (
        <FullScreenImage src={src} clicked={() => setIsImgFullScreen(false)} />
      ) : null}
      <div className="post__rating-block">
        {userContext.isAuth && post.creator._id !== userContext.user._id ? (
          <div
            className={
              "post__rating-up" +
              (userContext.isAuth && post.likes.indexOf(userContext.user._id) > -1
                ? " post__rating-up_liked"
                : "")
            }
            title={
              userContext.isAuth && post.likes.indexOf(userContext.user._id) > -1
                ? "Убрать плюсик"
                : "Поставить плюсик"
            }
            onClick={likePostToggle}
          />
        ) : null}
        <div className="post__rating">{post.rating}</div>
        {userContext.isAuth && post.creator._id !== userContext.user._id ? (
          <div
            className={
              "post__rating-down" +
              (userContext.isAuth && post.dislikes.indexOf(userContext.user._id) > -1
                ? " post__rating-down_disliked"
                : "")
            }
            title={
              userContext.isAuth && post.dislikes.indexOf(userContext.user._id) > -1
                ? "Убрать минус"
                : "Поставить минус"
            }
            onClick={dislikePostToggle}
          />
        ) : null}
      </div>
      <div className="post-inner">
        <div className="post-inner__main">
          <div className="post-inner__title">
            <Link
              className="post-inner__title-link"
              to={`/post/${post._id}--${post.title.replace(/ /g, "_")}`}
            >
              {post.title}
            </Link>
          </div>
          <div className="post-inner__tags">
            {post.tags.map(tag => (
              <Link className="post-inner__tag-link" key={tag} to={`/search/${tag}`}>
                {tag}
              </Link>
            ))}
          </div>
          <div className="post-inner__content">{postBody}</div>
        </div>
        <div className="post-inner__footer">
          <div className="post-inner__footer-left-side">
            <div className="post-inner__mobile-rating-block">
              {userContext.isAuth && post.creator._id !== userContext.user._id ? (
                <div
                  className={
                    "post-inner__mobile-rating-up" +
                    (userContext.isAuth && post.likes.indexOf(userContext.user._id) > -1
                      ? " post-inner__mobile-rating-up_liked"
                      : "")
                  }
                  title="Поставить плюсик"
                  onClick={likePostToggle}
                />
              ) : null}
              <div className="post-inner__mobile-rating">{post.rating}</div>
              {userContext.isAuth && post.creator._id !== userContext.user._id ? (
                <div
                  className={
                    "post-inner__mobile-rating-down" +
                    (userContext.isAuth && post.dislikes.indexOf(userContext.user._id) > -1
                      ? " post-inner__mobile-rating-down_disliked"
                      : "")
                  }
                  title="Поставить минус"
                  onClick={dislikePostToggle}
                />
              ) : null}
            </div>
            {userContext.isAuth ? (
              <>
                <div className="post-inner__footer-saves-amount">{post.saves.length}</div>
                <div
                  className={
                    "post-inner__footer-save-post" +
                    (userContext.isAuth && post.saves.indexOf(userContext.user._id) > -1
                      ? " post-inner__footer-save-post_saved"
                      : "")
                  }
                  title="Сохранить"
                  onClick={savePostToggle}
                />
              </>
            ) : null}
            <div className="post-inner__footer-comments-amount">{post.comments.length}</div>
            <Link
              className="post-inner__footer-comments-link"
              to={`/post/${post._id}--${post.title.replace(/ /g, "_")}#comments`}
              title="Комменты"
            />
          </div>
          <div className="post-inner__footer-right-side">
            <div className="post-inner__user-info">
              <div className="post-inner__user-info-item">
                <Link className="post-inner__user-info-item-link" to={`/@${post.creator.name}`}>
                  {post.creator.name}
                </Link>
              </div>
              <div className="post-inner__user-info-item">
                <time className="post-inner__time">{timeFormatter(post.createdAt)}</time>
              </div>
            </div>
            <div className="post-inner__avatar">
              <Link className="post-inner__avatar-link" to={`/@${post.creator.name}`}>
                <img
                  className="post-inner__avatar-img"
                  src={post.creator.avatar.url}
                  alt="avatar"
                />
              </Link>
            </div>
            {userContext.isAuth &&
            (userContext.user.status === "admin" || userContext.user.status === "moderator") ? (
              <div className="post-inner__admin-btns">
                <div className="post-inner__edit-post" title="Редактировать пост">
                  <Link className="post-inner__edit-link" to={`/edit/post/${post._id}`} />
                </div>
                <div
                  className="post-inner__delete-post"
                  title="Удалить пост"
                  onClick={openConfirmation}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
};

export default withRouter(Post);
