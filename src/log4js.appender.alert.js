define(['log4js.core', 'log4js.appender', 'log4js.layout.simple'], function(log4js){
  'use strict';
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
  AlertAppender.prototype = new log4js.Appender();

  /**
   *
   * @type {Layout}
   */
  AlertAppender.prototype.layout = new log4js.SimpleLayout();

  /**
   *
   * @param loggingEvent
   */
  AlertAppender.prototype.append = function (loggingEvent) {
    var formattedMessage = this.getLayout().format(loggingEvent);
    if (this.getLayout().ignoresThrowable()) {
      formattedMessage += loggingEvent.getThrowableStrRep();
    }
    window.alert(formattedMessage);
  };

  /**
   *
   * @returns {string}
   */
  AlertAppender.prototype.toString = function () {
    return 'AlertAppender';
  };

  log4js.AlertAppender = AlertAppender;
});
