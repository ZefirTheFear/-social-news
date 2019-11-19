import React, { useEffect, useState, useContext } from "react";
import { Link, NavLink } from "react-router-dom";

import "./Dashboard.scss";

import Spinner from "../Spinner/Spinner";

import UserContext from "../../context/userContext";

import numberFormatter from "../../utils/NumberFormatter";

const Dashboard = props => {
  const userContext = useContext(UserContext);

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  let isFetching = true;

  const controller = new AbortController();
  const signal = controller.signal;

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isLogoClicked]);

  useEffect(() => {
    return () => {
      if (isFetching) {
        controller.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch(`${window.domain}/users/user/${userContext.user.name}`, {
        signal: signal
      });
      if (response.status === 404) {
        isFetching = false;
        return props.logoutHandler();
      }
      if (response.status !== 200) {
        isFetching = false;
        userContext.setIsError(true);
        return;
      }
      const resData = await response.json();
      localStorage.setItem("user", JSON.stringify(resData));
      userContext.setUser(resData);
      setUser(resData);
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

  const logout = () => {
    if (props.hideDashboard) {
      props.hideDashboard();
    }
    userContext.logoutHandler();
  };

  return isLoading ? (
    <Spinner />
  ) : (
    <div className="dashboard">
      <div className="dashboard__header">
        <div className="dashboard__avatar">
          <Link
            className="dashboard__avatar-link"
            to={`/@${user.name}`}
            onClick={props.hideDashboard}
          >
            <img className="dashboard__img" src={user.avatar.url} alt="avatar" />
          </Link>
        </div>
        <div className="dashboard__user-info">
          <div className="dashboard__user-nick">
            <Link
              className="dashboard__user-info-link"
              to={`/@${user.name}`}
              onClick={props.hideDashboard}
            >
              {user.name}
            </Link>
          </div>

          <div className="dashboard__user-exit" onClick={logout}>
            Выйти
          </div>
        </div>
        <div className="dashboard__settings">
          <Link
            to="/settings"
            className="dashboard__settings-symbol"
            title="Настройки"
            onClick={props.hideDashboard}
          />
        </div>
      </div>
      <div className="dashboard__profile-info">
        <div className="dashboard__profile-info-item">
          <span className="dashboard__profile-info-value">{user.rating}</span>
          <span className="dashboard__profile-info-label">рейтинг</span>
        </div>
        <div className="dashboard__profile-info-item">
          <span className="dashboard__profile-info-value">{user.subscribers.length}</span>
          <span className="dashboard__profile-info-label">
            {numberFormatter(user.subscribers.length, ["подписчик", "подписчика", "подписчиков"])}
          </span>
        </div>
        <div className="dashboard__profile-info-item">
          <span className="dashboard__profile-info-value">{user.posts.length}</span>
          <span className="dashboard__profile-info-label">
            {numberFormatter(user.posts.length, ["пост", "поста", "постов"])}
          </span>
        </div>
        <div className="dashboard__profile-info-item">
          <span className="dashboard__profile-info-value">{user.comments.length}</span>
          <span className="dashboard__profile-info-label">
            {numberFormatter(user.comments.length, ["комментарий", "комментария", "комментариев"])}
          </span>
        </div>
      </div>
      <nav className="dashboard__profile-content">
        <div className="dashboard__profile-content-item" onClick={props.hideDashboard}>
          <NavLink
            to="/answers"
            className="dashboard__profile-content-item-link"
            activeClassName="dashboard__profile-content-item-link_active"
          >
            Ответы
            {userContext.user && userContext.user.newAnswers.length > 0 ? (
              <span className="dashboard__new-answers">{userContext.user.newAnswers.length}</span>
            ) : null}
          </NavLink>
        </div>
        <div className="dashboard__profile-content-item" onClick={props.hideDashboard}>
          <NavLink
            to="/my-comments"
            className="dashboard__profile-content-item-link"
            activeClassName="dashboard__profile-content-item-link_active"
          >
            Комментарии
          </NavLink>
        </div>
        <div className="dashboard__profile-content-item" onClick={props.hideDashboard}>
          <NavLink
            to="/estimates"
            className="dashboard__profile-content-item-link"
            activeClassName="dashboard__profile-content-item-link_active"
          >
            Оценки
          </NavLink>
        </div>
        <div className="dashboard__profile-content-item" onClick={props.hideDashboard}>
          <NavLink
            to="/saved"
            className="dashboard__profile-content-item-link"
            activeClassName="dashboard__profile-content-item-link_active"
          >
            Сохраненное
          </NavLink>
        </div>
        <div className="dashboard__profile-content-item" onClick={props.hideDashboard}>
          <NavLink
            to="/subs-list"
            className="dashboard__profile-content-item-link"
            activeClassName="dashboard__profile-content-item-link_active"
          >
            Подписки
          </NavLink>
        </div>
        <div className="dashboard__profile-content-item" onClick={props.hideDashboard}>
          <NavLink
            to="/ignore-list"
            className="dashboard__profile-content-item-link"
            activeClassName="dashboard__profile-content-item-link_active"
          >
            Игнор-лист
          </NavLink>
        </div>
        <div className="dashboard__profile-content-item" onClick={props.hideDashboard}>
          <NavLink
            to="/notes"
            className="dashboard__profile-content-item-link"
            activeClassName="dashboard__profile-content-item-link_active"
          >
            Заметки
          </NavLink>
        </div>
      </nav>
      <div className="dashboard__add-post">
        <Link className="dashboard__add-post-link" to="/new-post" onClick={props.hideDashboard}>
          <div className="dashboard__add-post-plus" />
          <button className="dashboard__button">Создать пост</button>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
