import React, { useContext } from "react";

import UserContext from "../../context/userContext";

import "./Sidebar.scss";

import AuthForm from "../AuthForm/AuthForm";
import Dashboard from "../Dashboard/Dashboard";

const Sidebar = props => {
  const userContext = useContext(UserContext);

  return (
    <div className="sidebar">
      {userContext.isAuth ? (
        <div className="sidebar__block">
          <Dashboard logoutHandler={props.logoutHandler} isLogoClicked={props.isLogoClicked} />
        </div>
      ) : (
        <div className="sidebar__block">
          <AuthForm />
        </div>
      )}
    </div>
  );
};

export default Sidebar;
