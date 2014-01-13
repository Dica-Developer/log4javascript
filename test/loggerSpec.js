/*global define, describe, it, xit, expect, spyOn, afterEach, beforeEach*/
define(['log4javascript', 'level', 'logger'], function (log4js) {
  'use strict';

  describe('Testing core log4javascript#Logger functionality', function () {
    it('log4javascript.getLogger should be define', function () {
      expect(log4js.getLogger).toBeDefined();
    });

    it('log4javascript.getRootLogger should be define', function () {
      expect(log4js.getRootLogger).toBeDefined();
    });

    it('log4javascript.getDefaultLogger should be define', function () {
      expect(log4js.getDefaultLogger).toBeDefined();
    });

    describe('Test new Logger as root', function () {
      var rootLogger = null;
      beforeEach(function () {
        rootLogger = new Logger('root');
      });
      it('Name property should be "root"', function () {
        expect(rootLogger.name).toBe('root');
      });

      it('Should not have any parent', function () {
        expect(rootLogger.parent).toBe(null);
      });

      it('Should\'nt have any children before instantiated them', function () {
        expect(rootLogger.children.length).toBe(0);
      });

      it('Call toString should return "Logger[root]"', function () {
        expect(rootLogger.toString()).toBe('Logger[root]');
      });


      describe('Level', function () {
        var rootLogger = null;
        beforeEach(function () {
          rootLogger = new Logger('root');
          rootLogger.setLevel(Level.ALL);
        });

        it('Call set level should apply right level', function () {
          expect(rootLogger.getLevel()).toBe(Level.ALL);
        });

        it('Return off getLevel be instance of #Level', function () {
          expect(rootLogger.getLevel() instanceof Level).toBe(true);
        });

        it('Call getEffectiveLevel should return same Level as getLevel', function () {
          expect(rootLogger.getEffectiveLevel()).toBe(rootLogger.getLevel());
        });

      });

    });

    xit('log4javascript.getDefaultLogger call should return default logger', function () {
      var defaultLogger = log4js.getDefaultLogger();
      expect(defaultLogger).toBeDefined();
    });

    xit('log4javascript.getLogger call without name should return with name [anonymous]', function () {
      var logger = log4js.getLogger();
      expect(logger).toBeDefined();
      expect(logger.name).toBe('[anonymous]');
    });
  });
});