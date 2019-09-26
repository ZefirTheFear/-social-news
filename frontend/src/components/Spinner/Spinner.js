import React from "react";

import "./Spinner.scss";

const Spinner = () => {
  return (
    <div className="spinner">
      <img src={require("../../assets/spinner.svg")} alt="spinner" />
    </div>
  );
};

export default Spinner;
