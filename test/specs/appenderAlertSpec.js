/*global define, describe, it, xit, expect, spyOn, beforeEach, jasmine*/
define([
  'params',
  'level',
  'layout',
  'logger',
  'appender',
  'layout.simple',
  'appender.alert'
], function () {
  'use strict';

  describe('#AlertAppender', function () {

    var appender = null, loggingEvent = null, logger = null;

    beforeEach(function () {
      appender = new AlertAppender();
      logger = new Logger('test');
      loggingEvent = new LoggingEvent(logger, new Date(), Level.TRACE, ['1', '2'], null);
    });

    it('.toString', function () {
      expect(appender.toString()).toBe('AlertAppender');
    });

    it('.toString', function () {
      var alertSpy = spyOn(window, 'alert');
      appender.append(loggingEvent);
      expect(alertSpy).toHaveBeenCalledWith('TRACE - 1' + newLine + '2');
    });

    it('.toString', function () {
      var layout = appender.getLayout();
      layout.ignoresThrowable = function(){
        return false;
      };
      var alertSpy = spyOn(window, 'alert');
      appender.append(loggingEvent);
      expect(alertSpy).toHaveBeenCalledWith('TRACE - 1' + newLine + '2');
    });

  });
});