import { InvalidGetOutputCallOnGenericRuleType, RuleTypeNotFoundException } from "./Exceptions";

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

export interface IValidation {
  valid: boolean,
  error: string
}

export const getRuleObject = (rule: Rule): GenericRule => {
  if (rule.ruleType === undefined) { // Handling undefined case to support backward compatibility
    rule.ruleType = "REDIRECT";
    return new RedirectRule(rule);
  }
  else if (rule.ruleType == "REDIRECT") {
    return new RedirectRule(rule);
  }
  else if (rule.ruleType == "REQUEST_HEADER") {
    return new AddRequestHeaderRule(rule);
  }
  throw new RuleTypeNotFoundException(rule.ruleType);
}


export class GenericRule {
  urlpattern: string;
  target: string;
  scheme: ruleSchemeTypes;
  active: boolean;
  ruleType: ruleTypes;

  public getRuleOutput = (requestDetails: {url: string}) : chrome.webRequest.BlockingResponse => {
    throw new InvalidGetOutputCallOnGenericRuleType("getRuleOutput");
  }

  public validateRule = () : IValidation => {
    throw new InvalidGetOutputCallOnGenericRuleType("validateRule");
  }
}

export class AddRequestHeaderRule extends GenericRule {
  constructor(rule: Rule){
    super();
    this.active = rule.active;
    this.urlpattern = rule.urlpattern;
    this.target = rule.target;
    this.scheme = rule.scheme;
    this.ruleType = rule.ruleType;
  }

  public validateRule = () : IValidation => {
    const validation = {
      valid: true,
      error: ""
    }
    // check for keys
    const requiredKeys = ["urlpattern", "target", "scheme", "active", "ruleType"];
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
  
    if(this.urlpattern.trim()===""){
      validation.valid = false;
      validation.error = "Url pattern cannot be empty";
      return validation;
    }
    if(this.target.trim()===""){
      validation.valid = false;
      validation.error = "Headers cannot be empty";
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
    this.ruleType = rule.ruleType;
  }

  public validateRule = () : IValidation => {
    const validation = {
      valid: true,
      error: ""
    }
    // check for keys
    const requiredKeys = ["urlpattern", "target", "scheme", "active", "ruleType"];
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
  
    if(this.urlpattern.trim()===""){
      validation.valid = false;
      validation.error = "Url pattern cannot be empty";
      return validation;
    }
    if(this.target.trim()===""){
      validation.valid = false;
      validation.error = "Url target cannot be empty";
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
