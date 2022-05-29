import React, { useState } from "react";
import { DynamicSearchPage } from "../pagetemplate/dynamicsearch";
//import { Pagination } from "../../../../util/pagination/pagination";
import { useNavigate } from "react-router-dom";
import * as Icon from "react-bootstrap-icons";
import "./TPS.css";
import { useSelector } from "react-redux";
import * as Loaders from "react-spinners";
//import { useSelector } from "react-redux";
export const TicketPage = () => {
  // const { event } = useSelector((state) => state);
  const navigate = useNavigate();
  return (
    <div className="SEARCH_SCREEN">
      <DynamicSearchPage
        url="/api/tickets"
        Lister={TicketList}
        NFmessage="No Tickets Found"
        whichSearch={"tickets"}
      />
      <button
        type="button"
        id="create_ticket"
        onClick={() => navigate("/create-ticket")}
      >
        create ticket
      </button>
    </div>
  );
};

function deleteTicket(token, username, ticket, SV) {
  SV("loading");
  fetch(
    `/gen/tickets/${username}?token=${token}&ticketID=${ticket.ticketID}&eventID=${ticket.EventRefer}`,
    { method: "DELETE" }
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.ticketID !== ticket.ticketID) {
        SV("valid");
      }
      // success
      SV("invalid");
    })
    .catch((err) => {
      console.log(err);
      SV("valid");
    });
}

const TicketList = ({ list, onClicker }) => {
  const Element = ({ ticket, onClicker }) => {
    const [valid, setValid] = useState("valid");
    const { username, token } = useSelector((state) => state);

    if (valid === "invalid") return null;
    return (
      <div className="ticket-container">
        <div className="ticket-tab">
          <h3 className="ticket-name">
            {" "}
            {(ticket.Name + " " + ticket.LastName).padEnd(15)}
          </h3>
          <h6>{ticket.ticketID}</h6>
          <h6>{ticket.Price}</h6>
          <h4>{ticket.Type}</h4>
          <div className="ticket-tab-buttons">
            <div className="qrbutton">
              <Icon.UpcScan size={30} onClick={() => onClicker(ticket)} />
            </div>
            <div className="ticket-del-button">
              {valid === "loading" ? (
                <Loaders.ClipLoader size={30} />
              ) : (
                <Icon.XSquare
                  size={30}
                  onClick={() => {
                    deleteTicket(token, username, ticket, setValid);
                  }}
                />
              )}
            </div>
          </div>
        </div>
        <div className="ticket-devider" />
      </div>
    );
  };

  return (
    <div className="tickets-list">
      {list.map((ticket) => (
        <Element ticket={ticket} key={ticket.ID} onClicker={onClicker} />
      ))}
    </div>
  );
};
