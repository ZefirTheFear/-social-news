import React, { useState, useEffect, useContext } from "react";

import Post from "./Post/Post";
import Spinner from "../Spinner/Spinner";
import SomethingWentWrong from "../SomethingWentWrong/SomethingWentWrong";

import UserContext from "../../context/userContext";

import "./Posts.scss";

const Posts = props => {
  const userContext = useContext(UserContext);

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        props.requestUrl,
        props.logedIn
          ? {
              headers: {
                Authorization: userContext.token
              }
            }
          : null
      );
      console.log(response);
      if (response.status !== 200) {
        setIsError(true);
        setIsLoading(false);
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
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isLogoClicked, props.requestUrl]);

  return (
    <div className="posts">
      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <SomethingWentWrong />
      ) : posts.length > 0 ? (
        posts.map(post => (
          <div key={post._id} className="posts__post">
            <Post post={post} />
          </div>
        ))
      ) : (
        <div className="posts__no-posts">Здесь пока что нет ни одного поста</div>
      )}
    </div>
  );
};

export default Posts;
