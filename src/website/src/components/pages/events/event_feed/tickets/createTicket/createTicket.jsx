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

function TicketCreate() {
  const { username, token, event } = useSelector((state) => state);
  const navigate = useNavigate();
  const [form_name, set_fname] = useState("");
  const [form_lastname, set_flname] = useState("");
  const [form_type, set_ftype] = useState("");
  const [form_email, set_femail] = useState("");
  const [form_price, set_fprice] = useState("");
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

  const handleSubmit = () => {
    if (isLoading) {
      setError("Already Loading");
      return;
    }
    setError(null);
    setIsLoading(true);
    fetch(`/gen/tickets/${username}?token=${token}`, {
      method: "POST",
      body: JSON.stringify({
        EventRefer: event.ID,
        Name: form_name,
        LastName: form_lastname,
        Email: form_email,
        Type: form_type,
        Price: Number(form_price),
      }),
    })
      .then((resp) => resp.json())
      .then((x) => {
        console.log("i am " + x);
        setStatus(x.status);
      })
      .catch((e) => {
        console.log(e);
        setStatus(500);
      })
      .finally(() => setIsLoading(false));
    return false;
  };

  const handleMsg = () => {
    console.log(`[${status}]`);
    if (status === 200) {
      return <h1>Ticket Created</h1>;
    } else if (status === 500) {
      return <h1>Error at creation</h1>;
    }
  };

  const renderForm = () => {
    return (
      <>
        <h1>New Ticket For {event.Title}</h1>
        <Input
          value={form_name}
          setter={set_fname}
          type="text"
          pholder={"name"}
        />

        <Input
          value={form_lastname}
          setter={set_flname}
          type="text"
          pholder="last name"
        />

        <Input
          value={form_type}
          setter={set_ftype}
          type="text"
          pholder="ticket type"
        />

        <Input
          value={form_email}
          setter={set_femail}
          type="text"
          pholder="email"
        />
        <Input
          value={form_price}
          setter={set_fprice}
          type="number"
          pholder="price"
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
export default TicketCreate;
