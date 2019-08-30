import React, { useState, useEffect } from "react";
import cloneDeep from "clone-deep";

import Comment from "../Comments/Comment/Comment";

import "./Answer.scss";

const Answer = props => {
  const [comment, setComment] = useState(null);

  useEffect(() => {
    const newAnswer = cloneDeep(props.answer);
    newAnswer.postId = newAnswer.postId._id;
    // console.log(newAnswer);
    setComment(newAnswer);
    // setIsLoading(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Answer">
      <h6>{props.answer.postId.title}</h6>
      {!comment ? <div>Loading...</div> : <Comment comment={comment} />}
    </div>
  );
};

export default Answer;
