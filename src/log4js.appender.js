/**
 *
 * @constructor
 * @mixin
 */
var Appender = function () {};

/**
 *
 * @type {EventSupport}
 */
Appender.prototype = new EventSupport();

/**
 *
 * @type {PatternLayout}
 */
Appender.prototype.layout = new PatternLayout();

/**
 *
 * @type {Level}
 */
Appender.prototype.threshold = Level.ALL;

/**
 *
 * @type {Array}
 */
Appender.prototype.loggers = [];

/**
 * Performs threshold checks before delegating actual logging to the
 * subclass's specific append method.
 * @param {LoggingEvent} loggingEvent
 */
Appender.prototype.doAppend = function (loggingEvent) {
  'use strict';

  if (enabled && loggingEvent.level.level >= this.threshold.level) {
    this.append(loggingEvent);
  }
};

/**
 *
 * @param {LoggingEvent} loggingEvent
 */
Appender.prototype.append = function (loggingEvent) {};

/**
 *
 * @param {Layout} layout
 */
Appender.prototype.setLayout = function (layout) {
  'use strict';

  if (layout instanceof Layout) {
    this.layout = layout;
  } else {
    handleError('Appender.setLayout: layout supplied to ' +
      this.toString() + ' is not a subclass of Layout');
  }
};

/**
 *
 * @returns {Layout}
 */
Appender.prototype.getLayout = function () {
  'use strict';

  return this.layout;
};

/**
 *
 * @param {Level} threshold
 */
Appender.prototype.setThreshold = function (threshold) {
  'use strict';

  if (threshold instanceof Level) {
    this.threshold = threshold;
  } else {
    handleError('Appender.setThreshold: threshold supplied to ' +
      this.toString() + ' is not a subclass of Level');
  }
};

/**
 *
 * @returns {Level}
 */
Appender.prototype.getThreshold = function () {
  'use strict';

  return this.threshold;
};

/**
 *
 * @param {Logger} logger
 */
Appender.prototype.setAddedToLogger = function (logger) {
  'use strict';

  this.loggers.push(logger);
};

/**
 *
 * @param {Logger} logger
 */
Appender.prototype.setRemovedFromLogger = function (logger) {
  'use strict';

  arrayRemove(this.loggers, logger);
};

/**
 *
 * @type {emptyFunction}
 */
Appender.prototype.group = emptyFunction;

/**
 *
 * @type {emptyFunction}
 */
Appender.prototype.groupEnd = emptyFunction;

/**
 * @todo document document document
 */
Appender.prototype.toString = function () {
  'use strict';

  handleError('Appender.toString: all appenders must override this method');
};

/**
 *
 * @type {Appender}
 */
log4javascript.Appender = Appender;