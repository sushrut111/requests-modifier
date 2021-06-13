import React from "react";
import { Button, Card } from "react-bootstrap";
import ReactDOM from "react-dom";
const Popup = () => {
  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage();
  }

  return (
    <>
      <Card style={{ width: '18rem' }}>
        <Card.Body>
          <Card.Title>AutoResponder</Card.Title>
          <Card.Text>
            Auto responder is active. You can specify rules to define how to process the requests. Rules can be changed on extension's options page.
          </Card.Text>
          <Card.Link><Button onClick={handleOpenOptions}>Open options</Button></Card.Link>
        </Card.Body>
      </Card>
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById("root")
);
