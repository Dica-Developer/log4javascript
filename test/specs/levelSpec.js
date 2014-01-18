/*global define, describe, it, xit, expect, spyOn, afterEach, beforeEach*/
define(['level'], function () {
  'use strict';

  describe('#Level', function () {
    var level = null;
    beforeEach(function () {
      level = new Level(11111, 'test');
    });

    it('.toString', function () {
      expect(level.toString()).toBe('test');
    });

    it('.equal', function () {
      var equal = new Level(11111, 'testB');
      expect(level.equals(equal)).toBe(true);
    });

    it('.isGreaterOrEqual', function () {
      var equal = new Level(11111, 'equal');
      var greater = new Level(11110, 'greater');
      var less = new Level(11112, 'less');
      expect(level.isGreaterOrEqual(equal)).toBe(true);
      expect(level.isGreaterOrEqual(greater)).toBe(true);
      expect(level.isGreaterOrEqual(less)).toBe(false);
    });

    it('#ALL should be defined', function () {
      expect(Level.ALL).toBeDefined();
    });

    it('#FATAL should be defined', function () {
      expect(Level.FATAL).toBeDefined();
    });

    it('#ERROR should be defined', function () {
      expect(Level.ERROR).toBeDefined();
    });

    it('#WARN should be defined', function () {
      expect(Level.WARN).toBeDefined();
    });

    it('#DEBUG should be defined', function () {
      expect(Level.DEBUG).toBeDefined();
    });

    it('#TRACE should be defined', function () {
      expect(Level.TRACE).toBeDefined();
    });

    it('#INFO should be defined', function () {
      expect(Level.INFO).toBeDefined();
    });

    it('#OFF should be defined', function () {
      expect(Level.OFF).toBeDefined();
    });

  });
});