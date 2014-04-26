define(['log4js.helper', 'log4js.core', 'log4js.appender'], function (helper, log4js) {
  'use strict';

  /**
   * XML Layout
   * @param combineMessages
   * @constructor
   * @mixes Layout
   */
  function XmlLayout(combineMessages) {
    this.combineMessages = helper.extractBooleanFromParam(combineMessages, true);
    this.customFields = [];
  }

  /**
   *
   * @type {Layout}
   */
  XmlLayout.prototype = new log4js.Layout();

  /**
   *
   * @returns {Boolean}
   */
  XmlLayout.prototype.isCombinedMessages = function () {
    return this.combineMessages;
  };

  /**
   *
   * @returns {String}
   */
  XmlLayout.prototype.getContentType = function () {
    return 'text/xml';
  };

  /**
   *
   * @param {String} str
   * @returns {String}
   */
  XmlLayout.prototype.escapeCdata = function (str) {
    return str.replace(/\]\]>/, ']]>]]&gt;<![CDATA[');
  };

  /**
   *
   * @param loggingEvent
   * @returns {String}
   */
  XmlLayout.prototype.format = function (loggingEvent) {
    var layout = this;
    var i, len;

    function formatMessage(message) {
      message = (typeof message === 'string') ? message : helper.toString(message);
      return '<log4javascript:message><![CDATA[' +
        layout.escapeCdata(message) + ']]></log4javascript:message>';
    }

    var str = '<log4javascript:event logger="' + loggingEvent.logger.name +
      '" timestamp="' + this.getTimeStampValue(loggingEvent) + '"';
    if (!this.isTimeStampsInMilliseconds()) {
      str += ' milliseconds="' + loggingEvent.milliseconds + '"';
    }
    str += ' level="' + loggingEvent.level.name + '">' + helper.newLine;
    if (this.combineMessages) {
      str += formatMessage(loggingEvent.getCombinedMessages());
    } else {
      str += '<log4javascript:messages>' + helper.newLine;
      for (i = 0, len = loggingEvent.messages.length; i < len; i++) {
        str += formatMessage(loggingEvent.messages[i]) + helper.newLine;
      }
      str += '</log4javascript:messages>' + helper.newLine;
    }
    if (this.hasCustomFields()) {
      for (i = 0, len = this.customFields.length; i < len; i++) {
        str += '<log4javascript:customfield name="' +
          this.customFields[i].name + '"><![CDATA[' +
          this.customFields[i].value.toString() +
          ']]></log4javascript:customfield>' + helper.newLine;
      }
    }
    if (loggingEvent.exception) {
      str += '<log4javascript:exception><![CDATA[' +
        helper.getExceptionStringRep(loggingEvent.exception) +
        ']]></log4javascript:exception>' + helper.newLine;
    }
    str += '</log4javascript:event>' + helper.newLine;
    return str;
  };

  /**
   *
   * @returns {Boolean}
   */
  XmlLayout.prototype.ignoresThrowable = function () {
    return false;
  };

  /**
   *
   * @returns {String}
   */
  XmlLayout.prototype.toString = function () {
    return 'XmlLayout';
  };

  /**
   *
   * @type {XmlLayout}
   */
  log4js.XmlLayout = XmlLayout;
});