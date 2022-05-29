import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MakeFetch } from "../../../../../funcs/api";
import { TicketPage } from "../tickets/ticketPage";
import { sleep } from "../../../../util/sleep";
import UsersPage from "../users/usersPage";
import "./FP.css";
function FeedPage() {
  const { event, token, username } = useSelector((state) => state);
  const navigate = useNavigate();
  const [page, setPage] = useState("tickets");
  const [del, setDel] = useState("delete");
  const deleteEvent = () => {
    if (del === "loading") return;
    if (del === "delete") setDel("confirm");
    if (del !== "confirm") return;
    console.log("deleting event");
    setDel("loading");
    sleep(1000);
    fetch(`/gen/events/${username}?token=${token}&eventID=${event.ID}`, {
      method: "DELETE",
    })
      .then((resp) => resp.json())
      .then((data) => {
        console.log(data);
        if (data.status === 200) {
          console.log("hereeee");
          setDel("DONE");
          navigate("/events");
        }
        setDel("inner error");
      })
      .catch((err) => {
        console.log(err);
        setDel("error");
      });
  };

  return (
    <div className="FILLER_SCREEN">
      <div className="FLOATER_SCREEN">
        <h1 className="TITLE_HEADER">
          {event.Title} {page}
        </h1>
        <div className="feed-search-area">
          {page === "tickets" ? <TicketPage /> : <UsersPage />}
        </div>
      </div>
      <div className="feed-buttons">
        <button
          onClick={() => {
            console.log(page);
            if (page === "tickets") {
              setPage("admins");
            } else setPage("tickets");
          }}
          className="feed-button"
          id="switcher"
        >
          Switch
        </button>
        <button
          className="feed-button"
          id="deleter"
          onClick={() => deleteEvent()}
        >
          {del}
        </button>
      </div>
    </div>
  );
}

export default FeedPage;
