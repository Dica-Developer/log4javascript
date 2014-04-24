define(['log4js.helper'], function(helper){
  'use strict';

  /**
   * Custom event support
   * @constructor
   */
  function EventSupport() {
    this.eventTypes = [];
    this.eventListeners = {};
  }

  /**
   *
   * @param {Array} eventTypesParam
   */
  EventSupport.prototype.setEventTypes = function (eventTypesParam) {
    if (helper.isArray(eventTypesParam)) {
      this.eventTypes = eventTypesParam;
      this.eventListeners = {};
      for (var i = 0, len = this.eventTypes.length; i < len; i++) {
        this.eventListeners[this.eventTypes[i]] = [];
      }
    } else {
      helper.handleError('EventSupport [' + this + ']: setEventTypes: eventTypes parameter must be an Array');
    }
  };

  /**
   *
   * @param {String} eventType
   * @param {Function} listener
   */
  EventSupport.prototype.addEventListener = function (eventType, listener) {
    if (helper.isFunction(listener)) {
      if (!helper.arrayContains(this.eventTypes, eventType)) {
        helper.handleError('EventSupport [' + this + ']: addEventListener: no event called "' + eventType + '"');
      } else {
        this.eventListeners[eventType].push(listener);
      }
    } else {
      helper.handleError('EventSupport [' + this + ']: addEventListener: listener must be a function');
    }
  };

  /**
   *
   * @param {String} eventType
   * @param {Function} listener
   */
  EventSupport.prototype.removeEventListener = function (eventType, listener) {
    if (helper.isFunction(listener)) {
      if (!helper.arrayContains(this.eventTypes, eventType)) {
        helper.handleError('EventSupport [' + this + ']: removeEventListener: no event called "' + eventType + '"');
      } else {
        helper.arrayRemove(this.eventListeners[eventType], listener);
      }
    } else {
      helper.handleError('EventSupport [' + this + ']: removeEventListener: listener must be a function');
    }
  };

  /**
   *
   * @param {String} eventType
   * @param {Array} eventArgs
   */
  EventSupport.prototype.dispatchEvent = function (eventType, eventArgs) {
    if (helper.arrayContains(this.eventTypes, eventType)) {
      var listeners = this.eventListeners[eventType];
      for (var i = 0, len = listeners.length; i < len; i++) {
        listeners[i].call(this, eventType, eventArgs);
      }
    } else {
      helper.handleError('EventSupport [' + this + ']: dispatchEvent: no event called "' + eventType + '"');
    }
  };

  return EventSupport;
});