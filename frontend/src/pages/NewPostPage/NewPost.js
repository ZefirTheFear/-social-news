import React, { useState, useContext, useEffect } from "react";

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

  const [fetchedPostBody, setFetchedPostBody] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const postId = props.match.params.postId;

  useEffect(() => {
    if (props.editMode) {
      setIsLoading(true);
      fetch(`http://localhost:5001/posts/${postId}`)
        .then(res => {
          if (res.status === 404) {
            setNotFound(true);
            setIsLoading(false);
            return;
          } else if (res.status === 200) {
            return res.json();
          } else {
            // TODO вывести UI , что что-то пошло не так
            console.log("что что-то пошло не так");
            return;
          }
        })
        .then(resData => {
          if (!resData) {
            return;
          }
          console.log(resData);
          // if (resData.creator._id !== userContext.user._id) {
          if (userContext.user.status !== "admin" && userContext.user.status !== "moderator") {
            return props.history.push("/");
          }

          setTitle(resData.title);

          const fetchedTags = [];
          resData.tags.forEach(tag =>
            fetchedTags.push({ content: tag, key: Date.now() * Math.random() })
          );
          setTags(fetchedTags);

          const fetchedOldPostBody = [];
          resData.body.forEach(bodyItem => {
            if (bodyItem.type === "text") {
              fetchedOldPostBody.push({
                type: "text",
                content: bodyItem.content,
                key: bodyItem.key
              });
            } else {
              fetchedOldPostBody.push({
                type: "image",
                url: `http://localhost:5001/${bodyItem.url}`,
                key: bodyItem.key
              });
            }
          });
          setFetchedPostBody(fetchedOldPostBody);

          setIsLoading(false);
        })
        .catch(error => console.log(error));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const oldImgBlocksArray = [];
    const newImgBlocksArray = [];
    const dataOrder = [];
    const postTags = [];

    props.editMode
      ? newPostData.forEach(item => {
          if (item.type === "text") {
            if (item.content !== "") {
              textBlocksArray.push(item.content.trim());
              dataOrder.push({ type: "text", key: item.key });
            }
          } else if (item.content) {
            newImgBlocksArray.push(item.content);
            dataOrder.push({ type: "newImg", key: item.key });
          } else {
            oldImgBlocksArray.push(item.url.replace("http://localhost:5001/", ""));
            dataOrder.push({ type: "oldImg", key: item.key });
          }
        })
      : newPostData.forEach(item => {
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

    if (props.editMode) {
      console.log("textBlocksArray", textBlocksArray);
      console.log("oldImgBlocksArray", oldImgBlocksArray);
      console.log("newImgBlocksArray", newImgBlocksArray);
      console.log("dataOrder", dataOrder);
    } else {
      console.log("textBlocksArray", textBlocksArray);
      console.log("imgBlocksArray", imgBlocksArray);
      console.log("dataOrder", dataOrder);
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("textBlocksArray", JSON.stringify(textBlocksArray));
    if (props.editMode) {
      formData.append("oldImgBlocksArray", JSON.stringify(oldImgBlocksArray));
      for (let index = 0; index < newImgBlocksArray.length; index++) {
        // formData.append("imgBlocksArray", newImgBlocksArray[index]);
        formData.append("newImgBlocksArray", newImgBlocksArray[index]);
      }
    } else {
      for (let index = 0; index < imgBlocksArray.length; index++) {
        formData.append("imgBlocksArray", imgBlocksArray[index]);
      }
    }
    formData.append("content", JSON.stringify(dataOrder));
    formData.append("tags", JSON.stringify(postTags));

    fetch(
      props.editMode
        ? `http://localhost:5001/posts/${postId}/edit`
        : "http://localhost:5001/posts/new-post",
      {
        headers: {
          Authorization: userContext.token
        },
        method: props.editMode ? "PATCH" : "POST",
        body: formData
      }
    )
      .then(res => {
        console.log(res);
        if (res.status === 200 || res.status === 201 || res.status === 422) {
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

  return isLoading ? (
    <div>Loading...</div>
  ) : !notFound ? (
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
          <ContentMaker
            sendContentMakerStateHandler={sendContentMakerStateHandler}
            contentData={props.editMode ? fetchedPostBody : null}
          />
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
          {props.editMode ? "Сохранить" : "Добавить пост"}
        </button>
      </form>
    </div>
  ) : (
    <div>There is no such post</div>
  );
};

export default NewPost;
