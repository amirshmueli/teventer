import React, { useContext, useEffect } from "react";
import Store from "../../store/store";
import "./navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { StoreActions } from "../../store/store";
import { useLocation } from "react-router-dom";

const not_admin_routes = ["/", "/connect", "/signup"];

const Navbar = () => {
  const navStyle = {
    color: "white",
  };
  const navigate = useNavigate();
  const { token } = useSelector((state) => state);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    if (token !== "") return;
    console.log(`path is [${location.pathname}]`);
    if (!not_admin_routes.includes(location.pathname)) navigate("/connect");
  }, [navigate, location, token]);

  const logout = () => {
    dispatch({
      type: StoreActions.setToken,
      payload: "",
    });
    dispatch({
      type: StoreActions.setUsername,
      payload: "",
    });
  };

  const render = () => {
    if (token === "") {
      return (
        <>
          <Link to="/connect" style={navStyle}>
            <li>connect</li>
          </Link>
          <Link to="/signup" style={navStyle}>
            <li>signup</li>
          </Link>
        </>
      );
    }
    return (
      <>
        <Link to="/events" style={navStyle}>
          <li>events</li>
        </Link>
        <Link to="/allfeed" style={navStyle}>
          <li>admins</li>
        </Link>
        <Link to="/" style={navStyle} onClick={() => logout()}>
          <li>signout</li>
        </Link>
      </>
    );
  };
  return (
    <nav>
      <Link to="/">
        <h2 id="title">Teventer</h2>
      </Link>
      <div className="wrapper">
        <ul className="nav-links" style={navStyle}>
          {render()}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
