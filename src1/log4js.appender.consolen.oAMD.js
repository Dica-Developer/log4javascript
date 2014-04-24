var defaultCommandLineFunctions = [];
var consoleAppenderIdCounter = 1;

/**
 * ConsoleAppender
 * @constructor
 * @mixes Appender
 */
function ConsoleAppender() {}

/**
 *
 * @type {Appender}
 */
ConsoleAppender.prototype = new Appender();

/**
 *
 * @param {Boolean} inPage
 * @param {HTMLElement} container
 * @param {Boolean} lazyInit
 * @param {Boolean} initiallyMinimized
 * @param {Boolean} useDocumentWrite
 * @param {String} width
 * @param {String} height
 * @param {Boolean} focusConsoleWindow
 */
ConsoleAppender.prototype.create = function (
  inPage,
  container,
  lazyInit,
  initiallyMinimized,
  useDocumentWrite,
  width,
  height,
  focusConsoleWindow
  ) {
  'use strict';

  var appender = this;

  // Common properties
  var initialized = false;
  var consoleWindowCreated = false;
  var consoleWindowLoaded = false;
  var consoleClosed = false;

  var queuedLoggingEvents = [];
  var isSupported = true;
  var consoleAppenderId = consoleAppenderIdCounter++;

  // Local variables
  initiallyMinimized = extractBooleanFromParam(initiallyMinimized, this.defaults.initiallyMinimized);
  lazyInit = extractBooleanFromParam(lazyInit, this.defaults.lazyInit);
  useDocumentWrite = extractBooleanFromParam(useDocumentWrite, this.defaults.useDocumentWrite);
  var newestMessageAtTop = this.defaults.newestMessageAtTop;
  var scrollToLatestMessage = this.defaults.scrollToLatestMessage;
  width = width ? width : this.defaults.width;
  height = height ? height : this.defaults.height;
  var maxMessages = this.defaults.maxMessages;
  var showCommandLine = this.defaults.showCommandLine;
  var commandLineObjectExpansionDepth = this.defaults.commandLineObjectExpansionDepth;
  var showHideButton = this.defaults.showHideButton;
  var showCloseButton = this.defaults.showCloseButton;
  /*jshint unused:false */
  var showLogEntryDeleteButtons = this.defaults.showLogEntryDeleteButtons;

  /**
   * @todo document
   */
  this.setLayout(this.defaults.layout);

  // Functions whose implementations vary between subclasses
  var init, createWindow, safeToAppend, getConsoleWindow, open;

  // Configuration methods. The function scope is used to prevent
  // direct alteration to the appender configuration properties.
  var appenderName = inPage ? 'InPageAppender' : 'PopUpAppender';
  var checkCanConfigure = function (configOptionName) {
    if (consoleWindowCreated) {
      handleError(appenderName + ': configuration option "' + configOptionName + '" may not be set after the appender has been initialized');
      return false;
    }
    return true;
  };

  var consoleWindowExists = function () {
    return (consoleWindowLoaded && isSupported && !consoleClosed);
  };

  /**
   *
   * @returns {Boolean}
   */
  this.isNewestMessageAtTop = function () {
    return newestMessageAtTop;
  };

  /**
   *
   * @param newestMessageAtTopParam
   */
  this.setNewestMessageAtTop = function (newestMessageAtTopParam) {
    newestMessageAtTop = toBool(newestMessageAtTopParam);
    if (consoleWindowExists()) {
      getConsoleWindow().setNewestAtTop(newestMessageAtTop);
    }
  };

  /**
   *
   * @returns {Boolean}
   */
  this.isScrollToLatestMessage = function () {
    return scrollToLatestMessage;
  };

  /**
   *
   * @param {Boolean} scrollToLatestMessageParam
   */
  this.setScrollToLatestMessage = function (scrollToLatestMessageParam) {
    scrollToLatestMessage = toBool(scrollToLatestMessageParam);
    if (consoleWindowExists()) {
      getConsoleWindow().setScrollToLatest(scrollToLatestMessage);
    }
  };

  /**
   *
   * @returns {Number}
   */
  this.getWidth = function () {
    return width;
  };

  /**
   *
   * @param {Number} widthParam
   */
  this.setWidth = function (widthParam) {
    if (checkCanConfigure('width')) {
      width = extractStringFromParam(widthParam, width);
    }
  };

  /**
   *
   * @returns {Number}
   */
  this.getHeight = function () {
    return height;
  };

  /**
   *
   * @param {Number} heightParam
   */
  this.setHeight = function (heightParam) {
    if (checkCanConfigure('height')) {
      height = extractStringFromParam(heightParam, height);
    }
  };

  /**
   *
   * @returns {Number | Null}
   */
  this.getMaxMessages = function () {
    return maxMessages;
  };

  /**
   *
   * @param {Number} maxMessagesParam
   */
  this.setMaxMessages = function (maxMessagesParam) {
    maxMessages = extractIntFromParam(maxMessagesParam, maxMessages);
    if (consoleWindowExists()) {
      getConsoleWindow().setMaxMessages(maxMessages);
    }
  };

  /**
   *
   * @returns {Boolean}
   */
  this.isShowCommandLine = function () {
    return showCommandLine;
  };

  /**
   *
   * @param {Boolean} showCommandLineParam
   */
  this.setShowCommandLine = function (showCommandLineParam) {
    showCommandLine = toBool(showCommandLineParam);
    if (consoleWindowExists()) {
      getConsoleWindow().setShowCommandLine(showCommandLine);
    }
  };

  /**
   *
   * @returns {Boolean}
   */
  this.isShowHideButton = function () {
    return showHideButton;
  };

  /**
   *
   * @param {Boolean} showHideButtonParam
   */
  this.setShowHideButton = function (showHideButtonParam) {
    showHideButton = toBool(showHideButtonParam);
    if (consoleWindowExists()) {
      getConsoleWindow().setShowHideButton(showHideButton);
    }
  };

  /**
   *
   * @returns {Boolean}
   */
  this.isShowCloseButton = function () {
    return showCloseButton;
  };

  /**
   *
   * @param {Boolean} showCloseButtonParam
   */
  this.setShowCloseButton = function (showCloseButtonParam) {
    showCloseButton = toBool(showCloseButtonParam);
    if (consoleWindowExists()) {
      getConsoleWindow().setShowCloseButton(showCloseButton);
    }
  };

  /**
   *
   * @returns {Number}
   */
  this.getCommandLineObjectExpansionDepth = function () {
    return commandLineObjectExpansionDepth;
  };

  /**
   *
   * @param {Number} commandLineObjectExpansionDepthParam
   */
  this.setCommandLineObjectExpansionDepth = function (commandLineObjectExpansionDepthParam) {
    commandLineObjectExpansionDepth = extractIntFromParam(commandLineObjectExpansionDepthParam, commandLineObjectExpansionDepth);
  };

  var minimized = initiallyMinimized;

  /**
   *
   * @returns {Boolean}
   */
  this.isInitiallyMinimized = function () {
    return initiallyMinimized;
  };

  /**
   *
   * @param {Boolean} initiallyMinimizedParam
   */
  this.setInitiallyMinimized = function (initiallyMinimizedParam) {
    if (checkCanConfigure('initiallyMinimized')) {
      initiallyMinimized = toBool(initiallyMinimizedParam);
      minimized = initiallyMinimized;
    }
  };

  /**
   *
   * @returns {Boolean}
   */
  this.isUseDocumentWrite = function () {
    return useDocumentWrite;
  };

  /**
   *
   * @param {Boolean} useDocumentWriteParam
   */
  this.setUseDocumentWrite = function (useDocumentWriteParam) {
    if (checkCanConfigure('useDocumentWrite')) {
      useDocumentWrite = toBool(useDocumentWriteParam);
    }
  };

  /**
   *
   * @param loggingEvent
   * @param formattedMessage
   * @constructor
   */
  function QueuedLoggingEvent(loggingEvent, formattedMessage) {
    this.loggingEvent = loggingEvent;
    this.levelName = loggingEvent.level.name;
    this.formattedMessage = formattedMessage;
  }

  /**
   * @todo document
   */
  QueuedLoggingEvent.prototype.append = function () {
    getConsoleWindow().log(this.levelName, this.formattedMessage);
  };

  /**
   *
   * @param {String} name
   * @param initiallyExpanded
   * @constructor
   */
  function QueuedGroup(name, initiallyExpanded) {
    this.name = name;
    this.initiallyExpanded = initiallyExpanded;
  }

  /**
   * @todo document
   */
  QueuedGroup.prototype.append = function () {
    getConsoleWindow().group(this.name, this.initiallyExpanded);
  };

  /**
   *
   * @constructor
   */
  function QueuedGroupEnd() {}

  /**
   * @todo document
   */
  QueuedGroupEnd.prototype.append = function () {
    getConsoleWindow().groupEnd();
  };

  var checkAndAppend = function () {
    // Next line forces a check of whether the window has been closed
    safeToAppend();
    if (!initialized) {
      init();
    } else if (consoleClosed && reopenWhenClosed) {
      createWindow();
    }
    if (safeToAppend()) {
      appendQueuedLoggingEvents();
    }
  };

  /**
   *
   * @param loggingEvent
   */
  this.append = function (loggingEvent) {
    if (isSupported) {
      // Format the message
      var formattedMessage = appender.getLayout().format(loggingEvent);
      if (this.getLayout().ignoresThrowable()) {
        formattedMessage += loggingEvent.getThrowableStrRep();
      }
      queuedLoggingEvents.push(new QueuedLoggingEvent(loggingEvent, formattedMessage));
      checkAndAppend();
    }
  };

  /**
   *
   * @param {String} name
   * @param {Boolean} initiallyExpanded
   */
  this.group = function (name, initiallyExpanded) {
    if (isSupported) {
      queuedLoggingEvents.push(new QueuedGroup(name, initiallyExpanded));
      checkAndAppend();
    }
  };

  /**
   * @todo document
   */
  this.groupEnd = function () {
    if (isSupported) {
      queuedLoggingEvents.push(new QueuedGroupEnd());
      checkAndAppend();
    }
  };

  var appendQueuedLoggingEvents = function () {
    var currentLoggingEvent;
    while (queuedLoggingEvents.length > 0) {
      queuedLoggingEvents.shift().append();
    }
    if (focusConsoleWindow) {
      getConsoleWindow().focus();
    }
  };

  /**
   *
   * @param {Logger} logger
   */
  this.setAddedToLogger = function (logger) {
    this.loggers.push(logger);
    if (enabled && !lazyInit) {
      init();
    }
  };

  /**
   * @todo document
   */
  this.clear = function () {
    if (consoleWindowExists()) {
      getConsoleWindow().clearLog();
    }
    queuedLoggingEvents.length = 0;
  };

  /**
   * @todo document
   */
  this.focus = function () {
    if (consoleWindowExists()) {
      getConsoleWindow().focus();
    }
  };

  /**
   * @todo document
   */
  this.focusCommandLine = function () {
    if (consoleWindowExists()) {
      getConsoleWindow().focusCommandLine();
    }
  };

  /**
   * @todo document
   */
  this.focusSearch = function () {
    if (consoleWindowExists()) {
      getConsoleWindow().focusSearch();
    }
  };

  var commandWindow = window;

  /**
   *
   * @returns {window}
   */
  this.getCommandWindow = function () {
    return commandWindow;
  };

  /**
   *
   * @param {window} commandWindowParam
   */
  this.setCommandWindow = function (commandWindowParam) {
    commandWindow = commandWindowParam;
  };

  /**
   * @todo document
   */
  this.executeLastCommand = function () {
    if (consoleWindowExists()) {
      getConsoleWindow().evalLastCommand();
    }
  };

  /**
   *
   * @type {PatternLayout}
   */
  var commandLayout = new PatternLayout('%m');

  /**
   *
   * @returns {PatternLayout}
   */
  this.getCommandLayout = function () {
    return commandLayout;
  };

  /**
   *
   * @param {PatternLayout} commandLayoutParam
   */
  this.setCommandLayout = function (commandLayoutParam) {
    commandLayout = commandLayoutParam;
  };

  /**
   *
   * @param expr
   */
  this.evalCommandAndAppend = function (expr) {
    var len;
    var commandReturnValue = { appendResult: true, isError: false };
    var commandOutput = '';
    // Evaluate the command
    try {
      var result, i;
      // The next three lines constitute a workaround for IE. Bizarrely, iframes seem to have no
      // eval method on the window object initially, but once execScript has been called on
      // it once then the eval method magically appears. See http://www.thismuchiknow.co.uk/?p=25
      /*jshint evil:true */
      if (!commandWindow.eval && commandWindow.execScript) {
        commandWindow.execScript('null');
      }

      var commandLineFunctionsHash = {};
      for (i = 0, len = commandLineFunctions.length; i < len; i++) {
        commandLineFunctionsHash[commandLineFunctions[i][0]] = commandLineFunctions[i][1];
      }

      // Keep an array of variables that are being changed in the command window so that they
      // can be restored to their original values afterwards
      var objectsToRestore = [];
      var addObjectToRestore = function (name) {
        objectsToRestore.push([name, commandWindow[name]]);
      };

      addObjectToRestore('appender');
      commandWindow.appender = appender;

      addObjectToRestore('commandReturnValue');
      commandWindow.commandReturnValue = commandReturnValue;

      addObjectToRestore('commandLineFunctionsHash');
      commandWindow.commandLineFunctionsHash = commandLineFunctionsHash;

      var addFunctionToWindow = function (name) {
        addObjectToRestore(name);
        commandWindow[name] = function () {
          return this.commandLineFunctionsHash[name](appender, arguments, commandReturnValue);
        };
      };

      for (i = 0, len = commandLineFunctions.length; i < len; i++) {
        addFunctionToWindow(commandLineFunctions[i][0]);
      }

      // Another bizarre workaround to get IE to eval in the global scope
      /*jshint evil:true */
      if (commandWindow === window && commandWindow.execScript) {
        addObjectToRestore('evalExpr');
        addObjectToRestore('result');
        window.evalExpr = expr;
        /*jshint evil:true*/
        commandWindow.execScript('window.result=eval(window.evalExpr);');
        result = window.result;
      } else {
        /*jshint evil:true */
        result = commandWindow.eval(expr);
      }
      commandOutput = isUndefined(result) ? result : formatObjectExpansion(result, commandLineObjectExpansionDepth);

      // Restore variables in the command window to their original state
      for (i = 0, len = objectsToRestore.length; i < len; i++) {
        commandWindow[objectsToRestore[i][0]] = objectsToRestore[i][1];
      }
    } catch (ex) {
      commandOutput = 'Error evaluating command: ' + getExceptionStringRep(ex);
      commandReturnValue.isError = true;
    }
    // Append command output
    if (commandReturnValue.appendResult) {
      var message = '>>> ' + expr;
      if (!isUndefined(commandOutput)) {
        message += newLine + commandOutput;
      }
      var level = commandReturnValue.isError ? Level.ERROR : Level.INFO;
      var loggingEvent = new LoggingEvent(null, new Date(), level, [message], null);
      var mainLayout = this.getLayout();
      this.setLayout(commandLayout);
      this.append(loggingEvent);
      this.setLayout(mainLayout);
    }
  };

  var commandLineFunctions = defaultCommandLineFunctions.concat([]);

  /**
   *
   * @param functionName
   * @param commandLineFunction
   */
  this.addCommandLineFunction = function (functionName, commandLineFunction) {
    commandLineFunctions.push([functionName, commandLineFunction]);
  };

  var commandHistoryCookieName = 'log4javascriptCommandHistory';
  /**
   *
   * @param commandHistory
   */
  this.storeCommandHistory = function (commandHistory) {
    setCookie(commandHistoryCookieName, commandHistory.join(','));
  };

  var writeHtml = function (doc) {
    var lines = getConsoleHtmlLines();
    doc.open();
    for (var i = 0, len = lines.length; i < len; i++) {
      doc.writeln(lines[i]);
    }
    doc.close();
  };

  // Set up event listeners
  this.setEventTypes(['load', 'unload']);

  var consoleWindowLoadHandler = function () {
    var win = getConsoleWindow();
    win.setAppender(appender);
    win.setNewestAtTop(newestMessageAtTop);
    win.setScrollToLatest(scrollToLatestMessage);
    win.setMaxMessages(maxMessages);
    win.setShowCommandLine(showCommandLine);
    win.setShowHideButton(showHideButton);
    win.setShowCloseButton(showCloseButton);
    win.setMainWindow(window);

    // Restore command history stored in cookie
    var storedValue = getCookie(commandHistoryCookieName);
    if (storedValue) {
      win.commandHistory = storedValue.split(',');
      win.currentCommandIndex = win.commandHistory.length;
    }

    appender.dispatchEvent('load', { 'win': win });
  };

  /**
   * @todo document
   */
  this.unload = function () {
    logLog.debug('unload ' + this + ', caller: ' + this.unload.caller);
    if (!consoleClosed) {
      logLog.debug('really doing unload ' + this);
      consoleClosed = true;
      consoleWindowLoaded = false;
      consoleWindowCreated = false;
      appender.dispatchEvent('unload', {});
    }
  };

  var pollConsoleWindow = function (windowTest, interval, successCallback, errorMessage) {
    function doPoll() {
      try {
        // Test if the console has been closed while polling
        if (consoleClosed) {
          clearInterval(poll);
        }
        if (windowTest(getConsoleWindow())) {
          clearInterval(poll);
          successCallback();
        }
      } catch (ex) {
        clearInterval(poll);
        isSupported = false;
        handleError(errorMessage, ex);
      }
    }

    // Poll the pop-up since the onload event is not reliable
    var poll = setInterval(doPoll, interval);
  };

  var getConsoleUrl = function () {
    var documentDomainSet = (document.domain !== location.hostname);
    return useDocumentWrite ? '' : getBaseUrl() + 'console_uncompressed.html' +
      (documentDomainSet ? '?log4javascript_domain=' + window.escape(document.domain) : '');
  };

  // Define methods and properties that vary between subclasses
  if (inPage) {
    // InPageAppender

    var containerElement = null;

    // Configuration methods. The function scope is used to prevent
    // direct alteration to the appender configuration properties.
    var cssProperties = [];
    this.addCssProperty = function (name, value) {
      if (checkCanConfigure('cssProperties')) {
        cssProperties.push([name, value]);
      }
    };

    // Define useful variables
    var windowCreationStarted = false;
    var iframeContainerDiv;
    var iframeId = uniqueId + '_InPageAppender_' + consoleAppenderId;

    /**
     * @todo document
     */
    this.hide = function () {
      if (initialized && consoleWindowCreated) {
        if (consoleWindowExists()) {
          getConsoleWindow().$('command').blur();
        }
        iframeContainerDiv.style.display = 'none';
        minimized = true;
      }
    };

    /**
     * @todo document
     */
    this.show = function () {
      if (initialized) {
        if (consoleWindowCreated) {
          iframeContainerDiv.style.display = 'block';
          this.setShowCommandLine(showCommandLine); // Force IE to update
          minimized = false;
        } else if (!windowCreationStarted) {
          createWindow(true);
        }
      }
    };

    /**
     *
     * @returns {Boolean}
     */
    this.isVisible = function () {
      return !minimized && !consoleClosed;
    };

    /**
     *
     * @param {Boolean} fromButton
     */
    this.close = function (fromButton) {
      if (!consoleClosed && (!fromButton || confirm('This will permanently remove the console from the page. No more messages will be logged. Do you wish to continue?'))) {
        iframeContainerDiv.parentNode.removeChild(iframeContainerDiv);
        this.unload();
      }
    };

    // Create open, init, getConsoleWindow and safeToAppend functions
    /**
     * @todo document
     */
    open = function () {
      var initErrorMessage = 'InPageAppender.open: unable to create console iframe';

      function finalInit() {
        try {
          if (!initiallyMinimized) {
            appender.show();
          }
          consoleWindowLoadHandler();
          consoleWindowLoaded = true;
          appendQueuedLoggingEvents();
        } catch (ex) {
          isSupported = false;
          handleError(initErrorMessage, ex);
        }
      }

      function writeToDocument() {
        try {
          var windowTest = function (win) {
            return isLoaded(win);
          };
          if (useDocumentWrite) {
            writeHtml(getConsoleWindow().document);
          }
          if (windowTest(getConsoleWindow())) {
            finalInit();
          } else {
            pollConsoleWindow(windowTest, 100, finalInit, initErrorMessage);
          }
        } catch (ex) {
          isSupported = false;
          handleError(initErrorMessage, ex);
        }
      }

      minimized = false;
      iframeContainerDiv = containerElement.appendChild(document.createElement('div'));

      iframeContainerDiv.style.width = width;
      iframeContainerDiv.style.height = height;
      iframeContainerDiv.style.border = 'solid gray 1px';

      for (var i = 0, len = cssProperties.length; i < len; i++) {
        iframeContainerDiv.style[cssProperties[i][0]] = cssProperties[i][1];
      }

      var iframeSrc = useDocumentWrite ? '' : ' src="' + getConsoleUrl() + '"';

      // Adding an iframe using the DOM would be preferable, but it doesn't work
      // in IE5 on Windows, or in Konqueror prior to version 3.5 - in Konqueror
      // it creates the iframe fine but I haven't been able to find a way to obtain
      // the iframe's window object
      iframeContainerDiv.innerHTML = '<iframe id="' + iframeId + '" name="' + iframeId +
        '" width="100%" height="100%" frameborder="0"' + iframeSrc +
        ' scrolling="no"></iframe>';
      consoleClosed = false;

      // Write the console HTML to the iframe
      var iframeDocumentExistsTest = function (win) {
        try {
          return toBool(win) && (toBool(win.document) || (toBool(win.contentDocument)));
        } catch (ex) {
          return false;
        }
      };
      if (iframeDocumentExistsTest(getConsoleWindow())) {
        writeToDocument();
      } else {
        pollConsoleWindow(iframeDocumentExistsTest, 100, writeToDocument, initErrorMessage);
      }
      consoleWindowCreated = true;
    };

    /**
     *
     * @param show
     */
    createWindow = function (show) {
      if (show || !initiallyMinimized) {
        var pageLoadHandler = function () {
          if (!container) {
            // Set up default container element
            containerElement = document.createElement('div');
            containerElement.style.position = 'fixed';
            containerElement.style.left = '0';
            containerElement.style.right = '0';
            containerElement.style.bottom = '0';
            document.body.appendChild(containerElement);
            appender.addCssProperty('borderWidth', '1px 0 0 0');
            appender.addCssProperty('zIndex', 1000000); // Can't find anything authoritative that says how big z-index can be
            open();
          } else {
            try {
              var el = document.getElementById(container);
              if (el.nodeType === 1) {
                containerElement = el;
              }
              open();
            } catch (ex) {
              handleError('InPageAppender.init: invalid container element "' + container + '" supplied', ex);
            }
          }
        };

        // Test the type of the container supplied. First, check if it's an element
        if (pageLoaded && container && container.appendChild) {
          containerElement = container;
          open();
        } else if (pageLoaded) {
          pageLoadHandler();
        } else {
          log4javascript.addEventListener('load', pageLoadHandler);
        }
        windowCreationStarted = true;
      }
    };

    /**
     * @todo document
     */
    init = function () {
      createWindow();
      initialized = true;
    };

    /**
     *
     * @returns {HTMLIFrameElement | undefined}
     */
    getConsoleWindow = function () {
      var iframe = window.frames[iframeId];
      if (iframe) {
        return iframe;
      }
    };

    /**
     *
     * @returns {Boolean}
     */
    safeToAppend = function () {
      if (isSupported && !consoleClosed) {
        if (consoleWindowCreated && !consoleWindowLoaded && getConsoleWindow() && isLoaded(getConsoleWindow())) {
          consoleWindowLoaded = true;
        }
        return consoleWindowLoaded;
      }
      return false;
    };
  } else {
    // PopUpAppender

    // Extract params
    var useOldPopUp = appender.defaults.useOldPopUp;
    var complainAboutPopUpBlocking = appender.defaults.complainAboutPopUpBlocking;
    var reopenWhenClosed = this.defaults.reopenWhenClosed;

    // Configuration methods. The function scope is used to prevent
    // direct alteration to the appender configuration properties.
    /**
     *
     * @returns {PopUpAppender.defaults.useOldPopUp|*|a.defaults.useOldPopUp}
     */
    this.isUseOldPopUp = function () {
      return useOldPopUp;
    };

    /**
     *
     * @param {Boolean} useOldPopUpParam
     */
    this.setUseOldPopUp = function (useOldPopUpParam) {
      if (checkCanConfigure('useOldPopUp')) {
        useOldPopUp = toBool(useOldPopUpParam);
      }
    };

    /**
     *
     * @returns {PopUpAppender.defaults.complainAboutPopUpBlocking|*|a.defaults.complainAboutPopUpBlocking}
     */
    this.isComplainAboutPopUpBlocking = function () {
      return complainAboutPopUpBlocking;
    };

    /**
     *
     * @param {Boolean} complainAboutPopUpBlockingParam
     */
    this.setComplainAboutPopUpBlocking = function (complainAboutPopUpBlockingParam) {
      if (checkCanConfigure('complainAboutPopUpBlocking')) {
        complainAboutPopUpBlocking = toBool(complainAboutPopUpBlockingParam);
      }
    };

    /**
     *
     * @returns {Boolean}
     */
    this.isFocusPopUp = function () {
      return focusConsoleWindow;
    };

    /**
     *
     * @param {Boolean} focusPopUpParam
     */
    this.setFocusPopUp = function (focusPopUpParam) {
      // This property can be safely altered after logging has started
      focusConsoleWindow = toBool(focusPopUpParam);
    };

    /**
     *
     * @returns {PopUpAppender.defaults.reopenWhenClosed|*|a.defaults.reopenWhenClosed}
     */
    this.isReopenWhenClosed = function () {
      return reopenWhenClosed;
    };

    /**
     *
     * @param {Boolean} reopenWhenClosedParam
     */
    this.setReopenWhenClosed = function (reopenWhenClosedParam) {
      // This property can be safely altered after logging has started
      reopenWhenClosed = toBool(reopenWhenClosedParam);
    };

    /**
     * @todo document
     */
    this.close = function () {
      logLog.debug('close ' + this);
      try {
        popUp.close();
        this.unload();
      } catch (ex) {
        // Do nothing
      }
    };

    /**
     * @todo document
     */
    this.hide = function () {
      logLog.debug('hide ' + this);
      if (consoleWindowExists()) {
        this.close();
      }
    };

    /**
     * @todo document
     */
    this.show = function () {
      logLog.debug('show ' + this);
      if (!consoleWindowCreated) {
        open();
      }
    };

    /**
     *
     * @returns {Boolean}
     */
    this.isVisible = function () {
      return safeToAppend();
    };

    // Define useful variables
    var popUp;

    // Create open, init, getConsoleWindow and safeToAppend functions
    /**
     * @todo document
     */
    open = function () {
      var windowProperties = 'width=' + width + ',height=' + height + ',status,resizable';
      var frameInfo = '';
      try {
        var frameEl = window.frameElement;
        if (frameEl) {
          frameInfo = '_' + frameEl.tagName + '_' + (frameEl.name || frameEl.id || '');
        }
      } catch (e) {
        frameInfo = '_inaccessibleParentFrame';
      }
      var windowName = 'PopUp_' + location.host.replace(/[^a-z0-9]/gi, '_') + '_' + consoleAppenderId + frameInfo;
      if (!useOldPopUp || !useDocumentWrite) {
        // Ensure a previous window isn't used by using a unique name
        windowName = windowName + '_' + uniqueId;
      }

      var checkPopUpClosed = function (win) {
        if (consoleClosed) {
          return true;
        } else {
          try {
            return toBool(win) && win.closed;
          } catch (ex) {
          }
        }
        return false;
      };

      var popUpClosedCallback = function () {
        if (!consoleClosed) {
          appender.unload();
        }
      };

      function finalInit() {
        getConsoleWindow().setCloseIfOpenerCloses(!useOldPopUp || !useDocumentWrite);
        consoleWindowLoadHandler();
        consoleWindowLoaded = true;
        appendQueuedLoggingEvents();
        pollConsoleWindow(checkPopUpClosed, 500, popUpClosedCallback,
          'PopUpAppender.checkPopUpClosed: error checking pop-up window');
      }

      try {
        popUp = window.open(getConsoleUrl(), windowName, windowProperties);
        consoleClosed = false;
        consoleWindowCreated = true;
        if (popUp && popUp.document) {
          if (useDocumentWrite && useOldPopUp && isLoaded(popUp)) {
            popUp.mainPageReloaded();
            finalInit();
          } else {
            if (useDocumentWrite) {
              writeHtml(popUp.document);
            }
            // Check if the pop-up window object is available
            var popUpLoadedTest = function (win) {
              return toBool(win) && isLoaded(win);
            };
            if (isLoaded(popUp)) {
              finalInit();
            } else {
              pollConsoleWindow(popUpLoadedTest, 100, finalInit,
                'PopUpAppender.init: unable to create console window');
            }
          }
        } else {
          isSupported = false;
          logLog.warn('PopUpAppender.init: pop-ups blocked, please unblock to use PopUpAppender');
          if (complainAboutPopUpBlocking) {
            handleError('log4javascript: pop-up windows appear to be blocked. Please unblock them to use pop-up logging.');
          }
        }
      } catch (ex) {
        handleError('PopUpAppender.init: error creating pop-up', ex);
      }
    };

    /**
     * @todo document
     */
    createWindow = function () {
      if (!initiallyMinimized) {
        open();
      }
    };

    /**
     * @todo document
     */
    init = function () {
      createWindow();
      initialized = true;
    };

    /**
     *
     * @returns {*}
     */
    getConsoleWindow = function () {
      return popUp;
    };

    /**
     *
     * @returns {Boolean}
     */
    safeToAppend = function () {
      if (isSupported && !isUndefined(popUp) && !consoleClosed) {
        if (popUp.closed ||
          (consoleWindowLoaded && isUndefined(popUp.closed))) { // Extra check for Opera
          appender.unload();
          logLog.debug('PopUpAppender: pop-up closed');
          return false;
        }
        if (!consoleWindowLoaded && isLoaded(popUp)) {
          consoleWindowLoaded = true;
        }
      }
      return isSupported && consoleWindowLoaded && !consoleClosed;
    };
  }

  /**
   * Expose getConsoleWindow so that automated tests can check the DOM
   * @type {*}
   */
  this.getConsoleWindow = getConsoleWindow;
};
/**
 *
 * @param functionName
 * @param commandLineFunction
 */
ConsoleAppender.addGlobalCommandLineFunction = function (functionName, commandLineFunction) {
  'use strict';

  defaultCommandLineFunctions.push([functionName, commandLineFunction]);
};