import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";

import UserContext from "../../context/userContext";

import "./SubsList.scss";

const SubsList = () => {
  const userContext = useContext(UserContext);

  const [subList, setSubList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5001/users/get-subscribe-to`, {
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
        setSubList(resData);
        setIsLoading(false);
      })
      .catch(error => console.log(error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeUser = userId => {
    fetch(`http://localhost:5001/users/toggle-subscribe-to-user/${userId}`, {
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
        setSubList([...subList].filter(item => item._id !== userId));
      })
      .catch(error => console.log(error));
  };

  return isLoading ? (
    <div>Loading...</div>
  ) : subList.length === 0 ? (
    <div>Вы ни на кого не подписаны</div>
  ) : (
    <div className="subs-list">
      {subList.map(user => {
        return (
          <div className="subs-list__sub-to" key={user._id}>
            <div className="subs-list__remove-user" onClick={() => removeUser(user._id)}>
              &times;
            </div>
            <Link to={`/@${user.name}`}>
              <img
                className="subs-list__user-avatar"
                src={"http://localhost:5001/" + user.avatar}
                alt="ava"
              />
            </Link>
            <Link className="subs-list__username" to={`/@${user.name}`}>
              {user.name}
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default SubsList;
