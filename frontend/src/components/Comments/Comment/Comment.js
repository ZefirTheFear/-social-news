import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";

import parse from "html-react-parser";
import uniqid from "uniqid";

import Confirm from "../../Confirm/Confirm";
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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (comment) {
      const body = comment.body.map(item => {
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
                src={`${window.domain}/` + item.url}
                alt="img"
                draggable="false"
              />
            </div>
          );
        }
      });
      setCommentBody(body);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comment]);

  const relpyFormToggle = () => {
    if (props.commentIdForReply === comment._id) {
      props.openReplyBlockHandler(null);
    } else {
      props.openReplyBlockHandler(comment._id);
    }
  };

  const fetchComment = async () => {
    try {
      const request = await fetch(`${window.domain}/posts/comments/${comment._id}`);
      if (request.status !== 200) {
        return;
      }
      const resData = await request.json();
      console.log(resData);
      setComment(resData);
    } catch (error) {
      return;
    }
  };

  const likeComment = async () => {
    try {
      const request = await fetch(`${window.domain}/posts/comments/${comment._id}/like`, {
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
      fetchComment();
    } catch (error) {
      return;
    }
  };

  const dislikeComment = async () => {
    try {
      const request = await fetch(`${window.domain}/posts/comments/${comment._id}/dislike`, {
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
      fetchComment();
    } catch (error) {
      return;
    }
  };

  const editCommentHandler = () => {
    console.log(comment.body);
    setEditMode(true);
    const comBody = [];

    comment.body.forEach(item => {
      if (item.type === "text") {
        comBody.push(item);
      } else {
        comBody.push({ ...item, url: `${window.domain}/${item.url}` });
      }
    });
    console.log(comBody);

    setCommentBodyForEditing(comBody);
  };

  const cancelEditModeHandler = () => {
    console.log("cancelEditModeHandler");
    setEditMode(false);
  };

  const sendEditedCommentHandler = e => {
    e.preventDefault();
    console.log("content", editCommentData);

    if (editCommentData.length === 0) {
      return setErrors({ content: { msg: "Нужен контент" } });
    }

    const textBlocksArray = [];
    const oldImgBlocksArray = [];
    const newImgBlocksArray = [];
    const dataOrder = [];

    editCommentData.forEach(item => {
      if (item.type === "text") {
        if (item.content !== "") {
          textBlocksArray.push(item.content);
          dataOrder.push({ type: "text", key: item.key });
        }
      } else if (item.content) {
        newImgBlocksArray.push(item.content);
        dataOrder.push({ type: "newImg", key: item.key });
      } else {
        oldImgBlocksArray.push(item.url.replace(`${window.domain}/`, ""));
        dataOrder.push({ type: "oldImg", key: item.key });
      }
    });

    console.log("textBlocksArray", textBlocksArray);
    console.log("oldImgBlocksArray", oldImgBlocksArray);
    console.log("newImgBlocksArray", newImgBlocksArray);
    console.log("dataOrder", dataOrder);

    const formData = new FormData();
    formData.append("textBlocksArray", JSON.stringify(textBlocksArray));
    formData.append("oldImgBlocksArray", JSON.stringify(oldImgBlocksArray));
    for (let index = 0; index < newImgBlocksArray.length; index++) {
      // formData.append("imgBlocksArray", newImgBlocksArray[index]);
      formData.append("newImgBlocksArray", newImgBlocksArray[index]);
    }
    formData.append("content", JSON.stringify(dataOrder));

    fetch(`${window.domain}/posts/comments/${comment._id}/edit`, {
      headers: {
        Authorization: userContext.token
      },
      method: "PATCH",
      body: formData
    })
      .then(res => {
        console.log(res);
        if (res.status === 200 || res.status === 422) {
          return res.json();
        } else {
          // TODO вывести UI , что что-то пошло не так
          console.log("что что-то пошло не так");
          return;
        }
      })
      .then(resData => {
        console.log(resData);
        if (resData.errors) {
          setErrors(resData.errors);
        } else {
          cancelEditModeHandler();
          setComment(resData);
        }
      })
      .catch(err => console.log(err));
  };

  const openConfirmation = () => {
    setIsDeleting(true);
  };

  const deleteCommentHandler = () => {
    fetch(`${window.domain}/posts/comments/${comment._id}/delete`, {
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
        props.deleteComment(comment._id, comment._id);
      })
      .catch(error => console.log(error));
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
      <div className="comment__header">
        <div className="comment__rating">
          <div className="comment__rating-value">{comment.rating}</div>
          {userContext.user && comment.creator._id !== userContext.user._id ? (
            <div className="comment__rating-up">
              <div
                className={
                  "comment__rating-up-symbol" +
                  (userContext.user && comment.likes.indexOf(userContext.user._id) > -1
                    ? " comment__rating-up-symbol_liked"
                    : "")
                }
                onClick={likeComment}
              />
            </div>
          ) : null}
          {userContext.user && comment.creator._id !== userContext.user._id ? (
            <div className="comment-rating-down">
              <div
                className={
                  "comment__rating-down-symbol" +
                  (userContext.user && comment.dislikes.indexOf(userContext.user._id) > -1
                    ? " comment__rating-up-symbol_disliked"
                    : "")
                }
                onClick={dislikeComment}
              />
            </div>
          ) : null}
        </div>

        <div className="comment__user-info">
          <div className="comment__user-avatar">
            <Link to={`/@${comment.creator.name}`} className="comment__user-avatar-link">
              <img
                src={`${window.domain}/` + comment.creator.avatar}
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
          <div className="comment__reply">
            <button className="comment__reply-btn" type="button" onClick={relpyFormToggle}>
              {props.commentIdForReply === comment._id ? "отмена" : "ответить"}
            </button>
            {userContext.user &&
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
