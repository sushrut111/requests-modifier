export type ruleSchemeTypes = "REGEX" | "EXACT";

export interface Rule {
  urlpattern: string,
  target: string,
  scheme: ruleSchemeTypes,
  active: boolean
}

export const getRedirectResponse = (thisrule: Rule, requestDetails: {url: string}) => {
  if(thisrule.scheme === "EXACT"){
    if(thisrule.urlpattern===requestDetails.url){
      return {
        redirectUrl: thisrule.target
      }  
    }
  } else if(thisrule.scheme === "REGEX") {
    const regexp = new RegExp(`^${thisrule.urlpattern}$`);
    if(regexp.test(requestDetails.url)) {
      let match = regexp.exec(requestDetails.url);
      return {
        redirectUrl: thisrule.target + (match.length>1?match[match.length-1]:"")
      }
    }
  }
}