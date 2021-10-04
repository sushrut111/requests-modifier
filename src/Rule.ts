export type ruleSchemeTypes = "REGEX" | "EXACT";

export interface Rule {
  urlpattern: string,
  target: string,
  scheme: ruleSchemeTypes,
  active: boolean
}

export const validateRule = (rule: Rule) => {
  const validation = {
    valid: true,
    error: ""
  }
  // check for keys
  const requiredKeys = ["urlpattern", "target", "scheme", "active"];
  for(let key of requiredKeys){
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
      return {
        redirectUrl: thisrule.target
      }  
    }
  } else if(thisrule.scheme === "REGEX") {
    const regexp = new RegExp(`^${thisrule.urlpattern}$`);
    if(regexp.test(requestDetails.url)) {
      const match = regexp.exec(requestDetails.url);
      return {
        redirectUrl: thisrule.target + (match.length>1?match[match.length-1]:"")
      }
    }
  }
}