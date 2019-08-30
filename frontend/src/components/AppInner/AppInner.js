import React from "react";
import { Route, Switch } from "react-router-dom";

import "./AppInner.scss";

import Posts from "../Posts/Posts";
import BestPosts from "../BestPosts/BestPosts";
import NewPosts from "../NewPosts/NewPosts";
import SinglePost from "../SinglePost/SinglePost";
import Profile from "../Profile/Profile";
import Sidebar from "../Sidebar/Sidebar";
import NotFound from "../../pages/NotFoundPage/NotFound";
import Answers from "../Answers/Answers";
import Estimates from "../Estimates/Estimates";
import SavedPosts from "../SavedPosts/SavedPosts";
import SubsList from "../SubsList/SubsList";
import IgnoreList from "../IgnoreList/IgnoreList";
import Notes from "../Notes/Notes";

const AppInner = propss => {
  return (
    <div className="app-inner">
      <div className="app-inner__main">
        <Switch>
          <Route
            path="/"
            exact
            render={props => <Posts {...props} isLogoClicked={propss.isLogoClicked} />}
          />
          <Route path="/best" exact component={BestPosts} />
          <Route path="/new" exact component={NewPosts} />
          <Route path="/post/:postTitle" component={SinglePost} />
          <Route path="/@:username" component={Profile} />

          <Route path="/answers" component={Answers} />
          <Route path="/estimates" component={Estimates} />
          <Route path="/saved" exact component={SavedPosts} />
          <Route path="/subs-list" exact component={SubsList} />
          <Route path="/ignore-list" exact component={IgnoreList} />
          <Route path="/notes" exact component={Notes} />

          <Route component={NotFound} />
        </Switch>
      </div>
      <div className="app-inner__sidebar">
        <Sidebar logoutHandler={propss.logoutHandler} />
      </div>
    </div>
  );
};

export default AppInner;
