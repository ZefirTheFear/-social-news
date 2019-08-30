import React, { useState } from "react";

import "./TestComponent.css";

const TestComponent = () => {
  const fetchedComments = [
    {
      id: "1",
      creator: "John Doe",
      body: "Comment 1",
      children: ["1.1", "1.2"]
    },
    {
      id: "2",
      creator: "Vasya Pupkin",
      body: "Comment 2",
      children: []
    },
    {
      id: "1.1",
      creator: "Vasya Pupkin",
      body: "Answ 1 for Comment 1",
      children: []
    },
    {
      id: "1.2",
      creator: "Vasya Pupkin",
      body: "Answ 2 for Comment 1",
      children: ["1.2.1"]
    },
    {
      id: "1.2.1",
      creator: "Vasya Pupkin",
      body: "Answ 1 for answ 2 for Comment 1",
      children: []
    }
  ];

  const returnedComments = [];

  const getCommentsByIds = (arrayOfId, array) => {
    const children = [];
    arrayOfId.forEach(id => {
      children.push(array.find(item => item.id === id));
    });
    return mountCommentsHandler(children);
  };

  const mountCommentsHandler = comments => {
    console.log(comments);
    return comments.map(comment => {
      if (returnedComments.indexOf(comment.id) === -1) {
        returnedComments.push(comment.id);
        console.log(returnedComments);
        return (
          <div key={comment.id} className="comment">
            {comment.body}
            <div style={{ marginLeft: "20px" }}>
              {comment.children.length > 0
                ? getCommentsByIds(comment.children, fetchedComments)
                : null}
            </div>
          </div>
        );
      } else {
        return null;
      }
    });
  };

  return mountCommentsHandler(fetchedComments);
};

export default TestComponent;
