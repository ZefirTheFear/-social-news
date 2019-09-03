import React, { useState, useEffect, useContext } from "react";

import Answer from "../Answer/Answer";

import UserContext from "../../context/userContext";

import "./AnswersPosts.scss";

const AnswersPosts = () => {
  const userContext = useContext(UserContext);

  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch("http://localhost:5001/comments/answers-posts", {
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
    <div className="answers-posts">
      {answers.map(answer => {
        return answer ? <Answer answer={answer} key={answer[0]._id} /> : null;
      })}
    </div>
  );
};

export default AnswersPosts;
