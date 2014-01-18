/*global define, describe, it, expect, beforeEach*/
define(['params', 'level', 'layout', 'logger', 'layout.null'], function () {
  'use strict';

  describe('#NullLayout', function () {

    var layout = null, logger = null, loggingEvent = null;

    beforeEach(function () {
      layout = new NullLayout();
      logger = new Logger('test');
      loggingEvent = new LoggingEvent(logger, new Date(), Level.TRACE, ['1'], null);
    });

    it('.toString', function () {
      expect(layout.toString()).toBe('NullLayout');
    });

    it('.ignoresThrowable', function () {
      expect(layout.ignoresThrowable()).toBe(true);
    });

    it('.format', function () {
      expect(layout.format(loggingEvent)).toBe(loggingEvent.messages);
    });
  });
});