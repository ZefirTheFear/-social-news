import React, { useState, useEffect } from "react";

import Post from "../Posts/Post/Post";
import Spinner from "../Spinner/Spinner";
import SomethingWentWrong from "../SomethingWentWrong/SomethingWentWrong";

import "./Search.scss";

const Search = props => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const desired = props.match.params.desired.trim();

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const request = await fetch(`${window.domain}/posts/desired/${desired}`);
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
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.match.params.desired.trim()]);

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
        <div className="posts__no-posts">
          По запросу '{props.match.params.desired.trim()}' ничего не найдено
        </div>
      )}
    </div>
  );
};

export default Search;
