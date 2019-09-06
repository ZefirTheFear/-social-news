import React, { useState, useEffect, useContext } from "react";

import MyComment from "../MyComment/MyComment";

import UserContext from "../../context/userContext";

import "./MyComments.scss";

const MyComments = () => {
  const userContext = useContext(UserContext);

  const [myComment, setMyComment] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch("http://localhost:5001/comments/my-comments", {
      headers: {
        Authorization: userContext.token
      }
    })
      .then(res => res.json())
      .then(resData => {
        console.log(resData);
        setMyComment(resData);
        setIsLoading(false);
      })
      .catch(error => console.log(error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isLoading ? (
    <div>Loading...</div>
  ) : (
    <div className="answers-comments">
      {myComment.map(myComment => {
        return myComment ? (
          <div className="answers-comments__answer" key={myComment[0]._id}>
            <MyComment myComment={myComment} isOpenThread={false} />
          </div>
        ) : null;
      })}
    </div>
  );
};

export default MyComments;
