export type ruleSchemeTypes = "REGEX" | "EXACT";
export type ruleTypes = "REDIRECT" | "REQUEST_HEADER";
export interface Rule {
  urlpattern: string,
  target: string,
  scheme: ruleSchemeTypes,
  active: boolean,
  ruleType?: ruleTypes
}

export interface HeaderTarget {
  name: string,
  value: string
}

export class GenericRule {
  urlpattern: string;
  target: string;
  scheme: ruleSchemeTypes;
  active: boolean;
  ruleType: ruleTypes;

  validateRule = () => {
    const validation = {
      valid: true,
      error: ""
    }
    // check for keys
    const requiredKeys = ["urlpattern", "target", "scheme", "active"];
    for(const key of requiredKeys){
      if(!(key in this)){
        validation.error = `${key} not found in rule`;
        validation.valid = false;
        return validation;
      }
    }
  
    // validate rule scheme
    const allowedSchemes = ["REGEX", "EXACT"];
    if(!allowedSchemes.includes(this.scheme)){
      validation.error = `${this.scheme} is not a valid rule scheme`;
      validation.valid = false;
      return validation;
    }
  
    if(this.urlpattern.trim()==="" || this.target.trim()===""){
      validation.valid = false;
      validation.error = "Url pattern or url target cannot be empty";
      return validation;
    }
    if(this.scheme==="REGEX"){
      try{
        new RegExp(this.urlpattern)
      } catch (e) {
        validation.valid = false;
        validation.error = `${this.urlpattern} is not valid regex: ${e.toString()}`;
        return validation;
      }
    }
    return validation;
  }


}

export class AddRequestHeaderRule extends GenericRule {
  constructor(rule: Rule){
    super();
    this.active = rule.active;
    this.urlpattern = rule.urlpattern;
    this.target = rule.target;
    this.scheme = rule.scheme;
  }
  
  public getRuleOutput = (requestDetails: {url: string}) : chrome.webRequest.BlockingResponse => {
    if (this.scheme == "EXACT") {
      if (this.urlpattern === requestDetails.url) {
        return {
          requestHeaders: JSON.parse(this.target)
        }
      }
    }
    else if (this.scheme === "REGEX") {
      const regexp = new RegExp(`^${this.urlpattern}$`);
      if(regexp.test(requestDetails.url)) {
        return {
          requestHeaders: JSON.parse(this.target)
        }
      }      
    }
  }
}

export class RedirectRule extends GenericRule {
  constructor(rule: Rule){
    super();
    this.active = rule.active;
    this.urlpattern = rule.urlpattern;
    this.target = rule.target;
    this.scheme = rule.scheme;
  }

  public getRuleOutput = (requestDetails: {url: string}) : chrome.webRequest.BlockingResponse => {
    if(this.scheme === "EXACT"){
      if(this.urlpattern===requestDetails.url){
        if(this.target === "BLOCK") {
          return {
            cancel: true
          }
        }
        return {
          redirectUrl: this.target
        }  
      }
    } else if(this.scheme === "REGEX") {
      const regexp = new RegExp(`^${this.urlpattern}$`);
      if(regexp.test(requestDetails.url)) {
        if(this.target === "BLOCK") {
          return {
            cancel: true
          }
        }
        const match = regexp.exec(requestDetails.url);
        return {
          redirectUrl: this.target + (match.length>1?match[match.length-1]:"")
        }
      }
    }
  }
}

export const validateRule = (rule: Rule) => {
  const validation = {
    valid: true,
    error: ""
  }
  // check for keys
  const requiredKeys = ["urlpattern", "target", "scheme", "active"];
  for(const key of requiredKeys){
    if(!(key in rule)){
      validation.error = `${key} not found in rule`;
      validation.valid = false;
      return validation;
    }
  }

  // validate rule scheme
  const allowedSchemes = ["REGEX", "EXACT"];
  if(!allowedSchemes.includes(rule.scheme)){
    validation.error = `${rule.scheme} is not a valid rule scheme`;
    validation.valid = false;
    return validation;
  }

  if(rule.urlpattern.trim()==="" || rule.target.trim()===""){
    validation.valid = false;
    validation.error = "Url pattern or url target cannot be empty";
    return validation;
  }
  if(rule.scheme==="REGEX"){
    try{
      new RegExp(rule.urlpattern)
    } catch (e) {
      validation.valid = false;
      validation.error = `${rule.urlpattern} is not valid regex: ${e.toString()}`;
      return validation;
    }
  }
  return validation;
}

export const getRedirectResponse = (thisrule: Rule, requestDetails: {url: string}) => {
  if(thisrule.scheme === "EXACT"){
    if(thisrule.urlpattern===requestDetails.url){
      if(thisrule.target === "BLOCK") {
        return {
          cancel: true
        }
      }
      return {
        redirectUrl: thisrule.target
      }  
    }
  } else if(thisrule.scheme === "REGEX") {
    const regexp = new RegExp(`^${thisrule.urlpattern}$`);
    if(regexp.test(requestDetails.url)) {
      if(thisrule.target === "BLOCK") {
        return {
          cancel: true
        }
      }
      const match = regexp.exec(requestDetails.url);
      return {
        redirectUrl: thisrule.target + (match.length>1?match[match.length-1]:"")
      }
    }
  }
}