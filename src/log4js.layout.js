/**
 * Layout
 * @constructor
 * @mixin
 */
function Layout() {}

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
 * @todo document
 */
Layout.prototype.format = function () {
  'use strict';

  handleError('Layout.format: layout supplied has no format() method');
};

/**
 * @todo document
 */
Layout.prototype.ignoresThrowable = function () {
  'use strict';

  handleError('Layout.ignoresThrowable = layout supplied has no ignoresThrowable() method');
};

/**
 *
 * @returns {String}
 */
Layout.prototype.getContentType = function () {
  'use strict';

  return 'text/plain';
};

/**
 *
 * @returns {Boolean}
 */
Layout.prototype.allowBatching = function () {
  'use strict';

  return true;
};

/**
 *
 * @param timeStampsInMilliseconds
 */
Layout.prototype.setTimeStampsInMilliseconds = function (timeStampsInMilliseconds) {
  'use strict';

  this.overrideTimeStampsSetting = true;
  this.useTimeStampsInMilliseconds = toBool(timeStampsInMilliseconds);
};

/**
 *
 * @returns {null|Layout.useTimeStampsInMilliseconds|*}
 */
Layout.prototype.isTimeStampsInMilliseconds = function () {
  'use strict';

  return this.overrideTimeStampsSetting ?
    this.useTimeStampsInMilliseconds : useTimeStampsInMilliseconds;
};

/**
 *
 * @param loggingEvent
 * @returns {Number|LoggingEvent.timeStampInMilliseconds|*}
 */
Layout.prototype.getTimeStampValue = function (loggingEvent) {
  'use strict';

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
  'use strict';

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
    dataValues.push([this.exceptionKey, getExceptionStringRep(loggingEvent.exception)]);
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
  'use strict';

  this.loggerKey = extractStringFromParam(loggerKey, this.defaults.loggerKey);
  this.timeStampKey = extractStringFromParam(timeStampKey, this.defaults.timeStampKey);
  this.levelKey = extractStringFromParam(levelKey, this.defaults.levelKey);
  this.messageKey = extractStringFromParam(messageKey, this.defaults.messageKey);
  this.exceptionKey = extractStringFromParam(exceptionKey, this.defaults.exceptionKey);
  this.urlKey = extractStringFromParam(urlKey, this.defaults.urlKey);
  this.millisecondsKey = extractStringFromParam(millisecondsKey, this.defaults.millisecondsKey);
};

/**
 *
 * @param name
 * @param value
 */
Layout.prototype.setCustomField = function (name, value) {
  'use strict';

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
};

/**
 *
 * @returns {Boolean}
 */
Layout.prototype.hasCustomFields = function () {
  'use strict';

  return (this.customFields.length > 0);
};

/**
 * @todo document
 */
Layout.prototype.toString = function () {
  'use strict';

  handleError('Layout.toString: all layouts must override this method');
};

if(typeof log4javascript !== 'undefined'){
  /**
   *
   * @type {Layout}
   */
  log4javascript.Layout = Layout;
}
