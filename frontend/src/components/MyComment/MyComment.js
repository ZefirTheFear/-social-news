import React, { useState, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";

import Comments from "../Comments/Comments";
import UserContext from "../../context/userContext";

import "./MyComment.scss";

const MyComment = props => {
  const answerEl = useRef();

  const userContext = useContext(UserContext);

  const [isParentShown, setIsParentShown] = useState(false);
  const [myComment, setMyComment] = useState(props.myComment);

  useEffect(() => {
    if (isParentShown) {
      answerEl.current.querySelector(".comments__opened-internal-comments").style.display = "flex";
      answerEl.current.querySelectorAll(".comments__closed-internal-comments")[
        answerEl.current.querySelectorAll(".comments__closed-internal-comments").length - 1
      ].style.display = "none";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isParentShown]);

  const showParentHandler = async () => {
    try {
      document.body.style.cursor = "wait";
      const response = await fetch(`${window.domain}/posts/comments/${myComment[0].parentComment}`);
      if (response.status !== 200) {
        document.body.style.cursor = "";
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      const parentComment = { ...resData };
      parentComment.children = [myComment[0]._id];
      const newMyComment = [...myComment];
      newMyComment.unshift(parentComment);
      setMyComment(newMyComment);
      setIsParentShown(true);
      document.body.style.cursor = "";
    } catch (error) {
      document.body.style.cursor = "";
      userContext.setIsError(true);
    }
  };

  const hideParentHandler = () => {
    const newMyComment = [...myComment];
    newMyComment.shift();
    setMyComment(newMyComment);
    setIsParentShown(false);
  };

  return (
    <div className="my-comment" ref={answerEl}>
      <Link
        to={`/post/${myComment[0].postId._id}--${myComment[0].postId.title.replace(/ /g, "_")}`}
        className="my-comment__post-link"
      >
        <h6 className="my-comment__post-title">{myComment[0].postId.title}</h6>
      </Link>
      <>
        {myComment[0].parentComment && !isParentShown ? (
          <div>
            <div
              className="my-comment__show-parent"
              onClick={showParentHandler}
              title="Показать родительский комментарий"
            ></div>
          </div>
        ) : null}
        {isParentShown ? (
          <div>
            <div
              className="my-comment__hide-parent"
              onClick={hideParentHandler}
              title="Скрыть родительский комментарий"
            ></div>
          </div>
        ) : null}
        <Comments comments={myComment} isOpenThread={props.isOpenThread} />
      </>
    </div>
  );
};

export default MyComment;
