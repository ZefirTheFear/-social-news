import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";

import Spinner from "../Spinner/Spinner";

import UserContext from "../../context/userContext";

import "./Notes.scss";

const Notes = () => {
  const userContext = useContext(UserContext);

  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  let isFetching = true;

  const controller = new AbortController();
  const signal = controller.signal;

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (notes.length > 0) {
      document
        .querySelectorAll(".notes__body")
        .forEach(textarea => (textarea.style.height = textarea.scrollHeight + "px"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  useEffect(() => {
    return () => {
      if (isFetching) {
        controller.abort();
        console.log("fetchNotes прерван");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`${window.domain}/users/get-notes`, {
        headers: {
          Authorization: userContext.token
        },
        signal: signal
      });
      console.log(response);
      if (response.status !== 200) {
        isFetching = false;
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      console.log(resData);
      setNotes(resData);
      isFetching = false;
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      isFetching = false;
      if (error.name === "AbortError") {
        return;
      }
      userContext.setIsError(true);
    }
  };

  const removeUser = async userId => {
    try {
      const response = await fetch(`${window.domain}/users/remove-note/${userId}`, {
        headers: {
          Authorization: userContext.token
        },
        method: "PATCH"
      });
      console.log(response);
      if (response.status !== 200) {
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      console.log(resData);
      localStorage.setItem("user", JSON.stringify(resData));
      setNotes([...notes].filter(item => item.user._id !== userId));
    } catch (error) {
      console.log(error);
      userContext.setIsError(true);
    }
  };

  return (
    <div className="notes">
      {isLoading ? (
        <Spinner />
      ) : notes.length > 0 ? (
        notes.map(note => {
          return (
            <div className="notes__note" key={note.user._id}>
              <div className="notes__note-inner">
                <Link to={`/@${note.user.name}`}>
                  <img className="notes__user-avatar" src={note.user.avatar.url} alt="ava" />
                </Link>
                <Link className="notes__username" to={`/@${note.user.name}`}>
                  {note.user.name}
                </Link>
                <div
                  className="notes__remove-note"
                  title="Удалить заметку"
                  onClick={() => removeUser(note.user._id)}
                >
                  &times;
                </div>
              </div>
              <textarea className="notes__body" readOnly value={note.body} rows="1" />
            </div>
          );
        })
      ) : (
        <div className="notes__no-notes">Нет заметок о пользователях</div>
      )}
    </div>
  );
};

export default Notes;
