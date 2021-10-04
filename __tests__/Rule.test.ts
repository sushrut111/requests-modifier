import { Rule, validateRule, getRedirectResponse } from "../src/Rule";

test("A valid rule", () => {
  const rule: Rule = {
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
  const rule: Rule = {
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
  const target = "https://google.com";
  const rule: Rule = {
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
  const target = "https://google.com";
  const rule: Rule = {
    urlpattern: "http://example.com",
    target: target,
    scheme: "EXACT",
    active: true,
  };

  expect(getRedirectResponse(rule, {url: "https://facebook.com"})).toBeUndefined();
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

  expect(getRedirectResponse(rule, {url: testurl})).toMatchObject({
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

  expect(getRedirectResponse(rule, {url: testurl})).toMatchObject({
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

  expect(validateRule(rule)).toMatchObject({
    valid: true,
    error: "",
  });

  expect(getRedirectResponse(rule, {
    url: "https://google.com"
  })).toMatchObject({cancel: true});
})