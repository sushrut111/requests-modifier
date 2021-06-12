import React from "react";
import { Button, Container } from "react-bootstrap";
import ReactDOM from "react-dom";
const Popup = () => {
  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage();
  }

  return (
    <>
      <Container>
        To change the autoresponder's rules, click on the button below.
        <Button onClick={handleOpenOptions}>Open options</Button>
      </Container>
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById("root")
);
