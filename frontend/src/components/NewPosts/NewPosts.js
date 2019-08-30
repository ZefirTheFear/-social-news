import React, { useState, useEffect } from "react";

import Post from "../Posts/Post/Post";

import "./NewPosts.scss";

const NewPosts = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = () => {
    setIsLoading(true);
    fetch("http://localhost:5001/posts/new")
      .then(res => res.json())
      .then(resData => {
        console.log(resData);
        setPosts(resData);
        setIsLoading(false);
      })
      .catch(error => console.log(error));
  };

  useEffect(() => {
    fetchPosts();
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

export default NewPosts;
