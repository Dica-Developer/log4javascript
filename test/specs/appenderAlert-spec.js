/*global define, describe, it, expect, spyOn, beforeEach, window*/
define([
  'log4js',
  'helper',
  'logger',
  'appender',
  'appender.alert'
], function (log4js, helper, Logger) {
  'use strict';

  describe('#AlertAppender', function () {

    var appender = null, loggingEvent = null, logger = null;

    beforeEach(function () {
      appender = new log4js.AlertAppender();
      logger = new log4js.getLogger('test');
      loggingEvent = new Logger.LoggingEvent(logger, new Date(), log4js.Level.TRACE, ['1', '2'], null);
    });

    it('.toString', function () {
      expect(appender.toString()).toBe('AlertAppender');
    });

    it('.toString', function () {
      var alertSpy = spyOn(window, 'alert');
      appender.append(loggingEvent);
      expect(alertSpy).toHaveBeenCalledWith('TRACE - 1' + helper.newLine + '2');
    });

    it('.toString', function () {
      var layout = appender.getLayout();
      layout.ignoresThrowable = function(){
        return false;
      };
      var alertSpy = spyOn(window, 'alert');
      appender.append(loggingEvent);
      expect(alertSpy).toHaveBeenCalledWith('TRACE - 1' + helper.newLine + '2');
    });

  });
});