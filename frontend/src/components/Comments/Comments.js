import React, { useEffect, useState } from "react";

import Comment from "./Comment/Comment";

import "./Comments.scss";

const Comments = props => {
  const [fetchedComments, setFetchedComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentIdForReply, setCommentIdForReply] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5001/posts/${props.postId}/comments`)
      .then(res => res.json())
      .then(resData => {
        console.log(resData);
        setFetchedComments(resData);
        setIsLoading(false);
      })
      .catch(error => console.log(error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openReplyBlockHandler = commentId => {
    setCommentIdForReply(commentId);
    props.setParentCommentId(commentId);
  };

  const hideInternalComment = e => {
    e.currentTarget.parentNode.parentNode.style.display = "none";
    e.currentTarget.parentNode.parentNode.nextSibling.style.display = "flex";
  };
  const showInternalComment = e => {
    e.currentTarget.parentNode.parentNode.style.display = "none";
    e.currentTarget.parentNode.parentNode.previousSibling.style.display = "flex";
  };

  const returnedComments = [];

  const getCommentsByIdsAndMount = (arrayOfId, comments) => {
    const children = [];
    arrayOfId.forEach(id => {
      children.push(comments.find(comment => comment._id === id));
    });
    return mountCommentsHandler(children);
  };

  const mountCommentsHandler = comments => {
    return comments.map(comment => {
      if (returnedComments.indexOf(comment._id) === -1) {
        returnedComments.push(comment._id);
        return (
          <div className="comments__comment-with-replies" key={comment._id}>
            <div className="comments_comment">
              <Comment
                comment={comment}
                createCommentHandler={props.createCommentHandler}
                sendContentMakerStateHandler={props.sendContentMakerStateHandler}
                commentIdForReply={commentIdForReply}
                openReplyBlockHandler={openReplyBlockHandler}
              />
            </div>
            {comment.children.length > 0 ? (
              <React.Fragment>
                <div className="comments__opened-internal-comments">
                  <div className="comments__reply-comment-controls">
                    <div
                      className="comments__close-reply"
                      onClick={hideInternalComment}
                      title="Закрыть ответы"
                    />
                    <div className="comments__reply-comment-border" />
                  </div>
                  <div className="comments__reply-comment-body">
                    {getCommentsByIdsAndMount(comment.children, fetchedComments)}
                  </div>
                </div>
                <div className="comments__closed-internal-comments">
                  <div className="comments__reply-comment-controls">
                    <div className="comments__open-reply" onClick={showInternalComment}>
                      открыть ответы
                    </div>
                  </div>
                  {/* <div className="comments__show-replies">открыть ответы</div> */}
                </div>
              </React.Fragment>
            ) : null}
          </div>
        );
      } else {
        return null;
      }
    });
  };

  return isLoading ? (
    <div>Loading...</div>
  ) : fetchedComments.length > 0 ? (
    <div className="comments">{mountCommentsHandler(fetchedComments)}</div>
  ) : (
    <h4>Комментариев пока нет. Станьте первым.</h4>
  );
};

export default Comments;
