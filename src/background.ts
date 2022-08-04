import _ from "lodash";
import {Rule, getRedirectResponse, GenericRule, RedirectRule, AddRequestHeaderRule} from "./Rule";
const synchronizeDataSaved = (): Promise<Rule[]> => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("RArules", (data: any) => {
      resolve(data?.RArules??[]);
    });
  });    
}

let rules: Rule[] = [];
synchronizeDataSaved().then(syncRules => {
  rules = syncRules;
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    rules = changes.RArules.newValue;
  }
});


const actorFunction = async () => {
  
  chrome.webRequest.onBeforeSendHeaders.addListener(
    (requestDetails: chrome.webRequest.WebRequestHeadersDetails): void | chrome.webRequest.BlockingResponse => {
      for(let i=0; i<rules.length; i++){
        if(rules[i].ruleType !== "REQUEST_HEADER") {
          continue;
        }
        if(!rules[i].active) continue;
        const thisrule = new AddRequestHeaderRule(rules[i]);
        const returnHeaders = thisrule.getRuleOutput(requestDetails);
        if(returnHeaders===undefined) continue;
        let finalHeaders: chrome.webRequest.BlockingResponse = { requestHeaders: [] };
        if(requestDetails.requestHeaders!==undefined){
          finalHeaders.requestHeaders = _.concat(requestDetails.requestHeaders, returnHeaders.requestHeaders)
        }
        return finalHeaders;
      }
    }, 
    {
      urls: ["<all_urls>"]
    },
    ["blocking", "requestHeaders"]
  );

  chrome.webRequest.onBeforeRequest.addListener(
    (requestDetails: chrome.webRequest.WebRequestBodyDetails): void | chrome.webRequest.BlockingResponse => {
      for(let i=0; i<rules.length; i++){
        // undefined check if for backward compatibility
        if (rules[i].ruleType !== "REDIRECT" && rules[i].ruleType !== undefined) continue;
        if(!rules[i].active) continue;
        const thisrule = new RedirectRule(rules[i]);
        const redirResp = thisrule.getRuleOutput(requestDetails);
        if(redirResp===undefined) continue;
        return redirResp;
      }
    },
    {
      urls: ["<all_urls>"]
    },  
    ["blocking"]
  );
}

actorFunction();
