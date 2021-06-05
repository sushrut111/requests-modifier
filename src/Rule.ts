type ruleSchemeTypes = "REGEX" | "EXACT";

interface Rule {
  urlpattern: string,
  target: string,
  scheme: ruleSchemeTypes,
  active: boolean
}