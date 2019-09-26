import React, { useState, useContext } from "react";

import uniqid from "uniqid";

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

  const newTagHandler = () => {
    if (currentTag.trim().length > 0 && currentTag.trim().length < 300) {
      for (const tag of tags) {
        if (tag.content === currentTag.trim()) {
          return setCurrentTag("");
        }
      }
      setTags([...tags, { content: currentTag.trim(), key: uniqid() }]);
      setCurrentTag("");
    } else if (currentTag.trim().length > 30) {
      setCurrentTag("");
      setErrors({ ...errors, tags: { msg: "Нe более 30 символов в теге" } });
    }
  };

  const removeNewPostTagHandler = index => {
    const postTags = [...tags];
    postTags.splice(index, 1);
    setTags(postTags);
  };

  const createPost = e => {
    e.preventDefault();
    console.log("title", title.trim());
    console.log("content", newPostData);
    console.log("tags", tags);

    const clientErrors = {};
    if (title.trim().length < 1 || title.trim().length > 30) {
      clientErrors.title = {
        msg: "Длина заголовка от 1 до 30 символов"
      };
    }
    if (newPostData.length < 1) {
      clientErrors.content = {
        msg: "Нужен контент"
      };
    }
    if (newPostData.length > 5) {
      clientErrors.content = {
        msg: "Максимум 5 блоков"
      };
    }
    if (tags.length < 1) {
      clientErrors.tags = {
        msg: "Нужен хотя бы 1 тег"
      };
    }
    if (tags.length > 5) {
      clientErrors.tags = {
        msg: "Максимум 5 тегов"
      };
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

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

  const focusPostTitle = () => {
    const newErrors = { ...errors };
    delete newErrors.title;
    setErrors(newErrors);
  };

  const focusPostTag = () => {
    const newErrors = { ...errors };
    delete newErrors.tags;
    setErrors(newErrors);
  };

  const focusPostContent = () => {
    const newErrors = { ...errors };
    delete newErrors.content;
    setErrors(newErrors);
  };

  return (
    <div className="new-post">
      <form className="new-post__form" noValidate onSubmit={createPost}>
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
            onFocus={focusPostTitle}
          />
        </div>
        {errors.title ? <div className="new-post__invalid-feedback">{errors.title.msg}</div> : null}

        <div
          className={"new-post__content" + (errors.content ? " new-post__content_invalid" : "")}
          onClick={focusPostContent}
        >
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
              onFocus={focusPostTag}
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
