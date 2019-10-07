import React, { useState } from "react";

import Comment from "./Comment/Comment";

import "./Comments.scss";

const Comments = props => {
  const [commentIdForReply, setCommentIdForReply] = useState(null);
  const [fetchedComments, setFetchedComments] = useState(props.comments);

  const openReplyBlockHandler = commentId => {
    setCommentIdForReply(commentId);
  };

  const hideInternalComment = e => {
    e.currentTarget.parentNode.parentNode.style.display = "none";
    e.currentTarget.parentNode.parentNode.nextSibling.style.display = "flex";
  };
  const showInternalComment = e => {
    e.currentTarget.parentNode.parentNode.style.display = "none";
    e.currentTarget.parentNode.parentNode.previousSibling.style.display = "flex";
  };

  const addComment = comment => {
    const newComments = [...fetchedComments];
    const parentComment = newComments.find(com => com._id === comment.parentComment);
    parentComment.children.push(comment._id);
    newComments.push(comment);
    console.log(newComments);
    setFetchedComments(newComments);
    setCommentIdForReply(null);
  };

  const getCommentsByIdsAndMount = (arrayOfId, comments, array) => {
    const children = [];
    arrayOfId.forEach(id => {
      children.push(comments.find(comment => comment._id === id));
    });
    return mountCommentsHandler(children, array);
  };

  const mountCommentsHandler = (comments, array) => {
    console.log(comments);
    return comments.map(comment => {
      if (array.indexOf(comment._id) === -1) {
        array.push(comment._id);
        return (
          <div className="comments__comment-with-replies" key={comment._id}>
            <div className="comments_comment">
              <Comment
                comment={comment}
                commentIdForReply={commentIdForReply}
                openReplyBlockHandler={openReplyBlockHandler}
                addComment={addComment}
              />
            </div>
            {comment.children.length > 0 ? (
              <>
                <div
                  className="comments__opened-internal-comments"
                  style={props.isOpenThread ? { display: "flex" } : { display: "none" }}
                >
                  <div className="comments__reply-comment-controls">
                    <div
                      className="comments__close-reply"
                      onClick={hideInternalComment}
                      title="Закрыть ответы"
                    />
                    <div className="comments__reply-comment-border" />
                  </div>
                  <div className="comments__reply-comment-body">
                    {getCommentsByIdsAndMount(comment.children, fetchedComments, array)}
                  </div>
                </div>
                <div
                  className="comments__closed-internal-comments"
                  style={props.isOpenThread ? { display: "none" } : { display: "flex" }}
                >
                  <div className="comments__reply-comment-controls">
                    <div className="comments__open-reply" onClick={showInternalComment}>
                      открыть ответы
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        );
      } else {
        return null;
      }
    });
  };

  return <div className="comments">{mountCommentsHandler(fetchedComments, [])}</div>;
};

export default Comments;
