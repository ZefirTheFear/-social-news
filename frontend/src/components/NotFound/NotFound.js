import React from "react";
import { Link } from "react-router-dom";

import "./NotFound.scss";

const NotFound = () => {
  return (
    <div className="not-found">
      <img className="not-found__img" src={require("../../assets/searching.svg")} alt="error" />
      <div className="not-found__msg">
        <div>Page Not Found!</div>
      </div>
      <Link to="/" className="not-found__home">
        Go to homepage
      </Link>
    </div>
  );
};

export default NotFound;
