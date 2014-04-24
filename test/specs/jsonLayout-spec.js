/*global define, describe, it, xit, expect, beforeEach*/
define(['helper', 'log4js', 'logger', 'layout.json'], function (helper, log4js, Logger) {
  'use strict';

  describe('#JsonLayout', function () {

    var layout = null, logger = null, loggingEvent = null;

    beforeEach(function () {
      layout = new log4js.JsonLayout();
      logger = new log4js.getLogger('test');
      loggingEvent = new Logger.LoggingEvent(logger, new Date(), log4js.Level.TRACE, ['1'], null);
    });

    it('.toString', function () {
      expect(layout.toString()).toBe('JsonLayout');
    });

    it('.ignoresThrowable', function () {
      expect(layout.ignoresThrowable()).toBe(false);
    });

    it('.getContentType', function () {
      expect(layout.getContentType()).toBe('application/json');
    });

    describe('with prettyPrint', function () {
      var layout = null, logger = null, loggingEvent = null,
        date = null, milliSeconds = null, seconds = null;

      beforeEach(function () {
        layout = new log4js.JsonLayout(true, true);
        logger = new log4js.getLogger('test');
        date = new Date();
        milliSeconds = date.getTime();
        seconds = Math.floor(milliSeconds / 1000);
        loggingEvent = new Logger.LoggingEvent(logger, date, log4js.Level.TRACE, ['1'], null);

      });

      it('.isReadable', function () {
        expect(layout.isReadable()).toBe(true);
      });

      it('.batchHeader', function () {
        expect(layout.batchHeader).toBe('[' + helper.newLine);
      });

      it('.batchFooter', function () {
        expect(layout.batchFooter).toBe(']' + helper.newLine);
      });

      it('.batchSeparator', function () {
        expect(layout.batchSeparator).toBe(',' + helper.newLine);
      });

      it('.colon', function () {
        expect(layout.colon).toBe(': ');
      });

      it('.tab', function () {
        expect(layout.tab).toBe('\t');
      });

      it('.lineBreak', function () {
        expect(layout.lineBreak).toBe(helper.newLine);
      });


      //TODO needs further investigation fails with unknown reason maybe special chars
      xit('.format', function () {

        var jsonExpample = '{ ' + helper.newLine +
          '\t"logger": "test",' + helper.newLine +
          '\t"timestamp": ' + seconds + ',' + helper.newLine +
          '\t"level": "TRACE",' + helper.newLine +
          '\t"url": "http://localhost:9876/context.html",' + helper.newLine +
          '\t"message": "1",' + helper.newLine +
          '\t"milliseconds": ' + loggingEvent.milliseconds + helper.newLine +
        '}' + helper.newLine;

//        var jsonString = JSON.stringify(jsonExpample, null, '\t');

        console.log(layout.format(loggingEvent));
        console.log(jsonExpample);

        expect(layout.format(loggingEvent)).toEqual(jsonExpample);
      });
    });

    describe('without prettyPrint', function () {
      var layout = null, logger = null, loggingEvent = null,
        date = null, milliSeconds = null, seconds = null;

      beforeEach(function () {
        layout = new log4js.JsonLayout(false, true);
        logger = new log4js.getLogger('test');
        date = new Date();
        milliSeconds = date.getTime();
        seconds = Math.floor(milliSeconds / 1000);
        loggingEvent = new Logger.LoggingEvent(logger, date, log4js.Level.TRACE, ['1'], null);
      });

      it('.isReadable', function () {
        expect(layout.isReadable()).toBe(false);
      });

      it('.isCombinedMessages', function () {
        expect(layout.isCombinedMessages()).toBe(true);
      });

      it('.batchHeader', function () {
        expect(layout.batchHeader).toBe('[');
      });

      it('.batchFooter', function () {
        expect(layout.batchFooter).toBe(']');
      });

      it('.batchSeparator', function () {
        expect(layout.batchSeparator).toBe(',');
      });

      it('.colon', function () {
        expect(layout.colon).toBe(':');
      });

      it('.tab', function () {
        expect(layout.tab).toBe('');
      });

      it('.lineBreak', function () {
        expect(layout.lineBreak).toBe('');
      });

      it('.format', function () {

        var jsonExpample = {
          'logger': 'test',
          'timestamp': seconds,
          'level': 'TRACE',
          'url': 'http://localhost:9876/context.html',
          'message': '1',
          'milliseconds': loggingEvent.milliseconds
        };

        expect(layout.format(loggingEvent)).toBe(JSON.stringify(jsonExpample));
      });
    });

  });
});