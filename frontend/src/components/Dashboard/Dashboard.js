import React, { useEffect, useState, useContext } from "react";
import { Link, NavLink } from "react-router-dom";

import "./Dashboard.scss";

import UserContext from "../../context/userContext";

import numberFormatter from "../../utils/NumberFormatter";

const Dashboard = props => {
  const userContext = useContext(UserContext);

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5001/users/user/${userContext.user.name}`)
      .then(res => {
        if (res.status === 404) {
          return props.logoutHandler();
        } else if (res.status === 200) {
          return res.json();
        } else {
          // TODO вывести UI , что что-то пошло не так
          console.log("что что-то пошло не так");
          return;
        }
      })
      .then(resData => {
        if (!resData) {
          return;
        }
        console.log(resData);
        if (resData.error) {
          return;
        }
        localStorage.setItem("user", JSON.stringify(resData));
        setUser(resData);
        setIsLoading(false);
      })
      .catch(err => console.log(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = () => {
    if (props.hideDashboard) {
      props.hideDashboard();
    }
    userContext.logoutHandler();
  };

  return isLoading ? (
    <div>Loading...</div>
  ) : (
    <div className="dashboard">
      <div className="dashboard__header">
        <div className="dashboard__avatar">
          <Link
            className="dashboard__avatar-link"
            to={`/@${user.name}`}
            onClick={props.hideDashboard}
          >
            <img
              className="dashboard__img"
              src={"http://localhost:5001/" + user.avatar}
              alt="avatar"
            />
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
          <Link to="/settings" className="dashboard__settings-symbol" title="Настройки" />
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
      <div className="dashboard__profile-content">
        <div className="dashboard__profile-content-item" onClick={props.hideDashboard}>
          <NavLink
            to="/answers/posts"
            className="dashboard__profile-content-item-link"
            activeClassName="dashboard__profile-content-item-link_active"
          >
            Ответы
            {userContext.user.newAnswers.length > 0 ? (
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
      </div>
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
