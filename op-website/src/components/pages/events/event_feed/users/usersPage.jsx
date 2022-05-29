import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DynamicSearchPage } from "../pagetemplate/dynamicsearch";
import { useSelector } from "react-redux";
import * as Icon from "react-bootstrap-icons";
import { MakeFetch } from "../../../../../funcs/api";
import * as Loaders from "react-spinners";
import "./UP.css";

function UsersPage() {
  const navigate = useNavigate();
  const [state, setState] = useState(0);
  const main = () => {
    console.log("changed to main");
    return (
      <div>
        <DynamicSearchPage
          url="/gen/users"
          Lister={UserList}
          NFmessage="No Admins Found"
          whichSearch={"eventAdmins"}
          xstatus={"drem"}
        />
        <button id="create_ticket" onClick={() => navigate("/create-admin")}>
          create admin
        </button>
        <button id="create_ticket" onClick={() => setState(1)}>
          assign
        </button>
      </div>
    );
  };
  const sec = () => {
    return (
      <div>
        <DynamicSearchPage
          url="/gen/admins"
          Lister={UserList}
          NFmessage="No Admins Found"
          whichSearch={"allAdmins"}
          xstatus={"dadd"}
        />
        <button id="create_ticket" onClick={() => setState(0)}>
          back
        </button>
      </div>
    );
  };
  const pagination = () => {
    if (state === 0) return main();
    return sec();
  };
  return pagination();
}

const def_color = "#000";
const size = 30;

function UserList({ list, status }) {
  const ListElement = ({ user: admin_name, istatus }) => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(istatus);
    // dadd, drem, err, sadd, srem
    const { username, token, event } = useSelector((state) => state);

    const assignAdmin = async () => {
      setLoading(true);
      console.log(`Assign ${admin_name} to ${event.Title}`);
      MakeFetch({
        url: `/gen/assign/${username}?token=${token}`,
        method: "POST",
        body: JSON.stringify({
          Username: admin_name,
          EventID: event.ID,
        }),
      })
        .then((res) => {
          setLoading(false);
          return res.json();
        })
        .then((json) => {
          console.log(`PASS -> [${json.username}|${json.eventID}]`);
          if (json.username !== admin_name) {
            setStatus("err");
            console.log("err ver usrname");
            return;
          } else if (json.eventID !== event.ID) {
            setStatus("err");
            console.log("eventID ver usrname");
            return;
          }
          console.log("pass and assiged");
          setStatus("sadd");
        })
        .catch((err) => {
          console.log(err);
          setStatus("err");
        })
        .finally(() => setLoading(false));
      console.log("finished");
    };

    const renderLoader = () => {
      return <Loaders.ClipLoader size={30} />;
    };

    const renderIcon = () => {
      if (loading) return renderLoader();
      switch (status) {
        case "dadd":
          return <Icon.PersonPlusFill size={size} />;
        case "drem":
          return <Icon.PersonDashFill size={size} />;
        case "sadd":
          return <Icon.CheckCircleFill size={size} />;
        case "srem":
          return <Icon.CheckSquareFill size={size} />;
        default:
          return <Icon.BugFill size={size} />;
      }
    };

    const unAssignAdmin = async () => {
      setLoading(true);
      fetch(
        `/gen/remove/${username}?token=${token}&username=${admin_name}&eventID=${event.ID}`,
        { method: "DELETE" }
      )
        .then((res) => res.json())
        .then((json) => {
          console.log(`PASS -> [${json.username}|${json.eventID}]`);
          console.log(json);
          if (json.username !== admin_name) {
            console.log("username ver failed");
            setStatus("err");
          } else if (json.eventID !== event.ID) {
            console.log("eventID ver failed");
            setStatus("err");
          }
          setStatus("srem");
        })
        .catch((err) => {
          console.log(err);
          setStatus("err");
        })
        .finally(() => setLoading(false));
      console.log("finished");
    };

    const func = () => {
      if (loading) return;
      if (status === "dadd" || status === "srem") {
        assignAdmin();
        return;
      }
      unAssignAdmin();
    };

    const renderElement = () => {
      return (
        <div className="ticket-container">
          <div className="ticket-tab">
            <h3 className="ticket-name">{admin_name}</h3>
            <div>
              <div className="ticket-buttonQR" onClick={() => func()}>
                {renderIcon()}
              </div>
            </div>
          </div>
          <div className="ticket-devider" />
        </div>
      );
    };

    return renderElement();
  };

  const renderList = () => {
    return (
      <div className="tickets-list">
        {list.map((admin) => {
          console.log(admin);
          return <ListElement user={admin} istatus={status} key={admin} />;
        })}
      </div>
    );
  };

  return renderList();
}

export default UsersPage;
