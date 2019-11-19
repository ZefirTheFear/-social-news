import React, { useState, useContext } from "react";

import uniqid from "uniqid";
import cloneDeep from "clone-deep";

import ContentMaker from "../ContentMaker/ContentMaker";
import Loading from "../Loading/Loading";

import UserContext from "../../context/userContext";

import "./AddComment.scss";

const AddComment = props => {
  const userContext = useContext(UserContext);

  const [newCommentData, setNewCommentData] = useState([]);
  const [errors, setErrors] = useState({});
  const [isContentMakerReseted, setIsContentMakerReseted] = useState(null);
  const [isNeedToWait, setIsNeedToWait] = useState(false);

  const createComment = async e => {
    e.preventDefault();
    setIsNeedToWait(true);

    let commentData = cloneDeep(newCommentData);

    commentData = commentData.filter(
      item => item.type === "image" || (item.type === "text" && item.content.length !== 0)
    );
    if (commentData.length === 0) {
      setIsNeedToWait(false);
      return setErrors({ content: { msg: "Нужен контент" } });
    }
    if (commentData.length > 5) {
      setIsNeedToWait(false);
      return setErrors({ content: { msg: "Максимум 5 блоков" } });
    }

    for (const item of commentData) {
      try {
        if (item.type === "image") {
          const data = new FormData();
          data.append("file", item.content);
          data.append("upload_preset", "comment-imgs");
          const response = await fetch("https://api.cloudinary.com/v1_1/ztf/upload", {
            method: "POST",
            body: data
          });
          const resData = await response.json();
          item.url = resData.secure_url;
          item.public_id = resData.public_id;
          delete item.content;
        }
      } catch (error) {
        userContext.setIsError(true);
      }
    }

    const formData = new FormData();
    formData.append("content", JSON.stringify(commentData));

    if (props.parentCommentId) {
      formData.append("parentCommentId", props.parentCommentId);
    }

    try {
      const response = await fetch(`${window.domain}/posts/${props.postId}/add-comment`, {
        headers: {
          Authorization: userContext.token
        },
        method: "POST",
        body: formData
      });
      if (response.status !== 201 && response.status !== 422) {
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      if (resData.errors) {
        setIsNeedToWait(false);
        setErrors(resData.errors);
      } else if (props.mode === "answerForPost") {
        props.addComment();
        setIsContentMakerReseted(uniqid());
        setIsNeedToWait(false);
      } else {
        props.addComment(resData);
        setIsNeedToWait(false);
      }
    } catch (error) {
      userContext.setIsError(true);
    }
  };

  const sendContentMakerStateHandler = content => {
    setNewCommentData(content);
  };

  const focusForm = () => {
    setErrors({});
  };

  return (
    <div className="add-comment">
      <div className="add-comment__offer">Добавьте комментарий, используя форму ниже...</div>
      <form
        className={"add-comment__form" + (errors.content ? " add-comment__form_invalid" : "")}
        onSubmit={createComment}
        onClick={focusForm}
        noValidate
      >
        <ContentMaker
          sendContentMakerStateHandler={sendContentMakerStateHandler}
          isReseted={isContentMakerReseted}
        />
        <button type="submit" className="add-comment__btn">
          Отправить
        </button>
      </form>
      {errors.content ? (
        <div className="add-comment__form__invalid-feedback">{errors.content.msg}</div>
      ) : null}
      {isNeedToWait ? <Loading /> : null}
    </div>
  );
};

export default AddComment;
