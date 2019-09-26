import React, { useState, useEffect, useRef } from "react";

import Post from "../Posts/Post/Post";
import AddComment from "../AddComment/AddComment";
import Comments from "../Comments/Comments";
import Spinner from "../Spinner/Spinner";

import "./SinglePost.scss";

const SinglePost = props => {
  const commentsEl = useRef();

  const [comments, setComments] = useState([]);

  const [post, setPost] = useState(null);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const postId = props.match.params.postTitle.split("--")[0];

  useEffect(() => {
    fetch(`http://localhost:5001/posts/${postId}`)
      .then(res => {
        if (res.status === 404) {
          setNotFound(true);
          setIsLoadingPost(false);
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
        setIsLoadingPost(false);
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
        const element = commentsEl.current;

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

  useEffect(() => {
    fetch(`http://localhost:5001/posts/${postId}/comments`)
      .then(res => res.json())
      .then(resData => {
        console.log(resData);
        setComments(resData);
        setIsLoadingComments(false);
      })
      .catch(error => console.log(error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isLoadingPost ? (
    <Spinner />
  ) : !notFound ? (
    <div className="single-post">
      <Post post={post} />

      <div className="single-post__comments-block" ref={commentsEl}>
        {isLoadingComments ? (
          <Spinner />
        ) : comments.length > 0 ? (
          <div className="single-post__comments">
            <Comments comments={comments} isOpenThread={true} />
          </div>
        ) : (
          <h4 className="single-post__no-comments">Комментариев пока нет. Станьте первым.</h4>
        )}
        <div className="single-post__add-comment">
          <AddComment postId={postId} />
        </div>
      </div>
    </div>
  ) : (
    <div>There is no such post</div>
  );
};

export default SinglePost;
