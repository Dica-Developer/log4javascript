/*global describe, it, expect, spyOn, window*/
define(['helper'], function (helper) {
  'use strict';

  describe('#helper', function () {

    describe('#helper.isUndefined', function () {
      it('should return true', function(){
        var test = {};
        var test1 = void 0;
        expect(helper.isUndefined(test.bla)).toBeTruthy();
        expect(helper.isUndefined(test1)).toBeTruthy();
      });

      it('should return false', function(){
        var test = {bla: 'bla'};
        var test1 = 'bla';
        expect(helper.isUndefined(test.bla)).toBeFalsy();
        expect(helper.isUndefined(test1)).toBeFalsy();
      });
    });

    describe('#helper.isNotUndefined', function () {
      it('should return false', function(){
        var test = {};
        var test1 = void 0;
        expect(helper.isNotUndefined(test.bla)).toBeFalsy();
        expect(helper.isNotUndefined(test1)).toBeFalsy();
      });

      it('should return true', function(){
        var test = {bla: 'bla'};
        var test1 = 'bla';
        expect(helper.isNotUndefined(test.bla)).toBeTruthy();
        expect(helper.isNotUndefined(test1)).toBeTruthy();
      });
    });

    describe('#helper.isFunction', function () {
      it('should return false', function(){
        var test = {};
        var test1 = void 0;
        expect(helper.isFunction(test.bla)).toBeFalsy();
        expect(helper.isFunction(test1)).toBeFalsy();
      });

      it('should return true', function(){
        var test = function(){};
        expect(helper.isFunction(test)).toBeTruthy();
        expect(helper.isFunction(function(){})).toBeTruthy();
      });
    });

    describe('#helper.isBoolean', function () {
      it('should return false', function(){
        var test = {};
        var test1 = void 0;
        expect(helper.isBoolean(test.bla)).toBeFalsy();
        expect(helper.isBoolean(test1)).toBeFalsy();
      });

      it('should return true', function(){
        expect(helper.isBoolean(true)).toBeTruthy();
        expect(helper.isBoolean(false)).toBeTruthy();
      });
    });

    describe('#helper.isString', function () {
      it('should return false', function(){
        var test = {};
        var test1 = void 0;
        var test2 = 1;
        expect(helper.isString(test.bla)).toBeFalsy();
        expect(helper.isString(test1)).toBeFalsy();
        expect(helper.isString(test2)).toBeFalsy();
      });

      it('should return true', function(){
        expect(helper.isString('test')).toBeTruthy();
      });
    });

    describe('#helper.toString', function () {
      it('should return string representation of given argument', function(){
        var test = {};
        var test1 = {toString: function(){return 'test';}};
        var test2 = null;
        var test3 = 1;
        expect(helper.toString(test)).toBe('[object Object]');
        expect(helper.toString(test1)).toBe('test');
        expect(helper.toString(test2)).toBe('null');
        expect(helper.toString(test3)).toBe('1');
      });
    });

    describe('#helper.isArray', function () {
      it('should return false', function(){
        var test = {};
        var test1 = void 0;
        var test2 = 0;
        expect(helper.isArray(test.bla)).toBeFalsy();
        expect(helper.isArray(test1)).toBeFalsy();
        expect(helper.isArray(test2)).toBeFalsy();
      });

      it('should return true', function(){
        expect(helper.isArray([])).toBeTruthy();
        expect(helper.isArray(new Array(1))).toBeTruthy();
      });
    });

    describe('#helper.arrayContains', function () {
      it('should return false', function(){
        var test = [1,2,3];
        expect(helper.arrayContains(test, 4)).toBeFalsy();
      });

      it('should return true', function(){
        var test = [1,2,3,4];
        expect(helper.arrayContains(test, 4)).toBeTruthy();
      });
    });

    describe('#helper.arrayRemove', function () {
      it('should return false', function(){
        var test = [1,2,3];
        expect(helper.arrayRemove(test, 4)).toBeFalsy();
      });

      it('should return true', function(){
        var test = [1,2,3,4];
        expect(helper.arrayRemove(test, 4)).toBeTruthy();
      });

      it('should remove given value', function(){
        var test = [1,2,3,4];
        expect(helper.arrayRemove(test, 4)).toBeTruthy();
        expect(helper.arrayContains(test, 4)).toBeFalsy();
      });
    });

    describe('#helper.trim', function () {
      it('should return trimmed string', function(){
        var test = ' jhg ';
        var test1 = ' jhg';
        var test2 = 'jhg ';
        var test3 = 'jh g';
        expect(helper.trim(test)).toBe('jhg');
        expect(helper.trim(test1)).toBe('jhg');
        expect(helper.trim(test2)).toBe('jhg');
        expect(helper.trim(test3)).toBe('jh g');
      });
    });

    describe('#helper.splitIntoLines', function () {
      it('should return array of lines', function(){
        var test = 'This\nis\ra\r\nsentence';
        expect(helper.splitIntoLines(test)).toEqual(['This', 'is', 'a', 'sentence']);
      });
    });

    describe('#helper.getExceptionMessage', function () {
      it('should return the message of an exception', function(){
        var error = new Error('test message');
        expect(helper.getExceptionMessage(error)).toBe('test message');

        error.description = error.message;
        delete error.message;
        expect(helper.getExceptionMessage(error)).toBe('test message');

        delete error.description;
        expect(helper.getExceptionMessage(error)).toBe('Error: ');
      });
    });

    describe('#helper.getUrlFileName', function () {
      it('should return the everything after the last "/"', function(){
        var url = 'http://bla/bla/bla.js';
        var url1 = 'http://bla.js';

        expect(helper.getUrlFileName(url)).toBe('bla.js');
        expect(helper.getUrlFileName(url1)).toBe('bla.js');
      });
    });

    describe('#helper.handleError', function () {
      it('should call window.alert', function(){
        var alertSpy = spyOn(window, 'alert');
        helper.handleError('Alarm')
        expect(alertSpy).toHaveBeenCalledWith('Alarm');
      });
    });

    describe('#helper.constants', function () {
      it('should set to default', function(){
        expect(helper.anonymousLoggerName).toBe('[anonymous]');
        expect(helper.defaultLoggerName).toBe('[default]');
        expect(helper.nullLoggerName).toBe('[null]');
        expect(helper.rootLoggerName).toBe('root');
        expect(helper.newLine).toBe('\r\n');
      });
    });

  });

});
