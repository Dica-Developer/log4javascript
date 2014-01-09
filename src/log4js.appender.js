/* ---------------------------------------------------------------------- */
// Appender prototype

var Appender = function () {
};

Appender.prototype = new EventSupport();

Appender.prototype.layout = new PatternLayout();
Appender.prototype.threshold = Level.ALL;
Appender.prototype.loggers = [];

// Performs threshold checks before delegating actual logging to the
// subclass's specific append method.
Appender.prototype.doAppend = function (loggingEvent) {
  if (enabled && loggingEvent.level.level >= this.threshold.level) {
    this.append(loggingEvent);
  }
};

Appender.prototype.append = function (loggingEvent) {
};

Appender.prototype.setLayout = function (layout) {
  if (layout instanceof Layout) {
    this.layout = layout;
  } else {
    handleError("Appender.setLayout: layout supplied to " +
      this.toString() + " is not a subclass of Layout");
  }
};

Appender.prototype.getLayout = function () {
  return this.layout;
};

Appender.prototype.setThreshold = function (threshold) {
  if (threshold instanceof Level) {
    this.threshold = threshold;
  } else {
    handleError("Appender.setThreshold: threshold supplied to " +
      this.toString() + " is not a subclass of Level");
  }
};

Appender.prototype.getThreshold = function () {
  return this.threshold;
};

Appender.prototype.setAddedToLogger = function (logger) {
  this.loggers.push(logger);
};

Appender.prototype.setRemovedFromLogger = function (logger) {
  array_remove(this.loggers, logger);
};

Appender.prototype.group = emptyFunction;
Appender.prototype.groupEnd = emptyFunction;

Appender.prototype.toString = function () {
  handleError("Appender.toString: all appenders must override this method");
};

log4javascript.Appender = Appender;