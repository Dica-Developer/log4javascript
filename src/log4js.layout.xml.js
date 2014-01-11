/**
 * XML Layout
 * @param combineMessages
 * @constructor
 * @mixes Layout
 */
function XmlLayout(combineMessages) {
  'use strict';

  this.combineMessages = extractBooleanFromParam(combineMessages, true);
  this.customFields = [];
}

/**
 *
 * @type {Layout}
 */
XmlLayout.prototype = new Layout();

/**
 *
 * @returns {Boolean}
 */
XmlLayout.prototype.isCombinedMessages = function () {
  'use strict';

  return this.combineMessages;
};

/**
 *
 * @returns {String}
 */
XmlLayout.prototype.getContentType = function () {
  'use strict';

  return 'text/xml';
};

/**
 *
 * @param {String} str
 * @returns {String}
 */
XmlLayout.prototype.escapeCdata = function (str) {
  'use strict';

  return str.replace(/\]\]>/, ']]>]]&gt;<![CDATA[');
};

/**
 *
 * @param loggingEvent
 * @returns {String}
 */
XmlLayout.prototype.format = function (loggingEvent) {
  'use strict';

  var layout = this;
  var i, len;

  function formatMessage(message) {
    message = (typeof message === 'string') ? message : toStr(message);
    return '<log4javascript:message><![CDATA[' +
      layout.escapeCdata(message) + ']]></log4javascript:message>';
  }

  var str = '<log4javascript:event logger="' + loggingEvent.logger.name +
    '" timestamp="' + this.getTimeStampValue(loggingEvent) + '"';
  if (!this.isTimeStampsInMilliseconds()) {
    str += ' milliseconds="' + loggingEvent.milliseconds + '"';
  }
  str += ' level="' + loggingEvent.level.name + '">' + newLine;
  if (this.combineMessages) {
    str += formatMessage(loggingEvent.getCombinedMessages());
  } else {
    str += '<log4javascript:messages>' + newLine;
    for (i = 0, len = loggingEvent.messages.length; i < len; i++) {
      str += formatMessage(loggingEvent.messages[i]) + newLine;
    }
    str += '</log4javascript:messages>' + newLine;
  }
  if (this.hasCustomFields()) {
    for (i = 0, len = this.customFields.length; i < len; i++) {
      str += '<log4javascript:customfield name="' +
        this.customFields[i].name + '"><![CDATA[' +
        this.customFields[i].value.toString() +
        ']]></log4javascript:customfield>' + newLine;
    }
  }
  if (loggingEvent.exception) {
    str += '<log4javascript:exception><![CDATA[' +
      getExceptionStringRep(loggingEvent.exception) +
      ']]></log4javascript:exception>' + newLine;
  }
  str += '</log4javascript:event>' + newLine + newLine;
  return str;
};

/**
 *
 * @returns {Boolean}
 */
XmlLayout.prototype.ignoresThrowable = function () {
  'use strict';

  return false;
};

/**
 *
 * @returns {String}
 */
XmlLayout.prototype.toString = function () {
  'use strict';

  return 'XmlLayout';
};

/**
 *
 * @type {XmlLayout}
 */
log4javascript.XmlLayout = XmlLayout;