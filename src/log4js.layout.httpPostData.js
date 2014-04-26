define(['log4js.core', 'log4js.layout'], function (log4js) {
  'use strict';

  /**
   * HttpPostDataLayout
   * @constructor
   * @mixes Layout
   */
  function HttpPostDataLayout() {
    this.setKeys();
    this.customFields = [];
    this.returnsPostData = true;
  }

  /**
   *
   * @type {Layout}
   */
  HttpPostDataLayout.prototype = new log4js.Layout();

  /**
   * Disable batching
   * @returns {Boolean}
   */
  HttpPostDataLayout.prototype.allowBatching = function () {
    return false;
  };

  /**
   *
   * @param loggingEvent
   * @returns {String}
   */
  HttpPostDataLayout.prototype.format = function (loggingEvent) {
    var dataValues = this.getDataValues(loggingEvent);
    var queryBits = [];
    for (var i = 0, len = dataValues.length; i < len; i++) {
      var val = (dataValues[i][1] instanceof Date) ?
        String(dataValues[i][1].getTime()) : dataValues[i][1];
      queryBits.push(encodeURIComponent(dataValues[i][0]) + '=' + encodeURIComponent(val));
    }
    return queryBits.join('&');
  };

  /**
   *
   * @returns {boolean}
   */
  HttpPostDataLayout.prototype.ignoresThrowable = function () {
    return false;
  };

  /**
   *
   * @returns {String}
   */
  HttpPostDataLayout.prototype.toString = function () {
    return 'HttpPostDataLayout';
  };

  log4js.HttpPostDataLayout = HttpPostDataLayout;
});
