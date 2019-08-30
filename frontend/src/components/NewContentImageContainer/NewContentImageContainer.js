import React from "react";

import "./NewContentImageContainer.scss";

const NewContentImageContainer = props => {
  return (
    <div className="content-img-container">
      <div className="content-img-container__img-block">
        <img className="content-img-container__img" src={props.url} alt="img" draggable="false" />
      </div>
      <div className="content-img-container__remove" title="Удалить" onClick={props.removeBlock}>
        &times;
      </div>
    </div>
  );
};

export default NewContentImageContainer;
