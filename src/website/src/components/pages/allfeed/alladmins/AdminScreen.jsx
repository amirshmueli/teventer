import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StoreActions } from "../../../../store/store";
import { DynamicSearchPage } from "../../events/event_feed/pagetemplate/dynamicsearch";
import * as Icon from "react-bootstrap-icons";
import * as Loaders from "react-spinners";
import { MakeFetch } from "../../../../funcs/api";

import "./AS.css";
const size = 30;
function AllAdminsScreen() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch({
      type: StoreActions.setEvent,
      payload: null,
    });
  }, [dispatch]);

  return (
    <div className="FILLER_SCREEN">
      <div className="FLOATER_SCREEN">
        <h1 className="TITLE_HEADER">Your Registered Admins</h1>
        <div className="SEARCH_SCREEN">
          <DynamicSearchPage
            url="/gen/admins"
            Lister={UserList}
            NFmessage="No Admins Found"
            whichSearch={"allAdmins"}
          />
        </div>
      </div>
    </div>
  );
}

export default AllAdminsScreen;

function UserList({ list, status }) {
  const ListElement = ({ user: admin_name, istatus }) => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("def");
    // def, rem, err
    const { username, token, event } = useSelector((state) => state);

    const renderLoader = () => {
      return <Loaders.ClipLoader size={30} />;
    };

    const renderIcon = () => {
      if (loading) return renderLoader();
      switch (status) {
        case "def":
          return <Icon.PersonDashFill size={size} />;
        case "rem":
          return <Icon.ExclamationCircleFill size={size} />;
        default:
          return <Icon.BugFill size={size} />;
      }
    };

    const deleteAdmin = async () => {
      if (status === "rem") return;
      setLoading(true);
      fetch(`/gen/delete/${username}?token=${token}&username=${admin_name}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then((json) => {
          console.log(`DELETE ON -> [${json.username}`);
          console.log(json);
          if (json.username !== admin_name) {
            console.log("username ver failed");
            setStatus("err");
            return;
          }
          setStatus("rem");
        })
        .catch((err) => {
          console.log(err);
          setStatus("err");
        })
        .finally(() => setLoading(false));
      console.log("finished");
    };

    const renderElement = () => {
      return (
        <div className="ticket-container">
          <div className="ticket-tab">
            <h3 className="ticket-name">{admin_name}</h3>
            <div>
              <div className="ticket-buttonQR" onClick={() => deleteAdmin()}>
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
