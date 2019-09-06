import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import Comments from "../Comments/Comments";

import "./MyComment.scss";

const MyComment = props => {
  const answerEl = useRef();

  const [isParentShown, setIsParentShown] = useState(false);
  const [myComment, setMyComment] = useState(props.myComment);
  // const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isParentShown) {
      answerEl.current.querySelector(".comments__opened-internal-comments").style.display = "flex";
      answerEl.current.querySelectorAll(".comments__closed-internal-comments")[
        answerEl.current.querySelectorAll(".comments__closed-internal-comments").length - 1
      ].style.display = "none";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myComment]);

  const showParentHandler = () => {
    // setIsLoading(true);
    fetch(`http://localhost:5001/posts/comments/${myComment[0].parentComment}`)
      .then(res => res.json())
      .then(resData => {
        console.log(resData);
        const parentComment = { ...resData };
        parentComment.children = [myComment[0]._id];
        const newMyComment = [...myComment];
        newMyComment.unshift(parentComment);
        setIsParentShown(true);
        setMyComment(newMyComment);
        // setIsLoading(false);
      })
      .catch(error => console.log(error));
  };

  const hideParentHandler = () => {
    const newMyComment = [...myComment];
    newMyComment.shift();
    setMyComment(newMyComment);
    setIsParentShown(false);
  };

  // return isLoading ? (
  //   <div>Loading...</div>
  // ) : (
  return (
    <div className="my-comment" ref={answerEl}>
      <Link
        to={`/post/${myComment[0].postId._id}--${myComment[0].postId.title.replace(/ /g, "_")}`}
        className="my-comment__post-link"
      >
        <h6 className="my-comment__post-title">{myComment[0].postId.title}</h6>
      </Link>
      {!myComment ? (
        <div>Loading...</div>
      ) : (
        <React.Fragment>
          {myComment[0].parentComment && !isParentShown ? (
            <div
              className="my-comment__show-parent"
              onClick={showParentHandler}
              title="Показать родительский комментарий"
            ></div>
          ) : null}
          {isParentShown ? (
            <div
              className="my-comment__hide-parent"
              onClick={hideParentHandler}
              title="Скрыть родительский комментарий"
            ></div>
          ) : null}
          <Comments comments={myComment} isOpenThread={props.isOpenThread} />
        </React.Fragment>
      )}
    </div>
  );
};

export default MyComment;
