/**
 * BrowserConsoleAppender (works in Opera, Safari, Firefox, Firefox with
 * Firebug extension and Chrome)
 * @constructor
 * @mixes Appender
 */
function BrowserConsoleAppender() {}

/**
 *
 * @type {Appender}
 */
BrowserConsoleAppender.prototype = new Appender();

/**
 *
 * @type {Layout}
 */
BrowserConsoleAppender.prototype.layout = new NullLayout();

/**
 *
 * @type {Level}
 */
BrowserConsoleAppender.prototype.threshold = Level.DEBUG;

/**
 *
 * @param loggingEvent
 */
BrowserConsoleAppender.prototype.append = function (loggingEvent) {
  'use strict';

  var appender = this;

  var getFormattedMessage = function () {
    var layout = appender.getLayout();
    var formattedMessage = layout.format(loggingEvent);
    if (layout.ignoresThrowable() && loggingEvent.exception) {
      formattedMessage += loggingEvent.getThrowableStrRep();
    }
    return formattedMessage;
  };

  if (typeof opera !== 'undefined' && opera.postError) { // Opera
    opera.postError(getFormattedMessage());
  } else if (window.console && window.console.log) { // Safari and Firebug
    var formattedMesage = getFormattedMessage();
    // Log to Firebug using its logging methods or revert to the console.log
    // method in Safari
    if (window.console.debug && Level.DEBUG.isGreaterOrEqual(loggingEvent.level)) {
      window.console.debug(formattedMesage);
    } else if (window.console.info && Level.INFO.equals(loggingEvent.level)) {
      window.console.info(formattedMesage);
    } else if (window.console.warn && Level.WARN.equals(loggingEvent.level)) {
      window.console.warn(formattedMesage);
    } else if (window.console.error && loggingEvent.level.isGreaterOrEqual(Level.ERROR)) {
      window.console.error(formattedMesage);
    } else {
      window.console.log(formattedMesage);
    }
  }
};

/**
 *
 * @param {String} name
 */
BrowserConsoleAppender.prototype.group = function (name) {
  'use strict';

  if (window.console && window.console.group) {
    window.console.group(name);
  }
};

/**
 * @todo document
 */
BrowserConsoleAppender.prototype.groupEnd = function () {
  'use strict';

  if (window.console && window.console.groupEnd) {
    window.console.groupEnd();
  }
};

/**
 *
 * @returns {String}
 */
BrowserConsoleAppender.prototype.toString = function () {
  'use strict';

  return 'BrowserConsoleAppender';
};

/**
 *
 * @type {BrowserConsoleAppender}
 */
log4javascript.BrowserConsoleAppender = BrowserConsoleAppender;