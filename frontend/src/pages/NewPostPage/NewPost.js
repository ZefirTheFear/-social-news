import React, { useState, useContext } from "react";

import ContentMaker from "../../components/ContentMaker/ContentMaker";
import NewPostTagContainer from "../../components/NewPostTagContainer/NewPostTagContainer";

import UserContext from "../../context/userContext";

import "./NewPost.scss";

const NewPost = props => {
  const userContext = useContext(UserContext);

  const [errors, setErrors] = useState({});
  const [title, setTitle] = useState("");
  const [newPostData, setNewPostData] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [tags, setTags] = useState([]);

  // Title
  const onChangeTitle = e => {
    setTitle(e.target.value);
  };

  // Tags
  const onChangeCurrentTag = e => {
    setCurrentTag(e.target.value);
  };

  const newTagHandler = e => {
    if (currentTag.trim().length > 0) {
      setTags([...tags, { content: currentTag.trim(), key: Date.now() }]);
      setCurrentTag("");
    }
  };

  const removeNewPostTagHandler = index => {
    const postTags = [...tags];
    postTags.splice(index, 1);
    setTags(postTags);
  };

  const onSubmit = e => {
    e.preventDefault();
    console.log(e);
    console.log("title", title.trim());
    console.log("content", newPostData);
    console.log("tags", tags);

    const textBlocksArray = [];
    const imgBlocksArray = [];
    const dataOrder = [];
    const postTags = [];

    newPostData.forEach(item => {
      if (item.type === "text") {
        if (item.content !== "") {
          textBlocksArray.push(item.content.trim());
          dataOrder.push({ type: "text", key: item.key });
        }
      } else {
        imgBlocksArray.push(item.content);
        dataOrder.push({ type: "img", key: item.key });
      }
    });

    tags.forEach(item => postTags.push(item.content));

    console.log("textBlocksArray", textBlocksArray);
    console.log("imgBlocksArray", imgBlocksArray);
    console.log("dataOrder", dataOrder);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("textBlocksArray", JSON.stringify(textBlocksArray));
    for (let index = 0; index < imgBlocksArray.length; index++) {
      formData.append("imgBlocksArray", imgBlocksArray[index]);
    }
    formData.append("content", JSON.stringify(dataOrder));
    formData.append("tags", JSON.stringify(postTags));

    fetch("http://localhost:5001/posts/new-post", {
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
          setErrors(resData.errors);
        } else {
          return props.history.push("/");
        }
      })
      .catch(err => console.log(err));
  };

  const sendContentMakerStateHandler = content => {
    setNewPostData(content);
  };

  return (
    <div className="new-post">
      <form className="new-post__form" noValidate onSubmit={onSubmit}>
        <div className="new-post__title">
          <input
            className={
              "new-post__title-input" + (errors.title ? " new-post__title-input_invalid" : "")
            }
            placeholder="Заголовок"
            name="newPostTitle"
            value={title}
            onChange={onChangeTitle}
            autoComplete="off"
          />
        </div>
        {errors.title ? <div className="new-post__invalid-feedback">{errors.title.msg}</div> : null}

        <div className={"new-post__content" + (errors.content ? " new-post__content_invalid" : "")}>
          <ContentMaker sendContentMakerStateHandler={sendContentMakerStateHandler} />
        </div>
        {errors.content ? (
          <div className="new-post__invalid-feedback">{errors.content.msg}</div>
        ) : null}

        <div className={"new-post__tags" + (errors.tags ? " new-post__tags_invalid" : "")}>
          <div className="new-post__tag-list">
            {tags.map((tag, index) => (
              <NewPostTagContainer
                key={tag.key}
                tag={tag.content}
                removeTag={() => removeNewPostTagHandler(index)}
              />
            ))}
          </div>
          <div className="new-post__add-tag">
            <input
              className="new-post__tag-input"
              placeholder="Тег"
              name="newPostTags"
              autoComplete="off"
              value={currentTag}
              onChange={onChangeCurrentTag}
            />
            <button type="button" className="new-post__add-tag-btn" onClick={newTagHandler} />
          </div>
        </div>
        {errors.tags ? <div className="new-post__invalid-feedback">{errors.tags.msg}</div> : null}
        <button type="submit" className="new-post__submit-btn">
          Добавить пост
        </button>
      </form>
    </div>
  );
};

export default NewPost;
