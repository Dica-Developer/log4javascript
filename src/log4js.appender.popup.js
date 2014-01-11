/**
 *
 * @param {Boolean} lazyInit
 * @param {Boolean} initiallyMinimized
 * @param {Boolean} useDocumentWrite
 * @param {String} width
 * @param {String} height
 * @constructor
 * @mixes ConsoleAppender
 */
function PopUpAppender(
  lazyInit,
  initiallyMinimized,
  useDocumentWrite,
  width,
  height
  ) {
  'use strict';

  /**
   * @todo document
   */
  this.create(
    false,
    null,
    lazyInit,
    initiallyMinimized,
    useDocumentWrite,
    width,
    height,
    this.defaults.focusPopUp
  );
}

/**
 *
 * @type {ConsoleAppender}
 */
PopUpAppender.prototype = new ConsoleAppender();

/**
 *
 * @type {{layout: PatternLayout, initiallyMinimized: boolean, focusPopUp: boolean, lazyInit: boolean, useOldPopUp: boolean, complainAboutPopUpBlocking: boolean, newestMessageAtTop: boolean, scrollToLatestMessage: boolean, width: string, height: string, reopenWhenClosed: boolean, maxMessages: null, showCommandLine: boolean, commandLineObjectExpansionDepth: number, showHideButton: boolean, showCloseButton: boolean, showLogEntryDeleteButtons: boolean, useDocumentWrite: boolean}}
 */
PopUpAppender.prototype.defaults = {
  layout: new PatternLayout('%d{HH:mm:ss} %-5p - %m{1}%n'),
  initiallyMinimized: false,
  focusPopUp: false,
  lazyInit: true,
  useOldPopUp: true,
  complainAboutPopUpBlocking: true,
  newestMessageAtTop: false,
  scrollToLatestMessage: true,
  width: '600',
  height: '400',
  reopenWhenClosed: false,
  maxMessages: null,
  showCommandLine: true,
  commandLineObjectExpansionDepth: 1,
  showHideButton: false,
  showCloseButton: true,
  showLogEntryDeleteButtons: true,
  useDocumentWrite: true
};

/**
 *
 * @returns {String}
 */
PopUpAppender.prototype.toString = function() {
  'use strict';

  return 'PopUpAppender';
};

/**
 *
 * @type {PopUpAppender}
 */
log4javascript.PopUpAppender = PopUpAppender;