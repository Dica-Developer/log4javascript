/*global define, describe, it, expect, beforeEach, spyOn, xit*/
define(['helper', 'log4js', 'logger'], function (helper, log4js, Logger) {
  'use strict';

  describe('log4js should defined and initiate with all Appender and Layouts', function () {

    it('log4js should be defined', function () {
      expect(log4js).toBeDefined();
    });

    describe('log4js prototypes should defined', function () {

      it('log4js.Level should be defined', function () {
        expect(log4js.Level).toBeDefined();
      });

      it('log4js.evalInScope should be defined', function () {
        expect(log4js.evalInScope).toBeDefined();
      });

      it('log4js.eventListeners should be defined', function () {
        expect(log4js.eventListeners).toBeDefined();
      });

      it('log4js.eventTypes should be defined', function () {
        expect(log4js.eventTypes).toBeDefined();
      });

      it('log4js.getDefaultLogger should be defined', function () {
        expect(log4js.getDefaultLogger).toBeDefined();
      });

      it('log4js.getLogger should be defined', function () {
        expect(log4js.getLogger).toBeDefined();
      });

      it('log4js.getNullLogger should be defined', function () {
        expect(log4js.getNullLogger).toBeDefined();
      });

      it('log4js.getRootLogger should be defined', function () {
        expect(log4js.getRootLogger).toBeDefined();
      });

      it('log4js.isEnabled should be defined', function () {
        expect(log4js.isEnabled).toBeDefined();
      });

      it('log4js.isTimeStampsInMilliseconds should be defined', function () {
        expect(log4js.isTimeStampsInMilliseconds).toBeDefined();
      });

      it('log4js.resetConfiguration should be defined', function () {
        expect(log4js.resetConfiguration).toBeDefined();
      });

      it('log4js.setEnabled should be defined', function () {
        expect(log4js.setEnabled).toBeDefined();
      });

      it('log4js.setShowStackTraces should be defined', function () {
        expect(log4js.setShowStackTraces).toBeDefined();
      });

      it('log4js.setTimeStampsInMilliseconds should be defined', function () {
        expect(log4js.setTimeStampsInMilliseconds).toBeDefined();
      });
    });

    describe('log4js Appender should defined', function () {

      it('log4js.Appender should be defined', function () {
        expect(log4js.Appender).toBeDefined();
      });

    });
  });

  describe('log4js.Level', function () {
    var tmpLevel = {
      OFF: null,
      FATAL: null,
      ERROR: null,
      WARN: null,
      INFO: null,
      DEBUG: null,
      TRACE: null,
      ALL: null
    };
    var levelKeys = [];
    beforeEach(function () {
      tmpLevel.OFF = log4js.Level.OFF;
      tmpLevel.FATAL = log4js.Level.FATAL;
      tmpLevel.ERROR = log4js.Level.ERROR;
      tmpLevel.WARN = log4js.Level.WARN;
      tmpLevel.INFO = log4js.Level.INFO;
      tmpLevel.DEBUG = log4js.Level.DEBUG;
      tmpLevel.TRACE = log4js.Level.TRACE;
      tmpLevel.ALL = log4js.Level.ALL;
      levelKeys = Object.keys(tmpLevel);
    });

    it('log4js.Level should be defined', function () {
      expect(log4js.Level).toBeDefined();
    });

    it('log4js.Level.ALL should be defined', function () {
      expect(tmpLevel.ALL).toBeDefined();
    });

    it('log4js.Level.ALL should be defined', function () {
      expect(tmpLevel.ALL).toBeDefined();
    });

    it('log4js.Level.FATAL should be defined', function () {
      expect(tmpLevel.FATAL).toBeDefined();
    });

    it('log4js.Level.ERROR should be defined', function () {
      expect(tmpLevel.ERROR).toBeDefined();
    });

    it('log4js.Level.WARN should be defined', function () {
      expect(tmpLevel.WARN).toBeDefined();
    });

    it('log4js.Level.DEBUG should be defined', function () {
      expect(tmpLevel.DEBUG).toBeDefined();
    });

    it('log4js.Level.TRACE should be defined', function () {
      expect(tmpLevel.TRACE).toBeDefined();
    });

    it('log4js.Level.INFO should be defined', function () {
      expect(tmpLevel.INFO).toBeDefined();
    });

    it('log4js.Level.OFF should be defined', function () {
      expect(tmpLevel.OFF).toBeDefined();
    });

    it('log4js.Level.<Level>.level should be Number', function () {
      for (var i = 0, length = levelKeys.length; i < length; i++) {
        expect(typeof tmpLevel[levelKeys[i]].level).toBe('number');
      }
    });

    it('log4js.Level.<Level>.name should be String', function () {
      for (var i = 0, length = levelKeys.length; i < length; i++) {
        expect(typeof tmpLevel[levelKeys[i]].name).toBe('string');
      }
    });

    it('log4js.Level.<Level>.name should be the same as the identifier', function () {
      for (var i = 0, length = levelKeys.length; i < length; i++) {
        expect(tmpLevel[levelKeys[i]].name).toBe(levelKeys[i]);
      }
    });
  });

  describe('log4js.setTimeStampsInMilliseconds', function(){

    it('Should set to false', function(){
      log4js.setTimeStampsInMilliseconds(false);
      expect(log4js.useTimeStampsInMilliseconds).toBeFalsy();
      log4js.setTimeStampsInMilliseconds(true);
      expect(log4js.useTimeStampsInMilliseconds).toBeTruthy();
      log4js.setTimeStampsInMilliseconds(0);
      expect(log4js.useTimeStampsInMilliseconds).toBeFalsy();
    });

    it('Should set to true', function(){
      log4js.setTimeStampsInMilliseconds(true);
      expect(log4js.useTimeStampsInMilliseconds).toBeTruthy();
      log4js.setTimeStampsInMilliseconds(false);
      expect(log4js.useTimeStampsInMilliseconds).toBeFalsy();
      log4js.setTimeStampsInMilliseconds(1);
      expect(log4js.useTimeStampsInMilliseconds).toBeTruthy();
    });

  });

  describe('log4js.isTimeStampsInMilliseconds', function(){

    it('Should return false', function(){
      log4js.setTimeStampsInMilliseconds(false);
      expect(log4js.isTimeStampsInMilliseconds()).toBeFalsy();
    });

    it('Should return true', function(){
      log4js.setTimeStampsInMilliseconds(true);
      expect(log4js.isTimeStampsInMilliseconds()).toBeTruthy();
    });

  });

  describe('log4js.setShowStackTraces', function(){

    it('Should set to false', function(){
      log4js.setShowStackTraces(false);
      expect(log4js.showStackTraces).toBeFalsy();
      log4js.setShowStackTraces(true);
      expect(log4js.showStackTraces).toBeTruthy();
      log4js.setShowStackTraces(0);
      expect(log4js.showStackTraces).toBeFalsy();
    });

    it('Should set to true', function(){
      log4js.setShowStackTraces(true);
      expect(log4js.showStackTraces).toBeTruthy();
      log4js.setShowStackTraces(false);
      expect(log4js.showStackTraces).toBeFalsy();
      log4js.setShowStackTraces(1);
      expect(log4js.showStackTraces).toBeTruthy();
    });

  });

  describe('log4js.getRootLogger', function(){

    it('Should return root logger', function(){
      var rootLogger = log4js.getRootLogger();
      expect(rootLogger.name).toBe('root');
      expect(rootLogger.getLevel()).toBe(log4js.Level.DEBUG);
    });

  });

  describe('log4js.getLogger', function(){

    it('Should throw error if name is not string', function(){
      var errorSpy = spyOn(helper, 'handleError');
      log4js.getLogger();
      expect(errorSpy).toHaveBeenCalledWith('Log4js [log4js.core]: getLogger: non-string logger name undefined supplied, returning anonymous logger');
    });

    it('Should return "anonymous" logger if name is not string', function(){
      spyOn(helper, 'handleError');
      var logger = log4js.getLogger();
      expect(logger.name).toBe('[anonymous]');
    });

    it('Should throw error if name is root logger', function(){
      var errorSpy = spyOn(helper, 'handleError');
      log4js.getLogger('root');
      expect(errorSpy).toHaveBeenCalledWith('Log4js [log4js.core]: getLogger: root logger may not be obtained by name');
    });

    //TODO check if 'new Logger()' is called
    xit('Should not call new Logger if logger exist', function(){
      log4js.getLogger('test');
      var loggerSpy = spyOn(Logger);
      log4js.getLogger('test');
      expect(loggerSpy).not.toHaveBeenCalled();
    });

    it('Should correctly add child logger to parents depending on the name', function(){
      var parent = log4js.getLogger('test');
      var child = log4js.getLogger('test.test');
      expect(child.parent).toBe(parent);
    });

  });

  //TODO check if 'new Logger()' is called
  describe('log4js.getNullLogger', function(){
    it('Should add new null logger if not exist', function(){
      var nullLogger = log4js.getNullLogger();
      expect(nullLogger.name).toBe('[null]');
    });
  });
});
