import React, { useState, useContext, useEffect } from "react";

import uniqid from "uniqid";
import cloneDeep from "clone-deep";

import ContentMaker from "../ContentMaker/ContentMaker";
import NewPostTagContainer from "../NewPostTagContainer/NewPostTagContainer";
import Spinner from "../Spinner/Spinner";
import Loading from "../Loading/Loading";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isNeedToWait, setIsNeedToWait] = useState(false);
  let isFetching = null;

  const postId = props.match.params.postId;

  const controller = new AbortController();
  const signal = controller.signal;

  useEffect(() => {
    if (props.editMode) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (isFetching) {
        controller.abort();
        console.log("fetchPostData прерван");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    if (userContext.user.status !== "admin" && userContext.user.status !== "moderator") {
      return props.history.push("/");
    }

    isFetching = true;
    setIsLoading(true);
    try {
      const response = await fetch(`${window.domain}/posts/${postId}`, { signal: signal });
      console.log(response);
      if (response.status === 404) {
        isFetching = false;
        userContext.setIsPageNotFound(true);
        return;
      }
      if (response.status !== 200) {
        isFetching = false;
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      console.log(resData);

      setTitle(resData.title);

      const fetchedTags = [];
      resData.tags.forEach(tag => fetchedTags.push({ content: tag, key: uniqid() }));
      setTags(fetchedTags);

      setFetchedPostBody(resData.body);

      isFetching = false;
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      isFetching = false;
      if (error.name === "AbortError") {
        return;
      }
      userContext.setIsError(true);
    }
  };

  // Title
  const onChangeTitle = e => {
    setTitle(e.target.value);
  };

  // Tags
  const onChangeCurrentTag = e => {
    setCurrentTag(e.target.value);
  };

  const newTagHandler = () => {
    if (currentTag.trim().length > 0 && currentTag.trim().length <= 30) {
      for (const tag of tags) {
        if (tag.content === currentTag.trim()) {
          return setCurrentTag("");
        }
      }
      setTags([...tags, { content: currentTag.trim(), key: uniqid() }]);
      setCurrentTag("");
    } else if (currentTag.trim().length > 30) {
      setErrors({ ...errors, tags: { msg: "Нe более 30 символов в теге" } });
    }
  };

  const removeTagHandler = index => {
    const postTags = [...tags];
    postTags.splice(index, 1);
    setTags(postTags);
  };

  const createPost = async e => {
    e.preventDefault();
    setIsNeedToWait(true);

    let postData = cloneDeep(newPostData);

    console.log("title", title.trim());
    console.log("content", newPostData);
    console.log("tags", tags);

    const clientErrors = {};
    if (title.trim().length < 1 || title.trim().length > 30) {
      clientErrors.title = {
        msg: "Длина заголовка от 1 до 30 символов"
      };
    }
    postData = postData.filter(
      item => item.type === "image" || (item.type === "text" && item.content.length !== 0)
    );
    if (postData.length < 1) {
      clientErrors.content = {
        msg: "Нужен контент"
      };
    }
    if (postData.length > 5) {
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
    for (const tag of tags) {
      if (tag.content.length > 30) {
        clientErrors.tags = {
          msg: "Нe более 30 символов в теге"
        };
      }
    }

    if (Object.keys(clientErrors).length > 0) {
      setIsNeedToWait(false);
      return setErrors(clientErrors);
    }

    if (props.editMode) {
      for (const item of postData) {
        try {
          if (item.type === "image" && item.content) {
            const data = new FormData();
            data.append("file", item.content);
            data.append("upload_preset", "post-imgs");
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
    } else {
      for (const item of postData) {
        try {
          if (item.type === "image") {
            const data = new FormData();
            data.append("file", item.content);
            data.append("upload_preset", "post-imgs");
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
    }

    const postTags = [];
    tags.forEach(item => postTags.push(item.content));

    console.log("content", postData);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("content", JSON.stringify(postData));
    formData.append("tags", JSON.stringify(postTags));

    try {
      setIsLoading(true);
      const response = await fetch(
        props.editMode
          ? `${window.domain}/posts/${postId}/edit`
          : `${window.domain}/posts/new-post`,
        {
          headers: {
            Authorization: userContext.token
          },
          method: props.editMode ? "PATCH" : "POST",
          body: formData
        }
      );
      console.log(response);
      if (response.status !== 200 && response.status !== 201 && response.status !== 422) {
        setIsLoading(false);
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      console.log(resData);
      if (resData.errors) {
        setErrors(resData.errors);
        setIsLoading(false);
      } else {
        return props.history.push("/");
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      userContext.setIsError(true);
    }
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
    <Spinner />
  ) : (
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
                removeTag={() => removeTagHandler(index)}
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
      {isNeedToWait ? <Loading /> : null}
    </div>
  );
};

export default NewPost;
