import React, { useState, useEffect, useContext } from "react";

import MyComment from "../MyComment/MyComment";
import Spinner from "../Spinner/Spinner";

import UserContext from "../../context/userContext";

import "./MyComments.scss";

const MyComments = () => {
  const userContext = useContext(UserContext);

  const [myComment, setMyComment] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  let isFetching = true;

  const controller = new AbortController();
  const signal = controller.signal;

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (isFetching) {
        controller.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchComments = async () => {
    try {
      const response = await fetch(`${window.domain}/comments/my-comments`, {
        headers: {
          Authorization: userContext.token
        },
        signal: signal
      });
      if (response.status !== 200) {
        isFetching = false;
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      setMyComment(resData);
      isFetching = false;
      setIsLoading(false);
    } catch (error) {
      isFetching = false;
      if (error.name === "AbortError") {
        return;
      }
      userContext.setIsError(true);
    }
  };

  return (
    <div className="my-comments">
      {isLoading ? (
        <Spinner />
      ) : myComment.length > 0 ? (
        myComment.map(myComment => {
          return myComment ? (
            <div className="my-comments__comment" key={myComment[0]._id}>
              <MyComment myComment={myComment} isOpenThread={false} />
            </div>
          ) : null;
        })
      ) : (
        <div className="my-comments__no-comments">Здесь пока что нет ни одного комментария</div>
      )}
    </div>
  );
};

export default MyComments;
