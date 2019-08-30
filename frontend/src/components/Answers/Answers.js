import React from "react";
import { Route, Switch, NavLink, Redirect } from "react-router-dom";

import AnswersAll from "../AnswersAll/AnswersAll";
import AnswersPosts from "../AnswersPosts/AnswersPosts";
import AnswersComments from "../AnswersComments/AnswersComments";

import "./Answers.scss";

const Answers = () => {
  return (
    <div className="answers">
      <div className="answers__menu">
        <div className="answers__menu-item">
          <NavLink
            to="/answers"
            exact
            className="answers__menu-item-link"
            activeClassName="answers__menu-item-link_active"
          >
            Все
          </NavLink>
        </div>
        <div className="answers__menu-item">
          <NavLink
            to="/answers/posts"
            className="answers__menu-item-link"
            activeClassName="answers__menu-item-link_active"
          >
            Ответы на посты
          </NavLink>
        </div>
        <div className="answers__menu-item">
          <NavLink
            to="/answers/comments"
            className="answers__menu-item-link"
            activeClassName="answers__menu-item-link_active"
          >
            Ответы на комментарии
          </NavLink>
        </div>
      </div>

      <div className="answers__inner">
        <Switch>
          <Route path="/answers" exact component={AnswersAll} />
          <Route path="/answers/posts" exact component={AnswersPosts} />
          <Route path="/answers/comments" exact component={AnswersComments} />
          <Redirect to="/answers" />
        </Switch>
      </div>
    </div>
  );
};

export default Answers;
