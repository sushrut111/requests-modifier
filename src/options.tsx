import React, { isValidElement, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Container, Table, InputGroup, DropdownButton, Dropdown, FormControl, Button, Tab, Alert } from "react-bootstrap";
import { EventKey } from "react-bootstrap/esm/types";
import * as _ from "lodash";
import {Rule, ruleSchemeTypes} from "./Rule";
import {Tester} from "./regexTester";

interface AllStore {
  RArules: Rule[]
}

const Options = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [showTester, setShowTester] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);
  const synchronizeDataSaved = () => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get("RArules", (data: any) => {
        resolve(data?.RArules??[]);
      });
    });    
  }

  const clearNewRule = () => {
    setNewRule({
      ...newRule,
      urlpattern: "",
      target: "",
      active: true
    })
  }

  const upSyncRules = () => {
    if(!!!initialized) return;
    chrome.storage.local.set({RArules: rules});
    
  }
  
  useEffect(()=>{
    synchronizeDataSaved().then((syncRules: Rule[])=>setRules(syncRules));
    setInitialized(true);
  }, []);

  useEffect(()=>{
    upSyncRules();
  }, [rules])
  
  const [newRule, setNewRule] = useState<Rule>({urlpattern:"", target:"", scheme: "REGEX", active: true});
  
  const handleUrlSchemeChange = (eventKey: ruleSchemeTypes) => {
    setNewRule({
      ...newRule,
      scheme: eventKey
    })
  }

  const handleUrlPatternChange = (e: any) => {
    setNewRule({
      ...newRule,
      urlpattern: e.target.value
    })
  }

  const handleTargetChange = (e: any) => {
    setNewRule({
      ...newRule,
      target: e.target.value
    })
  }
  function arrayBufferToBase64(buffer: ArrayBuffer) {
      let binary = '';
      let bytes = new Uint8Array(buffer);
      let len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
  }

  const handleFileDrop = async(e: any) => {
    e.preventDefault();
    if (e.dataTransfer.items) {
      for (var i = 0; i < e.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
        if (e.dataTransfer.items[i].kind === 'file') {
          var file = e.dataTransfer.items[i].getAsFile();
          let buffer = await file.arrayBuffer();
          let base64Data = arrayBufferToBase64(buffer);
          let dataUrl = `data:${file.type};base64,${base64Data}`;
          setNewRule({
            ...newRule,
            target: dataUrl
          })
        }
      }
    } 
  }

  const dragOverHandler = (e: any) => {
    e.preventDefault();
  }
  const saveRule = () => {
    if(newRule.urlpattern.trim()==="" || newRule.target.trim()===""){
      alert("Url patter or url target cannot be empty");
      return;
    }
    setRules(_.unionWith(rules, [newRule], _.isEqual));
    clearNewRule();
  }

  const removeRule = (rule: Rule) => {
    const tempRules = rules;
    _.remove(tempRules, (_irule)=>_.isEqual(_irule, rule));
    setRules([...tempRules]);
  }

  return (
    <>
<div>
  <Tester
    show={showTester}
    onHide={() => setShowTester(false)}
    rule={newRule}
  ></Tester>
  <Container>
    <div style={{textAlign: "center"}}><h2>Autoresponder</h2></div>
    <Alert variant="primary">
      <ul>
        <li>You can add and delete rules from autoresponder here.</li>
        <li>Select the match scheme for rule. Select EXACT to match the url exactly, select REGEX to enter a pattern.</li>
        <li>Enter the exact url or regular expression in the input field "URL to be matched"</li>
        <li>In the next input field, you can either enter the url where you want the response to be fetched from or drag and drop the file to return the contents of that file as response.</li>
        <li>The last matched group will be appended to the redirected URL by default. If you do not want to append the last match, write your regular expression such that there are no match groups.</li>
        <li>Click on Add rule to save the rule.</li>
      </ul>
    </Alert>
    <div>
      <InputGroup>
        <DropdownButton
          as={InputGroup.Prepend}
          variant="outline-secondary"
          title={newRule.scheme}
          id="input-group-dropdown-1"
          onSelect={handleUrlSchemeChange}
        >
          <Dropdown.Item eventKey={'EXACT'}>EXACT</Dropdown.Item>
          <Dropdown.Item eventKey={'REGEX'}>REGEX</Dropdown.Item>
        </DropdownButton>
        <FormControl placeholder="URL to be matched" value={newRule.urlpattern} onChange={handleUrlPatternChange}/>
      </InputGroup>
      <InputGroup>
        <FormControl 
          as="textarea" 
          aria-label="With textarea" 
          placeholder="Enter url for redirection. To return contents from a file as response, drag and drop the file in this text area." 
          value={newRule.target} 
          onChange={handleTargetChange} 
          onDrop={handleFileDrop} 
          onDragOver={dragOverHandler}
        />
        <Button onClick={()=>{setShowTester(!showTester)}} variant="warning">Test</Button>
        <Button variant="primary" onClick={saveRule}>Add Rule</Button>
      </InputGroup>
      <hr/>
    </div>
    <div>
      {rules?.length===0?
      <></>:<Table>
      <thead>
        <tr>
          <th>#</th>
          <th>Scheme</th>
          <th>UrlPattern</th>
          <th>Target</th>
          <th>Active</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {
          rules.map((rule, index)=>{
            return (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{rule.scheme}</td>
                <td>{rule.urlpattern}</td>
                <td>{rule.target}</td>
                <td>{rule.active}</td>
                <td><Button size="sm" variant="danger" onClick={()=>{removeRule(rule)}}>Delete</Button></td>
              </tr>
            )
          })
        }
      </tbody>
    </Table>
      }
      
      
    </div>

  </Container>
</div>
    </>
  );
};

ReactDOM.render(
  <Options/>,
  document.getElementById("root")
);
