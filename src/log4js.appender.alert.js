/**
 *
 * @constructor
 * @mixes Appender
 */
function AlertAppender() {}

/**
 *
 * @type {Appender}
 */
AlertAppender.prototype = new Appender();

/**
 *
 * @type {Layout}
 */
AlertAppender.prototype.layout = new SimpleLayout();

/**
 *
 * @param loggingEvent
 */
AlertAppender.prototype.append = function (loggingEvent) {
  'use strict';

  var formattedMessage = this.getLayout().format(loggingEvent);
  if (this.getLayout().ignoresThrowable()) {
    formattedMessage += loggingEvent.getThrowableStrRep();
  }
  alert(formattedMessage);
};

/**
 *
 * @returns {string}
 */
AlertAppender.prototype.toString = function () {
  'use strict';

  return 'AlertAppender';
};

/**
 *
 * @type {AlertAppender}
 */
log4javascript.AlertAppender = AlertAppender;