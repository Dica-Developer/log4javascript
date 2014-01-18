/*global define, describe, it, xit, expect, spyOn, beforeEach, jasmine*/
define(['params', 'level', 'layout', 'logger', 'layout.simple'], function () {
  'use strict';

  describe('#SimpleLayout', function () {

    var layout = null, logger = null, loggingEvent = null;

    beforeEach(function () {
      layout = new SimpleLayout();
      logger = new Logger('test');
      loggingEvent = new LoggingEvent(logger, new Date(), Level.TRACE, ['1'], null);
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