import React, { useEffect } from "react";

import "./Confirm.scss";

const Confirm = props => {
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
  }, []);

  useEffect(() => {
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <div className="confirm">
      <div className="confirm__dialog">
        <div className="confirm__header">
          <h3 className="confirm__title"> {props.title} </h3>
        </div>
        <div className="confirm__dialog-msg">
          <p className="confirm__dialog-msg-text"> {props.msg}</p>
        </div>
        <div className="confirm__footer">
          <div className="confirm__controls">
            <button className="confirm__button confirm__button_color_red" onClick={props.doAction}>
              {props.doBtn}
            </button>
            <button
              className="confirm__button confirm__button_color_green"
              onClick={props.cancelAction}
            >
              {props.cancelBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirm;
