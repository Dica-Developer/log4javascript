define(['log4js.core', 'log4js.layout'], function (log4js) {
  'use strict';

  /**
   * SimpleLayout
   * @constructor
   * @mixes Layout
   */
  function SimpleLayout() {
    this.customFields = [];
  }

  /**
   *
   * @type {Layout}
   */
  SimpleLayout.prototype = new log4js.Layout();

  /**
   *
   * @param loggingEvent
   * @returns {String}
   */
  SimpleLayout.prototype.format = function (loggingEvent) {
    return loggingEvent.level.name + ' - ' + loggingEvent.getCombinedMessages();
  };

  /**
   *
   * @returns {Boolean}
   */
  SimpleLayout.prototype.ignoresThrowable = function () {
    return true;
  };

  /**
   *
   * @returns {string}
   */
  SimpleLayout.prototype.toString = function () {
    return 'SimpleLayout';
  };

  log4js.SimpleLayout = SimpleLayout;
});
