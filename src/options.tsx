import React, { isValidElement, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Container, Table, InputGroup, DropdownButton, Dropdown, FormControl, Button, Tab, Alert, FormCheck } from "react-bootstrap";
import { EventKey } from "react-bootstrap/esm/types";
import * as _ from "lodash";
import {Rule, ruleSchemeTypes, validateRule} from "./Rule";
import {Tester} from "./regexTester";
import "./extras.css";

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
    if(!initialized) return;
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
      const bytes = new Uint8Array(buffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
  }

  const handleFileDrop = async(e: any) => {
    e.preventDefault();
    if (e.dataTransfer.items) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
        if (e.dataTransfer.items[i].kind === 'file') {
          const file = e.dataTransfer.items[i].getAsFile();
          const buffer = await file.arrayBuffer();
          const base64Data = arrayBufferToBase64(buffer);
          const dataUrl = `data:${file.type};base64,${base64Data}`;
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

  const addNewRules = (newrules: Rule[]) => {
    const validRules = newrules.filter((_irule)=>{
      const validation = validateRule(_irule);
      if(!validation.valid){
        alert(validation.error);
      }
      return validation.valid;
    })
    setRules(_.unionWith(rules, validRules, _.isEqual));
    return validRules.length === newrules.length;
  }

  const saveRule = () => {
    if(addNewRules([newRule])) clearNewRule();
  }

  const getJsonExportDataUrl = () => {
    return "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rules));
  }

  const openRuleTester = () => {
    const validation = validateRule(newRule);
    if(!validation.valid){
      alert(validation.error);
      return;
    }
    setShowTester(!showTester);
  }

  const removeRule = (rule: Rule) => {
    const tempRules = rules;
    _.remove(tempRules, (_irule)=>_.isEqual(_irule, rule));
    setRules([...tempRules]);
  }

  const toggleChecked = (rule: Rule) => {
    const tempRules = rules.map(
      _irule => {
        if(_.isEqual(_irule, rule)) {
          _irule.active = !_irule.active;
          
        }
        return _irule;
      }
    );
    setRules(tempRules);
  }

  const editRule = (rule: Rule) => {
    setNewRule(rule);
    removeRule(rule);
  }
  const loadFile = async(e: any) => {
    if(e.target.files.length===0){
      return;
    }
    const file: File = e.target.files[0];
    if(!file.name.endsWith(".arjson")) {
      alert("This is not a valid export from this extension.");
      return;
    }
    const fileText = await file.text();
    let fileRules;
    try{
      fileRules = JSON.parse(fileText);
      if(fileRules.length===undefined){
        throw new SyntaxError("The imported file does not seem to have rules in proper format exported by the extension.")
      }
    } catch(e) {
      alert(`The imported file is corrupted: ${e.toString()}`);
      return;
    }
    try{
      if(!addNewRules(fileRules)){
        throw new SyntaxError("One or more rules could not be imported from the file you uploaded. However, all the valid rules from the file have been succesfully imported.")
      }
    } catch (e) {
      alert(e.toString());
    }
    
  }
  
  const getInstructions = () => {
    return <Alert variant="primary">
      <ul>
        <li>You can add and delete rules from autoresponder here.</li>
        <li>Select the match scheme for rule. Select EXACT to match the url exactly, select REGEX to enter a pattern.</li>
        <li>Enter the exact url or regular expression in the input field "URL to be matched"</li>
        <li>In the next input field, you can either enter the url where you want the response to be fetched from or drag and drop the file to return the contents of that file as response.</li>
        <li>The last matched group will be appended to the redirected URL by default. If you do not want to append the last match, write your regular expression such that there are no match groups.</li>
        <li>Click on Add rule to save the rule.</li>
        <li>You can edit the saved rule by clicking the edit button. This will delete the saved rule and the rule will be added to the edit session - that means you will <b>lose the rule</b> if you navigate away without saving it.</li>
        <li>You can export the rules by clicking the Export rules button below the table.</li>
        <li>You can import the rules by clicking the Import rules button below the table and then selecting the .arjson file exported.</li>
      </ul>
    </Alert>
  }

  const getImportExportFunctionality = () => {
    return <>
      <Button variant="warning">
        <label>
          <input type="file" id="fileToLoad" onChange={loadFile} hidden/>
          Import
        </label>
      </Button><br/>      
      <a href={"data:" + getJsonExportDataUrl()} 
      download="autoresponder.arjson">
        <Button>Export</Button>
      </a>
    </>
  }

  const getRuleTesterModal = () => {
    return <Tester
    show={showTester}
    onHide={() => setShowTester(false)}
    rule={newRule}/>
  }

  return (
    <>
<div>
  <Container>
    {getRuleTesterModal()}
    <div style={{textAlign: "center"}}><h2>Autoresponder</h2></div>
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
        <Button onClick={openRuleTester} variant="warning">Test</Button>
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
                <td className="wrappedHidden">{rule.target}</td>
                <td><FormCheck type="checkbox" checked={rule.active} onChange={()=>toggleChecked(rule)}/></td>
                <td><Button size="sm" variant="warning" onClick={()=>editRule(rule)} >Edit</Button><Button size="sm" variant="danger" onClick={()=>{removeRule(rule)}}>Delete</Button></td>
              </tr>
            )
          })
        }
      </tbody>
    </Table>
      }
    </div>
      {getImportExportFunctionality()}
      {getInstructions()}
  </Container>
</div>
    </>
  );
};

ReactDOM.render(
  <Options/>,
  document.getElementById("root")
);
