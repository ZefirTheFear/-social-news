import React, { useState, useEffect, useContext } from "react";

import Answer from "../Answer/Answer";
import Spinner from "../Spinner/Spinner";

import UserContext from "../../context/userContext";

import "./AnswersPosts.scss";

const AnswersPosts = () => {
  const userContext = useContext(UserContext);

  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  let isFetching = true;

  const controller = new AbortController();
  const signal = controller.signal;

  useEffect(() => {
    fetchAnswers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      deleteNewAnswersForPosts();
      if (isFetching) {
        controller.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAnswers = async () => {
    try {
      const response = await fetch(`${window.domain}/comments/answers-posts`, {
        headers: {
          Authorization: userContext.token
        },
        signal: signal
      });
      if (response.status !== 200) {
        isFetching = false;
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      setAnswers(resData);
      isFetching = false;
      setIsLoading(false);
    } catch (error) {
      isFetching = false;
      if (error.name === "AbortError") {
        return;
      }
      userContext.setIsError(true);
    }
  };

  const deleteNewAnswersForPosts = async () => {
    try {
      const response = await fetch(`${window.domain}/users/delete-new-answers-for-posts`, {
        headers: {
          Authorization: userContext.token
        },
        method: "PATCH"
      });
      if (response.status !== 200) {
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      localStorage.setItem("user", JSON.stringify(resData));
      userContext.setUser(resData);
    } catch (error) {
      userContext.setIsError(true);
    }
  };

  return (
    <div className="answers-posts">
      {isLoading ? (
        <Spinner />
      ) : answers.length > 0 ? (
        answers.map(answer => {
          return answer ? (
            <div className="answers-posts__answer" key={answer[0]._id}>
              <Answer answer={answer} isOpenThread={false} />
            </div>
          ) : null;
        })
      ) : (
        <div className="answers-posts__no-answers">Здесь пока что нет ни одного ответа</div>
      )}
    </div>
  );
};

export default AnswersPosts;
