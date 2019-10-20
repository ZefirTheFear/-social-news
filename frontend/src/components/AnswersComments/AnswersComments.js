import React, { useState, useEffect, useContext } from "react";

import Answer from "../Answer/Answer";
import Spinner from "../Spinner/Spinner";

import UserContext from "../../context/userContext";

import "./AnswersComments.scss";

const AnswersComments = () => {
  const userContext = useContext(UserContext);

  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnswers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      deleteNewAnswersForPosts();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAnswers = async () => {
    try {
      const response = await fetch(`${window.domain}/comments/answers-comments`, {
        headers: {
          Authorization: userContext.token
        }
      });
      console.log(response);
      if (response.status !== 200) {
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      console.log(resData);
      setAnswers(resData);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      userContext.setIsError(true);
    }
  };

  const deleteNewAnswersForPosts = async () => {
    try {
      const response = await fetch(`${window.domain}/users/delete-new-answers-for-comments`, {
        headers: {
          Authorization: userContext.token
        },
        method: "PATCH"
      });
      console.log(response);
      if (response.status !== 200) {
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      console.log(resData);
      localStorage.setItem("user", JSON.stringify(resData));
      userContext.setUser(resData);
    } catch (error) {
      console.log(error);
      userContext.setIsError(true);
    }
  };

  return (
    <div className="answers-comments">
      {isLoading ? (
        <Spinner />
      ) : answers.length > 0 ? (
        answers.map(answer => {
          return answer ? (
            <div className="answers-comments__answer" key={answer[0]._id}>
              <Answer answer={answer} isOpenThread={true} />
            </div>
          ) : null;
        })
      ) : (
        <div className="answers-comments__no-answers">Здесь пока что нет ни одного ответа</div>
      )}
    </div>
  );
};

export default AnswersComments;
