import React, { isValidElement, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Container, Table, InputGroup, DropdownButton, Dropdown, FormControl, Button, Tab } from "react-bootstrap";
import { EventKey } from "react-bootstrap/esm/types";
import * as _ from "lodash";


interface AllStore {
  RArules: Rule[]
}

const Options = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [initialized, setInitialized] = useState<boolean>(false);
  const synchronizeDataSaved = () => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get("RArules", (data: any) => {
        resolve(data.RArules);
      });
    });    
  }

  const clearNewRule = () => {
    setNewRule({
      urlpattern: "",
      target: "",
      scheme: "REGEX",
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

  const saveRule = () => {
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
  <Container>
    <InputGroup className="mb-3">
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
      <FormControl placeholder="Response to return" value={newRule.target} onChange={handleTargetChange}/>
      <Button variant="primary" onClick={saveRule}>Add Rule</Button>
    </InputGroup>
    <div>
      <Table>
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
      
    </div>

  </Container>
</div>
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Options/>
  </React.StrictMode>,
  document.getElementById("root")
);
