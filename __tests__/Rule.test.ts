import { Rule, getRuleObject, GenericRule } from "../src/Rule";

test("A valid rule", () => {
  const rule: Rule = {
    urlpattern: "https://example.com",
    target: "https://google.com",
    scheme: "EXACT",
    active: true,
  };

  expect(getRuleObject(rule).validateRule()).toMatchObject({
    valid: true,
    error: "",
  });
});

test("An invalid rule with invalid regex", () => {
  const rule: Rule = {
    urlpattern: "*",
    target: "https://google.com",
    scheme: "REGEX",
    active: true,
  };

  expect(getRuleObject(rule).validateRule()).toMatchObject({
    valid: false,
    error: "* is not valid regex: SyntaxError: Invalid regular expression: /*/: Nothing to repeat",
  });
});


test("Correct redirection with regex", () => {
  const target = "https://google.com";
  const rule: Rule = {
    urlpattern: ".*",
    target: target,
    scheme: "REGEX",
    active: true,
  };

  const request = {url: "https://facebook.com"};

  expect(getRuleObject(rule).getRuleOutput(request)).toMatchObject({
    redirectUrl: target
  });
});

test("Correct redirection with exact with unmatching url", () => {
  const target = "https://google.com";
  const rule: Rule = {
    urlpattern: "http://example.com",
    target: target,
    scheme: "EXACT",
    active: true,
  };

  const request = {url: "https://facebook.com"};

  expect(getRuleObject(rule).getRuleOutput(request)).toBeUndefined();
});

test("Correct redirection with exact", () => {
  const target = "https://google.com";
  const testurl = "http://example.com"
  const rule: Rule = {
    urlpattern: "http://example.com",
    target: target,
    scheme: "EXACT",
    active: true,
  };

  const request = {url: testurl};

  expect(getRuleObject(rule).getRuleOutput(request)).toMatchObject({
    redirectUrl: target
  });
});

test("Correct redirection with regex and positional params", () => {
  const target = "https://google.com";
  const testurl = "http://example.com?name=testname"
  const rule: Rule = {
    urlpattern: "http://example.com(.*)",
    target: target,
    scheme: "REGEX",
    active: true,
  };

  const request = {url: testurl};

  expect(getRuleObject(rule).getRuleOutput(request)).toMatchObject({
    redirectUrl: `${target}?name=testname`
  });
});

test("Blocked url", () => {
  const target = "BLOCK";
  const pattern = ".*";
  const rule: Rule = {
    urlpattern: pattern,
    target: target,
    scheme: "REGEX",
    active: true
  };

  expect(getRuleObject(rule).validateRule()).toMatchObject({
    valid: true,
    error: "",
  });

  const reqeust = {
    url: "https://google.com"
  };

  expect(getRuleObject(rule).getRuleOutput(reqeust)).toMatchObject({cancel: true});
})

test("GetRuleObject Returns correct object with backward compatibility", () => {
  const target = "https://google.com";
  const rule: Rule = {
    urlpattern: "http://example.com(.*)",
    target: target,
    scheme: "REGEX",
    active: true,
  };
  const ruleObject = getRuleObject(rule);
  expect(ruleObject.ruleType).toMatch("REDIRECT");
});

test("GetRuleObject Returns correct object for redirect rule", () => {
  const target = "https://google.com";
  const rule: Rule = {
    urlpattern: "http://example.com(.*)",
    target: target,
    scheme: "REGEX",
    active: true,
    ruleType: "REDIRECT"
  };
  const ruleObject = getRuleObject(rule);
  expect(ruleObject.ruleType).toMatch("REDIRECT");
});

test("GetRuleObject Returns correct object with backward compatibility", () => {
  const target = '[{"name":"x-ms-test","value":"sometest"}]';
  const rule: Rule = {
    urlpattern: "http://example.com(.*)",
    target: target,
    scheme: "REGEX",
    active: true,
    ruleType: "REQUEST_HEADER"
  };
  const ruleObject = getRuleObject(rule);
  expect(ruleObject.ruleType).toMatch("REQUEST_HEADER");
});

test("GetRuleOutput call on generic class throws error", () => {
  const rule : GenericRule = new GenericRule();

  rule.urlpattern = "http://example.com(.*)",
  rule.target = "https://example.com",
  rule.scheme = "REGEX",
  rule.active = true,

  expect(() => { rule.getRuleOutput({ url: 'https://google.com' }) }).toThrow("Invalid call for method getRuleOutput on GenericRule class. This method call should be on the concrete rule class.");
});