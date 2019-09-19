import React, { useContext } from "react";
import { Route, Switch, NavLink, Redirect } from "react-router-dom";

import UserContext from "../../context/userContext";

import AnswersPosts from "../AnswersPosts/AnswersPosts";
import AnswersComments from "../AnswersComments/AnswersComments";

import "./Answers.scss";

const Answers = () => {
  const userContext = useContext(UserContext);

  return (
    <div className="answers">
      <div className="answers__menu">
        <div className="answers__menu-item">
          <NavLink
            to="/answers/posts"
            className="answers__menu-item-link"
            activeClassName="answers__menu-item-link_active"
          >
            Ответы на посты{" "}
            {userContext.user.newAnswers.filter(answer => answer.type === "answerForPost").length >
            0
              ? `(${
                  userContext.user.newAnswers.filter(answer => answer.type === "answerForPost")
                    .length
                })`
              : null}
          </NavLink>
        </div>
        <div className="answers__menu-item">
          <NavLink
            to="/answers/comments"
            className="answers__menu-item-link"
            activeClassName="answers__menu-item-link_active"
          >
            Ответы на комментарии{" "}
            {userContext.user.newAnswers.filter(answer => answer.type === "answerForComment")
              .length > 0
              ? `(${
                  userContext.user.newAnswers.filter(answer => answer.type === "answerForComment")
                    .length
                })`
              : null}
          </NavLink>
        </div>
      </div>

      <div className="answers__inner">
        <Switch>
          <Route path="/answers/posts" exact component={AnswersPosts} />
          <Route path="/answers/comments" exact component={AnswersComments} />
          <Redirect to="/answers/posts" />
        </Switch>
      </div>
    </div>
  );
};

export default Answers;
