import React, { useState, useEffect, useContext } from "react";

import Post from "../Posts/Post/Post";

import UserContext from "../../context/userContext";

import "./EstimatesDislikes.scss";

const EstimatesDislikes = () => {
  const userContext = useContext(UserContext);

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5001/posts/disliked", {
      headers: {
        Authorization: userContext.token
      }
    })
      .then(res => res.json())
      .then(resData => {
        console.log(resData);
        setPosts(resData);
        setIsLoading(false);
      })
      .catch(error => console.log(error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="posts">
      {isLoading ? (
        <div>Loading...</div>
      ) : posts.length > 0 ? (
        posts.map(post => (
          <div key={post._id} className="posts__post">
            <Post post={post} />
          </div>
        ))
      ) : (
        <h1>There is no posts yet</h1>
      )}
    </div>
  );
};

export default EstimatesDislikes;