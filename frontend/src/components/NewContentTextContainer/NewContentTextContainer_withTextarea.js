import React, { useEffect, useRef } from "react";

import "./NewContentTextContainer.scss";

const NewContentTextContainer = props => {
  const inputEl = useRef();

  useEffect(() => {
    if (props.content) {
      inputEl.current.value = props.content;
      inputEl.current.style.height = inputEl.current.scrollHeight + "px";
    } else {
      inputEl.current.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="content-text-container">
      <textarea
        className="content-text-container__txt"
        onChange={event => props.onChangeNewPostData(event, props.index)}
        placeholder="Введите текст..."
        rows="1"
        ref={inputEl}
      />
      <div className="content-text-container__remove" title="Удалить" onClick={props.removeBlock}>
        &times;
      </div>
    </div>
  );
};

export default NewContentTextContainer;
