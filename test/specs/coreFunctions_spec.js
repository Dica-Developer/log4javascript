/*global define, describe, it, expect, beforeEach*/
define(['log4javascript'], function(log4javascript){
  'use strict';

  describe('log4js should defined and initiate with all Appender and Layouts', function () {

    it('log4js should be defined', function () {
      expect(log4javascript).toBeDefined();
    });

    describe('log4js prototypes should defined', function () {

      it('log4js.Level should be defined', function () {
        expect(log4javascript.Level).toBeDefined();
      });

      it('log4js.evalInScope should be defined', function () {
        expect(log4javascript.evalInScope).toBeDefined();
      });

      it('log4js.eventListeners should be defined', function () {
        expect(log4javascript.eventListeners).toBeDefined();
      });

      it('log4js.eventTypes should be defined', function () {
        expect(log4javascript.eventTypes).toBeDefined();
      });

      it('log4js.getDefaultLogger should be defined', function () {
        expect(log4javascript.getDefaultLogger).toBeDefined();
      });

      it('log4js.getLogger should be defined', function () {
        expect(log4javascript.getLogger).toBeDefined();
      });

      it('log4js.getNullLogger should be defined', function () {
        expect(log4javascript.getNullLogger).toBeDefined();
      });

      it('log4js.getRootLogger should be defined', function () {
        expect(log4javascript.getRootLogger).toBeDefined();
      });

      it('log4js.isEnabled should be defined', function () {
        expect(log4javascript.isEnabled).toBeDefined();
      });

      it('log4js.isTimeStampsInMilliseconds should be defined', function () {
        expect(log4javascript.isTimeStampsInMilliseconds).toBeDefined();
      });

      it('log4js.logLog should be defined', function () {
        expect(log4javascript.logLog).toBeDefined();
      });

      it('log4js.resetConfiguration should be defined', function () {
        expect(log4javascript.resetConfiguration).toBeDefined();
      });

      it('log4js.setDocumentReady should be defined', function () {
        expect(log4javascript.setDocumentReady).toBeDefined();
      });

      it('log4js.setEnabled should be defined', function () {
        expect(log4javascript.setEnabled).toBeDefined();
      });

      it('log4js.setShowStackTraces should be defined', function () {
        expect(log4javascript.setShowStackTraces).toBeDefined();
      });

      it('log4js.setTimeStampsInMilliseconds should be defined', function () {
        expect(log4javascript.setTimeStampsInMilliseconds).toBeDefined();
      });
    });

    describe('log4js Appender should defined', function () {

      it('log4js.Appender should be defined', function () {
        expect(log4javascript.Appender).toBeDefined();
      });

      it('log4js.AlertAppender should be defined', function () {
        expect(log4javascript.AlertAppender).toBeDefined();
      });

      it('log4js.AjaxAppender should be defined', function () {
        expect(log4javascript.AjaxAppender).toBeDefined();
      });

      it('log4js.BrowserConsoleAppender should be defined', function () {
        expect(log4javascript.BrowserConsoleAppender).toBeDefined();
      });

      it('log4js.InPageAppender should be defined', function () {
        expect(log4javascript.InPageAppender).toBeDefined();
      });

      it('log4js.InlineAppender should be defined', function () {
        expect(log4javascript.InlineAppender).toBeDefined();
      });

      it('log4js.PopUpAppender should be defined', function () {
        expect(log4javascript.PopUpAppender).toBeDefined();
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
    beforeEach(function(){
      tmpLevel.OFF = log4javascript.Level.OFF;
      tmpLevel.FATAL = log4javascript.Level.FATAL;
      tmpLevel.ERROR = log4javascript.Level.ERROR;
      tmpLevel.WARN = log4javascript.Level.WARN;
      tmpLevel.INFO = log4javascript.Level.INFO;
      tmpLevel.DEBUG = log4javascript.Level.DEBUG;
      tmpLevel.TRACE = log4javascript.Level.TRACE;
      tmpLevel.ALL = log4javascript.Level.ALL;
      levelKeys = Object.keys(tmpLevel);
    });

    it('log4js.Level should be defined', function () {
      expect(log4javascript.Level).toBeDefined();
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
      for(var i = 0, length = levelKeys.length; i < length; i++){
        expect(typeof tmpLevel[levelKeys[i]].level).toBe('number');
      }
    });

    it('log4js.Level.<Level>.name should be String', function () {
      for(var i = 0, length = levelKeys.length; i < length; i++){
        expect(typeof tmpLevel[levelKeys[i]].name).toBe('string');
      }
    });

    it('log4js.Level.<Level>.name should be the same as the identifier', function () {
      for(var i = 0, length = levelKeys.length; i < length; i++){
        expect(tmpLevel[levelKeys[i]].name).toBe(levelKeys[i]);
      }
    });

  });
});
