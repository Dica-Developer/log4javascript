/*global define, describe, it, expect, beforeEach*/
define(['log4js', 'logger', 'layout.simple'], function (log4js, Logger) {
  'use strict';

  describe('#SimpleLayout', function () {

    var layout = null, logger = null, loggingEvent = null;

    beforeEach(function () {
      layout = new log4js.SimpleLayout();
      logger = log4js.getLogger('test');
      loggingEvent = new Logger.LoggingEvent(logger, new Date(), log4js.Level.TRACE, ['1'], null);
    });

    it('.toString', function () {
      expect(layout.toString()).toBe('SimpleLayout');
    });

    it('.ignoresThrowable', function () {
      expect(layout.ignoresThrowable()).toBe(true);
    });

    it('.format', function () {
      expect(layout.format(loggingEvent)).toBe('TRACE - ' + loggingEvent.messages);
    });
  });
});