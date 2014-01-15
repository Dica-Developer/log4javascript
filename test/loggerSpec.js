/*global define, describe, it, xit, expect, spyOn, afterEach, beforeEach*/
define(['params', 'level', 'logger'], function () {
  'use strict';

  describe('#Logger', function () {

    var logger = null;

    beforeEach(function () {
      logger = new Logger();
    });

    it('All #entryPoints should be true', function () {
      expect(logger.trace.isEntryPoint).toBe(true);
      expect(logger.debug.isEntryPoint).toBe(true);
      expect(logger.info.isEntryPoint).toBe(true);
      expect(logger.warn.isEntryPoint).toBe(true);
      expect(logger.error.isEntryPoint).toBe(true);
      expect(logger.fatal.isEntryPoint).toBe(true);
    });

    describe('.is<Level>Enabled should call .isEnabledFor', function () {
      var isEnabledForSpy = null;

      beforeEach(function () {
        isEnabledForSpy = spyOn(logger, 'isEnabledFor');
      });

      it('TRACE', function () {
        logger.isTraceEnabled();
        expect(isEnabledForSpy).toHaveBeenCalled();
      });

      it('DEBUG', function () {
        logger.isDebugEnabled();
        expect(isEnabledForSpy).toHaveBeenCalled();
      });

      it('INFO', function () {
        logger.isInfoEnabled();
        expect(isEnabledForSpy).toHaveBeenCalled();
      });

      it('WARN', function () {
        logger.isWarnEnabled();
        expect(isEnabledForSpy).toHaveBeenCalled();
      });

      it('ERROR', function () {
        logger.isErrorEnabled();
        expect(isEnabledForSpy).toHaveBeenCalled();
      });

      it('FATAL', function () {
        logger.isFatalEnabled();
        expect(isEnabledForSpy).toHaveBeenCalled();
      });

    });

    describe('.is<Level>Enabled should return correct value', function () {

      it('Level.ALL', function () {
        logger.setLevel(Level.ALL);
        logger.isTraceEnabled();
        expect(logger.isTraceEnabled()).toBe(true);
        expect(logger.isDebugEnabled()).toBe(true);
        expect(logger.isInfoEnabled()).toBe(true);
        expect(logger.isWarnEnabled()).toBe(true);
        expect(logger.isErrorEnabled()).toBe(true);
        expect(logger.isFatalEnabled()).toBe(true);
      });

      it('Level.TRACE', function () {
        logger.setLevel(Level.TRACE);
        logger.isTraceEnabled();
        expect(logger.isTraceEnabled()).toBe(true);
        expect(logger.isDebugEnabled()).toBe(true);
        expect(logger.isInfoEnabled()).toBe(true);
        expect(logger.isWarnEnabled()).toBe(true);
        expect(logger.isErrorEnabled()).toBe(true);
        expect(logger.isFatalEnabled()).toBe(true);
      });

      it('DEBUG', function () {
        logger.setLevel(Level.DEBUG);
        logger.isTraceEnabled();
        expect(logger.isTraceEnabled()).toBe(false);
        expect(logger.isDebugEnabled()).toBe(true);
        expect(logger.isInfoEnabled()).toBe(true);
        expect(logger.isWarnEnabled()).toBe(true);
        expect(logger.isErrorEnabled()).toBe(true);
        expect(logger.isFatalEnabled()).toBe(true);
      });

      it('INFO', function () {
        logger.setLevel(Level.INFO);
        logger.isTraceEnabled();
        expect(logger.isTraceEnabled()).toBe(false);
        expect(logger.isDebugEnabled()).toBe(false);
        expect(logger.isInfoEnabled()).toBe(true);
        expect(logger.isWarnEnabled()).toBe(true);
        expect(logger.isErrorEnabled()).toBe(true);
        expect(logger.isFatalEnabled()).toBe(true);
      });

      it('WARN', function () {
        logger.setLevel(Level.WARN);
        logger.isTraceEnabled();
        expect(logger.isTraceEnabled()).toBe(false);
        expect(logger.isDebugEnabled()).toBe(false);
        expect(logger.isInfoEnabled()).toBe(false);
        expect(logger.isWarnEnabled()).toBe(true);
        expect(logger.isErrorEnabled()).toBe(true);
        expect(logger.isFatalEnabled()).toBe(true);
      });

      it('ERROR', function () {
        logger.setLevel(Level.ERROR);
        logger.isTraceEnabled();
        expect(logger.isTraceEnabled()).toBe(false);
        expect(logger.isDebugEnabled()).toBe(false);
        expect(logger.isInfoEnabled()).toBe(false);
        expect(logger.isWarnEnabled()).toBe(false);
        expect(logger.isErrorEnabled()).toBe(true);
        expect(logger.isFatalEnabled()).toBe(true);
      });

      it('FATAL', function () {
        logger.setLevel(Level.FATAL);
        logger.isTraceEnabled();
        expect(logger.isTraceEnabled()).toBe(false);
        expect(logger.isDebugEnabled()).toBe(false);
        expect(logger.isInfoEnabled()).toBe(false);
        expect(logger.isWarnEnabled()).toBe(false);
        expect(logger.isErrorEnabled()).toBe(false);
        expect(logger.isFatalEnabled()).toBe(true);
      });

    });

    describe('.setLevel', function () {

      xit('Should throw exception (call handleError) if Level not instance of Level', function () {
        var handleErrorSpy = spyOn(handleError);
        logger.setLevel(0);
        expect(handleErrorSpy).toHaveBeenCalled();
      })

    });

    describe('.toString', function () {
      it('should return correct name', function () {
        expect(logger.toString()).toBe('Logger[undefined]');
      });
    });

    describe('.<Level> should call .log with correct arguments', function () {
      var logSpy = null;
      beforeEach(function () {
        logSpy = spyOn(logger, 'log');
      });

      it('logger.trace', function () {
        logger.trace();
        expect(logSpy).toHaveBeenCalledWith(Level.TRACE, {});
      });

      it('logger.debug', function () {
        logger.debug();
        expect(logSpy).toHaveBeenCalledWith(Level.DEBUG, {});
      });

      it('logger.info', function () {
        logger.info();
        expect(logSpy).toHaveBeenCalledWith(Level.INFO, {});
      });

      it('logger.warn', function () {
        logger.warn();
        expect(logSpy).toHaveBeenCalledWith(Level.WARN, {});
      });

      it('logger.error', function () {
        logger.error();
        expect(logSpy).toHaveBeenCalledWith(Level.ERROR, {});
      });

      it('logger.fatal', function () {
        logger.fatal();
        expect(logSpy).toHaveBeenCalledWith(Level.FATAL, {});
      });

    });

    describe('.log', function () {
      var logger = null;
      var callAppendersSpy = null;

      beforeEach(function () {
        logger = new Logger();
        logger.setLevel(Level.TRACE);
        callAppendersSpy = spyOn(logger, 'callAppenders');
      });

      it('If enabled and called with Level should call .callAppenders', function () {
        logger.log(Level.TRACE, 1);
        expect(callAppendersSpy).toHaveBeenCalled();
      });

      it('If enabled = false should not call .callAppenders', function () {
        enabled = false;
        logger.log(Level.TRACE, 1);
        expect(callAppendersSpy).not.toHaveBeenCalled();
        enabled = true;
      });

      //will crash phantomjs maybe because of new Error()
      xit('If lastParam is an exception .callAppenders should called with exception', function () {
        var error = new Error();
        var timeStamp = new Date();
        var loggingEvent = new LoggingEvent(this, timeStamp, Level.TRACE, [1], error);
        logger.log(Level.TRACE, 1, error);
        expect(callAppendersSpy).toHaveBeenCalledWith(loggingEvent);
      });

    });

    describe('.getEffectiveLevel', function(){
      var logger = null;

      beforeEach(function () {
        logger = new Logger();
      });

      it('should return Level.TRACE', function(){
        logger.setLevel(Level.TRACE);
        expect(logger.getEffectiveLevel()).toBe(Level.TRACE);
      });

      it('should return null', function(){
        expect(logger.getEffectiveLevel()).toBe(null);
      });
    });

    describe('.addChild', function(){

      var logger = null;
      var childLogger = null;

      beforeEach(function () {
        logger = new Logger();
        childLogger = new Logger();
      });

      it('Should call .invalidateAppenderCache on childLogger', function(){
        var childLoggerSpy = spyOn(childLogger, 'invalidateAppenderCache');

        logger.addChild(childLogger);
        expect(childLoggerSpy).toHaveBeenCalled();
      });

      it('childLogger.parent should be logger', function(){
        logger.addChild(childLogger);
        expect(childLogger.parent).toBe(logger);
      });

      it('logger.children.length should be 1', function(){
        logger.addChild(childLogger);
        expect(logger.children.length).toBe(1);
      });

    });


  });

  describe('#LoggingEvent', function(){

    var loggingEvent = null;
    var logger = null;

    beforeEach(function () {
      logger = new Logger();
    });

    it('.getString should return LoggingEvent[TRACE]', function(){
      loggingEvent = new LoggingEvent(logger, new Date(), Level.TRACE, ['1'], null);
      expect(loggingEvent.toString()).toBe('LoggingEvent[TRACE]');
    });

    it('.getCombinedMessages should return "1"', function(){
      loggingEvent = new LoggingEvent(logger, new Date(), Level.TRACE, ['1'], null);
      expect(loggingEvent.getCombinedMessages()).toBe('1');
    });

    it('.getCombinedMessages should return "1 -new Line- 2"', function(){
      loggingEvent = new LoggingEvent(logger, new Date(), Level.TRACE, ['1', '2'], null);
      expect(loggingEvent.getCombinedMessages()).toBe('1\r\n2');
    });

  });

});