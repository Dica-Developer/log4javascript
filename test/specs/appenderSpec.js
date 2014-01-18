/*global define, describe, it, expect, spyOn, beforeEach*/
define(['params', 'level', 'logger', 'eventSupport', 'layout.pattern', 'appender'], function () {
  'use strict';

  describe('#Appender', function () {

    var appender = null;
    var logger = new Logger();

    beforeEach(function () {
      appender = new Appender();
    });

    it('.toString calls handleError if not overridden', function () {
      var handleErrorSpy = spyOn(window, 'handleError');
      appender.toString();
      expect(handleErrorSpy).toHaveBeenCalledWith('Appender.toString: all appenders must override this method');
    });

    it('.getLayout should return #PatternLayout per default', function () {
      expect(appender.getLayout()).toEqual(new PatternLayout());
    });

    it('.getThreshold should return #Level.ALL per default', function () {
      expect(appender.getThreshold()).toBe(Level.ALL);
    });

    it('.setThreshold should call handleError if give parameter not instance of #Level', function () {
      var handleErrorSpy = spyOn(window, 'handleError');
      appender.toString = function(){
        return 'test';
      };
      appender.setThreshold('ERROR');
      expect(handleErrorSpy).toHaveBeenCalledWith('Appender.setThreshold: threshold supplied to test is not a subclass of Level');
    });

    it('.setThreshold should override .treshhold with given parameter', function () {
      appender.setThreshold(Level.ERROR);
      expect(appender.threshold).toBe(Level.ERROR);
    });

    it('.setLayout should call handleError if give parameter not instance of #Layout', function () {
      var handleErrorSpy = spyOn(window, 'handleError');
      appender.toString = function(){
        return 'test';
      };
      appender.setLayout('Layout');
      expect(handleErrorSpy).toHaveBeenCalledWith('Appender.setLayout: layout supplied to test is not a subclass of Layout');
    });

    it('.setLayout should override .layout with given parameter', function () {
      var layout = new Layout();
      appender.setLayout(layout);
      expect(appender.layout).toBe(layout);
    });

    it('.setAddedToLogger should add logger to loggers', function () {
      appender.setAddedToLogger(logger);
      expect(appender.loggers[0]).toBe(logger);
    });

    it('.setRemovedFromLogger should remove logger from loggers', function () {
      appender.setRemovedFromLogger(logger);
      expect(appender.loggers.length).toBe(0);

    });

    describe('.doAppend', function(){

      var appender = null;
      var appendSpy = null;
      var logger = null;
      var loggingEvent =null;
      beforeEach(function () {
        appender = new Appender();
        appendSpy = spyOn(appender, 'append');
        logger = new Logger();
        loggingEvent = new LoggingEvent(logger, new Date(), Level.TRACE, ['1'], null);
      });

      it('Should not call #Appender.append if enabled false', function(){
        enabled = false;
        appender.doAppend(loggingEvent);
        expect(appendSpy).not.toHaveBeenCalled();
        enabled = true;
      });

      it('Should not call #Appender.append if Level lower then treshhold', function(){
        appender.setThreshold(Level.ERROR);
        appender.doAppend(loggingEvent);
        expect(appendSpy).not.toHaveBeenCalled();
      });

      it('Should call #Appender.append if Level greater/equal then treshhold', function(){
        appender.setThreshold(Level.TRACE);
        appender.doAppend(loggingEvent);
        expect(appendSpy).toHaveBeenCalledWith(loggingEvent);
      });

    });

  });
});