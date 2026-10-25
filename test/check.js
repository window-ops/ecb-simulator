/* A tiny test helper: check(condition, message) records a failure, and
   done() prints the result and sets the exit code. */
"use strict";
var fails = 0, count = 0;
exports.check = function (cond, msg) {
  count++;
  if (!cond) { fails++; console.log("  FAIL " + msg); }
};
exports.done = function (name) {
  console.log(name + ": " + (fails ? fails + " of " + count + " checks failed" : count + " checks passed"));
  process.exitCode = fails ? 1 : 0;
};
