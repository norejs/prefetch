/**
 * Reporters module - exports all reporter classes
 */

const ConsoleReporter = require('./console-reporter');
const TestReporter = require('./test-reporter');
const JSONReporter = require('./json-reporter');

module.exports = {
  ConsoleReporter,
  TestReporter,
  JSONReporter
};
