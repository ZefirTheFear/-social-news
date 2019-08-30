import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";

import UserContext from "../../context/userContext";

import "./Notes.scss";

const Notes = () => {
  const userContext = useContext(UserContext);

  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5001/users/get-notes`, {
      headers: {
        Authorization: userContext.token
      }
    })
      .then(res => {
        if (res.status === 200) {
          return res.json();
        } else {
          // TODO вывести UI , что что-то пошло не так
          console.log("что что-то пошло не так");
          setIsLoading(false);
          return;
        }
      })
      .then(resData => {
        console.log(resData);
        if (!resData) {
          return;
        }
        setNotes(resData);
        setIsLoading(false);
      })
      .catch(error => console.log(error));
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

  const removeUser = userId => {
    console.log("remove");
    fetch(`http://localhost:5001/users/remove-note/${userId}`, {
      headers: {
        Authorization: userContext.token
      },
      method: "PATCH"
    })
      .then(res => {
        if (res.status === 200) {
          return res.json();
        } else {
          // TODO вывести UI , что что-то пошло не так
          console.log("что что-то пошло не так");
          return;
        }
      })
      .then(resData => {
        console.log(resData);
        localStorage.setItem("user", JSON.stringify(resData));
        setNotes([...notes].filter(item => item.user._id !== userId));
      })
      .catch(error => console.log(error));
  };

  return isLoading ? (
    <div>Loading...</div>
  ) : notes.length === 0 ? (
    <div>Нет заметок о пользователях</div>
  ) : (
    <div className="notes">
      {notes.map(note => {
        return (
          <div className="notes__note" key={note.user._id}>
            <div className="notes__note-inner">
              <Link to={`/@${note.user.name}`}>
                <img className="notes__user-avatar" src={note.user.avatar} alt="ava" />
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
      })}
    </div>
  );
};

export default Notes;
