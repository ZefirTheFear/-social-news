import React, { useState, useRef } from "react";
import { Link, NavLink, withRouter } from "react-router-dom";

import "./Navbar.scss";

import Modal from "../Modal/Modal";
import MenuMobile from "../MenuMobile/MenuMobile";
import Dashboard from "../Dashboard/Dashboard";
import AuthForm from "../AuthForm/AuthForm";

const Navbar = props => {
  const searchInput = useRef();

  const modalInnerRef = useRef();
  const backdropRef = useRef();

  const [searchInputValue, setSearchInputValue] = useState("");
  const [searchInputIsOpen, setSearchInputIsOpen] = useState(false);
  const [isMenuMobileOpen, setIsMenuMobileOpen] = useState(false);
  const [isDashboardMobileOpen, setIsDashboardMobileOpen] = useState(false);
  const [isLoginFormMobileOpen, setIsLoginFormMobileOpen] = useState(false);

  const disturbSearchInput = e => {
    e.currentTarget.style.width = "240px";
    searchInput.current.style.width = "200px";
    searchInput.current.style.padding = "6px 10px";
    searchInput.current.focus();
    setSearchInputIsOpen(true);
  };

  const searchBlockOnClick = e => {
    disturbSearchInput(e);
    console.log("clicked");
  };

  const searchBlockEnter = e => {
    disturbSearchInput(e);
    console.log("entered");
  };

  const searchBlockLeave = e => {
    if (!searchInputValue) {
      e.currentTarget.style.width = "";
      searchInput.current.style.width = "";
      searchInput.current.style.padding = "";
      searchInput.current.blur();
      setSearchInputIsOpen(false);
    }
  };

  const onChangeSearchInput = e => {
    setSearchInputValue(e.target.value);
  };

  const onBlurSearchInput = e => {
    if (!searchInputValue) {
      e.currentTarget.parentNode.parentNode.style.width = "";
      searchInput.current.style.width = "";
      searchInput.current.style.padding = "";
    }
  };

  const searchHandler = e => {
    e.preventDefault();
    if (!searchInputValue.trim()) {
      return console.log("empty");
    }
    props.history.push(`/search/${searchInputValue}`);
  };

  const showMenuMobile = () => {
    setIsMenuMobileOpen(true);
  };

  const hideMenuMobile = () => {
    modalInnerRef.current.style.animation = "modal__inner-fadeout 0.3s forwards";
    backdropRef.current.style.animation = "backdrop-fadeout 0.3s forwards";

    setTimeout(() => {
      setIsMenuMobileOpen(false);
    }, 300);
  };

  const showDashboard = () => {
    setIsDashboardMobileOpen(true);
  };

  const hideDashboard = () => {
    modalInnerRef.current.style.animation = "modal__inner-fadeout 0.3s forwards";
    backdropRef.current.style.animation = "backdrop-fadeout 0.3s forwards";

    setTimeout(() => {
      setIsDashboardMobileOpen(false);
    }, 300);
  };

  const showLoginForm = () => {
    setIsLoginFormMobileOpen(true);
  };

  const hideLoginForm = () => {
    modalInnerRef.current.style.animation = "modal__inner-fadeout 0.3s forwards";
    backdropRef.current.style.animation = "backdrop-fadeout 0.3s forwards";

    setTimeout(() => {
      setIsLoginFormMobileOpen(false);
    }, 300);
  };

  return (
    <header className="header header_theme_dark">
      <div className="header__inner">
        <div className="header__item header__logo">
          <Link to="/" onClick={props.logoClicked} title="домой">
            <img
              className="header__logo-img"
              src={require("../../assets/spinner-logo.svg")}
              alt="logo"
            />
          </Link>
        </div>
        <div className="header__item header__menu">
          <nav className="header-menu">
            <div className="header-menu__item">
              <NavLink
                to="/"
                exact
                activeClassName="header-menu__item-link_active"
                className="header-menu__item-link"
              >
                Свежее
              </NavLink>
            </div>
            <div className="header-menu__item">
              <NavLink
                to="/best"
                activeClassName="header-menu__item-link_active"
                className="header-menu__item-link"
              >
                Лучшее
              </NavLink>
            </div>
            <div className="header-menu__item">
              <NavLink
                to="/hot"
                activeClassName="header-menu__item-link_active"
                className="header-menu__item-link"
              >
                Горячее
              </NavLink>
            </div>
            {props.isAuth ? (
              <div className="header-menu__item">
                <NavLink
                  to="/subs"
                  activeClassName="header-menu__item-link_active"
                  className="header-menu__item-link"
                >
                  Моя лента
                </NavLink>
              </div>
            ) : null}
          </nav>
          <div className="header-menu-mobile" onClick={showMenuMobile} />
          {isMenuMobileOpen ? (
            <Modal
              backdropRef={backdropRef}
              modalInnerRef={modalInnerRef}
              backdropClick={hideMenuMobile}
            >
              <MenuMobile
                isAuth={props.isAuth}
                searchHandler={searchHandler}
                searchInputValue={searchInputValue}
                onChangeSearchInput={onChangeSearchInput}
                hideMenuMobile={hideMenuMobile}
              />
            </Modal>
          ) : null}
        </div>
        <div className="header__item header__right-menu">
          <div className="header-right-menu">
            <div
              className="header-right-menu__item header-right-menu__search-form"
              onMouseEnter={searchBlockEnter}
              onMouseLeave={searchBlockLeave}
              onClick={searchBlockOnClick}
            >
              <form onSubmit={searchHandler} className="search-form">
                <input
                  ref={searchInput}
                  className="search-form__input"
                  autoComplete="off"
                  placeholder="Поиск"
                  value={searchInputValue}
                  onChange={onChangeSearchInput}
                  onBlur={onBlurSearchInput}
                />
                <button
                  type={searchInputIsOpen ? "submit" : "button"}
                  className="search-form__button"
                />
              </form>
            </div>
            {props.isAuth ? (
              <>
                <div
                  className="header-right-menu__item header-right-menu__avatar"
                  onClick={showDashboard}
                >
                  <img
                    className="header-right-menu__img"
                    src={props.user.avatar.url}
                    alt="avatar"
                  />
                </div>
              </>
            ) : (
              <>
                <div
                  className="header-right-menu__item header-right-menu__login"
                  onClick={showLoginForm}
                >
                  Войти
                </div>
                {isLoginFormMobileOpen ? (
                  <Modal
                    backdropRef={backdropRef}
                    modalInnerRef={modalInnerRef}
                    backdropClick={hideLoginForm}
                  >
                    <AuthForm hideLoginForm={hideLoginForm} />
                  </Modal>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
      {isDashboardMobileOpen ? (
        <Modal
          backdropRef={backdropRef}
          modalInnerRef={modalInnerRef}
          backdropClick={hideDashboard}
        >
          <Dashboard hideDashboard={hideDashboard} />
        </Modal>
      ) : null}
    </header>
  );
};

export default withRouter(Navbar);
