import React, { useState } from "react";
import { Alert, Button, Container, FormControl, Modal, Table } from "react-bootstrap";
import {getRedirectResponse, Rule} from "./Rule";
interface TesterProps {
    show: boolean,
    onHide: ()=>void,
    rule: Rule
}

interface TestCase {
    testUrl: string,
    responseUrl?: string
}

export const Tester = (props: TesterProps) => {
  const defaultTestResponse = <Alert variant="warning">Please enter an url to test.</Alert>;
  const [testResponse, setTestResponse] = useState<any>(defaultTestResponse);

  const createResponse = (testcase: TestCase) => {
    if(testcase.testUrl===""){
        setTestResponse(defaultTestResponse);
    }
    if(!testcase.responseUrl){
        setTestResponse(
            <Alert variant="danger">
                The test url {testcase.testUrl} does not satisfy this rule.
            </Alert>
        )
    } else {
        setTestResponse(
            <Alert variant="primary">
                All requests to {testcase.testUrl}<br/>
                will get their response from <br/>
                <a href={testcase.responseUrl} target="_blank" >{testcase.responseUrl}</a>
            </Alert>
        )
    }
  }

  const testUrlAgainstRule = (e: any) => {
    let urlUnderTest = e.target.value.trim();
    if(urlUnderTest===""){
        setTestResponse(defaultTestResponse);
        return;
    }
    let resp = getRedirectResponse(props.rule, {url: urlUnderTest});
    if(resp===undefined){
        createResponse({testUrl: urlUnderTest})
    } else {
        createResponse({testUrl: urlUnderTest, responseUrl: resp.redirectUrl})
    }
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
                <tr><td>Match pattern</td><td>{props.rule.urlpattern}</td></tr>
                <tr><td>Target</td><td>{props.rule.target}</td></tr>
            </tbody>
        </Table>
        <hr/>
        <FormControl
            placeholder="Enter url to test"
            onChange={testUrlAgainstRule}
        />
        <br/>
            {testResponse}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};