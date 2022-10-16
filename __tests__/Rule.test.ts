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

  let request = {url: "https://facebook.com"};

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

  let request = {url: "https://facebook.com"};

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

  let request = {url: testurl};

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

  let request = {url: testurl};

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

  let reqeust = {
    url: "https://google.com"
  };

  expect(getRuleObject(rule).getRuleOutput(reqeust)).toMatchObject({cancel: true});
})