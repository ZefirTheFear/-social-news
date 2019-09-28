import React, { useState, useContext, useEffect } from "react";
import parse from "html-react-parser";
import { Link, withRouter } from "react-router-dom";

import Confirm from "../../Confirm/Confirm";

import UserContext from "../../../context/userContext";

import timeFormatter from "../../../utils/TimeFormatter";

import "./Post.scss";

const Post = props => {
  const userContext = useContext(UserContext);

  const [post, setPost] = useState(props.post);
  const [postBody, setPostBody] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const body = props.post.body.map(item => {
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
              src={`${window.domain}/${item.url}`}
              alt="img"
              draggable="false"
            />
          </div>
        );
      }
    });
    setPostBody(body);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPost = async () => {
    try {
      const request = await fetch(`${window.domain}/posts/${post._id}`);
      if (request.status !== 200) {
        return;
      }
      const resData = await request.json();
      setPost(resData);
    } catch (error) {
      return;
    }
  };

  const likePostToggle = async () => {
    try {
      const request = await fetch(`${window.domain}/posts/${post._id}/like`, {
        headers: {
          Authorization: userContext.token
        },
        method: "PATCH"
      });
      if (request.status !== 200) {
        return;
      }
      const resData = await request.json();
      console.log(resData);
      fetchPost();
    } catch (error) {
      return;
    }
  };

  const dislikePostToggle = async () => {
    try {
      const request = await fetch(`${window.domain}/posts/${post._id}/dislike`, {
        headers: {
          Authorization: userContext.token
        },
        method: "PATCH"
      });
      if (request.status !== 200) {
        return;
      }
      const resData = await request.json();
      console.log(resData);
      fetchPost();
    } catch (error) {
      return;
    }
  };

  const savePostToggle = async () => {
    try {
      const request = await fetch(`${window.domain}/posts/${post._id}/save`, {
        headers: {
          Authorization: userContext.token
        },
        method: "PATCH"
      });
      if (request.status !== 200) {
        return;
      }
      const resData = await request.json();
      console.log(resData);
      fetchPost();
    } catch (error) {
      return;
    }
  };

  const openConfirmation = () => {
    setIsDeleting(true);
  };

  const deletePostHandler = () => {
    // const rUSure = window.confirm("Удалить пост?");
    // if (!rUSure) {
    //   return;
    // }

    fetch(`http://localhost:5001/posts/${post._id}/delete`, {
      headers: {
        Authorization: userContext.token
      },
      method: "DELETE"
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
        return;
        // TODO обновить посты
      })
      .catch(error => console.log(error));
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
      <div className="post__rating-block">
        {userContext.user && post.creator._id !== userContext.user._id ? (
          <div
            className={
              "post__rating-up" +
              (userContext.user && post.likes.indexOf(userContext.user._id) > -1
                ? " post__rating-up_liked"
                : "")
            }
            title="Поставить плюсик"
            onClick={likePostToggle}
          />
        ) : null}
        <div className="post__rating">{post.rating}</div>
        {userContext.user && post.creator._id !== userContext.user._id ? (
          <div
            className={
              "post__rating-down" +
              (userContext.user && post.dislikes.indexOf(userContext.user._id) > -1
                ? " post__rating-down_disliked"
                : "")
            }
            title="Поставить минус"
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
              <Link className="post-inner__tag-link" key={tag} to="##">
                {tag}
              </Link>
            ))}
          </div>
          <div className="post-inner__content">{postBody}</div>
        </div>
        <div className="post-inner__footer">
          <div className="post-inner__footer-left-side">
            <div className="post-inner__mobile-rating-block">
              {userContext.user && post.creator._id !== userContext.user._id ? (
                <div
                  className={
                    "post-inner__mobile-rating-up" +
                    (userContext.user && post.likes.indexOf(userContext.user._id) > -1
                      ? " post-inner__mobile-rating-up_liked"
                      : "")
                  }
                  title="Поставить плюсик"
                  onClick={likePostToggle}
                />
              ) : null}
              <div className="post-inner__mobile-rating">{post.rating}</div>
              {userContext.user && post.creator._id !== userContext.user._id ? (
                <div
                  className={
                    "post-inner__mobile-rating-down" +
                    (userContext.user && post.dislikes.indexOf(userContext.user._id) > -1
                      ? " post-inner__mobile-rating-down_disliked"
                      : "")
                  }
                  title="Поставить минус"
                  onClick={dislikePostToggle}
                />
              ) : null}
            </div>
            <div className="post-inner__footer-saves-amount">{post.saves.length}</div>
            {userContext.user ? (
              <React.Fragment>
                <div
                  className={
                    "post-inner__footer-save-post" +
                    (userContext.user && post.saves.indexOf(userContext.user._id) > -1
                      ? " post-inner__footer-save-post_saved"
                      : "")
                  }
                  title="Сохранить"
                  onClick={savePostToggle}
                />
                <div className="post-inner__footer-comments-amount">{post.comments.length}</div>
              </React.Fragment>
            ) : null}
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
                  src={"http://localhost:5001/" + post.creator.avatar}
                  alt="avatar"
                />
              </Link>
            </div>
            {userContext.user &&
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
