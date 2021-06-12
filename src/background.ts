import {Rule, getRedirectResponse} from "./Rule";
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
  
  chrome.webRequest.onBeforeRequest.addListener(
    (requestDetails: chrome.webRequest.WebRequestBodyDetails): void | chrome.webRequest.BlockingResponse => {
      for(let i=0; i<rules.length; i++){
        if(!!!rules[i].active) continue;
        let thisrule = rules[i];
        let redirResp = getRedirectResponse(thisrule, requestDetails);
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
