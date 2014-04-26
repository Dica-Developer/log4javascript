/*global define, describe, it, expect, beforeEach*/
define(['helper', 'log4js', 'logger', 'layout.xml'], function (helper, log4js, Logger) {
  'use strict';

  describe('#SimpleLayout', function () {

    var layout, logger, loggingEvent, date;

    beforeEach(function () {
      layout = new log4js.XmlLayout();
      logger = log4js.getLogger('test');
      date = new Date();
    });

    it('.toString', function () {
      expect(layout.toString()).toBe('XmlLayout');
    });

    it('.ignoresThrowable', function () {
      expect(layout.ignoresThrowable()).toBe(false);
    });

    it('.getContentType', function () {
      expect(layout.getContentType()).toBe('text/xml');
    });

    it('.isCombinedMessages', function () {
      expect(layout.isCombinedMessages()).toBeTruthy();
    });

    it('.format', function () {
      loggingEvent = new Logger.LoggingEvent(logger, date, log4js.Level.TRACE, ['1'], null);
      expect(layout.format(loggingEvent)).toBe(
          '<log4javascript:event logger="test" timestamp="'+
            loggingEvent.timeStampInSeconds +
            '" milliseconds="'+
            loggingEvent.milliseconds +
            '" level="TRACE">' +
            helper.newLine +
            '<log4javascript:message><![CDATA[1]]></log4javascript:message></log4javascript:event>' +
            helper.newLine
      );
    });

    it('.format with date', function () {
      loggingEvent = new Logger.LoggingEvent(logger, date, log4js.Level.TRACE, [date], null);
      expect(layout.format(loggingEvent)).toBe(
          '<log4javascript:event logger="test" timestamp="'+
          loggingEvent.timeStampInSeconds +
          '" milliseconds="'+
          loggingEvent.milliseconds +
          '" level="TRACE">' +
          helper.newLine +
          '<log4javascript:message><![CDATA[' +
          date.toString() +
          ']]></log4javascript:message></log4javascript:event>' +
          helper.newLine
      );
    });

    it('.format with exception', function () {
      var error = new Error('Test Error');
      loggingEvent = new Logger.LoggingEvent(logger, date, log4js.Level.TRACE, ['1'], error);
      expect(layout.format(loggingEvent)).toBe(
          '<log4javascript:event logger="test" timestamp="'+
          loggingEvent.timeStampInSeconds +
          '" milliseconds="'+
          loggingEvent.milliseconds +
          '" level="TRACE">' +
          helper.newLine +
          '<log4javascript:message><![CDATA[1]]></log4javascript:message><log4javascript:exception><![CDATA[Exception: Test Error]]></log4javascript:exception>' +
          helper.newLine +
          '</log4javascript:event>' +
          helper.newLine
      );
    });
  });
});