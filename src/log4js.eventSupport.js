/**
 * Custom event support
 * @constructor
 */
function EventSupport() {
  'use strict';

  this.eventTypes = [];
  this.eventListeners = {};
}

/**
 *
 * @param {Array} eventTypesParam
 */
EventSupport.prototype.setEventTypes = function (eventTypesParam) {
  'use strict';

  if (isArray(eventTypesParam)) {
    this.eventTypes = eventTypesParam;
    this.eventListeners = {};
    for (var i = 0, len = this.eventTypes.length; i < len; i++) {
      this.eventListeners[this.eventTypes[i]] = [];
    }
  } else {
    handleError('EventSupport [' + this + ']: setEventTypes: eventTypes parameter must be an Array');
  }
};

/**
 *
 * @param {String} eventType
 * @param {Function} listener
 */
EventSupport.prototype.addEventListener = function (eventType, listener) {
  'use strict';

  if (isFunction(listener)) {
    if (!arrayContains(this.eventTypes, eventType)) {
      handleError('EventSupport [' + this + ']: addEventListener: no event called "' + eventType + '"');
    } else {
      this.eventListeners[eventType].push(listener);
    }
  } else {
    handleError('EventSupport [' + this + ']: addEventListener: listener must be a function');
  }
};

/**
 *
 * @param {String} eventType
 * @param {Function} listener
 */
EventSupport.prototype.removeEventListener = function (eventType, listener) {
  'use strict';

  if (isFunction(listener)) {
    if (!arrayContains(this.eventTypes, eventType)) {
      handleError('EventSupport [' + this + ']: removeEventListener: no event called "' + eventType + '"');
    } else {
      arrayRemove(this.eventListeners[eventType], listener);
    }
  } else {
    handleError('EventSupport [' + this + ']: removeEventListener: listener must be a function');
  }
};

/**
 *
 * @param {String} eventType
 * @param {Array} eventArgs
 */
EventSupport.prototype.dispatchEvent = function (eventType, eventArgs) {
  'use strict';

  if (arrayContains(this.eventTypes, eventType)) {
    var listeners = this.eventListeners[eventType];
    for (var i = 0, len = listeners.length; i < len; i++) {
      listeners[i](this, eventType, eventArgs);
    }
  } else {
    handleError('EventSupport [' + this + ']: dispatchEvent: no event called "' + eventType + '"');
  }
};