import React from "react";
import "./SomethingWentWrong.scss";

const SomethingWentWrong = () => {
  return (
    <div className="somethingwentwrong">
      <img
        className="somethingwentwrong__img"
        src={require("../../assets/client-server-error.svg")}
        alt="error"
      />
      <div className="somethingwentwrong__msg">
        <div>Something Went Wrong!</div>
        <div>Please retry later!</div>
      </div>
    </div>
  );
};

export default SomethingWentWrong;
