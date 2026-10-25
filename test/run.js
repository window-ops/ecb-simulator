/* Runs every test in this folder, one after another, and fails if any
   fails.

     node test/run.js */
"use strict";
var cp = require("child_process"), path = require("path");
var tests = ["data.test.js", "model.test.js", "ui.test.js", "stress.test.js"], failed = 0;
tests.forEach(function (t) {
  /* The folder and years given to run.js are for the UI test */
  var args = t === "ui.test.js" ? process.argv.slice(2) : [];
  var r = cp.spawnSync(process.execPath, [path.join(__dirname, t)].concat(args), { stdio: "inherit" });
  if (r.status !== 0) { failed++; }
});
console.log(failed ? failed + " of " + tests.length + " test files failed" : "all " + tests.length + " test files passed");
process.exitCode = failed ? 1 : 0;
