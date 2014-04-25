/*global window*/
define(function () {
  'use strict';

  /**
   *
   * @constructor
   */
  var Helper = function () {
  };

  Helper.prototype = {
    isUndefined: function isUndefined(obj) {
      return obj === void 0;
    },
    isNotUndefined: function isNotUndefined(obj) {
      return !this.isUndefined(obj);
    },
    isFunction: function isFunction(fn) {
      return typeof fn === 'function';
    },
    isBoolean: function isBoolean(bool){
      return typeof bool === 'boolean';
    },
    toBoolean: function isBoolean(bool){
      return Boolean(bool);
    },
    isString: function isString(str) {
      return typeof str === 'string';
    },
    toString: function toString(obj) {
      return (obj && obj.toString) ? obj.toString() : String(obj);
    },
    isArray: function isArray(array) {
      return array instanceof Array;
    },
    arrayContains: function arrayContains(arr, val) {
      var found = false;
      for (var i = 0, len = arr.length; i < len; i++) {
        if (arr[i] === val) {
          found = true;
          break;
        }
      }
      return found;
    },
    arrayRemove: function arrayRemove(arr, val) {
      var removed = false;
      for (var i = 0, len = arr.length; i < len; i++) {
        if (arr[i] === val) {
          arr.splice(i, 1);
          removed = true;
          break;

        }
      }
      return removed;
    },
    trim: function trim(str) {
      return str.replace(/^\s+/, '').replace(/\s+$/, '');
    },
    splitIntoLines: function splitIntoLines(text) {
      // Ensure all line breaks are \n only
      var text2 = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      return text2.split('\n');
    },
    getExceptionMessage: function getExceptionMessage(ex) {
      var message = '';
      if (ex.message) {
        message = ex.message;
      } else if (ex.description) {
        message = ex.description;
      } else {
        message = this.toString(ex);
      }
      return message;
    },
    getUrlFileName: function getUrlFileName(url) {
      var lastSlashIndex = Math.max(url.lastIndexOf('/'), url.lastIndexOf('\\'));
      return url.substr(lastSlashIndex + 1);
    },
    handleError: function handleError(message){
      window.alert(message);
    },
    extractStringFromParam: function(param, defaultValue){
      return this.isUndefined(param) ? defaultValue : String(param);
    },
    extractBooleanFromParam: function extractBooleanFromParam(param, defaultValue) {
      return this.isUndefined(param) ? defaultValue : this.toBoolean(param);
    },
    getExceptionStringRep: function(ex){
      if (ex) {
        var exStr = 'Exception: ' + this.getExceptionMessage(ex);
        try {
          if (ex.lineNumber) {
            exStr += ' on line number ' + ex.lineNumber;
          }
          if (ex.fileName) {
            exStr += ' in file ' + this.getUrlFileName(ex.fileName);
          }
        } catch (localEx) {
          this.handleError('Unable to obtain file and line information for error');
        }
//        if (showStackTraces && ex.stack) {
//          exStr += this.newLine + 'Stack trace:' + this.newLine + ex.stack;
//        }
        return exStr;
      }
      return null;
    },
    anonymousLoggerName: '[anonymous]',
    defaultLoggerName: '[default]',
    nullLoggerName: '[null]',
    rootLoggerName: 'root',
    newLine: '\r\n'
  };
  return new Helper();
});