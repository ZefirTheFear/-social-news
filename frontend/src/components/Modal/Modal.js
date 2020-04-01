import React, { useEffect } from "react";

import "./Modal.scss";
import Backdrop from "../Backdrop/Backdrop";

const Modal = props => {
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
  }, []);

  useEffect(() => {
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <div className="modal">
      <Backdrop
        ref={props.backdropRef}
        onClick={() => {
          props.backdropClick();
          document.documentElement.style.overflow = "";
        }}
      />
      <div className="modal__inner" ref={props.modalInnerRef}>
        {props.children}
      </div>
    </div>
  );
};

export default Modal;
