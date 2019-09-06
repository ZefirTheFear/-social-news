import React, { useState, useEffect, useContext } from "react";

import Answer from "../Answer/Answer";

import UserContext from "../../context/userContext";

import "./AnswersComments.scss";

const AnswersComments = () => {
  const userContext = useContext(UserContext);

  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch("http://localhost:5001/comments/answers-comments", {
      headers: {
        Authorization: userContext.token
      }
    })
      .then(res => res.json())
      .then(resData => {
        console.log(resData);
        setAnswers(resData);
        setIsLoading(false);
      })
      .catch(error => console.log(error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isLoading ? (
    <div>Loading...</div>
  ) : (
    <div className="answers-comments">
      {answers.map(answer => {
        return answer ? (
          <div className="answers-comments__answer" key={answer[0]._id}>
            <Answer answer={answer} isOpenThread={true} />
          </div>
        ) : null;
      })}
    </div>
  );
};

export default AnswersComments;
