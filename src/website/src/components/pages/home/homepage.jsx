import React from "react";
import { useSelector } from "react-redux";

import "./home.css";
const HomePage = () => {
  const { username, token } = useSelector((state) => state);

  const loggedScreen = () => {
    return <h1>Welcome Back {username}! </h1>;
  };

  const defaultScreen = () => {
    return (
      <>
        <h1>Welcome to Teventer!</h1>
        <p className="homepage-data">
          In this website you will be able to manage your upcoming events,
          tickets and admins
        </p>
      </>
    );
  };

  return (
    <div className="homepage-screen">
      <div className="homepage-main">
        {token === "" ? defaultScreen() : loggedScreen()}
      </div>
    </div>
  );
};

export { HomePage };
