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
        if(rules[i].scheme === "EXACT"){
          if(rules[i].urlpattern===requestDetails.url){
            return {
              redirectUrl: rules[i].target
            }  
          }
        } else if(rules[i].scheme === "REGEX") {
          const regexp = new RegExp(`^${rules[i].urlpattern}$`);
          if(regexp.test(requestDetails.url)) {
            let match = regexp.exec(requestDetails.url);
            return {
              redirectUrl: rules[i].target + (match.length>1?match[match.length-1]:"")
            }
          }
        }
      }
    },
    {
      urls: ["<all_urls>"]
    },  
    ["blocking"]
  );
}

actorFunction();
