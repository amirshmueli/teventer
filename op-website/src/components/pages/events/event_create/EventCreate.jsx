import React, { useState, useContext, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MakeFetch } from "../../../../funcs/api";
import * as Loaders from "react-spinners";
import "./EC.css";
export const Input = ({ value, setter, type, pholder, min, max }) => {
  return (
    <div className="input-field-EC">
      <input
        type={type}
        placeholder={pholder}
        required
        value={value}
        max={max}
        min={min}
        onChange={(e) => setter(e.target.value)}
      />
    </div>
  );
};

function EventCreate() {
  const { username, token } = useSelector((state) => state);
  const navigate = useNavigate();
  const [form_title, set_title] = useState("");
  const [form_date, set_date] = useState("");
  const [form_dateE, set_dateE] = useState("");
  const [form_timeStart, set_timeStart] = useState("");
  const [form_timeEnd, set_timeEnd] = useState("");
  const [form_capacity, set_capacity] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(0);

  const getDate = useCallback((days) => {
    let date;

    if (days !== undefined) {
      date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    } else {
      date = new Date();
    }

    const offset = date.getTimezoneOffset();

    date = new Date(date.getTime() - offset * 60 * 1000);

    return date.toISOString().split("T")[0];
  }, []);

  useEffect(() => {
    set_dateE(form_date);
  }, [form_date]);

  const handleSubmit = () => {
    if (isLoading) return;
    console.log("submit pressed");
    if (
      "" in
      [
        form_title,
        form_date,
        form_dateE,
        form_capacity,
        form_timeEnd,
        form_timeStart,
      ]
    ) {
      setError("Missing Input");
      return;
    }

    try {
      var time1 = timeFormatter(
        form_date.split("-"),
        form_timeStart.split(":")
      );
      var time2 = timeFormatter(form_dateE.split("-"), form_timeEnd.split(":"));
    } catch {
      setError("Missing Input");
      return;
    }

    const body = {
      title: form_title,
      StartTime: time1,
      EndTime: time2,
      Capacity: Number(form_capacity),
    };

    setIsLoading(true);

    MakeFetch({
      url: `/gen/events/${username}?token=${token}`,
      method: "POST",
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then((resp) => {
        setStatus(200);
      })
      .catch((e) => setStatus(500))
      .finally(() => setIsLoading(false));
  };

  const timeFormatter = (date, time) => {
    return new Date(
      date[0],
      Number(date[1]) - 1,
      date[2],
      time[0],
      time[1],
      0
    ).toISOString();
  };

  const renderLoader = () => {
    console.log(isLoading);
    if (!isLoading) return null;
    return <Loaders.ClipLoader size={32} />;
  };

  const renderForm = () => {
    return (
      <>
        <h1>Create An Event</h1>
        <Input
          value={form_title}
          setter={set_title}
          type="text"
          pholder={"Event Title"}
        />

        <div className="time">
          <label>Start Time</label>
          <div className="time-inner">
            <Input
              value={form_date}
              setter={set_date}
              type="date"
              min={getDate()}
              max={getDate(365)}
            />
            <Input value={form_timeStart} setter={set_timeStart} type="time" />
          </div>
        </div>

        <div className="time">
          <label>End Time</label>
          <div className="time-inner">
            <Input
              value={form_dateE}
              setter={set_dateE}
              type="date"
              min={form_date}
            />
            <Input
              value={form_timeEnd}
              setter={set_timeEnd}
              type="time"
              min={form_timeStart}
            />
          </div>
        </div>

        <Input
          value={form_capacity}
          setter={set_capacity}
          type="number"
          pholder={100}
          min={100}
          max={500000}
        />

        {renderLoader()}

        <button type="button" id="submit_button" onClick={() => handleSubmit()}>
          Submit
        </button>
      </>
    );
  };

  const handleMsg = () => {
    if (status === 200) {
      return <h1>Event Created</h1>;
    } else if (status === 500) {
      return <h1>Error at creation</h1>;
    }
  };

  return (
    <div className="login-form">
      {status === 0 ? renderForm() : handleMsg()}
      <button
        type="back"
        id="submit_button"
        onClick={() => navigate("/events")}
      >
        back
      </button>
    </div>
  );
}

export default EventCreate;
