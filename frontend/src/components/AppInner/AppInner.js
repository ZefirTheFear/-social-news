import React from "react";
import { Route, Switch } from "react-router-dom";

import "./AppInner.scss";

import Posts from "../Posts/Posts";
import SubsPosts from "../SubsPosts/SubsPosts";
import Search from "../Search/Search";
import SinglePost from "../SinglePost/SinglePost";
import Profile from "../Profile/Profile";
import Sidebar from "../Sidebar/Sidebar";
import NotFound from "../../pages/NotFoundPage/NotFound";
import Answers from "../Answers/Answers";
import MyComments from "../MyComments/MyComments";
import Estimates from "../Estimates/Estimates";
import SavedPosts from "../SavedPosts/SavedPosts";
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
                requestUrl={`${window.domain}/posts`}
              />
            )}
          />
          <Route
            path="/best"
            exact
            render={propss => <Posts {...propss} requestUrl={`${window.domain}/posts/best`} />}
          />
          <Route
            path="/new"
            exact
            render={propss => <Posts {...propss} requestUrl={`${window.domain}/posts/new`} />}
          />
          <Route path="/subs" exact component={SubsPosts} />
          <Route path="/search/:desired" component={Search} />
          <Route path="/post/:postTitle" component={SinglePost} />
          <Route path="/@:username" component={Profile} />

          {props.isAuth ? <Route path="/settings" exact component={Settings} /> : null}
          <Route path="/answers" component={Answers} />
          <Route path="/my-comments" exact component={MyComments} />
          <Route path="/estimates" component={Estimates} />
          <Route path="/saved" exact component={SavedPosts} />
          <Route path="/subs-list" exact component={SubsList} />
          <Route path="/ignore-list" exact component={IgnoreList} />
          <Route path="/notes" exact component={Notes} />

          <Route component={NotFound} />
        </Switch>
      </div>
      <div className="app-inner__sidebar">
        <Sidebar logoutHandler={props.logoutHandler} />
      </div>
    </div>
  );
};

export default AppInner;
