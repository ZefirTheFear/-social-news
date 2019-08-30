import React, { useState, useEffect, useContext, useRef } from "react";

import UserContext from "../../context/userContext";
import Comments from "../Comments/Comments";
import ContentMaker from "../ContentMaker/ContentMaker";
import Post from "../Posts/Post/Post";

import "./SinglePost.scss";

const SinglePost = props => {
  const comments = useRef();

  const userContext = useContext(UserContext);

  const [newCommentData, setNewCommentData] = useState([]);
  const [parentCommentId, setParentCommentId] = useState(null);

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const postId = props.match.params.postTitle.split("--")[0];

  useEffect(() => {
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
        setPost(resData);
        setIsLoading(false);
      })
      .catch(error => console.log(error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (props.location.hash === "#comments") {
      let observer;
      const reset = () => {
        setTimeout(() => {
          if (observer) {
            observer.disconnect();
            // console.log("reseted");
          }
        }, 500);
      };
      const scrollToElement = () => {
        const element = comments.current;

        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          // element.scrollIntoView();
          // console.log("scrolled");
          reset();

          return true;
        }

        return false;
      };
      setTimeout(() => {
        if (scrollToElement()) {
          return;
        }
        observer = new MutationObserver(scrollToElement);
        observer.observe(document, {
          attributes: true,
          childList: true,
          subtree: true
        });
      });
    }
  }, [props.location.hash]);

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
    console.log("parentCommentId", parentCommentId);

    const formData = new FormData();
    formData.append("textBlocksArray", JSON.stringify(textBlocksArray));
    for (let index = 0; index < imgBlocksArray.length; index++) {
      formData.append("imgBlocksArray", imgBlocksArray[index]);
    }
    formData.append("content", JSON.stringify(dataOrder));

    if (parentCommentId) {
      formData.append("parentCommentId", parentCommentId);
    }

    fetch(`http://localhost:5001/posts/${postId}/add-comment`, {
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

  return isLoading ? (
    <div>Loading...</div>
  ) : !notFound ? (
    <div className="single-post">
      <Post post={post} />

      <div className="single-post__comments" ref={comments}>
        <Comments
          postId={postId}
          createCommentHandler={createCommentHandler}
          sendContentMakerStateHandler={sendContentMakerStateHandler}
          setParentCommentId={setParentCommentId}
        />
        <div className="single-post__add-comment">
          <div className="single-post__add-comment-offer">
            Добавьте комментарий, используя форму ниже...
          </div>
          <form
            className="single-post__add-comment-form"
            onSubmit={createCommentHandler}
            noValidate
          >
            <ContentMaker sendContentMakerStateHandler={sendContentMakerStateHandler} />
            <button type="submit" className="single-post__add-comment-btn">
              Отправить
            </button>
          </form>
        </div>
      </div>
    </div>
  ) : (
    <div>There is no such post</div>
  );
};

export default SinglePost;
