import React, { useEffect, useContext } from "react";
import { Link } from "react-router-dom";

import UserContext from "../../context/userContext";

import "./NotFound.scss";

const NotFound = () => {
  const userContext = useContext(UserContext);

  useEffect(() => {
    userContext.setIsPageNotFound(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="not-found">
      <img className="not-found__img" src={require("../../assets/searching.svg")} alt="error" />
      <div className="not-found__msg">
        <div>Page Not Found!</div>
      </div>
      <Link to="/" className="not-found__home" onClick={() => userContext.setIsPageNotFound(false)}>
        Go to homepage
      </Link>
    </div>
  );
};

export default NotFound;
