import React from "react";
import { Link } from "react-router-dom";

import "./MenuMobile.scss";

const MenuMobile = props => {
  return (
    <div className="menu-mobile">
      <div className="menu-mobile__item">
        <Link to="/" className="menu-mobile__item-link" onClick={props.hideMenuMobile}>
          Горячее
        </Link>
      </div>
      <div className="menu-mobile__item">
        <Link to="/best" className="menu-mobile__item-link" onClick={props.hideMenuMobile}>
          Лучшее
        </Link>
      </div>
      <div className="menu-mobile__item">
        <Link to="/new" className="menu-mobile__item-link" onClick={props.hideMenuMobile}>
          Свежее
        </Link>
      </div>
      {props.isAuth ? (
        <div className="menu-mobile__item">
          <Link to="/subs" className="menu-mobile__item-link" onClick={props.hideMenuMobile}>
            Моя лента
          </Link>
        </div>
      ) : null}
      <div className="menu-mobile__item-search-form">
        <form onSubmit={props.searchHandler} className="search-form-mobile">
          <input
            className="search-form-mobile__input"
            autoComplete="off"
            placeholder="Поиск"
            value={props.searchInputValue}
            onChange={props.onChangeSearchInput}
          />
          <button
            type="submit"
            className="search-form-mobile__button"
            onClick={props.hideMenuMobile}
          />
        </form>
      </div>
    </div>
  );
};

export default MenuMobile;
