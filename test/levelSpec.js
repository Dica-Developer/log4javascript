/*global define, describe, it, xit, expect, spyOn, afterEach, beforeEach*/
define(['level'], function () {
  'use strict';

  describe('#Level', function () {
    var level = null;
    beforeEach(function(){
      level = new Level(11111, 'test')
    });
    it('.toString', function () {
      expect(level.toString()).toBe('testa');
    });
  });
});