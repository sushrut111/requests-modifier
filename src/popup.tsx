import React from "react";
import ReactDOM from "react-dom";
const Popup = () => {
  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage();
  }

  return (
    <>
      <button onClick={handleOpenOptions}>Open opttions</button>
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById("root")
);
