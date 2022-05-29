import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { ParseDate } from "../../../../../funcs/gen";
import * as Icon from "react-bootstrap-icons";
import * as Loaders from "react-spinners";
import { sleep } from "../../../../util/sleep";
import "./TP.css";
export const DynamicSearchPage = ({
  url,
  Lister,
  NFmessage,
  whichSearch,
  xstatus,
}) => {
  const { username, token, event } = useSelector((state) => state);
  const [mainList, setMainList] = useState([]);
  const [offset, setOffset] = useState(0);
  const [searchPhrase, setSearchPhrase] = useState("");
  const [dynamicPhrase, setDphrase] = useState("");
  const [loading, setLoading] = useState(false);
  const [max, setMax] = useState(0);
  const LIMIT = 10;

  const getPage = useCallback(
    async (noffset) => {
      console.log(`${noffset}/${offset}&${max}`);
      if (noffset > max) return;
      if (noffset < 0) return;
      console.log("here");
      setOffset(noffset);
      setLoading(true);

      let FURL = `${url}/${username}?token=${token}&offset=${noffset}&limit=${LIMIT}&search=${searchPhrase}`;
      if (whichSearch === "tickets") {
        FURL += "&status=2";
      }
      if (whichSearch !== "allAdmins") {
        FURL += `&eventID=${event.ID}`;
      }
      await sleep(100);
      fetch(FURL)
        .then((res) => res.json())
        .then((x) => {
          console.log(x);
          return x;
        })
        .then((data) => {
          if (max === 0) {
            console.warn(data.Max);
            setMax(data.Max);
          }
          if (whichSearch === "tickets") {
            setMainList([...data.tickets]);
          } else {
            if (data.users === null) {
              setMainList([]);
              return;
            }
            setMainList([...data.users]);
          }
        })
        .catch((err) => console.log(err))
        .finally(() => setLoading(false));
    },
    [offset, max, url, username, token, searchPhrase, whichSearch, event]
  );

  useEffect(() => {
    getPage(offset);
  }, [offset, getPage]);

  useEffect(() => {
    setOffset(0);
    setMainList([]);
    setMax(0);
  }, [searchPhrase]);

  useEffect(() => {
    console.log(`Offset Is [${offset}]`);
  }, [offset]);

  const clicker = (target) => {
    if (whichSearch === "tickets") {
      window.open(
        `https://localhost/gen/QR/${username}?token=${token}&eventID=${target.EventRefer}&ticketID=${target.ticketID}`
      );
    }
  };

  const renderList = () => {
    return (
      <div>
        {mainList.length === 0 ? (
          !loading ? (
            <h3>{NFmessage}</h3>
          ) : null
        ) : (
          <Lister list={mainList} onClicker={clicker} status={xstatus} />
        )}

        {renderLoader()}
      </div>
    );
  };

  const renderLoader = () => {
    return loading ? (
      <div className="SEARCH_LOADER">
        <Loaders.ClipLoader size={58} />
      </div>
    ) : null;
  };

  const handlePhraseChange = (event) => {
    setDphrase(event.target.value);
  };

  return (
    <div className="tickets-all">
      <div className="container-upper">
        <input
          id="ticketSearchInput"
          type="text"
          placeholder="search"
          onChange={handlePhraseChange}
        />
        <button
          id="ticketSearchButton"
          type="submit"
          onClick={() => {
            setSearchPhrase(dynamicPhrase);
          }}
        >
          search
        </button>
        {!loading ? (
          <h6>
            {offset}-{Math.min(offset + LIMIT, max)}/{max}
          </h6>
        ) : null}
      </div>
      <div className="container-main">
        {loading ? renderLoader() : renderList()}
      </div>
      <div className="nav-menu">
        <Icon.ArrowLeftCircle
          className="nav-btn"
          size={32}
          onClick={() => getPage(offset - LIMIT)}
        >
          prev
        </Icon.ArrowLeftCircle>

        <Icon.ArrowRightCircle
          lassName="nav-btn"
          size={32}
          onClick={() => getPage(offset + LIMIT)}
        >
          next
        </Icon.ArrowRightCircle>
      </div>
    </div>
  );
};
