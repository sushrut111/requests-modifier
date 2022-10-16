import React, { useState } from "react";
import { Alert, Button, FormControl, Modal, Table } from "react-bootstrap";
import { getRuleObject, Rule } from "./Rule";
import "./extras.css"
interface TesterProps {
  show: boolean,
  onHide: () => void,
  rule: Rule
}

interface TestCase {
  testUrl: string,
  response: chrome.webRequest.BlockingResponse
}

export const Tester = (props: TesterProps) => {
  const defaultTestResponse = <Alert variant="warning">Please enter an url to test.</Alert>;
  const [testResponse, setTestResponse] = useState<any>(defaultTestResponse);

  const createResponse = (testcase: TestCase) => {
    if (testcase.testUrl === "") {
      setTestResponse(defaultTestResponse);
    }
    if (!testcase.response || testcase.response === undefined) {
      setTestResponse(
        <Alert variant="danger">
          The test url {testcase.testUrl} does not satisfy this rule.
            </Alert>
      )
    }
    else {
      if (testcase.response.cancel) {
        setTestResponse(
          <Alert variant="primary">
            All requests to {testcase.testUrl}<br />
                will be blocked

            </Alert>
        )

      } else {
        if (getRuleObject(props.rule).ruleType == "REDIRECT") {
          setTestResponse(
            <Alert variant="primary">
              All requests to {testcase.testUrl}<br />
                  will get their response from <br />
              <a href={testcase.response.redirectUrl} target="_blank" className="wrappedHidden" >{testcase.response.redirectUrl}</a>
            </Alert>
          )
        } else if (getRuleObject(props.rule).ruleType == "REQUEST_HEADER") {
          setTestResponse(
            <Alert variant="primary">
            For all requests to {testcase.testUrl}<br />
            the headers {JSON.stringify(testcase.response.requestHeaders)} will be appended to outgoing request <br />
            this is in addition to the existing headers on the request
          </Alert>

          );
        } else {
          alert(`RuleType ${props.rule.ruleType} is not recognized!`)
        }
      }
    }
  }

  const testUrlAgainstRule = (e: any) => {
    const urlUnderTest = e.target.value.trim();
    if (urlUnderTest === "") {
      setTestResponse(defaultTestResponse);
      return;
    }
    const resp = getRuleObject(props.rule).getRuleOutput({ url: urlUnderTest });
    createResponse({ testUrl: urlUnderTest, response: resp })
  }

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Regex tester for autoresponder
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table>
          <tbody>
            <tr><td>Scheme</td><td>{props.rule.scheme}</td></tr>
            <tr><td>Rule type</td><td>{getRuleObject(props.rule).ruleType}</td></tr>
            <tr><td>Match pattern</td><td>{props.rule.urlpattern}</td></tr>
            <tr><td>Target</td><td className="wrappedHidden">{props.rule.target}</td></tr>
          </tbody>
        </Table>
        <hr />
        <FormControl
          placeholder="Enter url to test"
          onChange={testUrlAgainstRule}
        />
        <br />
        {testResponse}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};