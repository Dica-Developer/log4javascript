/*jshint unused:false*/
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