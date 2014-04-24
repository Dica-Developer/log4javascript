/*global define, describe, it, xit, expect, spyOn, beforeEach, jasmine*/
define(['helper', 'log4js', 'logger', 'layout'], function (helper, log4js, Logger) {
  'use strict';

  describe('#Layout', function () {

    describe('prototypes', function(){
      var layout = null;
      var defaults = {
        loggerKey: 'logger',
        timeStampKey: 'timestamp',
        millisecondsKey: 'milliseconds',
        levelKey: 'level',
        messageKey: 'message',
        exceptionKey: 'exception',
        urlKey: 'url'
      };

      beforeEach(function () {
        layout = new log4js.Layout();
      });

      it('check defaults', function () {
        expect(layout.defaults).toEqual(defaults);
      });

      it('prototypes should be same as defaults on initialization', function () {
        expect(layout.loggerKey).toBe(defaults.loggerKey);
        expect(layout.timeStampKey).toBe(defaults.timeStampKey);
        expect(layout.millisecondsKey).toBe(defaults.millisecondsKey);
        expect(layout.levelKey).toBe(defaults.levelKey);
        expect(layout.messageKey).toBe(defaults.messageKey);
        expect(layout.exceptionKey).toBe(defaults.exceptionKey);
        expect(layout.urlKey).toBe(defaults.urlKey);
        expect(layout.loggerKey).toBe(defaults.loggerKey);
      });

      it('check other prototypes', function () {
        expect(layout.batchHeader).toBe('');
        expect(layout.batchFooter).toBe('');
        expect(layout.batchSeparator).toBe('');
        expect(layout.returnsPostData).toBe(false);
        expect(layout.overrideTimeStampsSetting).toBe(false);
        expect(layout.useTimeStampsInMilliseconds).toBe(null);
        expect(layout.customFields).toEqual([]);
      });
    });


    describe('function to override by developing new Appender', function(){
      var layout = null;

      beforeEach(function () {
        layout = new log4js.Layout();
      });

      it('.format should call handle Error if it is not overridden', function(){
        var handleErrorSpy = spyOn(helper, 'handleError');
        layout.format();
        expect(handleErrorSpy).toHaveBeenCalledWith('Layout.format: layout supplied has no format() method');
      });

      it('.ignoresThrowable should call handle Error if it is not overridden', function(){
        var handleErrorSpy = spyOn(helper, 'handleError');
        layout.ignoresThrowable();
        expect(handleErrorSpy).toHaveBeenCalledWith('Layout.ignoresThrowable = layout supplied has no ignoresThrowable() method');
      });

      it('.allowBatching should return true per default', function(){
        expect(layout.allowBatching()).toBe(true);
      });

      it('.getContentType should return "text/plain" per default', function(){
        expect(layout.getContentType()).toBe('text/plain');
      });

      it('.toString should call handleError if not overridden', function(){
        var handleErrorSpy = spyOn(helper, 'handleError');
        layout.toString();
        expect(handleErrorSpy).toHaveBeenCalledWith('Layout.toString: all layouts must override this method');
      });

    });

    describe('.setTimeStampsInMilliseconds', function(){
      var layout = null;

      beforeEach(function () {
        layout = new log4js.Layout();
      });

      it('Should set .overrideTimeStampsSetting to true if called', function(){
        layout.setTimeStampsInMilliseconds(true);
        expect(layout.overrideTimeStampsSetting).toBe(true);
      });

      it('Should set .useTimeStampsInMilliseconds even if given parameter not a boolean', function(){
        layout.setTimeStampsInMilliseconds(0);
        expect(layout.useTimeStampsInMilliseconds).toBe(false);
        layout.setTimeStampsInMilliseconds('true');
        expect(layout.useTimeStampsInMilliseconds).toBe(true);
      });

    });

    describe('.isTimeStampsInMilliseconds', function(){
      var layout = null;

      beforeEach(function () {
        layout = new log4js.Layout();
      });

      it('Should return "null" per default', function(){
        expect(layout.isTimeStampsInMilliseconds()).toBe(null);
      });

      it('Should return .useTimeStampsInMilliseconds if .overrideTimeStampsSetting set to true', function(){
        layout.setTimeStampsInMilliseconds('true');
        expect(layout.isTimeStampsInMilliseconds()).toBe(layout.useTimeStampsInMilliseconds);
        layout.setTimeStampsInMilliseconds(0);
        expect(layout.isTimeStampsInMilliseconds()).toBe(layout.useTimeStampsInMilliseconds);
      });

    });

    describe('.getTimeStampValue', function(){
      var layout = null,
        loggingEvent = null,
        logger = null,
        date = null,
        seconds = null,
        milliSeconds = null;

      beforeEach(function () {
        layout = new log4js.Layout();
        logger = new Logger('test');
        date = new Date();
        milliSeconds = date.getTime();
        seconds = Math.floor(milliSeconds / 1000);
        loggingEvent = new Logger.LoggingEvent(logger, date, log4js.Level.TRACE, ['1'], null);
      });

      it('Should return value in seconds if .isTimeStampsInMilliseconds set to false', function(){
        expect(layout.getTimeStampValue(loggingEvent)).toBe(seconds);
      });

      it('Should return value in milliSeconds if .isTimeStampsInMilliseconds set to true', function(){
        layout.setTimeStampsInMilliseconds(true);
        expect(layout.getTimeStampValue(loggingEvent)).toBe(milliSeconds);
      });

    });

    describe('.getDataValues', function(){
      var layout = null,
        loggingEvent = null,
        logger = null,
        date = null,
        seconds = null,
        milliSeconds = null;

      beforeEach(function () {
        layout = new log4js.Layout();
        logger = new Logger('test');
        date = new Date();
        milliSeconds = date.getTime();
        seconds = Math.floor(milliSeconds / 1000);
        loggingEvent = new Logger.LoggingEvent(logger, date, log4js.Level.TRACE, ['1'], null);
      });

      it('Check default return values', function(){
        //TODO url could force failing tests on other machines
        expect(layout.getDataValues(loggingEvent, false)).toEqual([
          [ 'logger', 'test' ],
          [ 'timestamp', seconds ],
          [ 'level', 'TRACE' ],
          [ 'url', 'http://localhost:9876/context.html' ],
          [ 'message', ['1'] ],
          [ 'milliseconds', loggingEvent.milliseconds ]
        ]);
      });

      it('Check default return values with timestamp in millisecond', function(){
        layout.setTimeStampsInMilliseconds(true);
        //TODO url could force failing tests on other machines
        expect(layout.getDataValues(loggingEvent, false)).toEqual([
          [ 'logger', 'test' ],
          [ 'timestamp', milliSeconds ],
          [ 'level', 'TRACE' ],
          [ 'url', 'http://localhost:9876/context.html' ],
          [ 'message', ['1'] ]
        ]);
      });

      it('Check default return values with combinedMessages true', function(){
        //TODO url could force failing tests on other machines
        expect(layout.getDataValues(loggingEvent, true)).toEqual([
          [ 'logger', 'test' ],
          [ 'timestamp', seconds ],
          [ 'level', 'TRACE' ],
          [ 'url', 'http://localhost:9876/context.html' ],
          [ 'message', '1' ],
          [ 'milliseconds', loggingEvent.milliseconds ]
        ]);
      });

      //TODO this test affects next test setup ".hasCustomFields should return "false" per default"
      it('Check default return values with .customFields', function(){
        loggingEvent.exception = {
          message: 'Test message',
          lineNumber: 23,
          fileName: 'test.js'
        };
        //TODO url could force failing tests on other machines
        expect(layout.getDataValues(loggingEvent, false)).toEqual([
          [ 'logger', 'test' ],
          [ 'timestamp', seconds ],
          [ 'level', 'TRACE' ],
          [ 'url', 'http://localhost:9876/context.html' ],
          [ 'message', ['1'] ],
          [ 'milliseconds', loggingEvent.milliseconds ],
          [ 'exception', 'Exception: Test message on line number 23 in file test.js' ]
        ]);
      });

      //TODO this test affects next test setup ".hasCustomFields should return "false" per default"
      it('Check default return values with .customFields as function should call that', function(){
        var customFieldAsFunction = jasmine.createSpy('customField');

        layout.setCustomField('test', customFieldAsFunction);
        layout.getDataValues(loggingEvent, false);
        //TODO url could force failing tests on other machines
        expect(customFieldAsFunction).toHaveBeenCalled();
      });

      //TODO this test affects next test setup ".hasCustomFields should return "false" per default"
      it('Check default return values with exception set to loggingEvent', function(){
        var customFieldAsFunction = jasmine.createSpy('customField');

        layout.setCustomField('test', customFieldAsFunction);
        layout.getDataValues(loggingEvent, false);
        //TODO url could force failing tests on other machines
        expect(customFieldAsFunction).toHaveBeenCalled();
      });

    });

    describe('.setCustomField & .hasCustomFields', function(){
      var layout = null;

      beforeEach(function () {
        layout = new log4js.Layout();
      });
      //TODO affected by previous test "Check default return values with .customFields"
      xit('.hasCustomFields should return "false" per default', function(){
        expect(layout.hasCustomFields()).toBe(false);
      });

      it('.setCustomFields should call handleError if name and/or value is not set', function(){
        var handleErrorSpy = spyOn(helper, 'handleError');
        layout.setCustomField();
        expect(handleErrorSpy).toHaveBeenCalledWith('layout.setCustomFields: name and value must be defined');
      });

      it('.setCustomFields should call handleError if name is not "String "', function(){
        var handleErrorSpy = spyOn(helper, 'handleError');
        layout.setCustomField([], {});
        expect(handleErrorSpy).toHaveBeenCalledWith('layout.setCustomFields: name must be "String"');
      });

      it('.setCustomFields should apply give parameter to .customFields', function(){
        layout.setCustomField('test', 'bla');
        expect(layout.customFields[0]).toEqual({
          'name': 'test',
          'value': 'bla'
        });
      });

      it('.setCustomFields should update value if name already exist at .customFields', function(){
        layout.setCustomField('test', 'blubb');
        expect(layout.customFields[0]).toEqual({
          'name': 'test',
          'value': 'blubb'
        });
      });

      it('.setCustomFields should add new customField if name not exist', function(){
        layout.setCustomField('test2', 'bla');
        expect(layout.customFields[1]).toEqual({
          'name': 'test2',
          'value': 'bla'
        });
      });

      it('.hasCustomFields should return "true" if one set', function(){
        expect(layout.hasCustomFields()).toBe(true);
      });

    });

  });
});