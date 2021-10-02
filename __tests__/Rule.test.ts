import { Rule, validateRule, getRedirectResponse } from "../src/Rule";

test("A valid rule", () => {
  let rule: Rule = {
    urlpattern: "https://example.com",
    target: "https://google.com",
    scheme: "EXACT",
    active: true,
  };

  expect(validateRule(rule)).toMatchObject({
    valid: true,
    error: "",
  });
});

test("An invalid rule with invalid regex", () => {
  let rule: Rule = {
    urlpattern: "*",
    target: "https://google.com",
    scheme: "REGEX",
    active: true,
  };

  expect(validateRule(rule)).toMatchObject({
    valid: false,
    error: "* is not valid regex: SyntaxError: Invalid regular expression: /*/: Nothing to repeat",
  });
});


test("Correct redirection with regex", () => {
  let target = "https://google.com";
  let rule: Rule = {
    urlpattern: ".*",
    target: target,
    scheme: "REGEX",
    active: true,
  };

  expect(getRedirectResponse(rule, {url: "https://facebook.com"})).toMatchObject({
    redirectUrl: target
  });
});

test("Correct redirection with exact with unmatching url", () => {
  let target = "https://google.com";
  let rule: Rule = {
    urlpattern: "http://example.com",
    target: target,
    scheme: "EXACT",
    active: true,
  };

  expect(getRedirectResponse(rule, {url: "https://facebook.com"})).toBeUndefined();
});

test("Correct redirection with exact", () => {
  let target = "https://google.com";
  let testurl = "http://example.com"
  let rule: Rule = {
    urlpattern: "http://example.com",
    target: target,
    scheme: "EXACT",
    active: true,
  };

  expect(getRedirectResponse(rule, {url: testurl})).toMatchObject({
    redirectUrl: target
  });
});

test("Correct redirection with regex and positional params", () => {
  let target = "https://google.com";
  let testurl = "http://example.com?name=testname"
  let rule: Rule = {
    urlpattern: "http://example.com(.*)",
    target: target,
    scheme: "REGEX",
    active: true,
  };

  expect(getRedirectResponse(rule, {url: testurl})).toMatchObject({
    redirectUrl: `${target}?name=testname`
  });
});
