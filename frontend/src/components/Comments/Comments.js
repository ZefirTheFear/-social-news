import React, { useState, useEffect, useContext, memo } from "react";

import Comment from "./Comment/Comment";

import UserContext from "../../context/userContext";

import "./Comments.scss";

const Comments = props => {
  const userContext = useContext(UserContext);

  const [commentIdForReply, setCommentIdForReply] = useState(null);

  const cleanedComments = props.comments;
  if (userContext.user) {
    cleanedComments.forEach(comment => {
      if (userContext.user.ignoreList.includes(comment.creator._id)) {
        comment.body = [{ type: "text", content: "Коммент от игнорируемого пользователя" }];
      }
    });
  }

  const [fetchedComments, setFetchedComments] = useState(cleanedComments);

  useEffect(() => {
    setFetchedComments(props.comments);
  }, [props.comments]);

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
    setFetchedComments(newComments);
    setCommentIdForReply(null);
  };

  const deleteComment = (commentId, targetComId) => {
    const commentForDel = fetchedComments.find(comment => comment._id === commentId);
    const parentOfComForDel = fetchedComments.find(comment => {
      return comment._id === commentForDel.parentComment;
    });

    const commentsThread = (array, comment, targetCommentId, isLastChild, parentComment) => {
      array.push(comment._id);
      if (comment.children.length > 0) {
        for (const child of comment.children) {
          const childComment = fetchedComments.find(com => com._id === child);
          return commentsThread(
            array,
            childComment,
            targetCommentId,
            comment.children.indexOf(child) === comment.children.length - 1,
            comment
          );
        }
      } else {
        if (comment._id.toString() === targetCommentId.toString()) {
          return array;
        } else if (isLastChild) {
          return searchingForTargetComment(array, parentComment, targetCommentId);
        } else {
          const nextSiblingIndex = parentComment.children.indexOf(comment._id) + 1;
          const nextSiblingId = parentComment.children[nextSiblingIndex];
          const nextSibling = fetchedComments.find(com => com._id === nextSiblingId);
          return commentsThread(
            array,
            nextSibling,
            targetCommentId,
            parentComment.children.indexOf(nextSibling._id) === parentComment.children.length - 1,
            parentComment
          );
        }
      }
    };

    const searchingForTargetComment = (array, comment, targetCommentId) => {
      if (comment._id.toString() === targetCommentId.toString()) {
        return array;
      }
      const parentCommentId = comment.parentComment;
      const parentComment = fetchedComments.find(com => com._id === parentCommentId);
      const isLastChild =
        parentComment.children.indexOf(comment._id) === parentComment.children.length - 1;
      if (isLastChild) {
        return searchingForTargetComment(array, parentComment, targetCommentId);
      } else {
        const nextSiblingIndex = parentComment.children.indexOf(comment._id) + 1;
        const nextSiblingId = parentComment.children[nextSiblingIndex];
        const nextSibling = fetchedComments.find(com => com._id === nextSiblingId);
        return commentsThread(
          array,
          nextSibling,
          targetCommentId,
          parentComment.children.indexOf(nextSibling._id) === parentComment.children.length - 1,
          parentComment
        );
      }
    };

    const deletedCommentsIds = commentsThread([], commentForDel, targetComId);
    const leftComments = fetchedComments.filter(
      comment => !deletedCommentsIds.includes(comment._id)
    );

    if (parentOfComForDel) {
      let updatedParentCom = leftComments.find(comment => comment._id === parentOfComForDel._id);
      updatedParentCom.children = updatedParentCom.children.filter(ids => ids !== commentId);
    }
    setFetchedComments(leftComments);
  };

  const getCommentsByIdsAndMount = (arrayOfId, comments, array) => {
    const children = [];
    arrayOfId.forEach(id => {
      children.push(comments.find(comment => comment._id === id));
    });
    return mountCommentsHandler(children, array);
  };

  const mountCommentsHandler = (comments, array) => {
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
                deleteComment={deleteComment}
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

export default memo(Comments);
