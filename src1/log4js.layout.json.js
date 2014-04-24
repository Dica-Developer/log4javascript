/**
 *
 * @param {String} str
 * @returns {*|XML|string|Node|void}
 */
function escapeNewLines(str) {
  'use strict';

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
  'use strict';

  this.readable = extractBooleanFromParam(readable, false);
  this.combineMessages = extractBooleanFromParam(combineMessages, true);
  this.batchHeader = this.readable ? '[' + newLine : '[';
  this.batchFooter = this.readable ? ']' + newLine : ']';
  this.batchSeparator = this.readable ? ',' + newLine : ',';
  this.setKeys();
  this.colon = this.readable ? ': ' : ':';
  this.tab = this.readable ? '\t' : '';
  this.lineBreak = this.readable ? newLine : '';
  this.customFields = [];
}

/**
 *
 * @type {Layout}
 */
JsonLayout.prototype = new Layout();

/**
 *
 * @returns {Boolean}
 */
JsonLayout.prototype.isReadable = function () {
  'use strict';

  return this.readable;
};

/**
 *
 * @returns {Boolean}
 */
JsonLayout.prototype.isCombinedMessages = function () {
  'use strict';

  return this.combineMessages;
};

/**
 *
 * @param loggingEvent
 * @returns {String}
 */
JsonLayout.prototype.format = function (loggingEvent) {
  'use strict';

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
      formattedValue = '"' + escapeNewLines(toStr(val).replace(/\'/g, '\\\"')) + '"';
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
  'use strict';

  return false;
};

/**
 *
 * @returns {String}
 */
JsonLayout.prototype.toString = function () {
  'use strict';

  return 'JsonLayout';
};

/**
 *
 * @returns {String}
 */
JsonLayout.prototype.getContentType = function () {
  'use strict';

  return 'application/json';
};

if(typeof log4javascript !== 'undefined'){
  /**
   *
   * @type {JsonLayout}
   */
  log4javascript.JsonLayout = JsonLayout;
}
