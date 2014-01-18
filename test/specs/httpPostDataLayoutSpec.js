/*global define, describe, it, expect, beforeEach*/
define(['params', 'level', 'layout', 'logger', 'layout.httpPostData'], function () {
  'use strict';

  describe('#HttpPostDataLayout', function () {

    var layout = null, logger = null, loggingEvent = null,
      date = null, seconds = null, milliSeconds = null;

    beforeEach(function () {
      layout = new HttpPostDataLayout();
      logger = new Logger('test');
      date = new Date();
      milliSeconds = date.getTime();
      seconds = Math.floor(milliSeconds / 1000);
      loggingEvent = new LoggingEvent(logger, date, Level.TRACE, ['1'], null);
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
  });
});