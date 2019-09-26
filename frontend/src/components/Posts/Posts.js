import React, { useState, useEffect } from "react";

import Post from "./Post/Post";
import Spinner from "../Spinner/Spinner";
import SomethingWentWrong from "../SomethingWentWrong/SomethingWentWrong";

import "./Posts.scss";

const Posts = props => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const request = await fetch(props.requestUrl);
      console.log(request);
      if (request.status !== 200) {
        setIsError(true);
        setIsLoading(false);
        return;
      }
      const resData = await request.json();
      console.log(resData);
      setPosts(resData);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsError(true);
      setIsLoading(false);
    }
    // setIsLoading(true);
    // fetch("http://localhost:5001/posts")
    //   .then(res => {
    //     console.log(res);
    //     res.json();
    //   })
    //   .then(resData => {
    //     console.log(resData);
    //     setPosts(resData);
    //     setIsLoading(false);
    //   })
    //   .catch(error => console.log(error));
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
        <div>There is no posts yet</div>
      )}
    </div>
  );
};

export default Posts;
