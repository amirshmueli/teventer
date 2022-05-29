import React, { useState, useEffect } from "react";
import "./POE.css";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { StoreActions } from "../../../../store/store";
import { MakeFetch } from "../../../../funcs/api";
import * as Icons from "react-bootstrap-icons";
import * as Loaders from "react-spinners";
function RadioChoose(props) {
  return (
    <div
      className="radioTab"
      onClick={props.onChange}
      style={props.checked ? { backgroundColor: "#87bded" } : null}
    >
      {props.children}
    </div>
  );
}

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

function PageOfEvents() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [event_list, set_event_list] = useState([]);
  const [actualEvent, setActualEvent] = useState({});
  const { username, token } = useSelector((state) => state);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token === "" || username === "") navigate("/");
  }, [token, username, navigate]);

  useEffect(() => {
    async function f() {
      setIsLoading(true);
      await sleep(500);
      MakeFetch({ url: `/gen/events/${username}?token=${token}` })
        .then((resp) => resp.json())
        .then((data) => {
          if (data.events === []) return;
          console.log(data.events);
          set_event_list(data.events);
        })
        .catch((err) => console.log(err))
        .finally(() => setIsLoading(false));
    }
    f();
  }, [username, token]);

  useEffect(() => {
    if (event_list.length === 0) return;
    setActualEvent(event_list[0]);
  }, [event_list]);

  const renderList = () => {
    return event_list.map((event) => <Item event={event} />);
  };

  const Item = ({ event }) => {
    return (
      <div className="POE_list" key={event.ID}>
        <RadioChoose
          checked={event === actualEvent}
          onChange={() => {
            setActualEvent(event);
          }}
        >
          <div>
            <h3>{event.Title}</h3>
            <h5>
              {new Date(event.StartTime).toLocaleDateString("en-GB", {
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </h5>
          </div>
        </RadioChoose>
        <div className="devider" />
      </div>
    );
  };

  const EventList = () => {
    return renderList();
  };

  const renderProblem = () => {
    return (
      <div className="POE_nomessage">
        <h1>oops!</h1>
        <h4>it seems that you do not have any upcoming events</h4>
      </div>
    );
  };

  const renderLoader = () => {
    return (
      <div className="POE_Loader">
        <Loaders.ClipLoader size={56} />
      </div>
    );
  };

  const handleSubmit = () => {
    console.log("submitted");
    dispatch({
      type: StoreActions.setEvent,
      payload: actualEvent,
    });
    navigate("/event-feed");
  };

  return (
    <div className="FILLER_SCREEN">
      <div className="FLOATER_SCREEN">
        <h1 className="TITLE_HEADER">Your Upcoming Events</h1>
        <div className="POE_area">
          {isLoading ? (
            renderLoader()
          ) : event_list.length === 0 ? (
            renderProblem()
          ) : (
            <EventList />
          )}
        </div>
        {isLoading ? null : (
          <div className="eventsButtons">
            {event_list.length === 0 ? null : (
              <button
                className="feedButton"
                type="submit"
                onClick={() => handleSubmit()}
              >
                Submit
              </button>
            )}
            <div className="mydiv">
              <Icons.PlusCircle
                size={"6vh"}
                className="POE_add_button"
                color="#1e88e5"
                onClick={() => navigate("/create-event")}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PageOfEvents;
