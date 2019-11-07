import React, { useState, useEffect, useContext } from "react";

import Post from "./Post/Post";
import Spinner from "../Spinner/Spinner";

import UserContext from "../../context/userContext";

import "./Posts.scss";

const Posts = props => {
  const userContext = useContext(UserContext);

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  let isFetching = true;

  const controller = new AbortController();
  const signal = controller.signal;

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isLogoClicked, props.requestUrl]);

  useEffect(() => {
    return () => {
      if (isFetching) {
        controller.abort();
        console.log("fetchPosts прерван");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(
        props.requestUrl,
        props.logedIn
          ? {
              headers: {
                Authorization: userContext.token
              },
              signal: signal
            }
          : { signal: signal }
      );
      console.log(response);
      if (response.status !== 200) {
        isFetching = false;
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      console.log(resData);
      if (userContext.user) {
        const posts = resData.filter(
          post => !userContext.user.ignoreList.includes(post.creator._id)
        );
        console.log(posts);
        setPosts(posts);
      } else {
        setPosts(resData);
      }
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

  const deletePost = postId => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  return (
    <div className="posts">
      {isLoading ? (
        <Spinner />
      ) : posts.length > 0 ? (
        posts.map(post => (
          <div key={post._id} className="posts__post">
            <Post post={post} deletePost={deletePost} />
          </div>
        ))
      ) : (
        <div className="posts__no-posts">Здесь пока что нет ни одного поста</div>
      )}
    </div>
  );
};

export default Posts;
