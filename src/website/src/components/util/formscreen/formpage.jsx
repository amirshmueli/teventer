import React from "react";

function FormPage(props) {
  const { header, children } = props;

  const renderLoader = () => {};

  const renderError = () => {};

  return (
    <div className="form-design">
      <h1>{header}</h1>
      <div className="content">{children}</div>
      {renderLoader()}
      {renderError()}
    </div>
  );
}

export default FormPage;
