define(['log4js.core', 'log4js.layout'], function (log4js) {
  'use strict';

  /**
   * NullLayout
   * @constructor
   * @mixes Layout
   */
  function NullLayout() {
    this.customFields = [];
  }

  /**
   *
   * @type {Layout}
   */
  NullLayout.prototype = new log4js.Layout();

  /**
   *
   * @param loggingEvent
   * @returns {Array}
   */
  NullLayout.prototype.format = function (loggingEvent) {
    return loggingEvent.messages;
  };

  /**
   *
   * @returns {Boolean}
   */
  NullLayout.prototype.ignoresThrowable = function () {
    return true;
  };

  /**
   *
   * @returns {String}
   */
  NullLayout.prototype.toString = function () {
    return 'NullLayout';
  };

  log4js.NullLayout = NullLayout;
});
