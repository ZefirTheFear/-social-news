import React, { useState, useEffect, useContext } from "react";

import Post from "../Posts/Post/Post";
import Spinner from "../Spinner/Spinner";

import UserContext from "../../context/userContext";

import "./Search.scss";

const Search = props => {
  const userContext = useContext(UserContext);

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  let isFetching = true;

  const desired = props.match.params.desired.trim();

  const controller = new AbortController();
  const signal = controller.signal;

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.match.params.desired.trim()]);

  useEffect(() => {
    return () => {
      if (isFetching) {
        controller.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${window.domain}/posts/desired/${desired}`, { signal: signal });
      if (response.status !== 200) {
        isFetching = false;
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      setPosts(resData);
      isFetching = false;
      setIsLoading(false);
    } catch (error) {
      isFetching = false;
      userContext.setIsError(true);
    }
  };

  return (
    <div className="posts">
      {isLoading ? (
        <Spinner />
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
