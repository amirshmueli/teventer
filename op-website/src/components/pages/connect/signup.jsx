import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { StoreActions } from "../../../store/store";
import { MakeFetch, urlBuilder } from "../../../funcs/api";
import * as Loaders from "react-spinners";
import "./loginstyle.css";
const Signup = () => {
  const dispatch = useDispatch();
  const [form_uname, setForm_uname] = useState("");
  const [form_pass, setFrom_pass] = useState("");
  const [form_email, setFrom_email] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setForm_uname("");
    setFrom_pass("");
    setFrom_email("");
  }, [status]);

  const handleSubmit = () => {
    if ("" in [form_uname, form_pass, form_email]) return;
    setLoading(true);
    MakeFetch({
      url: "/register",
      body: JSON.stringify({
        Username: form_uname,
        Password: form_pass,
        Email: form_email,
      }),
      method: "POST",
    })
      .then((res) => {
        setLoading(false);
        return res.json();
      })
      .then((data) => {
        if (data.Username !== form_uname) {
          throw Error("not singup");
        }
        setStatus(2);
      })
      .catch((err) => {
        console.log(err);
        setStatus(1);
      })
      .finally(() => setLoading(false));
  };

  const renderForm = () => {
    return (
      <div className="login-form">
        <>
          <h1>Register</h1>
          <div className="content">
            <div className="input-field">
              <input
                type="text"
                placeholder="Username"
                onChange={(e) => setForm_uname(e.target.value)}
              />
            </div>
            <div className="input-field">
              <input
                type="text"
                placeholder="Email"
                onChange={(e) => setFrom_email(e.target.value)}
              />
            </div>
            <div className="input-field">
              <input
                type="password"
                placeholder="Password"
                onChange={(e) => setFrom_pass(e.target.value)}
              />
            </div>
          </div>
          {renderLoader()}
          <button id="submit_button" onClick={() => handleSubmit()}>
            Submit
          </button>
        </>
      </div>
    );
  };

  const renderAfterScreen = () => {
    return (
      <div className="login-form">
        {status === 2 ? (
          <>
            <h1>{status === 2 ? "Registered Successfully" : null}</h1>
            <button
              type="button"
              id="submit_button"
              onClick={() => navigate("/connect")}
            >
              Procceed
            </button>
          </>
        ) : (
          renderError()
        )}
      </div>
    );
  };

  const renderError = () => {
    return (
      <>
        <h1>{status === 1 ? "Could Not Register" : null}</h1>
        <button type="button" id="submit_button" onClick={() => setStatus(0)}>
          back
        </button>
      </>
    );
  };

  const renderLoader = () => {
    if (loading)
      return (
        <div className="Connect_Loader">
          <Loaders.ClipLoader size={24} speedMultiplier={0.8} />
        </div>
      );
    return null;
  };

  const renderScreens = () => {
    if (status === 0) return renderForm();
    return renderAfterScreen();
  };

  return renderScreens();
};

export { Signup };
