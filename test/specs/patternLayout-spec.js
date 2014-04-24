/*global define, describe, it, expect, beforeEach, spyOn, xit*/
define(['helper', 'level', 'log4js', 'logger', 'layout', 'layout.pattern'], function (helper, Level, log4js, Logger) {
  'use strict';

  describe('#PatternLayout', function () {

    var layout = null, logger = null, loggingEvent = null;

    beforeEach(function () {
      layout = new log4js.PatternLayout();
      logger = new Logger('layout.pattern.test', log4js);
      loggingEvent = new Logger.LoggingEvent(logger, new Date(), Level.TRACE, ['1'], null);
    });

    it('.toString', function () {
      expect(layout.toString()).toBe('PatternLayout');
    });

    it('.pattern', function () {
      expect(layout.ignoresThrowable()).toBe(true);
    });

    describe('.pattern', function(){

      it('param not given "DEFAULT_CONVERSION_PATTERN" is default', function(){
        var layout = new log4js.PatternLayout();
        expect(layout.pattern).toBe('%m%n');
      });

      it('param should override pattern', function(){
        var layout = new log4js.PatternLayout('%r%t');
        expect(layout.pattern).toBe('%r%t');
      });

    });

    describe('.format', function () {

      var logger = null, loggingEvent = null;

      beforeEach(function () {
        logger = new Logger('layout.pattern.test');
        loggingEvent = new Logger.LoggingEvent(logger, new Date(23, 3, 23), Level.TRACE, ['1', '2'], null);
      });

      it('just text', function(){
        var layout = new log4js.PatternLayout('test');
        expect(layout.format(loggingEvent)).toBe('test');
      });

      it('%m - simple', function(){
        var layout = new log4js.PatternLayout('%m');
        expect(layout.format(loggingEvent)).toBe('1 2');
      });

      it('%m{0} - with valid specifier', function(){
        var layout = new log4js.PatternLayout('%m{0}');
        expect(layout.format(loggingEvent)).toBe('1 2');
      });

      it('%m{invalid} - with invalid specifier', function(){
        var handleErrorSpy = spyOn(helper, 'handleError');
        var layout = new log4js.PatternLayout('%m{invalid}');
        expect(layout.format(loggingEvent)).toBe('1 2');
        expect(handleErrorSpy).toHaveBeenCalledWith('PatternLayout.format: invalid specifier "invalid" for conversion character "m" - should be a number');
      });

      it('%c - simple', function(){
        var layout = new log4js.PatternLayout('%c');
        expect(layout.format(loggingEvent)).toBe('layout.pattern.test');
      });

      it('%c{2} - with valid specifier', function(){
        var layout = new log4js.PatternLayout('%c{2}');
        expect(layout.format(loggingEvent)).toBe('pattern.test');
      });

      it('%c{4} - with invalid specifier', function(){
        var layout = new log4js.PatternLayout('%c{4}');
        expect(layout.format(loggingEvent)).toBe('layout.pattern.test');
      });

      it('%d - simple', function(){
        var layout = new log4js.PatternLayout('%d');
        expect(layout.format(loggingEvent)).toBe('1923-04-23 00:00:00,000');
      });

      it('%d{ISO8601} - with valid specifier', function(){
        var layout = new log4js.PatternLayout('%d{ISO8601}');
        expect(layout.format(loggingEvent)).toBe('1923-04-23 00:00:00,000');
      });

      it('%d{ABSOLUTE} - with valid specifier', function(){
        var layout = new log4js.PatternLayout('%d{ABSOLUTE}');
        expect(layout.format(loggingEvent)).toBe('00:00:00,000');
      });

      it('%d{DATE} - with valid specifier', function(){
        var layout = new log4js.PatternLayout('%d{DATE}');
        expect(layout.format(loggingEvent)).toBe('23 Apr 1923 00:00:00,000');
      });

      it('%d{TEST} - with invalid specifier', function(){
        var layout = new log4js.PatternLayout('%d{TEST}');
        expect(layout.format(loggingEvent)).toBe('');
      });

      it('%n', function(){
        var layout = new log4js.PatternLayout('%n');
        expect(layout.format(loggingEvent)).toBe(helper.newLine);
      });

      it('%p', function(){
        var layout = new log4js.PatternLayout('%p');
        expect(layout.format(loggingEvent)).toBe('TRACE');
      });

      it('%r', function(){
        var layout = new log4js.PatternLayout('%r');
        expect(layout.format(loggingEvent)).toBe('' + loggingEvent.timeStamp.getDifference(log4js.applicationStartDate));
      });

      it('%%', function(){
        var layout = new log4js.PatternLayout('%%');
        expect(layout.format(loggingEvent)).toBe('%');
      });

      it('%l', function(){
        var handleErrorSpy = spyOn(helper, 'handleError');
        var layout = new log4js.PatternLayout('%l');
        expect(layout.format(loggingEvent)).toBe('');
        expect(handleErrorSpy).toHaveBeenCalledWith('Could not apply "l" pattern because no stack is available');
      });

      it('%6p - padding right', function(){
        var layout = new log4js.PatternLayout('%6p');
        expect(layout.format(loggingEvent)).toBe(' TRACE');
      });

      it('%-6p - padding left', function(){
        var layout = new log4js.PatternLayout('%-6p');
        expect(layout.format(loggingEvent)).toBe('TRACE ');
      });

      it('%.3p - truncation', function(){
        var layout = new log4js.PatternLayout('%.3p');
        expect(layout.format(loggingEvent)).toBe('ACE');
      });

      it('%.7p - truncation', function(){
        var layout = new log4js.PatternLayout('%.7p');
        expect(layout.format(loggingEvent)).toBe('TRACE');
      });

      it('%M', function(){
        var layout = new log4js.PatternLayout('%M');
        expect(layout.format(loggingEvent)).toBe('%M');
      });

      xit('%f', function(){
        var layout = new log4js.PatternLayout('%f');
        expect(layout.format(loggingEvent)).toBe('%f');
      });

    });

  });
});