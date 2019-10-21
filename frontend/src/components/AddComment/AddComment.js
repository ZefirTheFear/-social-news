import React, { useState, useContext } from "react";

import ContentMaker from "../ContentMaker/ContentMaker";

import UserContext from "../../context/userContext";

import "./AddComment.scss";

const AddComment = props => {
  const userContext = useContext(UserContext);

  const [newCommentData, setNewCommentData] = useState([]);
  const [errors, setErrors] = useState({});
  const [isContentMakerReseted, setIsContentMakerReseted] = useState(null);

  const createCommentHandler = async e => {
    e.preventDefault();
    console.log("content", newCommentData);

    if (newCommentData.length === 0) {
      return setErrors({ content: { msg: "Нужен контент" } });
    }
    if (newCommentData.length > 5) {
      return setErrors({ content: { msg: "Максимум 5 блоков" } });
    }

    const textBlocksArray = [];
    const imgBlocksArray = [];
    const dataOrder = [];

    newCommentData.forEach(item => {
      if (item.type === "text") {
        if (item.content !== "") {
          textBlocksArray.push(item.content);
          dataOrder.push({ type: "text", key: item.key });
        }
      } else {
        imgBlocksArray.push(item.content);
        dataOrder.push({ type: "img", key: item.key });
      }
    });

    console.log("textBlocksArray", textBlocksArray);
    console.log("imgBlocksArray", imgBlocksArray);
    console.log("dataOrder", dataOrder);
    console.log("parentCommentId", props.parentCommentId);

    const formData = new FormData();
    formData.append("textBlocksArray", JSON.stringify(textBlocksArray));
    for (let index = 0; index < imgBlocksArray.length; index++) {
      formData.append("imgBlocksArray", imgBlocksArray[index]);
    }
    formData.append("content", JSON.stringify(dataOrder));

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
        props.addComment(resData);
        setIsContentMakerReseted(Date.now());
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
        onSubmit={createCommentHandler}
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
