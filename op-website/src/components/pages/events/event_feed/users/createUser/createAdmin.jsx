import React, { useState, useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export const Input = ({ value, setter, type, pholder }) => {
  return (
    <div className="input-field">
      <input
        type={type}
        placeholder={pholder}
        required
        value={value}
        onChange={(e) => setter(e.target.value)}
      />
    </div>
  );
};

const renderLoader = () => {
  return <h4>loading</h4>;
};

function AdminCreate() {
  const { username, token, event } = useSelector((state) => state);
  const navigate = useNavigate();
  const [form_username, set_fname] = useState("");
  const [form_password, set_fpass] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(0);

  useEffect(() => {
    if (username === "" || token === "") {
      navigate("/connect");
    }
  }, [username, token, navigate]);

  useEffect(() => {
    setStatus(0);
  }, []);

  const createUser = () => {
    fetch(`/gen/register/${username}?token=${token}`, {
      method: "POST",
      body: JSON.stringify({
        Username: form_username,
        Password: form_password,
      }),
    })
      .then((resp) => resp.json())
      .then((x) => {
        setStatus(x.status);
        return x.status;
      })
      .then((x) => {
        if (x !== 200) return;
        console.log(`status is ${x}`);
        assignUser2Event();
      })
      .catch((e) => {
        console.log(e);
        setStatus(500);
      })
      .finally(() => setIsLoading(false));
  };

  const assignUser2Event = () => {
    fetch(`/gen/assign/${username}?token=${token}`, {
      method: "POST",
      body: JSON.stringify({
        Username: form_username,
        EventID: event.ID,
      }),
    })
      .then((resp) => resp.json())
      .then((data) => setStatus(data.status))
      .catch((e) => {
        console.log(`error is [${e}]`);
        setStatus(300);
      });
  };

  const handleSubmit = () => {
    if (isLoading) {
      setError("Already Loading");
      return;
    }
    setError(null);
    setIsLoading(true);
    createUser();
    return false;
  };

  const handleMsg = () => {
    console.log(`[${status}]`);
    console.log(status);
    if (status === 200) {
      return (
        <div>
          <h1>Admin Created</h1>
          <h4>Username: {form_username}</h4>
          <h4>Password: {form_password}</h4>
        </div>
      );
    } else if (status === 500) {
      return <h1>Error at creation</h1>;
    } else if (status === 300) {
      return <h1>Created But Not Assigned</h1>;
    }
  };

  const renderForm = () => {
    return (
      <>
        <h1>New Admin For {event.Title}</h1>
        <Input
          value={form_username}
          setter={set_fname}
          type="text"
          pholder={"name"}
        />

        <Input
          value={form_password}
          setter={set_fpass}
          type="password"
          pholder="password"
        />

        {isLoading ? renderLoader() : null}

        <button type="submit" id="submit_button" onClick={() => handleSubmit()}>
          Submit
        </button>
        <h2>{error}</h2>
      </>
    );
  };

  return (
    <div className="login-form">
      {status === 0 ? renderForm() : handleMsg()}
      <button
        type="back"
        id="submit_button"
        onClick={() => navigate("/event-feed")}
      >
        back
      </button>
    </div>
  );
}
export default AdminCreate;
