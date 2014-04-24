/*global window*/
define(['log4js.helper', 'log4js.core'], function (helper, log4js) {
  'use strict';

  /**
   * Layout
   * @constructor
   * @mixin
   */
  function Layout() {
  }

  /**
   *
   * @type {{loggerKey: string, timeStampKey: string, millisecondsKey: string, levelKey: string, messageKey: string, exceptionKey: string, urlKey: string}}
   */
  Layout.prototype.defaults = {
    loggerKey: 'logger',
    timeStampKey: 'timestamp',
    millisecondsKey: 'milliseconds',
    levelKey: 'level',
    messageKey: 'message',
    exceptionKey: 'exception',
    urlKey: 'url'
  };

  /**
   *
   * @type {string}
   */
  Layout.prototype.loggerKey = 'logger';

  /**
   *
   * @type {string}
   */
  Layout.prototype.timeStampKey = 'timestamp';

  /**
   *
   * @type {string}
   */
  Layout.prototype.millisecondsKey = 'milliseconds';

  /**
   *
   * @type {string}
   */
  Layout.prototype.levelKey = 'level';

  /**
   *
   * @type {string}
   */
  Layout.prototype.messageKey = 'message';

  /**
   *
   * @type {string}
   */
  Layout.prototype.exceptionKey = 'exception';

  /**
   *
   * @type {string}
   */
  Layout.prototype.urlKey = 'url';

  /**
   *
   * @type {string}
   */
  Layout.prototype.batchHeader = '';

  /**
   *
   * @type {string}
   */
  Layout.prototype.batchFooter = '';

  /**
   *
   * @type {string}
   */
  Layout.prototype.batchSeparator = '';

  /**
   *
   * @type {boolean}
   */
  Layout.prototype.returnsPostData = false;

  /**
   *
   * @type {boolean}
   */
  Layout.prototype.overrideTimeStampsSetting = false;

  /**
   *
   * @type {null}
   */
  Layout.prototype.useTimeStampsInMilliseconds = null;

  /**
   *
   * @type {Array}
   */
  Layout.prototype.customFields = [];

  /**
   * @todo document
   */
  Layout.prototype.format = function () {
    helper.handleError('Layout.format: layout supplied has no format() method');
  };

  /**
   * @todo document
   */
  Layout.prototype.ignoresThrowable = function () {
    helper.handleError('Layout.ignoresThrowable = layout supplied has no ignoresThrowable() method');
  };

  /**
   *
   * @returns {String}
   */
  Layout.prototype.getContentType = function () {
    return 'text/plain';
  };

  /**
   *
   * @returns {Boolean}
   */
  Layout.prototype.allowBatching = function () {
    return true;
  };

  /**
   *
   * @param {Boolean} timeStampsInMilliseconds
   */
  Layout.prototype.setTimeStampsInMilliseconds = function (timeStampsInMilliseconds) {
    this.overrideTimeStampsSetting = true;
    this.useTimeStampsInMilliseconds = timeStampsInMilliseconds;
  };

  /**
   *
   * @returns {null|Layout.useTimeStampsInMilliseconds|*}
   */
  Layout.prototype.isTimeStampsInMilliseconds = function () {
    return this.overrideTimeStampsSetting ?
      this.useTimeStampsInMilliseconds : this.useTimeStampsInMilliseconds;
  };

  /**
   *
   * @param loggingEvent
   * @returns {Number|LoggingEvent.timeStampInMilliseconds|*}
   */
  Layout.prototype.getTimeStampValue = function (loggingEvent) {
    return this.isTimeStampsInMilliseconds() ?
      loggingEvent.timeStampInMilliseconds : loggingEvent.timeStampInSeconds;
  };

  /**
   *
   * @param loggingEvent
   * @param combineMessages
   * @returns {*}
   */
  Layout.prototype.getDataValues = function (loggingEvent, combineMessages) {
    var dataValues = [
      [this.loggerKey, loggingEvent.logger.name],
      [this.timeStampKey, this.getTimeStampValue(loggingEvent)],
      [this.levelKey, loggingEvent.level.name],
      [this.urlKey, window.location.href],
      [this.messageKey, combineMessages ? loggingEvent.getCombinedMessages() : loggingEvent.messages]
    ];
    if (!this.isTimeStampsInMilliseconds()) {
      dataValues.push([this.millisecondsKey, loggingEvent.milliseconds]);
    }
    if (loggingEvent.exception) {
      dataValues.push([this.exceptionKey, helper.getExceptionStringRep(loggingEvent.exception)]);
    }
    if (this.hasCustomFields()) {
      for (var i = 0, len = this.customFields.length; i < len; i++) {
        var val = this.customFields[i].value;

        // Check if the value is a function. If so, execute it, passing it the
        // current layout and the logging event
        if (typeof val === 'function') {
          val = val(this, loggingEvent);
        }
        dataValues.push([this.customFields[i].name, val]);
      }
    }
    return dataValues;
  };

  /**
   *
   * @param loggerKey
   * @param timeStampKey
   * @param levelKey
   * @param messageKey
   * @param exceptionKey
   * @param urlKey
   * @param millisecondsKey
   */
  Layout.prototype.setKeys = function (loggerKey, timeStampKey, levelKey, messageKey, exceptionKey, urlKey, millisecondsKey) {
    this.loggerKey = helper.extractStringFromParam(loggerKey, this.defaults.loggerKey);
    this.timeStampKey = helper.extractStringFromParam(timeStampKey, this.defaults.timeStampKey);
    this.levelKey = helper.extractStringFromParam(levelKey, this.defaults.levelKey);
    this.messageKey = helper.extractStringFromParam(messageKey, this.defaults.messageKey);
    this.exceptionKey = helper.extractStringFromParam(exceptionKey, this.defaults.exceptionKey);
    this.urlKey = helper.extractStringFromParam(urlKey, this.defaults.urlKey);
    this.millisecondsKey = helper.extractStringFromParam(millisecondsKey, this.defaults.millisecondsKey);
  };

  /**
   *
   * @param name
   * @param value
   */
  Layout.prototype.setCustomField = function (name, value) {
    if (helper.isUndefined(name) || helper.isUndefined(value)) {
      helper.handleError('layout.setCustomFields: name and value must be defined');
    } else if (!helper.isString(name)) {
      helper.handleError('layout.setCustomFields: name must be "String"');
    } else {
      var fieldUpdated = false;
      for (var i = 0, len = this.customFields.length; i < len; i++) {
        if (this.customFields[i].name === name) {
          this.customFields[i].value = value;
          fieldUpdated = true;
        }
      }
      if (!fieldUpdated) {
        this.customFields.push({'name': name, 'value': value});
      }
    }
  };

  /**
   *
   * @returns {Boolean}
   */
  Layout.prototype.hasCustomFields = function () {
    return (this.customFields.length > 0);
  };

  /**
   * @todo document
   */
  Layout.prototype.toString = function () {
    helper.handleError('Layout.toString: all layouts must override this method');
  };

  log4js.Layout = Layout;
});
