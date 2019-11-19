import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";

import Spinner from "../Spinner/Spinner";

import UserContext from "../../context/userContext";

import "./SubsList.scss";

const SubsList = () => {
  const userContext = useContext(UserContext);

  const [subList, setSubList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  let isFetching = true;

  const controller = new AbortController();
  const signal = controller.signal;

  useEffect(() => {
    fetchSubscribeToUsers();
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

  const fetchSubscribeToUsers = async () => {
    try {
      const response = await fetch(`${window.domain}/users/get-subscribe-to`, {
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
      setSubList(resData);
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

  const unsubUser = async userId => {
    try {
      const response = await fetch(`${window.domain}/users/toggle-subscribe-to-user/${userId}`, {
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
      setSubList([...subList].filter(item => item._id !== userId));
    } catch (error) {
      userContext.setIsError(true);
    }
  };

  return (
    <div className="subs-list">
      {isLoading ? (
        <Spinner />
      ) : subList.length > 0 ? (
        subList.map(user => {
          return (
            <div className="subs-list__sub-to" key={user._id}>
              <div className="subs-list__remove-user" onClick={() => unsubUser(user._id)}>
                &times;
              </div>
              <Link to={`/@${user.name}`}>
                <img className="subs-list__user-avatar" src={user.avatar.url} alt="ava" />
              </Link>
              <Link className="subs-list__username" to={`/@${user.name}`}>
                {user.name}
              </Link>
            </div>
          );
        })
      ) : (
        <div>Вы ни на кого не подписаны</div>
      )}
    </div>
  );
};

export default SubsList;
