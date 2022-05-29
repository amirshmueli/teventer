import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./loginstyle.css";

import { StoreActions } from "../../../store/store";
import { useDispatch } from "react-redux";
import { MakeFetch, urlBuilder } from "../../../funcs/api";
import * as Loaders from "react-spinners";
const Connect = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isLogged, setIsLogged] = useState(0);
  const [form_uname, setForm_uname] = useState("");
  const [form_pass, setFrom_pass] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm_uname("");
    setFrom_pass("");
  }, [isLogged]);

  const handleSubmit = () => {
    console.warn(form_uname, form_pass);
    setLoading(true);

    let params = urlBuilder({
      username: form_uname,
      password: form_pass,
    });

    MakeFetch({ method: "POST", url: `/login?` + params })
      .then((r) => r.json())
      .then((x) => {
        console.warn(x);
        if (x.token === undefined) {
          setIsLogged("2");
          return;
        }
        navigate("/");
        dispatch({
          type: StoreActions.setUsername,
          payload: form_uname,
        });
        dispatch({
          type: StoreActions.setToken,
          payload: x.token,
        });
        setIsLogged("1");
      })
      .finally(() => setLoading(false));
  };

  const changeUsername = (value) => {
    setForm_uname(value);
  };

  const chagnePassword = (value) => {
    setFrom_pass(value);
  };

  const renderLoader = () => {
    if (!loading) return null;
    return (
      <div className="Connect_Loader">
        <Loaders.ClipLoader size={24} speedMultiplier={0.8} />
      </div>
    );
  };

  const renderMessage = () => {
    console.log(isLogged);
    return isLogged !== "2" || loading ? null : (
      <div>
        <h4>Wrong Password</h4>
      </div>
    );
  };

  const renderFrom = () => {
    return (
      <div className="login-form">
        <>
          <h1>Login</h1>
          <div className="content">
            <div className="input-field">
              <input
                type="text"
                placeholder="Username"
                required
                value={form_uname}
                onChange={(e) => changeUsername(e.target.value)}
              />
            </div>
            <div className="input-field">
              <input
                type="password"
                placeholder="Password"
                required
                value={form_pass}
                onChange={(e) => chagnePassword(e.target.value)}
              />
            </div>
          </div>
          {renderLoader()}
          {renderMessage()}
          <button id="submit_button" onClick={() => handleSubmit()}>
            Submit
          </button>
        </>
      </div>
    );
  };

  return (
    <div className="LoginPage">
      {isLogged !== "1" ? renderFrom() : navigate("/")}
    </div>
  );
};

export { Connect };
