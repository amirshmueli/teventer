import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import * as Icon from "react-bootstrap-icons";
import { MakeFetch, urlBuilder } from "../../../funcs/api";
export function Pagination(props) {
  const { url, extraField, parseField, listRender, NFMessage } = props;

  const { username, token } = useSelector((state) => state);

  const [pageData, setPageData] = useState([]);
  const [pageOffset, setPageOffset] = useState(0);

  const [searchPhrase, setSearchPhrase] = useState("");
  const [formPhrase, setFormPhrase] = useState("");

  const [loading, setLoading] = useState(false);
  const [max, setMax] = useState(0);

  const LIMIT = 6;

  const changeOffset = (currentOffset) => {
    if (max !== 0 && currentOffset > max) return;
    if (currentOffset < 0) return;
    setPageOffset(currentOffset);
  };

  const resParser = useCallback(
    (data) => {
      if (max === 0) {
        console.warn(data.Max);
        setMax(data.Max);
      }

      setPageData([...data[parseField]]);
    },
    [max, parseField]
  );

  const getPage = useCallback(() => {
    setLoading(true);
    MakeFetch({
      url:
        url +
        "/" +
        username +
        "?" +
        urlBuilder({
          token: token,
          offset: pageOffset,
          limit: LIMIT,
          search: searchPhrase,
        }) +
        extraField,
    })
      .then((res) => res.json())
      .then((data) => resParser(data))
      .catch((err) => {})
      .finally(() => setLoading(false));
  }, [extraField, pageOffset, resParser, searchPhrase, token, url, username]);

  useEffect(() => {
    getPage();
  }, [pageOffset, getPage]);

  useEffect(() => {
    setPageOffset(0);
    setPageData([]);
  }, [searchPhrase]);

  const renderBody = () => {
    if (loading) return <h1>loading</h1>;
    if (pageData.length === 0) return <h1>{NFMessage}</h1>;
    return listRender(pageData);
  };

  return (
    <div className="pagination-all">
      <div className="pagination-header">
        <input
          id="pagination-search-textbox"
          type="text"
          placeholder="search"
          onChange={(event) => setFormPhrase(event.target.value)}
        />
        <button
          id="pagination-search-button"
          type="submit"
          onClick={() => {
            setSearchPhrase(formPhrase);
          }}
        >
          search
        </button>
      </div>
      <div className="pagination-list">{renderBody}</div>
      <div className="pagination-navigation">
        <Icon.ArrowLeftCircle
          className="nav-btn"
          size={32}
          onClick={() => changeOffset(pageOffset - LIMIT)}
        >
          prev
        </Icon.ArrowLeftCircle>

        <Icon.ArrowRightCircle
          lassName="nav-btn"
          size={32}
          onClick={() => changeOffset(pageOffset + LIMIT)}
        >
          next
        </Icon.ArrowRightCircle>
      </div>
    </div>
  );
}

export default Pagination;
