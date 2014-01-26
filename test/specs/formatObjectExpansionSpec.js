/*global define, describe, it, expect*/
define(['formatObjectExpansion'], function () {
  'use strict';

  describe('#formatObjectExpansion', function () {

    it('object === null', function(){
      expect(formatObjectExpansion(null, 2)).toBe('null');
    });

    it('object === undefined', function(){
      var undef;
      expect(formatObjectExpansion(undef, 2)).toBe('undefined');
    });

    it('object === String (one line)', function(){
      expect(formatObjectExpansion('Test', 2)).toBe('Test');
    });

    it('object === String (many lines)', function(){
      expect(formatObjectExpansion('Test' + newLine + 'test2' + newLine + 'test3', 2)).toBe('Test' + newLine + 'test2' + newLine + 'test3');
    });

    it('object === Date', function(){
      expect(formatObjectExpansion(new Date(23, 3, 23), 2)).toBe('Mon Apr 23 1923 00:00:00 GMT+0200 (CEST)');
    });

    it('object === array', function(){
      expect(formatObjectExpansion(['test', 'test2'], 2)).toBe('[' + newLine + '  test,' + newLine + '  test2' + newLine + ']');
    });

    it('object === object', function(){
      expect(formatObjectExpansion({test: 'test'}, 2)).toBe('{' + newLine + '  test: test' + newLine + '}');
    });

    it('object === object', function(){
      var newObj = {test: 'test'};
      newObj.newObj = newObj;
      expect(formatObjectExpansion(newObj, 2)).toBe('{' + newLine + '  test: test,' + newLine + '  newObj: [object Object] [already expanded]' + newLine + '}');
    });

    it('object === function', function(){
      var newFun = function(){};
      expect(formatObjectExpansion(newFun, 2)).toBe('function () {}');
    });

  });

});