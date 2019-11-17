import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";

import parse from "html-react-parser";
import uniqid from "uniqid";
import cloneDeep from "clone-deep";

import Confirm from "../../Confirm/Confirm";
import FullScreenImage from "../../FullScreenImage/FullScreenImage";
import ContentMaker from "../../ContentMaker/ContentMaker";
import AddComment from "../../AddComment/AddComment";

import UserContext from "../../../context/userContext";

import timeFormatter from "../../../utils/TimeFormatter";

import "./Comment.scss";

const Comment = props => {
  const userContext = useContext(UserContext);

  const [comment, setComment] = useState(props.comment);
  const [commentBody, setCommentBody] = useState(null);
  const [commentBodyForEditing, setCommentBodyForEditing] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editCommentData, setEditCommentData] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImgFullScreen, setIsImgFullScreen] = useState(false);
  const [src, setSrc] = useState(null);
  const [errors, setErrors] = useState({});
  let isFetching = null;

  const controller = new AbortController();
  const signal = controller.signal;

  useEffect(() => {
    if (comment) {
      setCommentBody(createCommentBody());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comment]);

  useEffect(() => {
    return () => {
      if (isFetching) {
        controller.abort();
        console.log("fetchComment прерван");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createCommentBody = () => {
    if (userContext.user.ignoreList.includes(comment.creator._id)) {
      return (
        <div className="comment__text-block" key={uniqid()}>
          Коммент от игнорируемого пользователя
        </div>
      );
    } else {
      return comment.body.map(item => {
        if (item.type === "text") {
          return (
            <div className="comment__text-block" key={uniqid()}>
              {parse(item.content)}
            </div>
          );
        } else {
          return (
            <div className="comment__img-block" key={uniqid()}>
              <img
                className="comment__img-block-img"
                src={item.url}
                alt="img"
                draggable="false"
                onClick={() => imgFullScreen(item.url)}
              />
            </div>
          );
        }
      });
    }
  };

  const imgFullScreen = src => {
    setIsImgFullScreen(true);
    setSrc(src);
  };

  const relpyFormToggle = () => {
    if (props.commentIdForReply === comment._id) {
      props.openReplyBlockHandler(null);
    } else {
      props.openReplyBlockHandler(comment._id);
    }
  };

  const fetchComment = async () => {
    try {
      document.body.style.cursor = "wait";
      const response = await fetch(`${window.domain}/posts/comments/${comment._id}`, {
        signal: signal
      });
      console.log(response);
      if (response.status !== 200) {
        isFetching = false;
        document.body.style.cursor = "";
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      console.log(resData);
      isFetching = false;
      document.body.style.cursor = "";
      setComment(resData);
    } catch (error) {
      console.log(error);
      document.body.style.cursor = "";
      isFetching = false;
      if (error.name === "AbortError") {
        return;
      }
      userContext.setIsError(true);
    }
  };

  const likeComment = async () => {
    try {
      document.body.style.cursor = "wait";
      const response = await fetch(`${window.domain}/posts/comments/${comment._id}/like`, {
        headers: {
          Authorization: userContext.token
        },
        method: "PATCH"
      });
      console.log(response);
      if (response.status !== 200) {
        document.body.style.cursor = "";
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      console.log(resData);
      document.body.style.cursor = "";
      fetchComment();
    } catch (error) {
      console.log(error);
      document.body.style.cursor = "";
      userContext.setIsError(true);
    }
  };

  const dislikeComment = async () => {
    try {
      document.body.style.cursor = "wait";
      const response = await fetch(`${window.domain}/posts/comments/${comment._id}/dislike`, {
        headers: {
          Authorization: userContext.token
        },
        method: "PATCH"
      });
      console.log(response);
      if (response.status !== 200) {
        document.body.style.cursor = "";
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      console.log(resData);
      document.body.style.cursor = "";
      fetchComment();
    } catch (error) {
      console.log(error);
      document.body.style.cursor = "";
      userContext.setIsError(true);
    }
  };

  const editCommentHandler = () => {
    setEditMode(true);
    setCommentBodyForEditing(comment.body);
  };

  const cancelEditModeHandler = () => {
    setEditMode(false);
  };

  const sendEditedCommentHandler = async e => {
    e.preventDefault();
    console.log("content", editCommentData);

    let commentData = cloneDeep(editCommentData);

    commentData = commentData.filter(
      item => item.type === "image" || (item.type === "text" && item.content.length !== 0)
    );
    if (commentData.length === 0) {
      return setErrors({ content: { msg: "Нужен контент" } });
    }
    if (commentData.length > 5) {
      return setErrors({ content: { msg: "Максимум 5 блоков" } });
    }

    for (const item of commentData) {
      try {
        if (item.type === "image" && item.content) {
          const data = new FormData();
          data.append("file", item.content);
          data.append("upload_preset", "comment-imgs");
          const response = await fetch("https://api.cloudinary.com/v1_1/ztf/upload", {
            method: "POST",
            body: data
          });
          const resData = await response.json();
          console.log(resData);
          item.url = resData.secure_url;
          item.public_id = resData.public_id;
          delete item.content;
        }
      } catch (error) {
        console.log(error);
        userContext.setIsError(true);
      }
    }

    console.log("content", commentData);

    const formData = new FormData();
    formData.append("content", JSON.stringify(commentData));

    try {
      const response = await fetch(`${window.domain}/posts/comments/${comment._id}/edit`, {
        headers: {
          Authorization: userContext.token
        },
        method: "PATCH",
        body: formData
      });
      console.log(response);
      if (response.status !== 200 && response.status !== 422) {
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      console.log(resData);
      if (resData.errors) {
        setErrors(resData.errors);
      } else {
        cancelEditModeHandler();
        setComment(resData);
      }
    } catch (error) {
      console.log(error);
      userContext.setIsError(true);
    }
  };

  const openConfirmation = () => {
    setIsDeleting(true);
  };

  const deleteCommentHandler = async () => {
    try {
      document.body.style.cursor = "wait";
      const response = await fetch(`${window.domain}/posts/comments/${comment._id}/delete`, {
        headers: {
          Authorization: userContext.token
        },
        method: "DELETE"
      });
      console.log(response);
      if (response.status !== 200) {
        document.body.style.cursor = "";
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      console.log(resData);
      document.body.style.cursor = "";
      props.deleteComment(comment._id, comment._id);
    } catch (error) {
      console.log(error);
      document.body.style.cursor = "";
      userContext.setIsError(true);
    }
  };

  const sendContentMakerStateHandler = content => {
    setEditCommentData(content);
  };

  const focusForm = () => {
    setErrors({});
  };

  return comment ? (
    <div className="comment">
      {isDeleting ? (
        <Confirm
          title="Удаление комментария/ветки"
          msg="Вы дествительно хотите удалить?"
          doBtn="Удалить"
          cancelBtn="Оставить"
          doAction={() => {
            deleteCommentHandler();
            setIsDeleting(false);
          }}
          cancelAction={() => setIsDeleting(false)}
        />
      ) : null}
      {isImgFullScreen ? (
        <FullScreenImage src={src} clicked={() => setIsImgFullScreen(false)} />
      ) : null}
      <div className="comment__header">
        <div className="comment__user-info">
          <div className="comment__user-avatar">
            <Link to={`/@${comment.creator.name}`} className="comment__user-avatar-link">
              <img
                src={comment.creator.avatar.url}
                className="comment__user-avatar-link-img"
                alt="avatar"
              />
            </Link>
          </div>
          <div className="comment__user-name">
            <Link to={`/@${comment.creator.name}`} className="comment__user-name-link">
              {comment.creator.name}
            </Link>
          </div>
        </div>
        <time className="comment__time">{timeFormatter(comment.createdAt)}</time>
      </div>
      {editMode ? (
        <>
          <form
            className={"comment__edit-form" + (errors.content ? " comment__edit-form_invalid" : "")}
            onSubmit={sendEditedCommentHandler}
            onClick={focusForm}
            noValidate
          >
            <ContentMaker
              sendContentMakerStateHandler={sendContentMakerStateHandler}
              contentData={commentBodyForEditing}
            />
            <button type="submit" className="comment__edit-submit-btn">
              отправить
            </button>
            <button
              type="button"
              className="comment__edit-cancel-btn"
              onClick={cancelEditModeHandler}
            >
              отмена
            </button>
          </form>
          {errors.content ? (
            <div className="comment__edit-form__invalid-feedback">{errors.content.msg}</div>
          ) : null}
        </>
      ) : (
        <>
          <div className="comment__content">{commentBody}</div>
          <div className="comment__footer">
            {userContext.isAuth ? (
              <button className="comment__reply-btn" type="button" onClick={relpyFormToggle}>
                {props.commentIdForReply === comment._id ? "отмена" : "ответить"}
              </button>
            ) : null}
            <div className="comment__footer-right-side">
              <div className="comment__rating">
                {userContext.isAuth && comment.creator._id !== userContext.user._id ? (
                  <div className="comment__rating-up">
                    <div
                      className={
                        "comment__rating-up-symbol" +
                        (userContext.isAuth && comment.likes.indexOf(userContext.user._id) > -1
                          ? " comment__rating-up-symbol_liked"
                          : "")
                      }
                      onClick={likeComment}
                    />
                  </div>
                ) : null}
                <div className="comment__rating-value">{comment.rating}</div>
                {userContext.isAuth && comment.creator._id !== userContext.user._id ? (
                  <div className="comment-rating-down">
                    <div
                      className={
                        "comment__rating-down-symbol" +
                        (userContext.isAuth && comment.dislikes.indexOf(userContext.user._id) > -1
                          ? " comment__rating-up-symbol_disliked"
                          : "")
                      }
                      onClick={dislikeComment}
                    />
                  </div>
                ) : null}
              </div>
              {userContext.isAuth &&
              (userContext.user.status === "admin" || userContext.user.status === "moderator") ? (
                <div className="comment__admin-btns">
                  <button
                    type="button"
                    className="comment__edit-btn"
                    onClick={editCommentHandler}
                    title="Редактировать"
                  />
                  <button
                    type="button"
                    className="comment__delete-btn"
                    onClick={openConfirmation}
                    title="Удалить"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </>
      )}

      {props.commentIdForReply === comment._id ? (
        <div className="comment__reply-block">
          <AddComment
            postId={comment.postId._id ? comment.postId._id : comment.postId}
            parentCommentId={comment._id}
            addComment={props.addComment}
          />
        </div>
      ) : null}
    </div>
  ) : null;
};

export default Comment;
