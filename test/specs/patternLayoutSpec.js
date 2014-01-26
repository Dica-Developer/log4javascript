/*global define, describe, it, expect, beforeEach, spyOn*/
define(['params', 'level', 'layout', 'logger', 'layout.pattern'], function () {
  'use strict';

  describe('#PatternLayout', function () {

    var layout = null, logger = null, loggingEvent = null;

    beforeEach(function () {
      layout = new PatternLayout();
      logger = new Logger('layout.pattern.test');
      loggingEvent = new LoggingEvent(logger, new Date(), Level.TRACE, ['1'], null);
    });

    it('.toString', function () {
      expect(layout.toString()).toBe('PatternLayout');
    });

    it('.pattern', function () {
      expect(layout.ignoresThrowable()).toBe(true);
    });

    describe('.pattern', function(){

      it('param not given "DEFAULT_CONVERSION_PATTERN" is default', function(){
        var layout = new PatternLayout();
        expect(layout.pattern).toBe('%m%n');
      });

      it('param should override pattern', function(){
        var layout = new PatternLayout('%r%t');
        expect(layout.pattern).toBe('%r%t');
      });

    });

    describe('.format', function () {

      var logger = null, loggingEvent = null;

      beforeEach(function () {
        logger = new Logger('layout.pattern.test');
        loggingEvent = new LoggingEvent(logger, new Date(23, 3, 23), Level.TRACE, ['1', '2'], null);
      });

      it('just text', function(){
        var layout = new PatternLayout('test');
        expect(layout.format(loggingEvent)).toBe('test');
      });

      it('%m - simple', function(){
        var layout = new PatternLayout('%m');
        expect(layout.format(loggingEvent)).toBe('1 2');
      });

      it('%m{0} - with valid specifier', function(){
        var layout = new PatternLayout('%m{0}');
        expect(layout.format(loggingEvent)).toBe('1 2');
      });

      it('%m{invalid} - with invalid specifier', function(){
        var handleErrorSpy = spyOn(window, 'handleError');
        var layout = new PatternLayout('%m{invalid}');
        expect(layout.format(loggingEvent)).toBe('1 2');
        expect(handleErrorSpy).toHaveBeenCalledWith('PatternLayout.format: invalid specifier "invalid" for conversion character "m" - should be a number');
      });

      it('%c - simple', function(){
        var layout = new PatternLayout('%c');
        expect(layout.format(loggingEvent)).toBe('layout.pattern.test');
      });

      it('%c{2} - with valid specifier', function(){
        var layout = new PatternLayout('%c{2}');
        expect(layout.format(loggingEvent)).toBe('pattern.test');
      });

      it('%c{4} - with invalid specifier', function(){
        var layout = new PatternLayout('%c{4}');
        expect(layout.format(loggingEvent)).toBe('layout.pattern.test');
      });

      it('%d - simple', function(){
        var layout = new PatternLayout('%d');
        expect(layout.format(loggingEvent)).toBe('1923-04-23 00:00:00,000');
      });

      it('%d{ISO8601} - with valid specifier', function(){
        var layout = new PatternLayout('%d{ISO8601}');
        expect(layout.format(loggingEvent)).toBe('1923-04-23 00:00:00,000');
      });

      it('%d{ABSOLUTE} - with valid specifier', function(){
        var layout = new PatternLayout('%d{ABSOLUTE}');
        expect(layout.format(loggingEvent)).toBe('00:00:00,000');
      });

      it('%d{DATE} - with valid specifier', function(){
        var layout = new PatternLayout('%d{DATE}');
        expect(layout.format(loggingEvent)).toBe('23 Apr 1923 00:00:00,000');
      });

      it('%d{TEST} - with invalid specifier', function(){
        var layout = new PatternLayout('%d{TEST}');
        expect(layout.format(loggingEvent)).toBe('');
      });

      it('%n', function(){
        var layout = new PatternLayout('%n');
        expect(layout.format(loggingEvent)).toBe(newLine);
      });

      it('%p', function(){
        var layout = new PatternLayout('%p');
        expect(layout.format(loggingEvent)).toBe('TRACE');
      });

      it('%r', function(){
        var layout = new PatternLayout('%r');
        expect(layout.format(loggingEvent)).toBe('' + loggingEvent.timeStamp.getDifference(applicationStartDate));
      });

      it('%%', function(){
        var layout = new PatternLayout('%%');
        expect(layout.format(loggingEvent)).toBe('%');
      });

      it('%l', function(){
        var handleErrorSpy = spyOn(window, 'handleError');
        var layout = new PatternLayout('%l');
        expect(layout.format(loggingEvent)).toBe('');
        expect(handleErrorSpy).toHaveBeenCalledWith('Could not apply "l" pattern because no stack is available');
      });

      it('%6p - padding right', function(){
        var layout = new PatternLayout('%6p');
        expect(layout.format(loggingEvent)).toBe(' TRACE');
      });

      it('%-6p - padding left', function(){
        var layout = new PatternLayout('%-6p');
        expect(layout.format(loggingEvent)).toBe('TRACE ');
      });

      it('%.3p - truncation', function(){
        var layout = new PatternLayout('%.3p');
        expect(layout.format(loggingEvent)).toBe('ACE');
      });

      it('%.7p - truncation', function(){
        var layout = new PatternLayout('%.7p');
        expect(layout.format(loggingEvent)).toBe('TRACE');
      });

      it('%M', function(){
        var layout = new PatternLayout('%M');
        expect(layout.format(loggingEvent)).toBe('%M');
      });

      it('%f', function(){
        var layout = new PatternLayout('%f');
        expect(layout.format(loggingEvent)).toBe('%f');
      });

    });

  });
});