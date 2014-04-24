/*jshint unused:false*/

/**
 *
 * @param name
 * @param value
 * @param days
 * @param path
 */
function setCookie(name, value, days, path) {
  'use strict';

  var expires;
  path = path ? '; path=' + path : '';
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = '; expires=' + date.toGMTString();
  } else {
    expires = '';
  }
  document.cookie = window.escape(name) + '=' + window.escape(value) + expires + path;
}

/**
 *
 * @param name
 * @returns {*}
 */
function getCookie(name) {
  'use strict';

  var nameEquals = window.escape(name) + '=';
  var ca = document.cookie.split(';');
  for (var i = 0, len = ca.length; i < len; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEquals) === 0) {
      return window.unescape(c.substring(nameEquals.length, c.length));
    }
  }
  return null;
}

/**
 * Gets the base URL of the location of the log4javascript script.
 * This is far from infallible.
 * @returns {*}
 */
function getBaseUrl() {
  'use strict';

  var scripts = document.getElementsByTagName('script');
  for (var i = 0, len = scripts.length; i < len; ++i) {
    if (scripts[i].src.indexOf('log4javascript') !== -1) {
      var lastSlash = scripts[i].src.lastIndexOf('/');
      return (lastSlash === -1) ? '' : scripts[i].src.substr(0, lastSlash + 1);
    }
  }
  return null;
}

/**
 *
 * @param win
 * @returns {boolean}
 */
function isLoaded(win) {
  'use strict';

  try {
    return toBool(win.loaded);
  } catch (ex) {
    return false;
  }
}

/* ---------------------------------------------------------------------- */
// Console extension functions

function padWithSpaces(str, len) {
  'use strict';

  if (str.length < len) {
    var spaces = [];
    var numberOfSpaces = Math.max(0, len - str.length);
    for (var i = 0; i < numberOfSpaces; i++) {
      spaces[i] = ' ';
    }
    str += spaces.join('');
  }
  return str;
}

function dir(obj) {
  'use strict';

  var maxLen = 0;
  // Obtain the length of the longest property name
  for (var p in obj) {
    maxLen = Math.max(toStr(p).length, maxLen);
  }
  // Create the nicely formatted property list
  var propList = [];
  for (p in obj) {
    var propNameStr = '  ' + padWithSpaces(toStr(p), maxLen + 2);
    var propVal;
    try {
      propVal = splitIntoLines(toStr(obj[p])).join(padWithSpaces(newLine, maxLen + 6));
    } catch (ex) {
      propVal = '[Error obtaining property. Details: ' + getExceptionMessage(ex) + ']';
    }
    propList.push(propNameStr + propVal);
  }
  return propList.join(newLine);
}

var nodeTypes = {
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  TEXT_NODE: 3,
  CDATA_SECTION_NODE: 4,
  ENTITY_REFERENCE_NODE: 5,
  ENTITY_NODE: 6,
  PROCESSING_INSTRUCTION_NODE: 7,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11,
  NOTATION_NODE: 12
};

var preFormattedElements = ['script', 'pre'];

// This should be the definitive list, as specified by the XHTML 1.0 Transitional DTD
var emptyElements = ['br', 'img', 'hr', 'param', 'link', 'area', 'input', 'col', 'base', 'meta'];
var indentationUnit = '  ';

// Create and return an XHTML string from the node specified
function getXhtml(rootNode, includeRootNode, indentation, startNewLine, preformatted) {
  'use strict';

  includeRootNode = isUndefined(includeRootNode) ? true : !!includeRootNode;
  if (isString(indentation)) {
    indentation = '';
  }
  startNewLine = !!startNewLine;
  preformatted = !!preformatted;
  var xhtml;

  function isWhitespace(node) {
    return ((node.nodeType === nodeTypes.TEXT_NODE) && /^[ \t\r\n]*$/.test(node.nodeValue));
  }

  function fixAttributeValue(attrValue) {
    return attrValue.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/'/g, '&quot;');
  }

  function getStyleAttributeValue(el) {
    var stylePairs = el.style.cssText.split(';');
    var styleValue = '';
    for (var j = 0, len = stylePairs.length; j < len; j++) {
      var nameValueBits = stylePairs[j].split(':');
      var props = [];
      if (!/^\s*$/.test(nameValueBits[0])) {
        props.push(trim(nameValueBits[0]).toLowerCase() + ':' + trim(nameValueBits[1]));
      }
      styleValue = props.join(';');
    }
    return styleValue;
  }

  function getNamespace(el) {
    if (el.prefix) {
      return el.prefix;
    } else if (el.outerHTML) {
      var regex = new RegExp('<([^:]+):' + el.tagName + '[^>]*>', 'i');
      if (regex.test(el.outerHTML)) {
        return RegExp.$1.toLowerCase();
      }
    }
    return '';
  }

  var lt = '<';
  var gt = '>';

  if (includeRootNode && rootNode.nodeType !== nodeTypes.DOCUMENT_FRAGMENT_NODE) {
    switch (rootNode.nodeType) {
    case nodeTypes.ELEMENT_NODE:
      var tagName = rootNode.tagName.toLowerCase();
      xhtml = startNewLine ? newLine + indentation : '';
      xhtml += lt;
      // Allow for namespaces, where present
      var prefix = getNamespace(rootNode);
      var hasPrefix = !!prefix;
      if (hasPrefix) {
        xhtml += prefix + ':';
      }
      xhtml += tagName;
      for (var i = 0, len = rootNode.attributes.length; i < len; i++) {
        var currentAttr = rootNode.attributes[i];
        // Check the attribute is valid.
        if (!currentAttr.specified ||
          currentAttr.nodeValue === null ||
          currentAttr.nodeName.toLowerCase() === 'style' ||
          typeof currentAttr.nodeValue !== 'string' ||
          currentAttr.nodeName.indexOf('_moz') === 0) {
          continue;
        }
        xhtml += ' ' + currentAttr.nodeName.toLowerCase() + '="';
        xhtml += fixAttributeValue(currentAttr.nodeValue);
        xhtml += '"';
      }
      // Style needs to be done separately as it is not reported as an
      // attribute in IE
      if (rootNode.style.cssText) {
        var styleValue = getStyleAttributeValue(rootNode);
        if (styleValue !== '') {
          xhtml += ' style="' + getStyleAttributeValue(rootNode) + '"';
        }
      }
      if (arrayContains(emptyElements, tagName) ||
        (hasPrefix && !rootNode.hasChildNodes())) {
        xhtml += '/' + gt;
      } else {
        xhtml += gt;
        // Add output for childNodes collection (which doesn't include attribute nodes)
        var childStartNewLine = !(rootNode.childNodes.length === 1 &&
          rootNode.childNodes[0].nodeType === nodeTypes.TEXT_NODE);
        var childPreformatted = arrayContains(preFormattedElements, tagName);
        for (var i1 = 0, len1 = rootNode.childNodes.length; i1 < len1; i1++) {
          xhtml += getXhtml(rootNode.childNodes[i1], true, indentation + indentationUnit,
            childStartNewLine, childPreformatted);
        }
        // Add the end tag
        var endTag = lt + '/' + tagName + gt;
        xhtml += childStartNewLine ? newLine + indentation + endTag : endTag;
      }
      return xhtml;
    case nodeTypes.TEXT_NODE:
      if (isWhitespace(rootNode)) {
        xhtml = '';
      } else {
        if (preformatted) {
          xhtml = rootNode.nodeValue;
        } else {
          // Trim whitespace from each line of the text node
          var lines = splitIntoLines(trim(rootNode.nodeValue));
          var trimmedLines = [];
          for (var i2 = 0, len2 = lines.length; i2 < len2; i2++) {
            trimmedLines[i2] = trim(lines[i2]);
          }
          xhtml = trimmedLines.join(newLine + indentation);
        }
        if (startNewLine) {
          xhtml = newLine + indentation + xhtml;
        }
      }
      return xhtml;
    case nodeTypes.CDATA_SECTION_NODE:
      return '<![CDA' + 'TA[' + rootNode.nodeValue + ']' + ']>' + newLine;
    case nodeTypes.DOCUMENT_NODE:
      xhtml = '';
      // Add output for childNodes collection (which doesn't include attribute nodes)
      for (var i3 = 0, len3 = rootNode.childNodes.length; i3 < len3; i3++) {
        xhtml += getXhtml(rootNode.childNodes[i3], true, indentation);
      }
      return xhtml;
    default:
      return '';
    }
  } else {
    xhtml = '';
    // Add output for childNodes collection (which doesn't include attribute nodes)
    for (var i4 = 0, len4 = rootNode.childNodes.length; i4 < len4; i4++) {
      xhtml += getXhtml(rootNode.childNodes[i4], true, indentation + indentationUnit);
    }
    return xhtml;
  }
}

function createCommandLineFunctions() {
  'use strict';

  ConsoleAppender.addGlobalCommandLineFunction('$', function (appender, args, returnValue) {
    return document.getElementById(args[0]);
  });

  ConsoleAppender.addGlobalCommandLineFunction('dir', function (appender, args, returnValue) {
    var lines = [];
    for (var i = 0, len = args.length; i < len; i++) {
      lines[i] = dir(args[i]);
    }
    return lines.join(newLine + newLine);
  });

  ConsoleAppender.addGlobalCommandLineFunction('dirxml', function (appender, args, returnValue) {
    var lines = [];
    for (var i = 0, len = args.length; i < len; i++) {
      var win = appender.getCommandWindow();
      lines[i] = getXhtml(args[i]);
    }
    return lines.join(newLine + newLine);
  });

  ConsoleAppender.addGlobalCommandLineFunction('cd', function (appender, args, returnValue) {
    var win, message;
    if (args.length === 0 || args[0] === '') {
      win = window;
      message = 'Command line set to run in main window';
    } else {
      if (args[0].window === args[0]) {
        win = args[0];
        message = 'Command line set to run in frame "' + args[0].name + '"';
      } else {
        win = window.frames[args[0]];
        if (win) {
          message = 'Command line set to run in frame "' + args[0] + '"';
        } else {
          returnValue.isError = true;
          message = 'Frame "' + args[0] + '" does not exist';
          win = appender.getCommandWindow();
        }
      }
    }
    appender.setCommandWindow(win);
    return message;
  });

  ConsoleAppender.addGlobalCommandLineFunction('clear', function (appender, args, returnValue) {
    returnValue.appendResult = false;
    appender.clear();
  });

  ConsoleAppender.addGlobalCommandLineFunction('keys', function (appender, args, returnValue) {
    var keys = [];
    for (var k in args[0]) {
      keys.push(k);
    }
    return keys;
  });

  ConsoleAppender.addGlobalCommandLineFunction('values', function (appender, args, returnValue) {
    var values = [];
    for (var k in args[0]) {
      try {
        values.push(args[0][k]);
      } catch (ex) {
        logLog.warn('values(): Unable to obtain value for key ' + k + '. Details: ' + getExceptionMessage(ex));
      }
    }
    return values;
  });

  ConsoleAppender.addGlobalCommandLineFunction('expansionDepth', function (appender, args, returnValue) {
    var expansionDepth = parseInt(args[0], 10);
    if (isNaN(expansionDepth) || expansionDepth < 0) {
      returnValue.isError = true;
      return '' + args[0] + ' is not a valid expansion depth';
    } else {
      appender.setCommandLineObjectExpansionDepth(expansionDepth);
      return 'Object expansion depth set to ' + expansionDepth;
    }
  });
}

function init() {
  'use strict';

  // Add command line functions
  createCommandLineFunctions();
}

init();