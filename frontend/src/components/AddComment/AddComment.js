import React, { useState, useContext } from "react";

import uniqid from "uniqid";
import cloneDeep from "clone-deep";

import ContentMaker from "../ContentMaker/ContentMaker";

import UserContext from "../../context/userContext";

import "./AddComment.scss";

const AddComment = props => {
  const userContext = useContext(UserContext);

  const [newCommentData, setNewCommentData] = useState([]);
  const [errors, setErrors] = useState({});
  const [isContentMakerReseted, setIsContentMakerReseted] = useState(null);

  const createComment = async e => {
    e.preventDefault();

    let commentData = cloneDeep(newCommentData);

    console.log("content", newCommentData);

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
      if (item.type === "image") {
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
    }

    console.log("content", commentData);
    console.log("parentCommentId", props.parentCommentId);

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
      console.log(response);
      if (response.status !== 201 && response.status !== 422) {
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      console.log(resData);
      if (resData.errors) {
        setErrors(resData.errors);
      } else if (props.mode === "answerForPost") {
        props.addComment();
        setIsContentMakerReseted(uniqid());
      } else {
        props.addComment(resData);
      }
    } catch (error) {
      console.log(error);
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
    </div>
  );
};

export default AddComment;
