import React, { useState, useContext } from "react";

import ContentMaker from "../ContentMaker/ContentMaker";

import UserContext from "../../context/userContext";

import "./AddComment.scss";

const AddComment = props => {
  const userContext = useContext(UserContext);

  const [newCommentData, setNewCommentData] = useState([]);

  const createCommentHandler = e => {
    e.preventDefault();
    console.log("content", newCommentData);

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

    fetch(`http://localhost:5001/posts/${props.postId}/add-comment`, {
      headers: {
        Authorization: userContext.token
      },
      method: "POST",
      body: formData
    })
      .then(res => {
        console.log(res);
        if (res.status === 201 || res.status === 422) {
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
          // setErrors(resData.errors);
        } else {
          setNewCommentData([]);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const sendContentMakerStateHandler = content => {
    setNewCommentData(content);
  };

  return (
    <div className="add-comment">
      <div className="add-comment__offer">Добавьте комментарий, используя форму ниже...</div>
      <form className="add-comment__form" onSubmit={createCommentHandler} noValidate>
        <ContentMaker sendContentMakerStateHandler={sendContentMakerStateHandler} />
        <button type="submit" className="add-comment__btn">
          Отправить
        </button>
      </form>
    </div>
  );
};

export default AddComment;
