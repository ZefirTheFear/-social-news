import React, { useContext, useState, useEffect } from "react";
import parse from "html-react-parser";
import { Link } from "react-router-dom";

import ContentMaker from "../../ContentMaker/ContentMaker";

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

  useEffect(() => {
    console.log(comment);
    if (comment) {
      const body = comment.body.map(item => {
        if (item.type === "text") {
          return (
            <div className="comment__text-block" key={Date.now() * Math.random()}>
              {parse(item.content)}
            </div>
          );
        } else {
          return (
            <div className="comment__img-block" key={Date.now() * Math.random()}>
              <img
                className="comment__img-block-img"
                src={"http://localhost:5001/" + item.url}
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

  const fetchComment = () => {
    fetch(`http://localhost:5001/posts/comments/${comment._id}`)
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
        setComment(resData);
      })
      .catch(error => console.log(error));
  };

  const likeComment = () => {
    fetch(`http://localhost:5001/posts/comments/${comment._id}/like`, {
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
        fetchComment();
      })
      .catch(error => console.log(error));
  };

  const dislikeComment = () => {
    fetch(`http://localhost:5001/posts/comments/${comment._id}/dislike`, {
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
        fetchComment();
      })
      .catch(error => console.log(error));
  };

  const editCommentHandler = () => {
    console.log(comment.body);
    setEditMode(true);
    const comBody = [];

    comment.body.forEach(item => {
      if (item.type === "text") {
        comBody.push(item);
      } else {
        comBody.push({ ...item, url: `http://localhost:5001/${item.url}` });
      }
    });
    console.log(comBody);

    setCommentBodyForEditing(comBody);
  };

  const cancelEditModeHandler = () => {
    setEditMode(false);
  };

  const sendEditedCommentHandler = e => {
    e.preventDefault();
    console.log("content", editCommentData);

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
        oldImgBlocksArray.push(item.url.replace("http://localhost:5001/", ""));
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

    fetch(`http://localhost:5001/posts/comments/${comment._id}/edit`, {
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
          // TODO обработать ошибки
        } else {
          cancelEditModeHandler();
          setComment(resData);
        }
      })
      .catch(err => console.log(err));
  };

  const deleteCommentHandler = () => {
    fetch(`http://localhost:5001/posts/comments/${comment._id}/delete`, {
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
        setComment(null);
      })
      .catch(error => console.log(error));
  };

  const sendContentMakerStateHandler = content => {
    setEditCommentData(content);
  };

  const addReplyComment = e => {
    props.createCommentHandler(e);
    props.openReplyBlockHandler(null);
    setTimeout(() => {
      fetchComment();
    }, 1000);
  };

  return comment ? (
    <div className="comment">
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
                src={comment.creator.avatar}
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
        <form className="comment__edit-form" onSubmit={sendEditedCommentHandler} noValidate>
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
      ) : (
        <React.Fragment>
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
                  onClick={deleteCommentHandler}
                  title="Удалить"
                />
              </div>
            ) : null}
          </div>
        </React.Fragment>
      )}

      {props.commentIdForReply === comment._id ? (
        <div className="comment__reply-block">
          <form className="comment__reply-form" onSubmit={addReplyComment} noValidate>
            <ContentMaker sendContentMakerStateHandler={props.sendContentMakerStateHandler} />
            <button type="submit" className="comment__reply-submit">
              отправить
            </button>
          </form>
        </div>
      ) : null}
    </div>
  ) : null;
};

export default Comment;
