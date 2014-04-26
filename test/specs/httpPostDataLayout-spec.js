/*global define, describe, it, expect, beforeEach*/
define(['log4js', 'logger', 'layout.httpPostData'], function (log4js, Logger) {
  'use strict';

  describe('#HttpPostDataLayout', function () {

    var layout = null, logger = null, loggingEvent = null,
      date = null, seconds = null, milliSeconds = null;

    beforeEach(function () {
      layout = new log4js.HttpPostDataLayout();
      logger = new log4js.getLogger('test');
      date = new Date();
      milliSeconds = date.getTime();
      seconds = Math.floor(milliSeconds / 1000);
      loggingEvent = new Logger.LoggingEvent(logger, date, log4js.Level.TRACE, ['1'], null);
    });

    it('.toString', function () {
      expect(layout.toString()).toBe('HttpPostDataLayout');
    });

    it('.ignoresThrowable', function () {
      expect(layout.ignoresThrowable()).toBe(false);
    });

    it('.allowBatching', function () {
      expect(layout.allowBatching()).toBe(false);
    });

    it('.format', function () {
      expect(layout.format(loggingEvent)).toBe('logger=test&timestamp=' +
        seconds +
        '&level=TRACE&url=http%3A%2F%2Flocalhost%3A9876%2Fcontext.html&message=1&milliseconds=' +
        loggingEvent.milliseconds);
    });

    xit('.format with date', function () {
      loggingEvent = new Logger.LoggingEvent(logger, date, log4js.Level.TRACE, [1, date], null);
      expect(layout.format(loggingEvent)).toBe('logger=test&timestamp=' +
        seconds +
        '&level=TRACE&url=http%3A%2F%2Flocalhost%3A9876%2Fcontext.html&message=' +
        String(date.getTime()) +
        '&milliseconds=' +
        loggingEvent.milliseconds);
    });
  });
});