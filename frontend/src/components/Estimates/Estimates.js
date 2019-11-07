import React from "react";
import { Route, Switch, NavLink, Redirect } from "react-router-dom";

import Posts from "../Posts/Posts";

import "./Estimates.scss";

const Estimates = () => {
  return (
    <div className="estimates">
      <div className="estimates__menu">
        <div className="estimates__menu-item">
          <NavLink
            to="/estimates"
            exact
            className="estimates__menu-item-link"
            activeClassName="estimates__menu-item-link_active"
          >
            Все
          </NavLink>
        </div>
        <div className="estimates__menu-item">
          <NavLink
            to="/estimates/liked"
            className="estimates__menu-item-link"
            activeClassName="estimates__menu-item-link_active"
          >
            Понравилось
          </NavLink>
        </div>
        <div className="estimates__menu-item">
          <NavLink
            to="/estimates/disliked"
            className="estimates__menu-item-link"
            activeClassName="estimates__menu-item-link_active"
          >
            Не понравилось
          </NavLink>
        </div>
      </div>

      <div className="estimates__inner">
        <Switch>
          <Route
            path="/estimates"
            exact
            render={propss => (
              <Posts {...propss} requestUrl={`${window.domain}/posts/estimates`} logedIn />
            )}
          />
          <Route
            path="/estimates/liked"
            exact
            render={propss => (
              <Posts {...propss} requestUrl={`${window.domain}/posts/liked`} logedIn />
            )}
          />
          <Route
            path="/estimates/disliked"
            exact
            render={propss => (
              <Posts {...propss} requestUrl={`${window.domain}/posts/disliked`} logedIn />
            )}
          />
          <Redirect to="/estimates" />
        </Switch>
      </div>
    </div>
  );
};

export default Estimates;
