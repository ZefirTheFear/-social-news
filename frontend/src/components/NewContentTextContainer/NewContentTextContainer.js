import React, { useState, useEffect, useRef } from "react";

import Confirm from "../Confirm/Confirm";

import "./NewContentTextContainer.scss";

const NewContentTextContainer = props => {
  const inputEl = useRef();
  const editEl = useRef();
  const urlBlc = useRef();
  const urlInp = useRef();

  const [isCancelBlur, setIsCancelBlur] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [range, setRange] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (props.content) {
      inputEl.current.innerHTML = props.content;
    } else {
      inputEl.current.focus();
    }

    document.addEventListener("mousedown", hideEditor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      document.removeEventListener("mousedown", hideEditor);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDrop = e => {
    e.preventDefault();
  };

  const hideEditor = e => {
    if (
      e.target.classList.contains("content-text-container__editor-btn") ||
      e.target.classList.contains("content-text-container__url")
    ) {
      setIsCancelBlur(true);

      setTimeout(() => {
        setIsCancelBlur(false);
      }, 100);

      return;
    }
    editEl.current.style.display = "none";
    urlBlc.current.style.display = "none";
    setUrlValue("");
  };

  const onPasteInput = e => {
    e.preventDefault();

    const content = e.clipboardData.getData("text/plain");

    document.execCommand("insertText", false, content);
  };

  const onSelectInput = () => {
    if (
      window
        .getSelection()
        .toString()
        .trim().length > 0
    ) {
      const range = window.getSelection().getRangeAt(0);
      editEl.current.style.top = window.pageYOffset + range.getBoundingClientRect().top + "px";
      editEl.current.style.left =
        range.getBoundingClientRect().left + range.getBoundingClientRect().width / 2 + "px";
      editEl.current.style.transform = "translate(-50%, -120%)";
      editEl.current.style.display = "flex";
    } else {
      editEl.current.style.display = "none";
      urlBlc.current.style.display = "none";
      setUrlValue("");
    }
  };

  const onBlurInput = () => {
    if (isCancelBlur) {
      return;
    }
    editEl.current.style.display = "none";
    urlBlc.current.style.display = "none";
    setUrlValue("");
  };

  const formatDoc = (command, value) => {
    document.execCommand(command, false, value);
  };

  const createLink = () => {
    urlBlc.current.style.display = "flex";
    setRange(window.getSelection().getRangeAt(0));
    urlInp.current.focus();
  };

  const onChangeUrl = e => {
    setUrlValue(e.target.value);
  };

  const urlInputConfirm = () => {
    if (urlValue.startsWith("http://www") || urlValue.startsWith("https://www")) {
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      document.execCommand("createLink", false, urlValue);
      urlBlc.current.style.display = "none";
      setUrlValue("");
    } else {
      return alert("Введите полную ссылку, пожалуйста");
    }
  };

  const urlInputCancel = () => {
    urlBlc.current.style.display = "none";
    setUrlValue("");
  };

  const openConfirmation = () => {
    setIsDeleting(true);
  };

  return (
    <div className="content-text-container" onDrop={onDrop}>
      {isDeleting ? (
        <Confirm
          title="Удаление текстового блока"
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
            ? "content-text-container__txt content-text-container__txt_is-dragging"
            : "content-text-container__txt"
        }
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder="Введите текст..."
        onInput={event => props.onChangeNewPostData(event, props.index)}
        onPaste={onPasteInput}
        onSelect={onSelectInput}
        onBlur={onBlurInput}
        ref={inputEl}
        tabIndex="1"
      />
      <div className="content-text-container__remove" title="Удалить" onClick={openConfirmation}>
        &times;
      </div>
      <div className="content-text-container__editor" ref={editEl}>
        <button
          type="button"
          className="content-text-container__editor-btn content-text-container__editor-bold"
          title="Жирный"
          onClick={() => formatDoc("bold")}
        />
        <button
          type="button"
          className="content-text-container__editor-btn content-text-container__editor-italic"
          title="Курсивный"
          onClick={() => formatDoc("italic")}
        />
        <button
          type="button"
          className="content-text-container__editor-btn content-text-container__editor-strike"
          title="Перечеркнутый"
          onClick={() => formatDoc("strikeThrough")}
        />
        <button
          type="button"
          className="content-text-container__editor-btn content-text-container__editor-underline"
          title="Подчеркнутый"
          onClick={() => formatDoc("underline")}
        />
        <div className="content-text-container__editor-link-url">
          <button
            type="button"
            className="content-text-container__editor-btn content-text-container__editor-link"
            title="Ссылка"
            onClick={createLink}
          />
          <div className="content-text-container__editor-url" ref={urlBlc}>
            <input
              type="text"
              className="content-text-container__url content-text-container__editor-url-input"
              placeholder="Введите ссылку"
              ref={urlInp}
              value={urlValue}
              onChange={onChangeUrl}
            />
            <button
              type="button"
              className="content-text-container__url content-text-container__editor-url-input-confirm"
              onClick={urlInputConfirm}
            />
            <button
              type="button"
              className="content-text-container__url content-text-container__editor-url-input-cancel"
              onClick={urlInputCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewContentTextContainer;
