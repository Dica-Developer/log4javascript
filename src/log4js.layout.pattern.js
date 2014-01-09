/* ---------------------------------------------------------------------- */
// formatObjectExpansion

function formatObjectExpansion(obj, depth, indentation) {
  var objectsExpanded = [];

  function doFormat(obj, depth, indentation) {
    var i, j, len, childDepth, childIndentation, childLines, expansion,
      childExpansion;

    if (!indentation) {
      indentation = "";
    }

    function formatString(text) {
      var lines = splitIntoLines(text);
      for (var j = 1, jLen = lines.length; j < jLen; j++) {
        lines[j] = indentation + lines[j];
      }
      return lines.join(newLine);
    }

    if (obj === null) {
      return "null";
    } else if (typeof obj == "undefined") {
      return "undefined";
    } else if (typeof obj == "string") {
      return formatString(obj);
    } else if (typeof obj == "object" && array_contains(objectsExpanded, obj)) {
      try {
        expansion = toStr(obj);
      } catch (ex) {
        expansion = "Error formatting property. Details: " + getExceptionStringRep(ex);
      }
      return expansion + " [already expanded]";
    } else if ((obj instanceof Array) && depth > 0) {
      objectsExpanded.push(obj);
      expansion = "[" + newLine;
      childDepth = depth - 1;
      childIndentation = indentation + "  ";
      childLines = [];
      for (i = 0, len = obj.length; i < len; i++) {
        try {
          childExpansion = doFormat(obj[i], childDepth, childIndentation);
          childLines.push(childIndentation + childExpansion);
        } catch (ex) {
          childLines.push(childIndentation + "Error formatting array member. Details: " +
            getExceptionStringRep(ex) + "");
        }
      }
      expansion += childLines.join("," + newLine) + newLine + indentation + "]";
      return expansion;
    } else if (Object.prototype.toString.call(obj) == "[object Date]") {
      return obj.toString();
    } else if (typeof obj == "object" && depth > 0) {
      objectsExpanded.push(obj);
      expansion = "{" + newLine;
      childDepth = depth - 1;
      childIndentation = indentation + "  ";
      childLines = [];
      for (i in obj) {
        try {
          childExpansion = doFormat(obj[i], childDepth, childIndentation);
          childLines.push(childIndentation + i + ": " + childExpansion);
        } catch (ex) {
          childLines.push(childIndentation + i + ": Error formatting property. Details: " +
            getExceptionStringRep(ex));
        }
      }
      expansion += childLines.join("," + newLine) + newLine + indentation + "}";
      return expansion;
    } else {
      return formatString(toStr(obj));
    }
  }

  return doFormat(obj, depth, indentation);
}
/* ---------------------------------------------------------------------- */
// Date-related stuff

var SimpleDateFormat;

(function () {
  var regex = /('[^']*')|(G+|y+|M+|w+|W+|D+|d+|F+|E+|a+|H+|k+|K+|h+|m+|s+|S+|Z+)|([a-zA-Z]+)|([^a-zA-Z']+)/;
  var monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var TEXT2 = 0, TEXT3 = 1, NUMBER = 2, YEAR = 3, MONTH = 4, TIMEZONE = 5;
  var types = {
    G: TEXT2,
    y: YEAR,
    M: MONTH,
    w: NUMBER,
    W: NUMBER,
    D: NUMBER,
    d: NUMBER,
    F: NUMBER,
    E: TEXT3,
    a: TEXT2,
    H: NUMBER,
    k: NUMBER,
    K: NUMBER,
    h: NUMBER,
    m: NUMBER,
    s: NUMBER,
    S: NUMBER,
    Z: TIMEZONE
  };
  var ONE_DAY = 24 * 60 * 60 * 1000;
  var ONE_WEEK = 7 * ONE_DAY;
  var DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK = 1;

  var newDateAtMidnight = function (year, month, day) {
    var d = new Date(year, month, day, 0, 0, 0);
    d.setMilliseconds(0);
    return d;
  };

  Date.prototype.getDifference = function (date) {
    return this.getTime() - date.getTime();
  };

  Date.prototype.isBefore = function (d) {
    return this.getTime() < d.getTime();
  };

  Date.prototype.getUTCTime = function () {
    return Date.UTC(this.getFullYear(), this.getMonth(), this.getDate(), this.getHours(), this.getMinutes(),
      this.getSeconds(), this.getMilliseconds());
  };

  Date.prototype.getTimeSince = function (d) {
    return this.getUTCTime() - d.getUTCTime();
  };

  Date.prototype.getPreviousSunday = function () {
    // Using midday avoids any possibility of DST messing things up
    var midday = new Date(this.getFullYear(), this.getMonth(), this.getDate(), 12, 0, 0);
    var previousSunday = new Date(midday.getTime() - this.getDay() * ONE_DAY);
    return newDateAtMidnight(previousSunday.getFullYear(), previousSunday.getMonth(),
      previousSunday.getDate());
  };

  Date.prototype.getWeekInYear = function (minimalDaysInFirstWeek) {
    if (isUndefined(this.minimalDaysInFirstWeek)) {
      minimalDaysInFirstWeek = DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK;
    }
    var previousSunday = this.getPreviousSunday();
    var startOfYear = newDateAtMidnight(this.getFullYear(), 0, 1);
    var numberOfSundays = previousSunday.isBefore(startOfYear) ?
      0 : 1 + Math.floor(previousSunday.getTimeSince(startOfYear) / ONE_WEEK);
    var numberOfDaysInFirstWeek = 7 - startOfYear.getDay();
    var weekInYear = numberOfSundays;
    if (numberOfDaysInFirstWeek < minimalDaysInFirstWeek) {
      weekInYear--;
    }
    return weekInYear;
  };

  Date.prototype.getWeekInMonth = function (minimalDaysInFirstWeek) {
    if (isUndefined(this.minimalDaysInFirstWeek)) {
      minimalDaysInFirstWeek = DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK;
    }
    var previousSunday = this.getPreviousSunday();
    var startOfMonth = newDateAtMidnight(this.getFullYear(), this.getMonth(), 1);
    var numberOfSundays = previousSunday.isBefore(startOfMonth) ?
      0 : 1 + Math.floor(previousSunday.getTimeSince(startOfMonth) / ONE_WEEK);
    var numberOfDaysInFirstWeek = 7 - startOfMonth.getDay();
    var weekInMonth = numberOfSundays;
    if (numberOfDaysInFirstWeek >= minimalDaysInFirstWeek) {
      weekInMonth++;
    }
    return weekInMonth;
  };

  Date.prototype.getDayInYear = function () {
    var startOfYear = newDateAtMidnight(this.getFullYear(), 0, 1);
    return 1 + Math.floor(this.getTimeSince(startOfYear) / ONE_DAY);
  };

  /* ------------------------------------------------------------------ */

  SimpleDateFormat = function (formatString) {
    this.formatString = formatString;
  };

  /**
   * Sets the minimum number of days in a week in order for that week to
   * be considered as belonging to a particular month or year
   */
  SimpleDateFormat.prototype.setMinimalDaysInFirstWeek = function (days) {
    this.minimalDaysInFirstWeek = days;
  };

  SimpleDateFormat.prototype.getMinimalDaysInFirstWeek = function () {
    return isUndefined(this.minimalDaysInFirstWeek) ?
      DEFAULT_MINIMAL_DAYS_IN_FIRST_WEEK : this.minimalDaysInFirstWeek;
  };

  var padWithZeroes = function (str, len) {
    while (str.length < len) {
      str = "0" + str;
    }
    return str;
  };

  var formatText = function (data, numberOfLetters, minLength) {
    return (numberOfLetters >= 4) ? data : data.substr(0, Math.max(minLength, numberOfLetters));
  };

  var formatNumber = function (data, numberOfLetters) {
    var dataString = "" + data;
    // Pad with 0s as necessary
    return padWithZeroes(dataString, numberOfLetters);
  };

  SimpleDateFormat.prototype.format = function (date) {
    var formattedString = "";
    var result;
    var searchString = this.formatString;
    while ((result = regex.exec(searchString))) {
      var quotedString = result[1];
      var patternLetters = result[2];
      var otherLetters = result[3];
      var otherCharacters = result[4];

      // If the pattern matched is quoted string, output the text between the quotes
      if (quotedString) {
        if (quotedString == "''") {
          formattedString += "'";
        } else {
          formattedString += quotedString.substring(1, quotedString.length - 1);
        }
      } else if (otherLetters) {
        // Swallow non-pattern letters by doing nothing here
      } else if (otherCharacters) {
        // Simply output other characters
        formattedString += otherCharacters;
      } else if (patternLetters) {
        // Replace pattern letters
        var patternLetter = patternLetters.charAt(0);
        var numberOfLetters = patternLetters.length;
        var rawData = "";
        switch (patternLetter) {
          case "G":
            rawData = "AD";
            break;
          case "y":
            rawData = date.getFullYear();
            break;
          case "M":
            rawData = date.getMonth();
            break;
          case "w":
            rawData = date.getWeekInYear(this.getMinimalDaysInFirstWeek());
            break;
          case "W":
            rawData = date.getWeekInMonth(this.getMinimalDaysInFirstWeek());
            break;
          case "D":
            rawData = date.getDayInYear();
            break;
          case "d":
            rawData = date.getDate();
            break;
          case "F":
            rawData = 1 + Math.floor((date.getDate() - 1) / 7);
            break;
          case "E":
            rawData = dayNames[date.getDay()];
            break;
          case "a":
            rawData = (date.getHours() >= 12) ? "PM" : "AM";
            break;
          case "H":
            rawData = date.getHours();
            break;
          case "k":
            rawData = date.getHours() || 24;
            break;
          case "K":
            rawData = date.getHours() % 12;
            break;
          case "h":
            rawData = (date.getHours() % 12) || 12;
            break;
          case "m":
            rawData = date.getMinutes();
            break;
          case "s":
            rawData = date.getSeconds();
            break;
          case "S":
            rawData = date.getMilliseconds();
            break;
          case "Z":
            rawData = date.getTimezoneOffset(); // This returns the number of minutes since GMT was this time.
            break;
        }
        // Format the raw data depending on the type
        switch (types[patternLetter]) {
          case TEXT2:
            formattedString += formatText(rawData, numberOfLetters, 2);
            break;
          case TEXT3:
            formattedString += formatText(rawData, numberOfLetters, 3);
            break;
          case NUMBER:
            formattedString += formatNumber(rawData, numberOfLetters);
            break;
          case YEAR:
            if (numberOfLetters <= 3) {
              // Output a 2-digit year
              var dataString = "" + rawData;
              formattedString += dataString.substr(2, 2);
            } else {
              formattedString += formatNumber(rawData, numberOfLetters);
            }
            break;
          case MONTH:
            if (numberOfLetters >= 3) {
              formattedString += formatText(monthNames[rawData], numberOfLetters, numberOfLetters);
            } else {
              // NB. Months returned by getMonth are zero-based
              formattedString += formatNumber(rawData + 1, numberOfLetters);
            }
            break;
          case TIMEZONE:
            var isPositive = (rawData > 0);
            // The following line looks like a mistake but isn't
            // because of the way getTimezoneOffset measures.
            var prefix = isPositive ? "-" : "+";
            var absData = Math.abs(rawData);

            // Hours
            var hours = "" + Math.floor(absData / 60);
            hours = padWithZeroes(hours, 2);
            // Minutes
            var minutes = "" + (absData % 60);
            minutes = padWithZeroes(minutes, 2);

            formattedString += prefix + hours + minutes;
            break;
        }
      }
      searchString = searchString.substr(result.index + result[0].length);
    }
    return formattedString;
  };
})();

log4javascript.SimpleDateFormat = SimpleDateFormat;
/* ---------------------------------------------------------------------- */
// PatternLayout

function PatternLayout(pattern) {
  if (pattern) {
    this.pattern = pattern;
  } else {
    this.pattern = PatternLayout.DEFAULT_CONVERSION_PATTERN;
  }
  this.customFields = [];
}

PatternLayout.TTCC_CONVERSION_PATTERN = "%r %p %c - %m%n";
PatternLayout.DEFAULT_CONVERSION_PATTERN = "%m%n";
PatternLayout.ISO8601_DATEFORMAT = "yyyy-MM-dd HH:mm:ss,SSS";
PatternLayout.DATETIME_DATEFORMAT = "dd MMM yyyy HH:mm:ss,SSS";
PatternLayout.ABSOLUTETIME_DATEFORMAT = "HH:mm:ss,SSS";

PatternLayout.prototype = new Layout();

PatternLayout.prototype.format = function (loggingEvent) {
  var regex = /%(-?[0-9]+)?(\.?[0-9]+)?([acdflmMnpr%])(\{([^\}]+)\})?|([^%]+)/;
  var formattedString = "";
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
      formattedString += "" + text;
    } else {
      // Create a raw replacement string based on the conversion
      // character and specifier
      var replacement = "";
      switch (conversionCharacter) {
        case "l": //Location
          var isChrome = navigator.userAgent.indexOf("Chrome") !== -1;
          if (isChrome) {
            //do someting else
            var stack = new Error().stack;
            var lineAccessingLogger = stack.split("\n")[8];

            var funcBegin = lineAccessingLogger.indexOf("at ") + 3;
            var resourceBegin = lineAccessingLogger.indexOf(" (") + 2;


            var functionName = funcBegin < resourceBegin ? lineAccessingLogger.substring(funcBegin, resourceBegin - 2) : null;

            var resourceLoc;
            if (functionName) {
              resourceLoc = lineAccessingLogger.substring(resourceBegin, lineAccessingLogger.length - 1);
            } else {
              functionName = "(anonymous)";
              resourceLoc = lineAccessingLogger.substring(funcBegin);
            }

            var colIdx = resourceLoc.lastIndexOf(":");
            var column = parseInt(resourceLoc.substring(colIdx + 1), 10);
            var lineIdx = resourceLoc.lastIndexOf(":", colIdx - 1);
            var line = parseInt(resourceLoc.substring(lineIdx + 1, colIdx), 10);

            var resource = resourceLoc.substring(0, lineIdx);
            var lastSegmentIdx = resource.lastIndexOf("/");

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

            var spec = "s:l";
            if (specifier)spec = specifier;

            var specresult = [];
            var priorNum = "";
            for (var int = 0; int < spec.length; int++) {
              var l = spec[int];
              var num = parseInt(l, 10);
              if (num > -1) {
                priorNum += l;
                continue;
              } else {
                if (priorNum.length > 0) {
                  specresult.push(parseInt(priorNum, 10));
                  priorNum = "";
                }
                specresult.push(l);
              }
            }
            if (priorNum.length > 0)
              specresult.push(parseInt(priorNum, 10));
            spec = specresult;

            for (var int = 0; int < spec.length; int++) {
              var optNum = spec[int + 1];
              switch (spec[int]) {
                case "s":
                  replacement += lastSegment;
                  break;
                case "r":
                  var string = resource;
                  if (typeof optNum === "number") {
                    string = string.substring(string.length - optNum);
                    spec.splice(int + 1, 1);
                  }
                  replacement += string;
                  break;
                case "l":
                  replacement += line;
                  break;
                case "c":
                  replacement += column;
                  break;
                case "f":
                  var string = functionName;
                  if (typeof optNum === "number") {
                    string = string.substring(string.length - optNum);
                    spec.splice(int + 1, 1);
                  }
                  replacement += string;
                  break;
                  break;
                default:
                  replacement += spec[int];
              }
              ;
            }
          } else {
            throw "can only use this method on google chrome";
          }
          break;
        case "a": // Array of messages
        case "m": // Message
          var depth = 0;
          if (specifier) {
            depth = parseInt(specifier, 10);
            if (isNaN(depth)) {
              handleError("PatternLayout.format: invalid specifier '" +
                specifier + "' for conversion character '" + conversionCharacter +
                "' - should be a number");
              depth = 0;
            }
          }
          var messages = (conversionCharacter === "a") ? loggingEvent.messages[0] : loggingEvent.messages;
          for (var i = 0, len = messages.length; i < len; i++) {
            if (i > 0 && (replacement.charAt(replacement.length - 1) !== " ")) {
              replacement += " ";
            }
            if (depth === 0) {
              replacement += messages[i];
            } else {
              replacement += formatObjectExpansion(messages[i], depth);
            }
          }
          break;
        case "c": // Logger name
          var loggerName = loggingEvent.logger.name;
          if (specifier) {
            var precision = parseInt(specifier, 10);
            var loggerNameBits = loggingEvent.logger.name.split(".");
            if (precision >= loggerNameBits.length) {
              replacement = loggerName;
            } else {
              replacement = loggerNameBits.slice(loggerNameBits.length - precision).join(".");
            }
          } else {
            replacement = loggerName;
          }
          break;
        case "d": // Date
          var dateFormat = PatternLayout.ISO8601_DATEFORMAT;
          if (specifier) {
            dateFormat = specifier;
            // Pick up special cases
            if (dateFormat == "ISO8601") {
              dateFormat = PatternLayout.ISO8601_DATEFORMAT;
            } else if (dateFormat == "ABSOLUTE") {
              dateFormat = PatternLayout.ABSOLUTETIME_DATEFORMAT;
            } else if (dateFormat == "DATE") {
              dateFormat = PatternLayout.DATETIME_DATEFORMAT;
            }
          }
          // Format the date
          replacement = (new SimpleDateFormat(dateFormat)).format(loggingEvent.timeStamp);
          break;
        case "f": // Custom field
          if (this.hasCustomFields()) {
            var fieldIndex = 0;
            if (specifier) {
              fieldIndex = parseInt(specifier, 10);
              if (isNaN(fieldIndex)) {
                handleError("PatternLayout.format: invalid specifier '" +
                  specifier + "' for conversion character 'f' - should be a number");
              } else if (fieldIndex === 0) {
                handleError("PatternLayout.format: invalid specifier '" +
                  specifier + "' for conversion character 'f' - must be greater than zero");
              } else if (fieldIndex > this.customFields.length) {
                handleError("PatternLayout.format: invalid specifier '" +
                  specifier + "' for conversion character 'f' - there aren't that many custom fields");
              } else {
                fieldIndex = fieldIndex - 1;
              }
            }
            var val = this.customFields[fieldIndex].value;
            if (typeof val == "function") {
              val = val(this, loggingEvent);
            }
            replacement = val;
          }
          break;
        case "n": // New line
          replacement = newLine;
          break;
        case "p": // Level
          replacement = loggingEvent.level.name;
          break;
        case "r": // Milliseconds since log4javascript startup
          replacement = "" + loggingEvent.timeStamp.getDifference(applicationStartDate);
          break;
        case "%": // Literal % sign
          replacement = "%";
          break;
        default:
          replacement = matchedString;
          break;
      }
      // Format the replacement according to any padding or
      // truncation specified
      var l;

      // First, truncation
      if (truncation) {
        l = parseInt(truncation.substr(1), 10);
        var strLen = replacement.length;
        if (l < strLen) {
          replacement = replacement.substring(strLen - l, strLen);
        }
      }
      // Next, padding
      if (padding) {
        if (padding.charAt(0) == "-") {
          l = parseInt(padding.substr(1), 10);
          // Right pad with spaces
          while (replacement.length < l) {
            replacement += " ";
          }
        } else {
          l = parseInt(padding, 10);
          // Left pad with spaces
          while (replacement.length < l) {
            replacement = " " + replacement;
          }
        }
      }
      formattedString += replacement;
    }
    searchString = searchString.substr(result.index + result[0].length);
  }
  return formattedString;
};

PatternLayout.prototype.ignoresThrowable = function () {
  return true;
};

PatternLayout.prototype.toString = function () {
  return "PatternLayout";
};

log4javascript.PatternLayout = PatternLayout;