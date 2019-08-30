import React from "react";

import "./NewPostTagContainer.scss";

const NewPostTagContainer = props => {
  return (
    <div className="new-post-tag">
      <div className="new-post-tag__remove" title="Удалить" onClick={props.removeTag}>
        &times;
      </div>
      {props.tag}
    </div>
  );
};

export default NewPostTagContainer;
