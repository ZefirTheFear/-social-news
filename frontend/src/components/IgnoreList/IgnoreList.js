import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";

import Spinner from "../Spinner/Spinner";

import UserContext from "../../context/userContext";

import "./IgnoreList.scss";

const IgnoreList = () => {
  const userContext = useContext(UserContext);

  const [ignoreList, setIgnoreList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  let isFetching = true;

  const controller = new AbortController();
  const signal = controller.signal;

  useEffect(() => {
    fetchIgnoredUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (isFetching) {
        controller.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchIgnoredUsers = async () => {
    try {
      const response = await fetch(`${window.domain}/users/get-ignore-list`, {
        headers: {
          Authorization: userContext.token
        },
        signal: signal
      });
      if (response.status !== 200) {
        isFetching = false;
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      setIgnoreList(resData);
      isFetching = false;
      setIsLoading(false);
    } catch (error) {
      isFetching = false;
      if (error.name === "AbortError") {
        return;
      }
      userContext.setIsError(true);
    }
  };

  const removeUser = async userId => {
    try {
      const response = await fetch(`${window.domain}/users/toggle-ignore/${userId}`, {
        headers: {
          Authorization: userContext.token
        },
        method: "PATCH"
      });
      if (response.status !== 200) {
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      localStorage.setItem("user", JSON.stringify(resData));
      setIgnoreList([...ignoreList].filter(item => item._id !== userId));
    } catch (error) {
      userContext.setIsError(true);
    }
  };

  return (
    <div className="ignore-list">
      {isLoading ? (
        <Spinner />
      ) : ignoreList.length > 0 ? (
        ignoreList.map(user => {
          return (
            <div className="ignore-list__sub-to" key={user._id}>
              <div className="ignore-list__remove-user" onClick={() => removeUser(user._id)}>
                &times;
              </div>
              <Link to={`/@${user.name}`}>
                <img className="ignore-list__user-avatar" src={user.avatar.url} alt="ava" />
              </Link>
              <Link className="ignore-list__username" to={`/@${user.name}`}>
                {user.name}
              </Link>
            </div>
          );
        })
      ) : (
        <div>Нет заблоктрованных пользователей</div>
      )}
    </div>
  );
};

export default IgnoreList;
