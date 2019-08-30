import React from "react";

import "./Modal.scss";
import Backdrop from "../Backdrop/Backdrop";

const Modal = props => {
  return (
    <div className="modal">
      <Backdrop ref={props.backdropRef} onClick={props.backdropClick} />
      <div className="modal__inner" ref={props.modalInnerRef}>
        {props.children}
      </div>
      ;
    </div>
  );
};

export default Modal;
