import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";

import UserContext from "../../context/userContext";

import "./IgnoreList.scss";

const IgnoreList = () => {
  const userContext = useContext(UserContext);

  const [ignoreList, setIgnoreList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5001/users/get-ignore-list`, {
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
        setIgnoreList(resData);
        setIsLoading(false);
      })
      .catch(error => console.log(error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeUser = userId => {
    fetch(`http://localhost:5001/users/toggle-ignore/${userId}`, {
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
        setIgnoreList([...ignoreList].filter(item => item._id !== userId));
      })
      .catch(error => console.log(error));
  };

  return isLoading ? (
    <div>Loading...</div>
  ) : ignoreList.length === 0 ? (
    <div>Нет заблоктрованных пользователей</div>
  ) : (
    <div className="ignore-list">
      {ignoreList.map(user => {
        return (
          <div className="ignore-list__sub-to" key={user._id}>
            <div className="ignore-list__remove-user" onClick={() => removeUser(user._id)}>
              &times;
            </div>
            <Link to={`/@${user.name}`}>
              <img className="ignore-list__user-avatar" src={user.avatar} alt="ava" />
            </Link>
            <Link className="ignore-list__username" to={`/@${user.name}`}>
              {user.name}
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default IgnoreList;
