import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import Comments from "../Comments/Comments";

import "./Answer.scss";

const Answer = props => {
  useEffect(() => {
    console.log("answer", props.answer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="answer">
      <Link
        to={`/post/${props.answer[0].postId._id}--${props.answer[0].postId.title.replace(
          / /g,
          "_"
        )}`}
        className="answer__post-link"
      >
        <h6 className="answer__post-title">{props.answer[0].postId.title}</h6>
      </Link>
      {!props.answer ? (
        <div>Loading...</div>
      ) : (
        <Comments comments={props.answer} isOpenThread={props.isOpenThread} />
      )}
    </div>
  );
};

export default Answer;
