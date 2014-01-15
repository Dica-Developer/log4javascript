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

    });

  });

});