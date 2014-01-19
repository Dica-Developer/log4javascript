// formatObjectExpansion

/**
 *
 * @param {Object} obj
 * @param {Number} depth
 * @param {Number} indentation
 * @returns {*}
 */
function formatObjectExpansion(obj, depth, indentation) {
  'use strict';

  var objectsExpanded = [];

  function doFormat(obj, depth, indentation) {
    var i, len, childDepth, childIndentation, childLines, expansion,
      childExpansion;

    if (!indentation) {
      indentation = '';
    }

    function formatString(text) {
      var lines = splitIntoLines(text);
      for (var j = 1, jLen = lines.length; j < jLen; j++) {
        lines[j] = indentation + lines[j];
      }
      return lines.join(newLine);
    }

    if (obj === null) {
      return 'null';
    } else if (typeof obj === 'undefined') {
      return 'undefined';
    } else if (typeof obj === 'string') {
      return formatString(obj);
    } else if (typeof obj === 'object' && arrayContains(objectsExpanded, obj)) {
      try {
        expansion = toStr(obj);
      } catch (ex) {
        expansion = 'Error formatting property. Details: ' + getExceptionStringRep(ex);
      }
      return expansion + ' [already expanded]';
    } else if ((obj instanceof Array) && depth > 0) {
      objectsExpanded.push(obj);
      expansion = '[' + newLine;
      childDepth = depth - 1;
      childIndentation = indentation + '  ';
      childLines = [];
      for (i = 0, len = obj.length; i < len; i++) {
        try {
          childExpansion = doFormat(obj[i], childDepth, childIndentation);
          childLines.push(childIndentation + childExpansion);
        } catch (ex) {
          childLines.push(childIndentation + 'Error formatting array member. Details: ' +
            getExceptionStringRep(ex) + '');
        }
      }
      expansion += childLines.join(',' + newLine) + newLine + indentation + ']';
      return expansion;
    } else if (Object.prototype.toString.call(obj) === '[object Date]') {
      return obj.toString();
    } else if (typeof obj === 'object' && depth > 0) {
      objectsExpanded.push(obj);
      expansion = '{' + newLine;
      childDepth = depth - 1;
      childIndentation = indentation + '  ';
      childLines = [];
      for (i in obj) {
        try {
          childExpansion = doFormat(obj[i], childDepth, childIndentation);
          childLines.push(childIndentation + i + ': ' + childExpansion);
        } catch (ex) {
          childLines.push(childIndentation + i + ': Error formatting property. Details: ' +
            getExceptionStringRep(ex));
        }
      }
      expansion += childLines.join(',' + newLine) + newLine + indentation + '}';
      return expansion;
    } else {
      return formatString(toStr(obj));
    }
  }

  return doFormat(obj, depth, indentation);
}

/**
 * PatternLayout
 * @param pattern
 * @constructor
 * @mixes Layout
 */
function PatternLayout(pattern) {
  'use strict';

  if (pattern) {
    this.pattern = pattern;
  } else {
    this.pattern = PatternLayout.DEFAULT_CONVERSION_PATTERN;
  }
  this.customFields = [];
}

/**
 *
 * @type {String}
 */
PatternLayout.TTCC_CONVERSION_PATTERN = '%r %p %c - %m%n';

/**
 *
 * @type {String}
 */
PatternLayout.DEFAULT_CONVERSION_PATTERN = '%m%n';

/**
 *
 * @type {String}
 */
PatternLayout.ISO8601_DATEFORMAT = 'yyyy-MM-dd HH:mm:ss,SSS';

/**
 *
 * @type {String}
 */
PatternLayout.DATETIME_DATEFORMAT = 'dd MMM yyyy HH:mm:ss,SSS';

/**
 *
 * @type {String}
 */
PatternLayout.ABSOLUTETIME_DATEFORMAT = 'HH:mm:ss,SSS';

/**
 *
 * @type {Layout}
 */
PatternLayout.prototype = new Layout();

/**
 *
 * @param loggingEvent
 * @returns {String}
 */
PatternLayout.prototype.format = function (loggingEvent) {
  'use strict';

  var regex = /%(-?[0-9]+)?(\.?[0-9]+)?([acdflmMnpr%])(\{([^\}]+)\})?|([^%]+)/;
  var formattedString = '';
  var result;
  var searchString = this.pattern;

  // Cannot use regex global flag since it doesn't work with exec in IE5
  while ((result = regex.exec(searchString))) {
    var matchedString = result[0];
    var padding = result[1];
    var truncation = result[2];
    var conversionCharacter = result[3];
    var specifier = result[5];
    var text = result[6];

    // Check if the pattern matched was just normal text
    if (text) {
      formattedString += '' + text;
    } else {
      // Create a raw replacement string based on the conversion
      // character and specifier
      var replacement = '';
      switch (conversionCharacter) {
      case 'l': //Location
        var error = new Error();
        if (error.stack) {
          var column, line, resource, funcBegin, resourceBegin;
          var stack = error.stack;
          var lineAccessingLogger = stack.split('\n')[8];

          if (lineAccessingLogger === '') {
            var lastIndexOfAt = stack.lastIndexOf('@');
            lineAccessingLogger = stack.substr(lastIndexOfAt);
            funcBegin = 0;
            resourceBegin = lineAccessingLogger.indexOf('@') + 1;
          } else {
            funcBegin = lineAccessingLogger.indexOf('at ') + 3;
            resourceBegin = lineAccessingLogger.indexOf(' (') + 2;
          }


          var functionName = funcBegin < resourceBegin ? lineAccessingLogger.substring(funcBegin, resourceBegin - 2) : null;

          var resourceLoc;
          if (functionName) {
            resourceLoc = lineAccessingLogger.substring(resourceBegin, lineAccessingLogger.length - 1);
          } else {
            functionName = '(anonymous)';
            resourceLoc = lineAccessingLogger.substring(funcBegin);
          }

          var resourceLocSplit = resourceLoc.split(':');
          column = resourceLocSplit.pop();
          line = resourceLocSplit.pop();
          if (isNaN(line)) {
            resourceLocSplit.push(line);
            resource = resourceLocSplit.join(':');
            if (resource.indexOf('@') === 0) {
              resource = resource.substr(1);
            }
            line = column;
            column = NaN;
          } else {
            resource = resourceLocSplit.join(':');
          }
          var lastSegmentIdx = resource.lastIndexOf('/');
          var lastSegment = resource.substring(lastSegmentIdx + 1);

          /*
           var resultObject = {
           r : resource,
           l : line,
           c : column,
           f : functionName,
           s : lastSegment
           };
           */

          var spec = 's:l';
          if (specifier){
            spec = specifier;
          }

          var specresult = [];
          var priorNum = '';
          var int;
          for (int = 0; int < spec.length; int++) {
            var l = spec[int];
            var num = parseInt(l, 10);
            if (num > -1) {
              priorNum += l;
            } else {
              if (priorNum.length > 0) {
                specresult.push(parseInt(priorNum, 10));
                priorNum = '';
              }
              specresult.push(l);
            }
          }
          if (priorNum.length > 0){
            specresult.push(parseInt(priorNum, 10));
          }
          spec = specresult;
          for (int = 0; int < spec.length; int++) {
            var optNum = spec[int + 1], string = '';
            switch (spec[int]) {
            case 's':
              replacement += lastSegment;
              break;
            case 'r':
              string = resource;
              if (typeof optNum === 'number') {
                string = string.substring(string.length - optNum);
                spec.splice(int + 1, 1);
              }
              replacement += string;
              break;
            case 'l':
              replacement += line;
              break;
            case 'c':
              if(!isNaN(column)){
                replacement += column;
              }else{
                replacement = replacement.substring(0, replacement.lastIndexOf(spec[int - 1]));
              }
              break;
            case 'f':
              string = functionName;
              if (typeof optNum === 'number') {
                string = string.substring(string.length - optNum);
                spec.splice(int + 1, 1);
              }
              replacement += string;
              break;
            default:
              replacement += spec[int];
            }
          }
        } else {
          handleError('Could not apply "l" pattern because no stack is available');
        }
        break;
      case 'a': // Array of messages
      case 'm': // Message
        var depth = 0;
        if (specifier) {
          depth = parseInt(specifier, 10);
          if (isNaN(depth)) {
            handleError('PatternLayout.format: invalid specifier "' +
              specifier + '" for conversion character "' + conversionCharacter +
              '" - should be a number');
            depth = 0;
          }
        }
        var messages = (conversionCharacter === 'a') ? loggingEvent.messages[0] : loggingEvent.messages;
        for (var i = 0, len = messages.length; i < len; i++) {
          if (i > 0 && (replacement.charAt(replacement.length - 1) !== ' ')) {
            replacement += ' ';
          }
          if (depth === 0) {
            replacement += messages[i];
          } else {
            replacement += formatObjectExpansion(messages[i], depth);
          }
        }
        break;
      case 'c': // Logger name
        var loggerName = loggingEvent.logger.name;
        if (specifier) {
          var precision = parseInt(specifier, 10);
          var loggerNameBits = loggingEvent.logger.name.split('.');
          if (precision >= loggerNameBits.length) {
            replacement = loggerName;
          } else {
            replacement = loggerNameBits.slice(loggerNameBits.length - precision).join('.');
          }
        } else {
          replacement = loggerName;
        }
        break;
      case 'd': // Date
        var dateFormat = PatternLayout.ISO8601_DATEFORMAT;
        if (specifier) {
          dateFormat = specifier;
          // Pick up special cases
          if (dateFormat === 'ISO8601') {
            dateFormat = PatternLayout.ISO8601_DATEFORMAT;
          } else if (dateFormat === 'ABSOLUTE') {
            dateFormat = PatternLayout.ABSOLUTETIME_DATEFORMAT;
          } else if (dateFormat === 'DATE') {
            dateFormat = PatternLayout.DATETIME_DATEFORMAT;
          }
        }
        // Format the date
        replacement = (new SimpleDateFormat(dateFormat)).format(loggingEvent.timeStamp);
        break;
      case 'f': // Custom field
        if (this.hasCustomFields()) {
          var fieldIndex = 0;
          if (specifier) {
            fieldIndex = parseInt(specifier, 10);
            if (isNaN(fieldIndex)) {
              handleError('PatternLayout.format: invalid specifier "' +
                specifier + '" for conversion character "f" - should be a number');
            } else if (fieldIndex === 0) {
              handleError('PatternLayout.format: invalid specifier "' +
                specifier + '" for conversion character "f" - must be greater than zero');
            } else if (fieldIndex > this.customFields.length) {
              handleError('PatternLayout.format: invalid specifier "' +
                specifier + '" for conversion character "f" - there aren\'t that many custom fields');
            } else {
              fieldIndex = fieldIndex - 1;
            }
          }
          var val = this.customFields[fieldIndex].value;
          if (typeof val === 'function') {
            val = val(this, loggingEvent);
          }
          replacement = val;
        }
        break;
      case 'n': // New line
        replacement = newLine;
        break;
      case 'p': // Level
        replacement = loggingEvent.level.name;
        break;
      case 'r': // Milliseconds since log4javascript startup
        replacement = '' + loggingEvent.timeStamp.getDifference(applicationStartDate);
        break;
      case '%': // Literal % sign
        replacement = '%';
        break;
      default:
        replacement = matchedString;
        break;
      }
      // Format the replacement according to any padding or
      // truncation specified
      var length;

      // First, truncation
      if (truncation) {
        length = parseInt(truncation.substr(1), 10);
        var strLen = replacement.length;
        if (length < strLen) {
          replacement = replacement.substring(strLen - length, strLen);
        }
      }
      // Next, padding
      if (padding) {
        if (padding.charAt(0) === '-') {
          length = parseInt(padding.substr(1), 10);
          // Right pad with spaces
          while (replacement.length < length) {
            replacement += ' ';
          }
        } else {
          length = parseInt(padding, 10);
          // Left pad with spaces
          while (replacement.length < length) {
            replacement = ' ' + replacement;
          }
        }
      }
      formattedString += replacement;
    }
    searchString = searchString.substr(result.index + result[0].length);
  }
  return formattedString;
};

/**
 *
 * @returns {Boolean}
 */
PatternLayout.prototype.ignoresThrowable = function () {
  'use strict';

  return true;
};

/**
 *
 * @returns {String}
 */
PatternLayout.prototype.toString = function () {
  'use strict';

  return 'PatternLayout';
};

if(typeof log4javascript !== 'undefined'){
  /**
   *
   * @type {PatternLayout}
   */
  log4javascript.PatternLayout = PatternLayout;
}
