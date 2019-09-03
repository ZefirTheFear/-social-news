import React, { useEffect } from "react";

import Comments from "../Comments/Comments";

import "./Answer.scss";

const Answer = props => {
  useEffect(() => {
    console.log("answer", props.answer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="answer">
      <h6>{props.answer[0].postId.title}</h6>
      {!props.answer ? <div>Loading...</div> : <Comments comments={props.answer} />}
    </div>
  );
};

export default Answer;
