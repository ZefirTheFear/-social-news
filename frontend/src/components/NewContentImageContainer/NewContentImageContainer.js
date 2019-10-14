import React, { useState } from "react";

import Confirm from "../Confirm/Confirm";

import "./NewContentImageContainer.scss";

const NewContentImageContainer = props => {
  const [isDeleting, setIsDeleting] = useState(false);

  const openConfirmation = () => {
    setIsDeleting(true);
  };

  return (
    <div className="content-img-container">
      {isDeleting ? (
        <Confirm
          title="Удаление картинки"
          msg="Вы дествительно хотите удалить?"
          doBtn="Удалить"
          cancelBtn="Оставить"
          doAction={() => {
            props.removeBlock();
            setIsDeleting(false);
          }}
          cancelAction={() => setIsDeleting(false)}
        />
      ) : null}
      <div
        className={
          props.isDragging
            ? "content-img-container__img-block content-img-container__img-block_is-dragging"
            : "content-img-container__img-block"
        }
      >
        <img className="content-img-container__img" src={props.url} alt="img" draggable="false" />
      </div>
      <div className="content-img-container__remove" title="Удалить" onClick={openConfirmation}>
        &times;
      </div>
    </div>
  );
};

export default NewContentImageContainer;
