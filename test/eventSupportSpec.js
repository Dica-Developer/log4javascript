/*global define, describe, it, expect, spyOn, beforeEach,jasmine*/
define(['params', 'eventSupport'], function () {
  'use strict';

  describe('#EventSupport', function () {

    describe('prototypes', function(){

      var eventSupport = null;

      beforeEach(function () {
        eventSupport = new EventSupport();
      });

      it('.eventTypes should be "[]"', function () {
        expect(eventSupport.eventTypes).toEqual([]);
      });

      it('.eventListeners should be "{}"', function () {
        expect(eventSupport.eventListeners).toEqual({});
      });

    });

    describe('.setEventTypes', function(){

      var eventSupport = null;

      beforeEach(function () {
        eventSupport = new EventSupport();
      });

      it('parameter must be Array otherwise handleError should be called', function () {
        var handleErrorSpy = spyOn(window, 'handleError');
        eventSupport.setEventTypes('');
        expect(handleErrorSpy).toHaveBeenCalledWith('EventSupport ['+ eventSupport +']: setEventTypes: eventTypes parameter must be an Array');
      });

      it('parameter should replace .eventTypes', function () {
        eventSupport.setEventTypes(['test']);
        expect(eventSupport.eventTypes[0]).toBe('test');
      });

      it('.eventListeners should be empty Array', function () {
        eventSupport.setEventTypes(['test1']);
        expect(eventSupport.eventListeners.test1).toEqual([]);
      });

    });

    describe('.addEventListener', function(){

      var eventSupport = null;

      beforeEach(function () {
        eventSupport = new EventSupport();
      });

      it('@param listener is function', function () {
        var handleErrorSpy = spyOn(window, 'handleError');
        eventSupport.setEventTypes(['test']);
        eventSupport.addEventListener('test', function(){});
        expect(handleErrorSpy).not.toHaveBeenCalled();
      });

      it('@param listener is function but event type does not exist', function () {
        var handleErrorSpy = spyOn(window, 'handleError');
        eventSupport.addEventListener('test1', function(){});
        expect(handleErrorSpy).toHaveBeenCalledWith('EventSupport [' + eventSupport + ']: addEventListener: no event called "test1"');
      });

      it('@param listener must be function otherwise handelError should be called', function () {
        var handleErrorSpy = spyOn(window, 'handleError');
        eventSupport.setEventTypes(['test']);
        eventSupport.addEventListener('test', null);
        expect(handleErrorSpy).toHaveBeenCalledWith('EventSupport [' + eventSupport + ']: addEventListener: listener must be a function');
      });

    });

    describe('.removeEventListener', function(){

      var eventSupport = null;

      beforeEach(function () {
        eventSupport = new EventSupport();
      });

      it('@param listener must be function otherwise handelError should be called', function () {
        var handleErrorSpy = spyOn(window, 'handleError');
        eventSupport.setEventTypes(['test', function(){}]);
        eventSupport.removeEventListener('test', null);
        expect(handleErrorSpy).toHaveBeenCalledWith('EventSupport [' + eventSupport + ']: removeEventListener: listener must be a function');
      });

      it('@param listener is function but event type does not exist', function () {
        var handleErrorSpy = spyOn(window, 'handleError');
        eventSupport.removeEventListener('test1', function(){});
        expect(handleErrorSpy).toHaveBeenCalledWith('EventSupport [' + eventSupport + ']: removeEventListener: no event called "test1"');
      });

      it('Should remove listener from .eventListeners', function () {
        var listener = function(){};
        eventSupport.setEventTypes(['test2']);
        eventSupport.addEventListener('test2', listener);
        eventSupport.removeEventListener('test2', listener);
        expect(eventSupport.eventListeners.test2).toEqual([]);
      });

    });

    describe('.dispatchEvent', function(){

      var eventSupport = null;

      beforeEach(function () {
        eventSupport = new EventSupport();
      });

      it('@param eventType must exist otherwise handleError should be called', function () {
        var handleErrorSpy = spyOn(window, 'handleError');
        eventSupport.dispatchEvent('test');
        expect(handleErrorSpy).toHaveBeenCalledWith('EventSupport [' + eventSupport + ']: dispatchEvent: no event called "test"');
      });

      it('if event exist it should be called', function () {
        var listener = jasmine.createSpy('listener');
        eventSupport.setEventTypes(['test2']);
        eventSupport.addEventListener('test2', listener);
        eventSupport.dispatchEvent('test2');
        expect(listener).toHaveBeenCalled();
      });

    });

  });
});