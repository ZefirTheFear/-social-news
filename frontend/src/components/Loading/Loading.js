import React, { useEffect } from "react";

import "./Loading.scss";

const Loading = () => {
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
  }, []);

  useEffect(() => {
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <div className="loading">
      <img src={require("../../assets/spinner.svg")} alt="spinner" draggable="false" />
    </div>
  );
};

export default Loading;
