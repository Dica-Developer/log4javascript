define(['log4js.helper', 'log4js.core', 'log4js.layout'], function (helper, log4js) {
  'use strict';

  /**
   *
   * @param {String} str
   * @returns {*|XML|string|Node|void}
   */
  function escapeNewLines(str) {
    return str.replace(/\r\n|\r|\n/g, '\\r\\n');
  }

  /**
   * JsonLayout
   * @param readable
   * @param combineMessages
   * @constructor
   * @property {Boolean} readable
   * @property {Boolean} combineMessages
   * @property {undefined | String} batchHeader
   * @property {undefined | String} batchFooter
   * @property {undefined | String} batchSeparator
   * @property {String} colon
   * @property {String} tab
   * @property {String} newLine
   * @property {Array} customFields
   * @mixes Layout
   */
  function JsonLayout(readable, combineMessages) {
    this.readable = helper.extractBooleanFromParam(readable, false);
    this.combineMessages = helper.extractBooleanFromParam(combineMessages, true);
    this.batchHeader = this.readable ? '[' + helper.newLine : '[';
    this.batchFooter = this.readable ? ']' + helper.newLine : ']';
    this.batchSeparator = this.readable ? ',' + helper.newLine : ',';
    this.setKeys();
    this.colon = this.readable ? ': ' : ':';
    this.tab = this.readable ? '\t' : '';
    this.lineBreak = this.readable ? helper.newLine : '';
    this.customFields = [];
  }

  /**
   *
   * @type {Layout}
   */
  JsonLayout.prototype = new log4js.Layout();

  /**
   *
   * @returns {Boolean}
   */
  JsonLayout.prototype.isReadable = function () {
    return this.readable;
  };

  /**
   *
   * @returns {Boolean}
   */
  JsonLayout.prototype.isCombinedMessages = function () {
    return this.combineMessages;
  };

  /**
   *
   * @param loggingEvent
   * @returns {String}
   */
  JsonLayout.prototype.format = function (loggingEvent) {
    var layout = this;
    var dataValues = this.getDataValues(loggingEvent, this.combineMessages);
    var str = '{' + this.lineBreak;
    var i, len;

    function formatValue(val, prefix, expand) {
      // Check the type of the data value to decide whether quotation marks
      // or expansion are required
      var formattedValue;
      var valType = typeof val;
      if (val instanceof Date) {
        formattedValue = String(val.getTime());
      } else if (expand && (val instanceof Array)) {
        formattedValue = '[' + layout.lineBreak;
        for (var i = 0, len = val.length; i < len; i++) {
          var childPrefix = prefix + layout.tab;
          formattedValue += childPrefix + formatValue(val[i], childPrefix, false);
          if (i < val.length - 1) {
            formattedValue += ',';
          }
          formattedValue += layout.lineBreak;
        }
        formattedValue += prefix + ']';
      } else if (valType !== 'number' && valType !== 'boolean') {
        formattedValue = '"' + escapeNewLines(helper.toString(val).replace(/\'/g, '\\\"')) + '"';
      } else {
        formattedValue = val;
      }
      return formattedValue;
    }

    for (i = 0, len = dataValues.length - 1; i <= len; i++) {
      str += this.tab + '"' + dataValues[i][0] + '"' + this.colon + formatValue(dataValues[i][1], this.tab, true);
      if (i < len) {
        str += ',';
      }
      str += this.lineBreak;
    }

    str += '}' + this.lineBreak;
    return str;
  };

  /**
   *
   * @returns {Boolean}
   */
  JsonLayout.prototype.ignoresThrowable = function () {
    return false;
  };

  /**
   *
   * @returns {String}
   */
  JsonLayout.prototype.toString = function () {
    return 'JsonLayout';
  };

  /**
   *
   * @returns {String}
   */
  JsonLayout.prototype.getContentType = function () {
    return 'application/json';
  };

  log4js.JsonLayout = JsonLayout;
});
