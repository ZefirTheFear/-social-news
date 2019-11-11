import React from "react";
import { Route, Switch } from "react-router-dom";

import "./AppInner.scss";

import Posts from "../Posts/Posts";
import Search from "../Search/Search";
import SinglePost from "../SinglePost/SinglePost";
import Profile from "../Profile/Profile";
import Sidebar from "../Sidebar/Sidebar";
import NotFound from "../NotFound/NotFound";
import Answers from "../Answers/Answers";
import MyComments from "../MyComments/MyComments";
import Estimates from "../Estimates/Estimates";
import SubsList from "../SubsList/SubsList";
import IgnoreList from "../IgnoreList/IgnoreList";
import Notes from "../Notes/Notes";
import Settings from "../ProfileSettings/ProfileSettings";

const AppInner = props => {
  return (
    <div className="app-inner">
      <div className="app-inner__main">
        <Switch>
          <Route
            path="/"
            exact
            render={propss => (
              <Posts
                {...propss}
                isLogoClicked={props.isLogoClicked}
                requestUrl={`${window.domain}/posts/new`}
              />
            )}
          />
          <Route
            path="/best"
            exact
            render={propss => <Posts {...propss} requestUrl={`${window.domain}/posts/best`} />}
          />
          <Route
            path="/hot"
            exact
            render={propss => <Posts {...propss} requestUrl={`${window.domain}/posts/hot`} />}
          />
          {props.isAuth ? (
            <Route
              path="/subs"
              exact
              render={propss => (
                <Posts {...propss} requestUrl={`${window.domain}/posts/subs`} logedIn />
              )}
            />
          ) : null}
          <Route path="/search/:desired" component={Search} />

          <Route path="/@:username" component={Profile} />

          <Route path="/post/:postTitle" component={SinglePost} />

          {props.isAuth ? <Route path="/settings" exact component={Settings} /> : null}
          {props.isAuth ? <Route path="/answers" component={Answers} /> : null}
          {props.isAuth ? <Route path="/my-comments" exact component={MyComments} /> : null}
          {props.isAuth ? <Route path="/estimates" component={Estimates} /> : null}
          {props.isAuth ? (
            <Route
              path="/saved"
              exact
              render={propss => (
                <Posts {...propss} requestUrl={`${window.domain}/posts/saved`} logedIn />
              )}
            />
          ) : null}
          {props.isAuth ? <Route path="/subs-list" exact component={SubsList} /> : null}
          {props.isAuth ? <Route path="/ignore-list" exact component={IgnoreList} /> : null}
          {props.isAuth ? <Route path="/notes" exact component={Notes} /> : null}

          <Route component={NotFound} />
        </Switch>
      </div>
      <aside className="app-inner__sidebar">
        <Sidebar logoutHandler={props.logoutHandler} isLogoClicked={props.isLogoClicked} />
      </aside>
    </div>
  );
};

export default AppInner;
