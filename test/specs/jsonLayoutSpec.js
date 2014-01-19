/*global define, describe, it, expect, beforeEach*/
define(['params', 'level', 'layout', 'logger', 'layout.json'], function () {
  'use strict';

  describe('#JsonLayout', function () {

    var layout = null, logger = null, loggingEvent = null;

    beforeEach(function () {
      layout = new JsonLayout();
      logger = new Logger('test');
      loggingEvent = new LoggingEvent(logger, new Date(), Level.TRACE, ['1'], null);
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
        layout = new JsonLayout(true, true);
        logger = new Logger('test');
        date = new Date();
        milliSeconds = date.getTime();
        seconds = Math.floor(milliSeconds / 1000);
        loggingEvent = new LoggingEvent(logger, date, Level.TRACE, ['1'], null);
      });

      it('.isReadable', function () {
        expect(layout.isReadable()).toBe(true);
      });

      it('.batchHeader', function () {
        expect(layout.batchHeader).toBe('[' + newLine);
      });

      it('.batchFooter', function () {
        expect(layout.batchFooter).toBe(']' + newLine);
      });

      it('.batchSeparator', function () {
        expect(layout.batchSeparator).toBe(',' + newLine);
      });

      it('.colon', function () {
        expect(layout.colon).toBe(': ');
      });

      it('.tab', function () {
        expect(layout.tab).toBe('\t');
      });

      it('.lineBreak', function () {
        expect(layout.lineBreak).toBe(newLine);
      });


      //TODO needs further investigation fails with unknown reason maybe special chars
      xit('.format', function () {

        var jsonExpample = '{ ' + newLine +
          '\t"logger": "test",'  + newLine +
          '\t"timestamp": ' + seconds + ',' +newLine +
          '\t"level": "TRACE",' + newLine +
          '\t"url": "http://localhost:9876/context.html",' + newLine +
          '\t"message": "1",' + newLine +
          '\t"milliseconds": ' + loggingEvent.milliseconds + newLine +
        '}' + newLine;

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
        layout = new JsonLayout(false, true);
        logger = new Logger('test');
        date = new Date();
        milliSeconds = date.getTime();
        seconds = Math.floor(milliSeconds / 1000);
        loggingEvent = new LoggingEvent(logger, date, Level.TRACE, ['1'], null);
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