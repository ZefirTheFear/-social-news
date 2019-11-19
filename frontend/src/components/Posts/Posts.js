import React, { useState, useEffect, useContext, useRef } from "react";

import { withRouter } from "react-router-dom";

import cloneDeep from "clone-deep";

import Post from "./Post/Post";
import Spinner from "../Spinner/Spinner";

import UserContext from "../../context/userContext";

import "./Posts.scss";

const Posts = props => {
  const userContext = useContext(UserContext);

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMorePosts, setIsFetchingMorePosts] = useState(null);
  const [isMorePosts, setIsMorePosts] = useState(true);
  const isFetching = useRef(null);
  const didMountRef = useRef(false);
  const urlRef = useRef(null);
  const page = useRef(1);
  const isNewRequestUrl = useRef(false);
  const currentController = useRef(false);

  useEffect(() => {
    if (didMountRef.current && props.history.location.pathname === "/") {
      resetHomePage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isLogoClicked]);

  useEffect(() => {
    if (didMountRef.current && props.history.location.pathname !== urlRef) {
      changeRequestUrl();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.requestUrl]);

  useEffect(() => {
    componentDidMount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (isFetching.current) {
        currentController.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPosts = async () => {
    if (!isLoading) {
      setIsFetchingMorePosts(true);
    }
    isFetching.current = true;
    const controller = new AbortController();
    const signal = controller.signal;
    currentController.current = controller;
    try {
      const response = await fetch(props.requestUrl, {
        headers: {
          Authorization: userContext.token,
          Page: page.current
        },
        signal: signal
      });
      if (response.status !== 200) {
        isFetching.current = false;
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      if (resData.length === 0) {
        isFetching.current = false;
        setIsMorePosts(false);
        setIsFetchingMorePosts(false);
        setIsLoading(false);
        return;
      }
      if (resData.length < 5) {
        setIsMorePosts(false);
      }
      if (userContext.user) {
        const fetchedPosts = resData.filter(
          post => !userContext.user.ignoreList.includes(post.creator._id)
        );
        let newPosts;
        if (isNewRequestUrl.current) {
          newPosts = fetchedPosts;
          isNewRequestUrl.current = false;
        } else {
          newPosts = cloneDeep(posts);
          const newPostsIds = [];
          newPosts.forEach(post => newPostsIds.push(post._id));
          newPosts = newPosts.concat(
            fetchedPosts.filter(post => newPostsIds.indexOf(post._id) < 0)
          );
        }
        setPosts(newPosts);
      } else {
        let newPosts;
        if (isNewRequestUrl.current) {
          newPosts = resData;
          isNewRequestUrl.current = false;
        } else {
          newPosts = cloneDeep(posts);
          const newPostsIds = [];
          newPosts.forEach(post => newPostsIds.push(post._id));
          newPosts = newPosts.concat(resData.filter(post => newPostsIds.indexOf(post._id) < 0));
        }
        setPosts(newPosts);
      }
      isFetching.current = false;
      if (!isLoading) {
        setIsFetchingMorePosts(false);
      }
      setIsLoading(false);
    } catch (error) {
      isFetching.current = false;
      if (error.name === "AbortError") {
        return;
      }
      userContext.setIsError(true);
    }
  };

  const componentDidMount = async () => {
    await fetchPosts();
    didMountRef.current = true;
    urlRef.current = props.history.location.pathname;
  };

  const changeRequestUrl = () => {
    isNewRequestUrl.current = true;
    page.current = 1;
    setIsLoading(true);
    setIsMorePosts(true);
    setPosts([]);
    fetchPosts();
  };

  const morePosts = () => {
    page.current++;
    fetchPosts();
  };

  const resetHomePage = () => {
    page.current = 1;
    isNewRequestUrl.current = true;
    setIsLoading(true);
    setIsMorePosts(true);
    setPosts([]);
    fetchPosts();
  };

  const deletePost = postId => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  return (
    <div className="posts">
      {isLoading ? (
        <Spinner />
      ) : posts.length > 0 ? (
        <>
          {posts.map(post => (
            <div key={post._id} className="posts__post">
              <Post post={post} deletePost={deletePost} />
            </div>
          ))}
          <div className="posts__more-posts">
            {isFetchingMorePosts ? (
              <Spinner></Spinner>
            ) : isMorePosts ? (
              props.history.location.pathname !== "/hot" ? (
                <button className="posts__more-posts-btn" onClick={morePosts}>
                  Еще постов
                </button>
              ) : null
            ) : null}
          </div>
        </>
      ) : (
        <div className="posts__no-posts">Здесь пока что нет ни одного поста</div>
      )}
    </div>
  );
};

export default withRouter(Posts);
