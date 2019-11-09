import React, { useState, useEffect, useRef, useContext } from "react";

import Post from "../Posts/Post/Post";
import AddComment from "../AddComment/AddComment";
import Comments from "../Comments/Comments";
import Spinner from "../Spinner/Spinner";

import UserContext from "../../context/userContext";

import "./SinglePost.scss";

const SinglePost = props => {
  const commentsEl = useRef();
  const addCommentEl = useRef();

  const userContext = useContext(UserContext);

  const [comments, setComments] = useState([]);
  const [post, setPost] = useState(null);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  let isFetchingPost = true;
  let isFetchingComments = null;

  const postId = props.match.params.postTitle.split("--")[0];

  const controllerForPost = new AbortController();
  const signalForPost = controllerForPost.signal;
  const controllerForComments = new AbortController();
  const signalForComments = controllerForComments.signal;

  useEffect(() => {
    fetchPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollToComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.location.hash]);

  useEffect(() => {
    if (post) {
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post]);

  useEffect(() => {
    return () => {
      if (isFetchingPost) {
        controllerForPost.abort();
        console.log("fetchSinglePost-post прерван");
      }
      if (isFetchingComments) {
        controllerForComments.abort();
        console.log("fetchSinglePost-comments прерван");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPost = async () => {
    try {
      const response = await fetch(`${window.domain}/posts/${postId}`, { signal: signalForPost });
      console.log(response);
      if (response.status === 404) {
        isFetchingPost = false;
        userContext.setIsPageNotFound(true);
        return;
      }
      if (response.status !== 200) {
        isFetchingPost = false;
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      console.log(resData);
      setPost(resData);
      isFetchingPost = false;
      setIsLoadingPost(false);
    } catch (error) {
      console.log(error);
      isFetchingPost = false;
      if (error.name === "AbortError") {
        return;
      }
      userContext.setIsError(true);
    }
  };

  const fetchComments = async () => {
    try {
      isFetchingComments = true;
      const response = await fetch(`${window.domain}/posts/${postId}/comments`, {
        signal: signalForComments
      });
      console.log(response);
      if (response.status !== 200) {
        isFetchingComments = false;
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      console.log(resData);
      setComments(resData);
      isFetchingComments = false;
      setIsLoadingComments(false);
    } catch (error) {
      console.log(error);
      isFetchingComments = false;
      if (error.name === "AbortError") {
        return;
      }
      userContext.setIsError(true);
    }
  };

  const scrollToComments = () => {
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
  };

  const addComment = () => {
    fetchComments();
  };

  return (
    <div className="single-post">
      {isLoadingPost ? (
        <Spinner />
      ) : (
        <>
          <Post post={post} />

          <div className="single-post__comments-block" ref={commentsEl}>
            {isLoadingComments ? (
              <Spinner />
            ) : comments.length > 0 ? (
              <div className="single-post__comments">
                <Comments comments={comments} isOpenThread={true} />
              </div>
            ) : (
              <div className="single-post__no-comments">Комментариев пока нет. Станьте первым.</div>
            )}

            <div className="single-post__add-comment" ref={addCommentEl}>
              {userContext.isAuth ? (
                <AddComment postId={postId} addComment={addComment} mode="answerForPost" />
              ) : (
                <div>Войдите в систему, чтобы иметь возможность писать комментарии</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SinglePost;
