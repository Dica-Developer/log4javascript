define(function(){
  'use strict';

  /**
   * Levels
   * @param {Number} level
   * @param {String} name
   * @property {Number} level
   * @property {String} name
   * @constructor
   */
  function Level(level, name) {
    this.level = level;
    this.name = name;
  }

  /**
   *
   * @returns {String}
   */
  Level.prototype.toString = function () {
    return this.name;
  };

  /**
   *
   * @param {Number} level
   * @returns {Boolean}
   */
  Level.prototype.equals = function (level) {
    return this.level === level.level;
  };

  /**
   *
   * @param {Number} level
   * @returns {Boolean}
   */
  Level.prototype.isGreaterOrEqual = function (level) {
    return this.level >= level.level;
  };

  /**
   *
   * @type {Level}
   */
  Level.ALL = new Level(Number.MIN_VALUE, 'ALL');
  /**
   *
   * @type {Level}
   */
  Level.TRACE = new Level(10000, 'TRACE');
  /**
   *
   * @type {Level}
   */
  Level.DEBUG = new Level(20000, 'DEBUG');
  /**
   *
   * @type {Level}
   */
  Level.INFO = new Level(30000, 'INFO');
  /**
   *
   * @type {Level}
   */
  Level.WARN = new Level(40000, 'WARN');
  /**
   *
   * @type {Level}
   */
  Level.ERROR = new Level(50000, 'ERROR');
  /**
   *
   * @type {Level}
   */
  Level.FATAL = new Level(60000, 'FATAL');
  /**
   *
   * @type {Level}
   */
  Level.OFF = new Level(Number.MAX_VALUE, 'OFF');

  /**
   *
   * @type {Level}
   */
  Level.ROOT_LOGGER_DEFAULT_LEVEL = Level.DEBUG;

  return Level;
});