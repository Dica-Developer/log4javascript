/*global define, describe, it, xit, expect, beforeEach*/
define(['log4javascript'], function(log4js){
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

      it('log4js.logLog should be defined', function () {
        expect(log4js.logLog).toBeDefined();
      });

      it('log4js.resetConfiguration should be defined', function () {
        expect(log4js.resetConfiguration).toBeDefined();
      });

      it('log4js.setDocumentReady should be defined', function () {
        expect(log4js.setDocumentReady).toBeDefined();
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

      it('log4js.AlertAppender should be defined', function () {
        expect(log4js.AlertAppender).toBeDefined();
      });

      it('log4js.AjaxAppender should be defined', function () {
        expect(log4js.AjaxAppender).toBeDefined();
      });

      it('log4js.BrowserConsoleAppender should be defined', function () {
        expect(log4js.BrowserConsoleAppender).toBeDefined();
      });

      it('log4js.InPageAppender should be defined', function () {
        expect(log4js.InPageAppender).toBeDefined();
      });

      it('log4js.InlineAppender should be defined', function () {
        expect(log4js.InlineAppender).toBeDefined();
      });

      it('log4js.PopUpAppender should be defined', function () {
        expect(log4js.PopUpAppender).toBeDefined();
      });
    });

    describe('log4js Layouts should defined', function () {

      it('log4js.Layout should be defined', function () {
        expect(log4js.Layout).toBeDefined();
      });

      it('log4js.HttpPostDataLayout should be defined', function () {
        expect(log4js.HttpPostDataLayout).toBeDefined();
      });

      it('log4js.JsonLayout should be defined', function () {
        expect(log4js.JsonLayout).toBeDefined();
      });

      it('log4js.NullLayout should be defined', function () {
        expect(log4js.NullLayout).toBeDefined();
      });

      it('log4js.PatternLayout should be defined', function () {
        expect(log4js.PatternLayout).toBeDefined();
      });

      it('log4js.SimpleLayout should be defined', function () {
        expect(log4js.SimpleLayout).toBeDefined();
      });

      it('log4js.XmlLayout should be defined', function () {
        expect(log4js.XmlLayout).toBeDefined();
      });
    });
  });

  function getLengthForLevelTesting(levelkeys, level) {
    //returns the length of the for loop by finding the level position
    return levelkeys.indexOf(level);
  }

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
