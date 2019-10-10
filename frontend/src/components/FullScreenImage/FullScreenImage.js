import React, { useEffect } from "react";

import "./FullScreenImage.scss";

const FullScreenImage = props => {
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
  }, []);

  useEffect(() => {
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <div className="full-screen-image" onClick={props.clicked}>
      <img className="full-screen-image__img" src={props.src} alt="img" />
    </div>
  );
};

export default FullScreenImage;
