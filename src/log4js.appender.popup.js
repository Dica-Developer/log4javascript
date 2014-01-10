/* ---------------------------------------------------------------------- */
// PopUpAppender and InPageAppender related

function setCookie(name, value, days, path) {
  var expires;
  path = path ? "; path=" + path : "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toGMTString();
  } else {
    expires = "";
  }
  document.cookie = escape(name) + "=" + escape(value) + expires + path;
}

function getCookie(name) {
  var nameEquals = escape(name) + "=";
  var ca = document.cookie.split(";");
  for (var i = 0, len = ca.length; i < len; i++) {
    var c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEquals) === 0) {
      return unescape(c.substring(nameEquals.length, c.length));
    }
  }
  return null;
}

// Gets the base URL of the location of the log4javascript script.
// This is far from infallible.
function getBaseUrl() {
  var scripts = document.getElementsByTagName("script");
  for (var i = 0, len = scripts.length; i < len; ++i) {
    if (scripts[i].src.indexOf("log4javascript") != -1) {
      var lastSlash = scripts[i].src.lastIndexOf("/");
      return (lastSlash == -1) ? "" : scripts[i].src.substr(0, lastSlash + 1);
    }
  }
  return null;
}

function isLoaded(win) {
  try {
    return bool(win.loaded);
  } catch (ex) {
    return false;
  }
}

/* ---------------------------------------------------------------------- */
// ConsoleAppender (prototype for PopUpAppender and InPageAppender)

var ConsoleAppender;

// Create an anonymous function to protect base console methods
(function() {
  var getConsoleHtmlLines = function() {
    return [
      '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
      '<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">',
      '	<head>',
      '		<title>log4javascript</title>',
      '		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />',
      '		<!-- Make IE8 behave like IE7, having gone to all the trouble of making IE work -->',
      '		<meta http-equiv="X-UA-Compatible" content="IE=7" />',
      '		<script type="text/javascript">var isIe = false, isIePre7 = false;</script>',
      '		<!--[if IE]><script type="text/javascript">isIe = true</script><![endif]-->',
      '		<!--[if lt IE 7]><script type="text/javascript">isIePre7 = true</script><![endif]-->',
      '		<script type="text/javascript">',
      '			//<![CDATA[',
      '			var loggingEnabled = true;',
      '			var logQueuedEventsTimer = null;',
      '			var logEntries = [];',
      '			var logEntriesAndSeparators = [];',
      '			var logItems = [];',
      '			var renderDelay = 100;',
      '			var unrenderedLogItemsExist = false;',
      '			var rootGroup, currentGroup = null;',
      '			var loaded = false;',
      '			var currentLogItem = null;',
      '			var logMainContainer;',
      '',
      '			function copyProperties(obj, props) {',
      '				for (var i in props) {',
      '					obj[i] = props[i];',
      '				}',
      '			}',
      '',
      '			/*----------------------------------------------------------------*/',
      '',
      '			function LogItem() {',
      '			}',
      '',
      '			LogItem.prototype = {',
      '				mainContainer: null,',
      '				wrappedContainer: null,',
      '				unwrappedContainer: null,',
      '				group: null,',
      '',
      '				appendToLog: function() {',
      '					for (var i = 0, len = this.elementContainers.length; i < len; i++) {',
      '						this.elementContainers[i].appendToLog();',
      '					}',
      '					this.group.update();',
      '				},',
      '',
      '				doRemove: function(doUpdate, removeFromGroup) {',
      '					if (this.rendered) {',
      '						for (var i = 0, len = this.elementContainers.length; i < len; i++) {',
      '							this.elementContainers[i].remove();',
      '						}',
      '						this.unwrappedElementContainer = null;',
      '						this.wrappedElementContainer = null;',
      '						this.mainElementContainer = null;',
      '					}',
      '					if (this.group && removeFromGroup) {',
      '						this.group.removeChild(this, doUpdate);',
      '					}',
      '					if (this === currentLogItem) {',
      '						currentLogItem = null;',
      '					}',
      '				},',
      '',
      '				remove: function(doUpdate, removeFromGroup) {',
      '					this.doRemove(doUpdate, removeFromGroup);',
      '				},',
      '',
      '				render: function() {},',
      '',
      '				accept: function(visitor) {',
      '					visitor.visit(this);',
      '				},',
      '',
      '				getUnwrappedDomContainer: function() {',
      '					return this.group.unwrappedElementContainer.contentDiv;',
      '				},',
      '',
      '				getWrappedDomContainer: function() {',
      '					return this.group.wrappedElementContainer.contentDiv;',
      '				},',
      '',
      '				getMainDomContainer: function() {',
      '					return this.group.mainElementContainer.contentDiv;',
      '				}',
      '			};',
      '',
      '			LogItem.serializedItemKeys = {LOG_ENTRY: 0, GROUP_START: 1, GROUP_END: 2};',
      '',
      '			/*----------------------------------------------------------------*/',
      '',
      '			function LogItemContainerElement() {',
      '			}',
      '',
      '			LogItemContainerElement.prototype = {',
      '				appendToLog: function() {',
      '					var insertBeforeFirst = (newestAtTop && this.containerDomNode.hasChildNodes());',
      '					if (insertBeforeFirst) {',
      '						this.containerDomNode.insertBefore(this.mainDiv, this.containerDomNode.firstChild);',
      '					} else {',
      '						this.containerDomNode.appendChild(this.mainDiv);',
      '					}',
      '				}',
      '			};',
      '',
      '			/*----------------------------------------------------------------*/',
      '',
      '			function SeparatorElementContainer(containerDomNode) {',
      '				this.containerDomNode = containerDomNode;',
      '				this.mainDiv = document.createElement("div");',
      '				this.mainDiv.className = "separator";',
      '				this.mainDiv.innerHTML = "&nbsp;";',
      '			}',
      '',
      '			SeparatorElementContainer.prototype = new LogItemContainerElement();',
      '',
      '			SeparatorElementContainer.prototype.remove = function() {',
      '				this.mainDiv.parentNode.removeChild(this.mainDiv);',
      '				this.mainDiv = null;',
      '			};',
      '',
      '			/*----------------------------------------------------------------*/',
      '',
      '			function Separator() {',
      '				this.rendered = false;',
      '			}',
      '',
      '			Separator.prototype = new LogItem();',
      '',
      '			copyProperties(Separator.prototype, {',
      '				render: function() {',
      '					var containerDomNode = this.group.contentDiv;',
      '					if (isIe) {',
      '						this.unwrappedElementContainer = new SeparatorElementContainer(this.getUnwrappedDomContainer());',
      '						this.wrappedElementContainer = new SeparatorElementContainer(this.getWrappedDomContainer());',
      '						this.elementContainers = [this.unwrappedElementContainer, this.wrappedElementContainer];',
      '					} else {',
      '						this.mainElementContainer = new SeparatorElementContainer(this.getMainDomContainer());',
      '						this.elementContainers = [this.mainElementContainer];',
      '					}',
      '					this.content = this.formattedMessage;',
      '					this.rendered = true;',
      '				}',
      '			});',
      '',
      '			/*----------------------------------------------------------------*/',
      '',
      '			function GroupElementContainer(group, containerDomNode, isRoot, isWrapped) {',
      '				this.group = group;',
      '				this.containerDomNode = containerDomNode;',
      '				this.isRoot = isRoot;',
      '				this.isWrapped = isWrapped;',
      '				this.expandable = false;',
      '',
      '				if (this.isRoot) {',
      '					if (isIe) {',
      '						this.contentDiv = logMainContainer.appendChild(document.createElement("div"));',
      '						this.contentDiv.id = this.isWrapped ? "log_wrapped" : "log_unwrapped";',
      '					} else {',
      '						this.contentDiv = logMainContainer;',
      '					}',
      '				} else {',
      '					var groupElementContainer = this;',
      '					',
      '					this.mainDiv = document.createElement("div");',
      '					this.mainDiv.className = "group";',
      '',
      '					this.headingDiv = this.mainDiv.appendChild(document.createElement("div"));',
      '					this.headingDiv.className = "groupheading";',
      '',
      '					this.expander = this.headingDiv.appendChild(document.createElement("span"));',
      '					this.expander.className = "expander unselectable greyedout";',
      '					this.expander.unselectable = true;',
      '					var expanderText = this.group.expanded ? "-" : "+";',
      '					this.expanderTextNode = this.expander.appendChild(document.createTextNode(expanderText));',
      '					',
      '					this.headingDiv.appendChild(document.createTextNode(" " + this.group.name));',
      '',
      '					this.contentDiv = this.mainDiv.appendChild(document.createElement("div"));',
      '					var contentCssClass = this.group.expanded ? "expanded" : "collapsed";',
      '					this.contentDiv.className = "groupcontent " + contentCssClass;',
      '',
      '					this.expander.onclick = function() {',
      '						if (groupElementContainer.group.expandable) {',
      '							groupElementContainer.group.toggleExpanded();',
      '						}',
      '					};',
      '				}',
      '			}',
      '',
      '			GroupElementContainer.prototype = new LogItemContainerElement();',
      '',
      '			copyProperties(GroupElementContainer.prototype, {',
      '				toggleExpanded: function() {',
      '					if (!this.isRoot) {',
      '						var oldCssClass, newCssClass, expanderText;',
      '						if (this.group.expanded) {',
      '							newCssClass = "expanded";',
      '							oldCssClass = "collapsed";',
      '							expanderText = "-";',
      '						} else {',
      '							newCssClass = "collapsed";',
      '							oldCssClass = "expanded";',
      '							expanderText = "+";',
      '						}',
      '						replaceClass(this.contentDiv, newCssClass, oldCssClass);',
      '						this.expanderTextNode.nodeValue = expanderText;',
      '					}',
      '				},',
      '',
      '				remove: function() {',
      '					if (!this.isRoot) {',
      '						this.headingDiv = null;',
      '						this.expander.onclick = null;',
      '						this.expander = null;',
      '						this.expanderTextNode = null;',
      '						this.contentDiv = null;',
      '						this.containerDomNode = null;',
      '						this.mainDiv.parentNode.removeChild(this.mainDiv);',
      '						this.mainDiv = null;',
      '					}',
      '				},',
      '',
      '				reverseChildren: function() {',
      '					// Invert the order of the log entries',
      '					var node = null;',
      '',
      '					// Remove all the log container nodes',
      '					var childDomNodes = [];',
      '					while ((node = this.contentDiv.firstChild)) {',
      '						this.contentDiv.removeChild(node);',
      '						childDomNodes.push(node);',
      '					}',
      '',
      '					// Put them all back in reverse order',
      '					while ((node = childDomNodes.pop())) {',
      '						this.contentDiv.appendChild(node);',
      '					}',
      '				},',
      '',
      '				update: function() {',
      '					if (!this.isRoot) {',
      '						if (this.group.expandable) {',
      '							removeClass(this.expander, "greyedout");',
      '						} else {',
      '							addClass(this.expander, "greyedout");',
      '						}',
      '					}',
      '				},',
      '',
      '				clear: function() {',
      '					if (this.isRoot) {',
      '						this.contentDiv.innerHTML = "";',
      '					}',
      '				}',
      '			});',
      '',
      '			/*----------------------------------------------------------------*/',
      '',
      '			function Group(name, isRoot, initiallyExpanded) {',
      '				this.name = name;',
      '				this.group = null;',
      '				this.isRoot = isRoot;',
      '				this.initiallyExpanded = initiallyExpanded;',
      '				this.elementContainers = [];',
      '				this.children = [];',
      '				this.expanded = initiallyExpanded;',
      '				this.rendered = false;',
      '				this.expandable = false;',
      '			}',
      '',
      '			Group.prototype = new LogItem();',
      '',
      '			copyProperties(Group.prototype, {',
      '				addChild: function(logItem) {',
      '					this.children.push(logItem);',
      '					logItem.group = this;',
      '				},',
      '',
      '				render: function() {',
      '					if (isIe) {',
      '						var unwrappedDomContainer, wrappedDomContainer;',
      '						if (this.isRoot) {',
      '							unwrappedDomContainer = logMainContainer;',
      '							wrappedDomContainer = logMainContainer;',
      '						} else {',
      '							unwrappedDomContainer = this.getUnwrappedDomContainer();',
      '							wrappedDomContainer = this.getWrappedDomContainer();',
      '						}',
      '						this.unwrappedElementContainer = new GroupElementContainer(this, unwrappedDomContainer, this.isRoot, false);',
      '						this.wrappedElementContainer = new GroupElementContainer(this, wrappedDomContainer, this.isRoot, true);',
      '						this.elementContainers = [this.unwrappedElementContainer, this.wrappedElementContainer];',
      '					} else {',
      '						var mainDomContainer = this.isRoot ? logMainContainer : this.getMainDomContainer();',
      '						this.mainElementContainer = new GroupElementContainer(this, mainDomContainer, this.isRoot, false);',
      '						this.elementContainers = [this.mainElementContainer];',
      '					}',
      '					this.rendered = true;',
      '				},',
      '',
      '				toggleExpanded: function() {',
      '					this.expanded = !this.expanded;',
      '					for (var i = 0, len = this.elementContainers.length; i < len; i++) {',
      '						this.elementContainers[i].toggleExpanded();',
      '					}',
      '				},',
      '',
      '				expand: function() {',
      '					if (!this.expanded) {',
      '						this.toggleExpanded();',
      '					}',
      '				},',
      '',
      '				accept: function(visitor) {',
      '					visitor.visitGroup(this);',
      '				},',
      '',
      '				reverseChildren: function() {',
      '					if (this.rendered) {',
      '						for (var i = 0, len = this.elementContainers.length; i < len; i++) {',
      '							this.elementContainers[i].reverseChildren();',
      '						}',
      '					}',
      '				},',
      '',
      '				update: function() {',
      '					var previouslyExpandable = this.expandable;',
      '					this.expandable = (this.children.length !== 0);',
      '					if (this.expandable !== previouslyExpandable) {',
      '						for (var i = 0, len = this.elementContainers.length; i < len; i++) {',
      '							this.elementContainers[i].update();',
      '						}',
      '					}',
      '				},',
      '',
      '				flatten: function() {',
      '					var visitor = new GroupFlattener();',
      '					this.accept(visitor);',
      '					return visitor.logEntriesAndSeparators;',
      '				},',
      '',
      '				removeChild: function(child, doUpdate) {',
      '					array_remove(this.children, child);',
      '					child.group = null;',
      '					if (doUpdate) {',
      '						this.update();',
      '					}',
      '				},',
      '',
      '				remove: function(doUpdate, removeFromGroup) {',
      '					for (var i = 0, len = this.children.length; i < len; i++) {',
      '						this.children[i].remove(false, false);',
      '					}',
      '					this.children = [];',
      '					this.update();',
      '					if (this === currentGroup) {',
      '						currentGroup = this.group;',
      '					}',
      '					this.doRemove(doUpdate, removeFromGroup);',
      '				},',
      '',
      '				serialize: function(items) {',
      '					items.push([LogItem.serializedItemKeys.GROUP_START, this.name]);',
      '					for (var i = 0, len = this.children.length; i < len; i++) {',
      '						this.children[i].serialize(items);',
      '					}',
      '					if (this !== currentGroup) {',
      '						items.push([LogItem.serializedItemKeys.GROUP_END]);',
      '					}',
      '				},',
      '',
      '				clear: function() {',
      '					for (var i = 0, len = this.elementContainers.length; i < len; i++) {',
      '						this.elementContainers[i].clear();',
      '					}',
      '				}',
      '			});',
      '',
      '			/*----------------------------------------------------------------*/',
      '',
      '			function LogEntryElementContainer() {',
      '			}',
      '',
      '			LogEntryElementContainer.prototype = new LogItemContainerElement();',
      '',
      '			copyProperties(LogEntryElementContainer.prototype, {',
      '				remove: function() {',
      '					this.doRemove();',
      '				},',
      '',
      '				doRemove: function() {',
      '					this.mainDiv.parentNode.removeChild(this.mainDiv);',
      '					this.mainDiv = null;',
      '					this.contentElement = null;',
      '					this.containerDomNode = null;',
      '				},',
      '',
      '				setContent: function(content, wrappedContent) {',
      '					if (content === this.formattedMessage) {',
      '						this.contentElement.innerHTML = "";',
      '						this.contentElement.appendChild(document.createTextNode(this.formattedMessage));',
      '					} else {',
      '						this.contentElement.innerHTML = content;',
      '					}',
      '				},',
      '',
      '				setSearchMatch: function(isMatch) {',
      '					var oldCssClass = isMatch ? "searchnonmatch" : "searchmatch";',
      '					var newCssClass = isMatch ? "searchmatch" : "searchnonmatch";',
      '					replaceClass(this.mainDiv, newCssClass, oldCssClass);',
      '				},',
      '',
      '				clearSearch: function() {',
      '					removeClass(this.mainDiv, "searchmatch");',
      '					removeClass(this.mainDiv, "searchnonmatch");',
      '				}',
      '			});',
      '',
      '			/*----------------------------------------------------------------*/',
      '',
      '			function LogEntryWrappedElementContainer(logEntry, containerDomNode) {',
      '				this.logEntry = logEntry;',
      '				this.containerDomNode = containerDomNode;',
      '				this.mainDiv = document.createElement("div");',
      '				this.mainDiv.appendChild(document.createTextNode(this.logEntry.formattedMessage));',
      '				this.mainDiv.className = "logentry wrapped " + this.logEntry.level;',
      '				this.contentElement = this.mainDiv;',
      '			}',
      '',
      '			LogEntryWrappedElementContainer.prototype = new LogEntryElementContainer();',
      '',
      '			LogEntryWrappedElementContainer.prototype.setContent = function(content, wrappedContent) {',
      '				if (content === this.formattedMessage) {',
      '					this.contentElement.innerHTML = "";',
      '					this.contentElement.appendChild(document.createTextNode(this.formattedMessage));',
      '				} else {',
      '					this.contentElement.innerHTML = wrappedContent;',
      '				}',
      '			};',
      '',
      '			/*----------------------------------------------------------------*/',
      '',
      '			function LogEntryUnwrappedElementContainer(logEntry, containerDomNode) {',
      '				this.logEntry = logEntry;',
      '				this.containerDomNode = containerDomNode;',
      '				this.mainDiv = document.createElement("div");',
      '				this.mainDiv.className = "logentry unwrapped " + this.logEntry.level;',
      '				this.pre = this.mainDiv.appendChild(document.createElement("pre"));',
      '				this.pre.appendChild(document.createTextNode(this.logEntry.formattedMessage));',
      '				this.pre.className = "unwrapped";',
      '				this.contentElement = this.pre;',
      '			}',
      '',
      '			LogEntryUnwrappedElementContainer.prototype = new LogEntryElementContainer();',
      '',
      '			LogEntryUnwrappedElementContainer.prototype.remove = function() {',
      '				this.doRemove();',
      '				this.pre = null;',
      '			};',
      '',
      '			/*----------------------------------------------------------------*/',
      '',
      '			function LogEntryMainElementContainer(logEntry, containerDomNode) {',
      '				this.logEntry = logEntry;',
      '				this.containerDomNode = containerDomNode;',
      '				this.mainDiv = document.createElement("div");',
      '				this.mainDiv.className = "logentry nonielogentry " + this.logEntry.level;',
      '				this.contentElement = this.mainDiv.appendChild(document.createElement("span"));',
      '				this.contentElement.appendChild(document.createTextNode(this.logEntry.formattedMessage));',
      '			}',
      '',
      '			LogEntryMainElementContainer.prototype = new LogEntryElementContainer();',
      '',
      '			/*----------------------------------------------------------------*/',
      '',
      '			function LogEntry(level, formattedMessage) {',
      '				this.level = level;',
      '				this.formattedMessage = formattedMessage;',
      '				this.rendered = false;',
      '			}',
      '',
      '			LogEntry.prototype = new LogItem();',
      '',
      '			copyProperties(LogEntry.prototype, {',
      '				render: function() {',
      '					var logEntry = this;',
      '					var containerDomNode = this.group.contentDiv;',
      '',
      '					// Support for the CSS attribute white-space in IE for Windows is',
      '					// non-existent pre version 6 and slightly odd in 6, so instead',
      '					// use two different HTML elements',
      '					if (isIe) {',
      '						this.formattedMessage = this.formattedMessage.replace(/\\r\\n/g, "\\r"); // Workaround for IE\'s treatment of white space',
      '						this.unwrappedElementContainer = new LogEntryUnwrappedElementContainer(this, this.getUnwrappedDomContainer());',
      '						this.wrappedElementContainer = new LogEntryWrappedElementContainer(this, this.getWrappedDomContainer());',
      '						this.elementContainers = [this.unwrappedElementContainer, this.wrappedElementContainer];',
      '					} else {',
      '						this.mainElementContainer = new LogEntryMainElementContainer(this, this.getMainDomContainer());',
      '						this.elementContainers = [this.mainElementContainer];',
      '					}',
      '					this.content = this.formattedMessage;',
      '					this.rendered = true;',
      '				},',
      '',
      '				setContent: function(content, wrappedContent) {',
      '					if (content != this.content) {',
      '						if (isIe && (content !== this.formattedMessage)) {',
      '							content = content.replace(/\\r\\n/g, "\\r"); // Workaround for IE\'s treatment of white space',
      '						}',
      '						for (var i = 0, len = this.elementContainers.length; i < len; i++) {',
      '							this.elementContainers[i].setContent(content, wrappedContent);',
      '						}',
      '						this.content = content;',
      '					}',
      '				},',
      '',
      '				getSearchMatches: function() {',
      '					var matches = [];',
      '					var i, len;',
      '					if (isIe) {',
      '						var unwrappedEls = getElementsByClass(this.unwrappedElementContainer.mainDiv, "searchterm", "span");',
      '						var wrappedEls = getElementsByClass(this.wrappedElementContainer.mainDiv, "searchterm", "span");',
      '						for (i = 0, len = unwrappedEls.length; i < len; i++) {',
      '							matches[i] = new Match(this.level, null, unwrappedEls[i], wrappedEls[i]);',
      '						}',
      '					} else {',
      '						var els = getElementsByClass(this.mainElementContainer.mainDiv, "searchterm", "span");',
      '						for (i = 0, len = els.length; i < len; i++) {',
      '							matches[i] = new Match(this.level, els[i]);',
      '						}',
      '					}',
      '					return matches;',
      '				},',
      '',
      '				setSearchMatch: function(isMatch) {',
      '					for (var i = 0, len = this.elementContainers.length; i < len; i++) {',
      '						this.elementContainers[i].setSearchMatch(isMatch);',
      '					}',
      '				},',
      '',
      '				clearSearch: function() {',
      '					for (var i = 0, len = this.elementContainers.length; i < len; i++) {',
      '						this.elementContainers[i].clearSearch();',
      '					}',
      '				},',
      '',
      '				accept: function(visitor) {',
      '					visitor.visitLogEntry(this);',
      '				},',
      '',
      '				serialize: function(items) {',
      '					items.push([LogItem.serializedItemKeys.LOG_ENTRY, this.level, this.formattedMessage]);',
      '				}',
      '			});',
      '',
      '			/*----------------------------------------------------------------*/',
      '',
      '			function LogItemVisitor() {',
      '			}',
      '',
      '			LogItemVisitor.prototype = {',
      '				visit: function(logItem) {',
      '				},',
      '',
      '				visitParent: function(logItem) {',
      '					if (logItem.group) {',
      '						logItem.group.accept(this);',
      '					}',
      '				},',
      '',
      '				visitChildren: function(logItem) {',
      '					for (var i = 0, len = logItem.children.length; i < len; i++) {',
      '						logItem.children[i].accept(this);',
      '					}',
      '				},',
      '',
      '				visitLogEntry: function(logEntry) {',
      '					this.visit(logEntry);',
      '				},',
      '',
      '				visitSeparator: function(separator) {',
      '					this.visit(separator);',
      '				},',
      '',
      '				visitGroup: function(group) {',
      '					this.visit(group);',
      '				}',
      '			};',
      '',
      '			/*----------------------------------------------------------------*/',
      '',
      '			function GroupFlattener() {',
      '				this.logEntriesAndSeparators = [];',
      '			}',
      '',
      '			GroupFlattener.prototype = new LogItemVisitor();',
      '',
      '			GroupFlattener.prototype.visitGroup = function(group) {',
      '				this.visitChildren(group);',
      '			};',
      '',
      '			GroupFlattener.prototype.visitLogEntry = function(logEntry) {',
      '				this.logEntriesAndSeparators.push(logEntry);',
      '			};',
      '',
      '			GroupFlattener.prototype.visitSeparator = function(separator) {',
      '				this.logEntriesAndSeparators.push(separator);',
      '			};',
      '',
      '			/*----------------------------------------------------------------*/',
      '',
      '			window.onload = function() {',
      '				// Sort out document.domain',
      '				if (location.search) {',
      '					var queryBits = unescape(location.search).substr(1).split("&"), nameValueBits;',
      '					for (var i = 0, len = queryBits.length; i < len; i++) {',
      '						nameValueBits = queryBits[i].split("=");',
      '						if (nameValueBits[0] == "log4javascript_domain") {',
      '							document.domain = nameValueBits[1];',
      '							break;',
      '						}',
      '					}',
      '				}',
      '',
      '				// Create DOM objects',
      '				logMainContainer = $("log");',
      '				if (isIePre7) {',
      '					addClass(logMainContainer, "oldIe");',
      '				}',
      '',
      '				rootGroup = new Group("root", true);',
      '				rootGroup.render();',
      '				currentGroup = rootGroup;',
      '				',
      '				setCommandInputWidth();',
      '				setLogContainerHeight();',
      '				toggleLoggingEnabled();',
      '				toggleSearchEnabled();',
      '				toggleSearchFilter();',
      '				toggleSearchHighlight();',
      '				applyFilters();',
      '				checkAllLevels();',
      '				toggleWrap();',
      '				toggleNewestAtTop();',
      '				toggleScrollToLatest();',
      '				renderQueuedLogItems();',
      '				loaded = true;',
      '				$("command").value = "";',
      '				$("command").autocomplete = "off";',
      '				$("command").onkeydown = function(evt) {',
      '					evt = getEvent(evt);',
      '					if (evt.keyCode == 10 || evt.keyCode == 13) { // Return/Enter',
      '						evalCommandLine();',
      '						stopPropagation(evt);',
      '					} else if (evt.keyCode == 27) { // Escape',
      '						this.value = "";',
      '						this.focus();',
      '					} else if (evt.keyCode == 38 && commandHistory.length > 0) { // Up',
      '						currentCommandIndex = Math.max(0, currentCommandIndex - 1);',
      '						this.value = commandHistory[currentCommandIndex];',
      '						moveCaretToEnd(this);',
      '					} else if (evt.keyCode == 40 && commandHistory.length > 0) { // Down',
      '						currentCommandIndex = Math.min(commandHistory.length - 1, currentCommandIndex + 1);',
      '						this.value = commandHistory[currentCommandIndex];',
      '						moveCaretToEnd(this);',
      '					}',
      '				};',
      '',
      '				// Prevent the keypress moving the caret in Firefox',
      '				$("command").onkeypress = function(evt) {',
      '					evt = getEvent(evt);',
      '					if (evt.keyCode == 38 && commandHistory.length > 0 && evt.preventDefault) { // Up',
      '						evt.preventDefault();',
      '					}',
      '				};',
      '',
      '				// Prevent the keyup event blurring the input in Opera',
      '				$("command").onkeyup = function(evt) {',
      '					evt = getEvent(evt);',
      '					if (evt.keyCode == 27 && evt.preventDefault) { // Up',
      '						evt.preventDefault();',
      '						this.focus();',
      '					}',
      '				};',
      '',
      '				// Add document keyboard shortcuts',
      '				document.onkeydown = function keyEventHandler(evt) {',
      '					evt = getEvent(evt);',
      '					switch (evt.keyCode) {',
      '						case 69: // Ctrl + shift + E: re-execute last command',
      '							if (evt.shiftKey && (evt.ctrlKey || evt.metaKey)) {',
      '								evalLastCommand();',
      '								cancelKeyEvent(evt);',
      '								return false;',
      '							}',
      '							break;',
      '						case 75: // Ctrl + shift + K: focus search',
      '							if (evt.shiftKey && (evt.ctrlKey || evt.metaKey)) {',
      '								focusSearch();',
      '								cancelKeyEvent(evt);',
      '								return false;',
      '							}',
      '							break;',
      '						case 40: // Ctrl + shift + down arrow: focus command line',
      '						case 76: // Ctrl + shift + L: focus command line',
      '							if (evt.shiftKey && (evt.ctrlKey || evt.metaKey)) {',
      '								focusCommandLine();',
      '								cancelKeyEvent(evt);',
      '								return false;',
      '							}',
      '							break;',
      '					}',
      '				};',
      '',
      '				// Workaround to make sure log div starts at the correct size',
      '				setTimeout(setLogContainerHeight, 20);',
      '',
      '				setShowCommandLine(showCommandLine);',
      '				doSearch();',
      '			};',
      '',
      '			window.onunload = function() {',
      '				if (mainWindowExists()) {',
      '					appender.unload();',
      '				}',
      '				appender = null;',
      '			};',
      '',
      '			/*----------------------------------------------------------------*/',
      '',
      '			function toggleLoggingEnabled() {',
      '				setLoggingEnabled($("enableLogging").checked);',
      '			}',
      '',
      '			function setLoggingEnabled(enable) {',
      '				loggingEnabled = enable;',
      '			}',
      '',
      '			var appender = null;',
      '',
      '			function setAppender(appenderParam) {',
      '				appender = appenderParam;',
      '			}',
      '',
      '			function setShowCloseButton(showCloseButton) {',
      '				$("closeButton").style.display = showCloseButton ? "inline" : "none";',
      '			}',
      '',
      '			function setShowHideButton(showHideButton) {',
      '				$("hideButton").style.display = showHideButton ? "inline" : "none";',
      '			}',
      '',
      '			var newestAtTop = false;',
      '',
      '			/*----------------------------------------------------------------*/',
      '',
      '			function LogItemContentReverser() {',
      '			}',
      '			',
      '			LogItemContentReverser.prototype = new LogItemVisitor();',
      '			',
      '			LogItemContentReverser.prototype.visitGroup = function(group) {',
      '				group.reverseChildren();',
      '				this.visitChildren(group);',
      '			};',
      '',
      '			/*----------------------------------------------------------------*/',
      '',
      '			function setNewestAtTop(isNewestAtTop) {',
      '				var oldNewestAtTop = newestAtTop;',
      '				var i, iLen, j, jLen;',
      '				newestAtTop = Boolean(isNewestAtTop);',
      '				if (oldNewestAtTop != newestAtTop) {',
      '					var visitor = new LogItemContentReverser();',
      '					rootGroup.accept(visitor);',
      '',
      '					// Reassemble the matches array',
      '					if (currentSearch) {',
      '						var currentMatch = currentSearch.matches[currentMatchIndex];',
      '						var matchIndex = 0;',
      '						var matches = [];',
      '						var actOnLogEntry = function(logEntry) {',
      '							var logEntryMatches = logEntry.getSearchMatches();',
      '							for (j = 0, jLen = logEntryMatches.length; j < jLen; j++) {',
      '								matches[matchIndex] = logEntryMatches[j];',
      '								if (currentMatch && logEntryMatches[j].equals(currentMatch)) {',
      '									currentMatchIndex = matchIndex;',
      '								}',
      '								matchIndex++;',
      '							}',
      '						};',
      '						if (newestAtTop) {',
      '							for (i = logEntries.length - 1; i >= 0; i--) {',
      '								actOnLogEntry(logEntries[i]);',
      '							}',
      '						} else {',
      '							for (i = 0, iLen = logEntries.length; i < iLen; i++) {',
      '								actOnLogEntry(logEntries[i]);',
      '							}',
      '						}',
      '						currentSearch.matches = matches;',
      '						if (currentMatch) {',
      '							currentMatch.setCurrent();',
      '						}',
      '					} else if (scrollToLatest) {',
      '						doScrollToLatest();',
      '					}',
      '				}',
      '				$("newestAtTop").checked = isNewestAtTop;',
      '			}',
      '',
      '			function toggleNewestAtTop() {',
      '				var isNewestAtTop = $("newestAtTop").checked;',
      '				setNewestAtTop(isNewestAtTop);',
      '			}',
      '',
      '			var scrollToLatest = true;',
      '',
      '			function setScrollToLatest(isScrollToLatest) {',
      '				scrollToLatest = isScrollToLatest;',
      '				if (scrollToLatest) {',
      '					doScrollToLatest();',
      '				}',
      '				$("scrollToLatest").checked = isScrollToLatest;',
      '			}',
      '',
      '			function toggleScrollToLatest() {',
      '				var isScrollToLatest = $("scrollToLatest").checked;',
      '				setScrollToLatest(isScrollToLatest);',
      '			}',
      '',
      '			function doScrollToLatest() {',
      '				var l = logMainContainer;',
      '				if (typeof l.scrollTop != "undefined") {',
      '					if (newestAtTop) {',
      '						l.scrollTop = 0;',
      '					} else {',
      '						var latestLogEntry = l.lastChild;',
      '						if (latestLogEntry) {',
      '							l.scrollTop = l.scrollHeight;',
      '						}',
      '					}',
      '				}',
      '			}',
      '',
      '			var closeIfOpenerCloses = true;',
      '',
      '			function setCloseIfOpenerCloses(isCloseIfOpenerCloses) {',
      '				closeIfOpenerCloses = isCloseIfOpenerCloses;',
      '			}',
      '',
      '			var maxMessages = null;',
      '',
      '			function setMaxMessages(max) {',
      '				maxMessages = max;',
      '				pruneLogEntries();',
      '			}',
      '',
      '			var showCommandLine = false;',
      '',
      '			function setShowCommandLine(isShowCommandLine) {',
      '				showCommandLine = isShowCommandLine;',
      '				if (loaded) {',
      '					$("commandLine").style.display = showCommandLine ? "block" : "none";',
      '					setCommandInputWidth();',
      '					setLogContainerHeight();',
      '				}',
      '			}',
      '',
      '			function focusCommandLine() {',
      '				if (loaded) {',
      '					$("command").focus();',
      '				}',
      '			}',
      '',
      '			function focusSearch() {',
      '				if (loaded) {',
      '					$("searchBox").focus();',
      '				}',
      '			}',
      '',
      '			function getLogItems() {',
      '				var items = [];',
      '				for (var i = 0, len = logItems.length; i < len; i++) {',
      '					logItems[i].serialize(items);',
      '				}',
      '				return items;',
      '			}',
      '',
      '			function setLogItems(items) {',
      '				var loggingReallyEnabled = loggingEnabled;',
      '				// Temporarily turn logging on',
      '				loggingEnabled = true;',
      '				for (var i = 0, len = items.length; i < len; i++) {',
      '					switch (items[i][0]) {',
      '						case LogItem.serializedItemKeys.LOG_ENTRY:',
      '							log(items[i][1], items[i][2]);',
      '							break;',
      '						case LogItem.serializedItemKeys.GROUP_START:',
      '							group(items[i][1]);',
      '							break;',
      '						case LogItem.serializedItemKeys.GROUP_END:',
      '							groupEnd();',
      '							break;',
      '					}',
      '				}',
      '				loggingEnabled = loggingReallyEnabled;',
      '			}',
      '',
      '			function log(logLevel, formattedMessage) {',
      '				if (loggingEnabled) {',
      '					var logEntry = new LogEntry(logLevel, formattedMessage);',
      '					logEntries.push(logEntry);',
      '					logEntriesAndSeparators.push(logEntry);',
      '					logItems.push(logEntry);',
      '					currentGroup.addChild(logEntry);',
      '					if (loaded) {',
      '						if (logQueuedEventsTimer !== null) {',
      '							clearTimeout(logQueuedEventsTimer);',
      '						}',
      '						logQueuedEventsTimer = setTimeout(renderQueuedLogItems, renderDelay);',
      '						unrenderedLogItemsExist = true;',
      '					}',
      '				}',
      '			}',
      '',
      '			function renderQueuedLogItems() {',
      '				logQueuedEventsTimer = null;',
      '				var pruned = pruneLogEntries();',
      '',
      '				// Render any unrendered log entries and apply the current search to them',
      '				var initiallyHasMatches = currentSearch ? currentSearch.hasMatches() : false;',
      '				for (var i = 0, len = logItems.length; i < len; i++) {',
      '					if (!logItems[i].rendered) {',
      '						logItems[i].render();',
      '						logItems[i].appendToLog();',
      '						if (currentSearch && (logItems[i] instanceof LogEntry)) {',
      '							currentSearch.applyTo(logItems[i]);',
      '						}',
      '					}',
      '				}',
      '				if (currentSearch) {',
      '					if (pruned) {',
      '						if (currentSearch.hasVisibleMatches()) {',
      '							if (currentMatchIndex === null) {',
      '								setCurrentMatchIndex(0);',
      '							}',
      '							displayMatches();',
      '						} else {',
      '							displayNoMatches();',
      '						}',
      '					} else if (!initiallyHasMatches && currentSearch.hasVisibleMatches()) {',
      '						setCurrentMatchIndex(0);',
      '						displayMatches();',
      '					}',
      '				}',
      '				if (scrollToLatest) {',
      '					doScrollToLatest();',
      '				}',
      '				unrenderedLogItemsExist = false;',
      '			}',
      '',
      '			function pruneLogEntries() {',
      '				if ((maxMessages !== null) && (logEntriesAndSeparators.length > maxMessages)) {',
      '					var numberToDelete = logEntriesAndSeparators.length - maxMessages;',
      '					var prunedLogEntries = logEntriesAndSeparators.slice(0, numberToDelete);',
      '					if (currentSearch) {',
      '						currentSearch.removeMatches(prunedLogEntries);',
      '					}',
      '					var group;',
      '					for (var i = 0; i < numberToDelete; i++) {',
      '						group = logEntriesAndSeparators[i].group;',
      '						array_remove(logItems, logEntriesAndSeparators[i]);',
      '						array_remove(logEntries, logEntriesAndSeparators[i]);',
      '						logEntriesAndSeparators[i].remove(true, true);',
      '						if (group.children.length === 0 && group !== currentGroup && group !== rootGroup) {',
      '							array_remove(logItems, group);',
      '							group.remove(true, true);',
      '						}',
      '					}',
      '					logEntriesAndSeparators = array_removeFromStart(logEntriesAndSeparators, numberToDelete);',
      '					return true;',
      '				}',
      '				return false;',
      '			}',
      '',
      '			function group(name, startExpanded) {',
      '				if (loggingEnabled) {',
      '					initiallyExpanded = (typeof startExpanded === "undefined") ? true : Boolean(startExpanded);',
      '					var newGroup = new Group(name, false, initiallyExpanded);',
      '					currentGroup.addChild(newGroup);',
      '					currentGroup = newGroup;',
      '					logItems.push(newGroup);',
      '					if (loaded) {',
      '						if (logQueuedEventsTimer !== null) {',
      '							clearTimeout(logQueuedEventsTimer);',
      '						}',
      '						logQueuedEventsTimer = setTimeout(renderQueuedLogItems, renderDelay);',
      '						unrenderedLogItemsExist = true;',
      '					}',
      '				}',
      '			}',
      '',
      '			function groupEnd() {',
      '				currentGroup = (currentGroup === rootGroup) ? rootGroup : currentGroup.group;',
      '			}',
      '',
      '			function mainPageReloaded() {',
      '				currentGroup = rootGroup;',
      '				var separator = new Separator();',
      '				logEntriesAndSeparators.push(separator);',
      '				logItems.push(separator);',
      '				currentGroup.addChild(separator);',
      '			}',
      '',
      '			function closeWindow() {',
      '				if (appender && mainWindowExists()) {',
      '					appender.close(true);',
      '				} else {',
      '					window.close();',
      '				}',
      '			}',
      '',
      '			function hide() {',
      '				if (appender && mainWindowExists()) {',
      '					appender.hide();',
      '				}',
      '			}',
      '',
      '			var mainWindow = window;',
      '			var windowId = "log4javascriptConsoleWindow_" + new Date().getTime() + "_" + ("" + Math.random()).substr(2);',
      '',
      '			function setMainWindow(win) {',
      '				mainWindow = win;',
      '				mainWindow[windowId] = window;',
      '				// If this is a pop-up, poll the opener to see if it\'s closed',
      '				if (opener && closeIfOpenerCloses) {',
      '					pollOpener();',
      '				}',
      '			}',
      '',
      '			function pollOpener() {',
      '				if (closeIfOpenerCloses) {',
      '					if (mainWindowExists()) {',
      '						setTimeout(pollOpener, 500);',
      '					} else {',
      '						closeWindow();',
      '					}',
      '				}',
      '			}',
      '',
      '			function mainWindowExists() {',
      '				try {',
      '					return (mainWindow && !mainWindow.closed &&',
      '						mainWindow[windowId] == window);',
      '				} catch (ex) {}',
      '				return false;',
      '			}',
      '',
      '			var logLevels = ["TRACE", "DEBUG", "INFO", "WARN", "ERROR", "FATAL"];',
      '',
      '			function getCheckBox(logLevel) {',
      '				return $("switch_" + logLevel);',
      '			}',
      '',
      '			function getIeWrappedLogContainer() {',
      '				return $("log_wrapped");',
      '			}',
      '',
      '			function getIeUnwrappedLogContainer() {',
      '				return $("log_unwrapped");',
      '			}',
      '',
      '			function applyFilters() {',
      '				for (var i = 0; i < logLevels.length; i++) {',
      '					if (getCheckBox(logLevels[i]).checked) {',
      '						addClass(logMainContainer, logLevels[i]);',
      '					} else {',
      '						removeClass(logMainContainer, logLevels[i]);',
      '					}',
      '				}',
      '				updateSearchFromFilters();',
      '			}',
      '',
      '			function toggleAllLevels() {',
      '				var turnOn = $("switch_ALL").checked;',
      '				for (var i = 0; i < logLevels.length; i++) {',
      '					getCheckBox(logLevels[i]).checked = turnOn;',
      '					if (turnOn) {',
      '						addClass(logMainContainer, logLevels[i]);',
      '					} else {',
      '						removeClass(logMainContainer, logLevels[i]);',
      '					}',
      '				}',
      '			}',
      '',
      '			function checkAllLevels() {',
      '				for (var i = 0; i < logLevels.length; i++) {',
      '					if (!getCheckBox(logLevels[i]).checked) {',
      '						getCheckBox("ALL").checked = false;',
      '						return;',
      '					}',
      '				}',
      '				getCheckBox("ALL").checked = true;',
      '			}',
      '',
      '			function clearLog() {',
      '				rootGroup.clear();',
      '				currentGroup = rootGroup;',
      '				logEntries = [];',
      '				logItems = [];',
      '				logEntriesAndSeparators = [];',
      ' 				doSearch();',
      '			}',
      '',
      '			function toggleWrap() {',
      '				var enable = $("wrap").checked;',
      '				if (enable) {',
      '					addClass(logMainContainer, "wrap");',
      '				} else {',
      '					removeClass(logMainContainer, "wrap");',
      '				}',
      '				refreshCurrentMatch();',
      '			}',
      '',
      '			/* ------------------------------------------------------------------- */',
      '',
      '			// Search',
      '',
      '			var searchTimer = null;',
      '',
      '			function scheduleSearch() {',
      '				try {',
      '					clearTimeout(searchTimer);',
      '				} catch (ex) {',
      '					// Do nothing',
      '				}',
      '				searchTimer = setTimeout(doSearch, 500);',
      '			}',
      '',
      '			function Search(searchTerm, isRegex, searchRegex, isCaseSensitive) {',
      '				this.searchTerm = searchTerm;',
      '				this.isRegex = isRegex;',
      '				this.searchRegex = searchRegex;',
      '				this.isCaseSensitive = isCaseSensitive;',
      '				this.matches = [];',
      '			}',
      '',
      '			Search.prototype = {',
      '				hasMatches: function() {',
      '					return this.matches.length > 0;',
      '				},',
      '',
      '				hasVisibleMatches: function() {',
      '					if (this.hasMatches()) {',
      '						for (var i = 0; i < this.matches.length; i++) {',
      '							if (this.matches[i].isVisible()) {',
      '								return true;',
      '							}',
      '						}',
      '					}',
      '					return false;',
      '				},',
      '',
      '				match: function(logEntry) {',
      '					var entryText = String(logEntry.formattedMessage);',
      '					var matchesSearch = false;',
      '					if (this.isRegex) {',
      '						matchesSearch = this.searchRegex.test(entryText);',
      '					} else if (this.isCaseSensitive) {',
      '						matchesSearch = (entryText.indexOf(this.searchTerm) > -1);',
      '					} else {',
      '						matchesSearch = (entryText.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1);',
      '					}',
      '					return matchesSearch;',
      '				},',
      '',
      '				getNextVisibleMatchIndex: function() {',
      '					for (var i = currentMatchIndex + 1; i < this.matches.length; i++) {',
      '						if (this.matches[i].isVisible()) {',
      '							return i;',
      '						}',
      '					}',
      '					// Start again from the first match',
      '					for (i = 0; i <= currentMatchIndex; i++) {',
      '						if (this.matches[i].isVisible()) {',
      '							return i;',
      '						}',
      '					}',
      '					return -1;',
      '				},',
      '',
      '				getPreviousVisibleMatchIndex: function() {',
      '					for (var i = currentMatchIndex - 1; i >= 0; i--) {',
      '						if (this.matches[i].isVisible()) {',
      '							return i;',
      '						}',
      '					}',
      '					// Start again from the last match',
      '					for (var i = this.matches.length - 1; i >= currentMatchIndex; i--) {',
      '						if (this.matches[i].isVisible()) {',
      '							return i;',
      '						}',
      '					}',
      '					return -1;',
      '				},',
      '',
      '				applyTo: function(logEntry) {',
      '					var doesMatch = this.match(logEntry);',
      '					if (doesMatch) {',
      '						logEntry.group.expand();',
      '						logEntry.setSearchMatch(true);',
      '						var logEntryContent;',
      '						var wrappedLogEntryContent;',
      '						var searchTermReplacementStartTag = "<span class=\\\"searchterm\\\">";',
      '						var searchTermReplacementEndTag = "<" + "/span>";',
      '						var preTagName = isIe ? "pre" : "span";',
      '						var preStartTag = "<" + preTagName + " class=\\\"pre\\\">";',
      '						var preEndTag = "<" + "/" + preTagName + ">";',
      '						var startIndex = 0;',
      '						var searchIndex, matchedText, textBeforeMatch;',
      '						if (this.isRegex) {',
      '							var flags = this.isCaseSensitive ? "g" : "gi";',
      '							var capturingRegex = new RegExp("(" + this.searchRegex.source + ")", flags);',
      '',
      '							// Replace the search term with temporary tokens for the start and end tags',
      '							var rnd = ("" + Math.random()).substr(2);',
      '							var startToken = "%%s" + rnd + "%%";',
      '							var endToken = "%%e" + rnd + "%%";',
      '							logEntryContent = logEntry.formattedMessage.replace(capturingRegex, startToken + "$1" + endToken);',
      '',
      '							// Escape the HTML to get rid of angle brackets',
      '							logEntryContent = escapeHtml(logEntryContent);',
      '',
      '							// Substitute the proper HTML back in for the search match',
      '							var result;',
      '							var searchString = logEntryContent;',
      '							logEntryContent = "";',
      '							wrappedLogEntryContent = "";',
      '							while ((searchIndex = searchString.indexOf(startToken, startIndex)) > -1) {',
      '								var endTokenIndex = searchString.indexOf(endToken, searchIndex);',
      '								matchedText = searchString.substring(searchIndex + startToken.length, endTokenIndex);',
      '								textBeforeMatch = searchString.substring(startIndex, searchIndex);',
      '								logEntryContent += preStartTag + textBeforeMatch + preEndTag;',
      '								logEntryContent += searchTermReplacementStartTag + preStartTag + matchedText +',
      '									preEndTag + searchTermReplacementEndTag;',
      '								if (isIe) {',
      '									wrappedLogEntryContent += textBeforeMatch + searchTermReplacementStartTag +',
      '										matchedText + searchTermReplacementEndTag;',
      '								}',
      '								startIndex = endTokenIndex + endToken.length;',
      '							}',
      '							logEntryContent += preStartTag + searchString.substr(startIndex) + preEndTag;',
      '							if (isIe) {',
      '								wrappedLogEntryContent += searchString.substr(startIndex);',
      '							}',
      '						} else {',
      '							logEntryContent = "";',
      '							wrappedLogEntryContent = "";',
      '							var searchTermReplacementLength = searchTermReplacementStartTag.length +',
      '								this.searchTerm.length + searchTermReplacementEndTag.length;',
      '							var searchTermLength = this.searchTerm.length;',
      '							var searchTermLowerCase = this.searchTerm.toLowerCase();',
      '							var logTextLowerCase = logEntry.formattedMessage.toLowerCase();',
      '							while ((searchIndex = logTextLowerCase.indexOf(searchTermLowerCase, startIndex)) > -1) {',
      '								matchedText = escapeHtml(logEntry.formattedMessage.substr(searchIndex, this.searchTerm.length));',
      '								textBeforeMatch = escapeHtml(logEntry.formattedMessage.substring(startIndex, searchIndex));',
      '								var searchTermReplacement = searchTermReplacementStartTag +',
      '									preStartTag + matchedText + preEndTag + searchTermReplacementEndTag;',
      '								logEntryContent += preStartTag + textBeforeMatch + preEndTag + searchTermReplacement;',
      '								if (isIe) {',
      '									wrappedLogEntryContent += textBeforeMatch + searchTermReplacementStartTag +',
      '										matchedText + searchTermReplacementEndTag;',
      '								}',
      '								startIndex = searchIndex + searchTermLength;',
      '							}',
      '							var textAfterLastMatch = escapeHtml(logEntry.formattedMessage.substr(startIndex));',
      '							logEntryContent += preStartTag + textAfterLastMatch + preEndTag;',
      '							if (isIe) {',
      '								wrappedLogEntryContent += textAfterLastMatch;',
      '							}',
      '						}',
      '						logEntry.setContent(logEntryContent, wrappedLogEntryContent);',
      '						var logEntryMatches = logEntry.getSearchMatches();',
      '						this.matches = this.matches.concat(logEntryMatches);',
      '					} else {',
      '						logEntry.setSearchMatch(false);',
      '						logEntry.setContent(logEntry.formattedMessage, logEntry.formattedMessage);',
      '					}',
      '					return doesMatch;',
      '				},',
      '',
      '				removeMatches: function(logEntries) {',
      '					var matchesToRemoveCount = 0;',
      '					var currentMatchRemoved = false;',
      '					var matchesToRemove = [];',
      '					var i, iLen, j, jLen;',
      '',
      '					// Establish the list of matches to be removed',
      '					for (i = 0, iLen = this.matches.length; i < iLen; i++) {',
      '						for (j = 0, jLen = logEntries.length; j < jLen; j++) {',
      '							if (this.matches[i].belongsTo(logEntries[j])) {',
      '								matchesToRemove.push(this.matches[i]);',
      '								if (i === currentMatchIndex) {',
      '									currentMatchRemoved = true;',
      '								}',
      '							}',
      '						}',
      '					}',
      '',
      '					// Set the new current match index if the current match has been deleted',
      '					// This will be the first match that appears after the first log entry being',
      '					// deleted, if one exists; otherwise, it\'s the first match overall',
      '					var newMatch = currentMatchRemoved ? null : this.matches[currentMatchIndex];',
      '					if (currentMatchRemoved) {',
      '						for (i = currentMatchIndex, iLen = this.matches.length; i < iLen; i++) {',
      '							if (this.matches[i].isVisible() && !array_contains(matchesToRemove, this.matches[i])) {',
      '								newMatch = this.matches[i];',
      '								break;',
      '							}',
      '						}',
      '					}',
      '',
      '					// Remove the matches',
      '					for (i = 0, iLen = matchesToRemove.length; i < iLen; i++) {',
      '						array_remove(this.matches, matchesToRemove[i]);',
      '						matchesToRemove[i].remove();',
      '					}',
      '',
      '					// Set the new match, if one exists',
      '					if (this.hasVisibleMatches()) {',
      '						if (newMatch === null) {',
      '							setCurrentMatchIndex(0);',
      '						} else {',
      '							// Get the index of the new match',
      '							var newMatchIndex = 0;',
      '							for (i = 0, iLen = this.matches.length; i < iLen; i++) {',
      '								if (newMatch === this.matches[i]) {',
      '									newMatchIndex = i;',
      '									break;',
      '								}',
      '							}',
      '							setCurrentMatchIndex(newMatchIndex);',
      '						}',
      '					} else {',
      '						currentMatchIndex = null;',
      '						displayNoMatches();',
      '					}',
      '				}',
      '			};',
      '',
      '			function getPageOffsetTop(el, container) {',
      '				var currentEl = el;',
      '				var y = 0;',
      '				while (currentEl && currentEl != container) {',
      '					y += currentEl.offsetTop;',
      '					currentEl = currentEl.offsetParent;',
      '				}',
      '				return y;',
      '			}',
      '',
      '			function scrollIntoView(el) {',
      '				var logContainer = logMainContainer;',
      '				// Check if the whole width of the element is visible and centre if not',
      '				if (!$("wrap").checked) {',
      '					var logContainerLeft = logContainer.scrollLeft;',
      '					var logContainerRight = logContainerLeft  + logContainer.offsetWidth;',
      '					var elLeft = el.offsetLeft;',
      '					var elRight = elLeft + el.offsetWidth;',
      '					if (elLeft < logContainerLeft || elRight > logContainerRight) {',
      '						logContainer.scrollLeft = elLeft - (logContainer.offsetWidth - el.offsetWidth) / 2;',
      '					}',
      '				}',
      '				// Check if the whole height of the element is visible and centre if not',
      '				var logContainerTop = logContainer.scrollTop;',
      '				var logContainerBottom = logContainerTop  + logContainer.offsetHeight;',
      '				var elTop = getPageOffsetTop(el) - getToolBarsHeight();',
      '				var elBottom = elTop + el.offsetHeight;',
      '				if (elTop < logContainerTop || elBottom > logContainerBottom) {',
      '					logContainer.scrollTop = elTop - (logContainer.offsetHeight - el.offsetHeight) / 2;',
      '				}',
      '			}',
      '',
      '			function Match(logEntryLevel, spanInMainDiv, spanInUnwrappedPre, spanInWrappedDiv) {',
      '				this.logEntryLevel = logEntryLevel;',
      '				this.spanInMainDiv = spanInMainDiv;',
      '				if (isIe) {',
      '					this.spanInUnwrappedPre = spanInUnwrappedPre;',
      '					this.spanInWrappedDiv = spanInWrappedDiv;',
      '				}',
      '				this.mainSpan = isIe ? spanInUnwrappedPre : spanInMainDiv;',
      '			}',
      '',
      '			Match.prototype = {',
      '				equals: function(match) {',
      '					return this.mainSpan === match.mainSpan;',
      '				},',
      '',
      '				setCurrent: function() {',
      '					if (isIe) {',
      '						addClass(this.spanInUnwrappedPre, "currentmatch");',
      '						addClass(this.spanInWrappedDiv, "currentmatch");',
      '						// Scroll the visible one into view',
      '						var elementToScroll = $("wrap").checked ? this.spanInWrappedDiv : this.spanInUnwrappedPre;',
      '						scrollIntoView(elementToScroll);',
      '					} else {',
      '						addClass(this.spanInMainDiv, "currentmatch");',
      '						scrollIntoView(this.spanInMainDiv);',
      '					}',
      '				},',
      '',
      '				belongsTo: function(logEntry) {',
      '					if (isIe) {',
      '						return isDescendant(this.spanInUnwrappedPre, logEntry.unwrappedPre);',
      '					} else {',
      '						return isDescendant(this.spanInMainDiv, logEntry.mainDiv);',
      '					}',
      '				},',
      '',
      '				setNotCurrent: function() {',
      '					if (isIe) {',
      '						removeClass(this.spanInUnwrappedPre, "currentmatch");',
      '						removeClass(this.spanInWrappedDiv, "currentmatch");',
      '					} else {',
      '						removeClass(this.spanInMainDiv, "currentmatch");',
      '					}',
      '				},',
      '',
      '				isOrphan: function() {',
      '					return isOrphan(this.mainSpan);',
      '				},',
      '',
      '				isVisible: function() {',
      '					return getCheckBox(this.logEntryLevel).checked;',
      '				},',
      '',
      '				remove: function() {',
      '					if (isIe) {',
      '						this.spanInUnwrappedPre = null;',
      '						this.spanInWrappedDiv = null;',
      '					} else {',
      '						this.spanInMainDiv = null;',
      '					}',
      '				}',
      '			};',
      '',
      '			var currentSearch = null;',
      '			var currentMatchIndex = null;',
      '',
      '			function doSearch() {',
      '				var searchBox = $("searchBox");',
      '				var searchTerm = searchBox.value;',
      '				var isRegex = $("searchRegex").checked;',
      '				var isCaseSensitive = $("searchCaseSensitive").checked;',
      '				var i;',
      '',
      '				if (searchTerm === "") {',
      '					$("searchReset").disabled = true;',
      '					$("searchNav").style.display = "none";',
      '					removeClass(document.body, "searching");',
      '					removeClass(searchBox, "hasmatches");',
      '					removeClass(searchBox, "nomatches");',
      '					for (i = 0; i < logEntries.length; i++) {',
      '						logEntries[i].clearSearch();',
      '						logEntries[i].setContent(logEntries[i].formattedMessage, logEntries[i].formattedMessage);',
      '					}',
      '					currentSearch = null;',
      '					setLogContainerHeight();',
      '				} else {',
      '					$("searchReset").disabled = false;',
      '					$("searchNav").style.display = "block";',
      '					var searchRegex;',
      '					var regexValid;',
      '					if (isRegex) {',
      '						try {',
      '							searchRegex = isCaseSensitive ? new RegExp(searchTerm, "g") : new RegExp(searchTerm, "gi");',
      '							regexValid = true;',
      '							replaceClass(searchBox, "validregex", "invalidregex");',
      '							searchBox.title = "Valid regex";',
      '						} catch (ex) {',
      '							regexValid = false;',
      '							replaceClass(searchBox, "invalidregex", "validregex");',
      '							searchBox.title = "Invalid regex: " + (ex.message ? ex.message : (ex.description ? ex.description : "unknown error"));',
      '							return;',
      '						}',
      '					} else {',
      '						searchBox.title = "";',
      '						removeClass(searchBox, "validregex");',
      '						removeClass(searchBox, "invalidregex");',
      '					}',
      '					addClass(document.body, "searching");',
      '					currentSearch = new Search(searchTerm, isRegex, searchRegex, isCaseSensitive);',
      '					for (i = 0; i < logEntries.length; i++) {',
      '						currentSearch.applyTo(logEntries[i]);',
      '					}',
      '					setLogContainerHeight();',
      '',
      '					// Highlight the first search match',
      '					if (currentSearch.hasVisibleMatches()) {',
      '						setCurrentMatchIndex(0);',
      '						displayMatches();',
      '					} else {',
      '						displayNoMatches();',
      '					}',
      '				}',
      '			}',
      '',
      '			function updateSearchFromFilters() {',
      '				if (currentSearch) {',
      '					if (currentSearch.hasMatches()) {',
      '						if (currentMatchIndex === null) {',
      '							currentMatchIndex = 0;',
      '						}',
      '						var currentMatch = currentSearch.matches[currentMatchIndex];',
      '						if (currentMatch.isVisible()) {',
      '							displayMatches();',
      '							setCurrentMatchIndex(currentMatchIndex);',
      '						} else {',
      '							currentMatch.setNotCurrent();',
      '							// Find the next visible match, if one exists',
      '							var nextVisibleMatchIndex = currentSearch.getNextVisibleMatchIndex();',
      '							if (nextVisibleMatchIndex > -1) {',
      '								setCurrentMatchIndex(nextVisibleMatchIndex);',
      '								displayMatches();',
      '							} else {',
      '								displayNoMatches();',
      '							}',
      '						}',
      '					} else {',
      '						displayNoMatches();',
      '					}',
      '				}',
      '			}',
      '',
      '			function refreshCurrentMatch() {',
      '				if (currentSearch && currentSearch.hasVisibleMatches()) {',
      '					setCurrentMatchIndex(currentMatchIndex);',
      '				}',
      '			}',
      '',
      '			function displayMatches() {',
      '				replaceClass($("searchBox"), "hasmatches", "nomatches");',
      '				$("searchBox").title = "" + currentSearch.matches.length + " matches found";',
      '				$("searchNav").style.display = "block";',
      '				setLogContainerHeight();',
      '			}',
      '',
      '			function displayNoMatches() {',
      '				replaceClass($("searchBox"), "nomatches", "hasmatches");',
      '				$("searchBox").title = "No matches found";',
      '				$("searchNav").style.display = "none";',
      '				setLogContainerHeight();',
      '			}',
      '',
      '			function toggleSearchEnabled(enable) {',
      '				enable = (typeof enable == "undefined") ? !$("searchDisable").checked : enable;',
      '				$("searchBox").disabled = !enable;',
      '				$("searchReset").disabled = !enable;',
      '				$("searchRegex").disabled = !enable;',
      '				$("searchNext").disabled = !enable;',
      '				$("searchPrevious").disabled = !enable;',
      '				$("searchCaseSensitive").disabled = !enable;',
      '				$("searchNav").style.display = (enable && ($("searchBox").value !== "") &&',
      '						currentSearch && currentSearch.hasVisibleMatches()) ?',
      '					"block" : "none";',
      '				if (enable) {',
      '					removeClass($("search"), "greyedout");',
      '					addClass(document.body, "searching");',
      '					if ($("searchHighlight").checked) {',
      '						addClass(logMainContainer, "searchhighlight");',
      '					} else {',
      '						removeClass(logMainContainer, "searchhighlight");',
      '					}',
      '					if ($("searchFilter").checked) {',
      '						addClass(logMainContainer, "searchfilter");',
      '					} else {',
      '						removeClass(logMainContainer, "searchfilter");',
      '					}',
      '					$("searchDisable").checked = !enable;',
      '				} else {',
      '					addClass($("search"), "greyedout");',
      '					removeClass(document.body, "searching");',
      '					removeClass(logMainContainer, "searchhighlight");',
      '					removeClass(logMainContainer, "searchfilter");',
      '				}',
      '				setLogContainerHeight();',
      '			}',
      '',
      '			function toggleSearchFilter() {',
      '				var enable = $("searchFilter").checked;',
      '				if (enable) {',
      '					addClass(logMainContainer, "searchfilter");',
      '				} else {',
      '					removeClass(logMainContainer, "searchfilter");',
      '				}',
      '				refreshCurrentMatch();',
      '			}',
      '',
      '			function toggleSearchHighlight() {',
      '				var enable = $("searchHighlight").checked;',
      '				if (enable) {',
      '					addClass(logMainContainer, "searchhighlight");',
      '				} else {',
      '					removeClass(logMainContainer, "searchhighlight");',
      '				}',
      '			}',
      '',
      '			function clearSearch() {',
      '				$("searchBox").value = "";',
      '				doSearch();',
      '			}',
      '',
      '			function searchNext() {',
      '				if (currentSearch !== null && currentMatchIndex !== null) {',
      '					currentSearch.matches[currentMatchIndex].setNotCurrent();',
      '					var nextMatchIndex = currentSearch.getNextVisibleMatchIndex();',
      '					if (nextMatchIndex > currentMatchIndex || confirm("Reached the end of the page. Start from the top?")) {',
      '						setCurrentMatchIndex(nextMatchIndex);',
      '					}',
      '				}',
      '			}',
      '',
      '			function searchPrevious() {',
      '				if (currentSearch !== null && currentMatchIndex !== null) {',
      '					currentSearch.matches[currentMatchIndex].setNotCurrent();',
      '					var previousMatchIndex = currentSearch.getPreviousVisibleMatchIndex();',
      '					if (previousMatchIndex < currentMatchIndex || confirm("Reached the start of the page. Continue from the bottom?")) {',
      '						setCurrentMatchIndex(previousMatchIndex);',
      '					}',
      '				}',
      '			}',
      '',
      '			function setCurrentMatchIndex(index) {',
      '				currentMatchIndex = index;',
      '				currentSearch.matches[currentMatchIndex].setCurrent();',
      '			}',
      '',
      '			/* ------------------------------------------------------------------------- */',
      '',
      '			// CSS Utilities',
      '',
      '			function addClass(el, cssClass) {',
      '				if (!hasClass(el, cssClass)) {',
      '					if (el.className) {',
      '						el.className += " " + cssClass;',
      '					} else {',
      '						el.className = cssClass;',
      '					}',
      '				}',
      '			}',
      '',
      '			function hasClass(el, cssClass) {',
      '				if (el.className) {',
      '					var classNames = el.className.split(" ");',
      '					return array_contains(classNames, cssClass);',
      '				}',
      '				return false;',
      '			}',
      '',
      '			function removeClass(el, cssClass) {',
      '				if (hasClass(el, cssClass)) {',
      '					// Rebuild the className property',
      '					var existingClasses = el.className.split(" ");',
      '					var newClasses = [];',
      '					for (var i = 0, len = existingClasses.length; i < len; i++) {',
      '						if (existingClasses[i] != cssClass) {',
      '							newClasses[newClasses.length] = existingClasses[i];',
      '						}',
      '					}',
      '					el.className = newClasses.join(" ");',
      '				}',
      '			}',
      '',
      '			function replaceClass(el, newCssClass, oldCssClass) {',
      '				removeClass(el, oldCssClass);',
      '				addClass(el, newCssClass);',
      '			}',
      '',
      '			/* ------------------------------------------------------------------------- */',
      '',
      '			// Other utility functions',
      '',
      '			function getElementsByClass(el, cssClass, tagName) {',
      '				var elements = el.getElementsByTagName(tagName);',
      '				var matches = [];',
      '				for (var i = 0, len = elements.length; i < len; i++) {',
      '					if (hasClass(elements[i], cssClass)) {',
      '						matches.push(elements[i]);',
      '					}',
      '				}',
      '				return matches;',
      '			}',
      '',
      '			// Syntax borrowed from Prototype library',
      '			function $(id) {',
      '				return document.getElementById(id);',
      '			}',
      '',
      '			function isDescendant(node, ancestorNode) {',
      '				while (node != null) {',
      '					if (node === ancestorNode) {',
      '						return true;',
      '					}',
      '					node = node.parentNode;',
      '				}',
      '				return false;',
      '			}',
      '',
      '			function isOrphan(node) {',
      '				var currentNode = node;',
      '				while (currentNode) {',
      '					if (currentNode == document.body) {',
      '						return false;',
      '					}',
      '					currentNode = currentNode.parentNode;',
      '				}',
      '				return true;',
      '			}',
      '',
      '			function escapeHtml(str) {',
      '				return str.replace(/&/g, "&amp;").replace(/[<]/g, "&lt;").replace(/>/g, "&gt;");',
      '			}',
      '',
      '			function getWindowWidth() {',
      '				if (window.innerWidth) {',
      '					return window.innerWidth;',
      '				} else if (document.documentElement && document.documentElement.clientWidth) {',
      '					return document.documentElement.clientWidth;',
      '				} else if (document.body) {',
      '					return document.body.clientWidth;',
      '				}',
      '				return 0;',
      '			}',
      '',
      '			function getWindowHeight() {',
      '				if (window.innerHeight) {',
      '					return window.innerHeight;',
      '				} else if (document.documentElement && document.documentElement.clientHeight) {',
      '					return document.documentElement.clientHeight;',
      '				} else if (document.body) {',
      '					return document.body.clientHeight;',
      '				}',
      '				return 0;',
      '			}',
      '',
      '			function getToolBarsHeight() {',
      '				return $("switches").offsetHeight;',
      '			}',
      '',
      '			function getChromeHeight() {',
      '				var height = getToolBarsHeight();',
      '				if (showCommandLine) {',
      '					height += $("commandLine").offsetHeight;',
      '				}',
      '				return height;',
      '			}',
      '',
      '			function setLogContainerHeight() {',
      '				if (logMainContainer) {',
      '					var windowHeight = getWindowHeight();',
      '					$("body").style.height = getWindowHeight() + "px";',
      '					logMainContainer.style.height = "" +',
      '						Math.max(0, windowHeight - getChromeHeight()) + "px";',
      '				}',
      '			}',
      '',
      '			function setCommandInputWidth() {',
      '				if (showCommandLine) {',
      '					$("command").style.width = "" + Math.max(0, $("commandLineContainer").offsetWidth -',
      '						($("evaluateButton").offsetWidth + 13)) + "px";',
      '				}',
      '			}',
      '',
      '			window.onresize = function() {',
      '				setCommandInputWidth();',
      '				setLogContainerHeight();',
      '			};',
      '',
      '			if (!Array.prototype.push) {',
      '				Array.prototype.push = function() {',
      '			        for (var i = 0, len = arguments.length; i < len; i++){',
      '			            this[this.length] = arguments[i];',
      '			        }',
      '			        return this.length;',
      '				};',
      '			}',
      '',
      '			if (!Array.prototype.pop) {',
      '				Array.prototype.pop = function() {',
      '					if (this.length > 0) {',
      '						var val = this[this.length - 1];',
      '						this.length = this.length - 1;',
      '						return val;',
      '					}',
      '				};',
      '			}',
      '',
      '			if (!Array.prototype.shift) {',
      '				Array.prototype.shift = function() {',
      '					if (this.length > 0) {',
      '						var firstItem = this[0];',
      '						for (var i = 0, len = this.length - 1; i < len; i++) {',
      '							this[i] = this[i + 1];',
      '						}',
      '						this.length = this.length - 1;',
      '						return firstItem;',
      '					}',
      '				};',
      '			}',
      '',
      '			if (!Array.prototype.splice) {',
      '				Array.prototype.splice = function(startIndex, deleteCount) {',
      '					var itemsAfterDeleted = this.slice(startIndex + deleteCount);',
      '					var itemsDeleted = this.slice(startIndex, startIndex + deleteCount);',
      '					this.length = startIndex;',
      '					// Copy the arguments into a proper Array object',
      '					var argumentsArray = [];',
      '					for (var i = 0, len = arguments.length; i < len; i++) {',
      '						argumentsArray[i] = arguments[i];',
      '					}',
      '					var itemsToAppend = (argumentsArray.length > 2) ?',
      '						itemsAfterDeleted = argumentsArray.slice(2).concat(itemsAfterDeleted) : itemsAfterDeleted;',
      '					for (i = 0, len = itemsToAppend.length; i < len; i++) {',
      '						this.push(itemsToAppend[i]);',
      '					}',
      '					return itemsDeleted;',
      '				};',
      '			}',
      '',
      '			function array_remove(arr, val) {',
      '				var index = -1;',
      '				for (var i = 0, len = arr.length; i < len; i++) {',
      '					if (arr[i] === val) {',
      '						index = i;',
      '						break;',
      '					}',
      '				}',
      '				if (index >= 0) {',
      '					arr.splice(index, 1);',
      '					return index;',
      '				} else {',
      '					return false;',
      '				}',
      '			}',
      '',
      '			function array_removeFromStart(array, numberToRemove) {',
      '				if (Array.prototype.splice) {',
      '					array.splice(0, numberToRemove);',
      '				} else {',
      '					for (var i = numberToRemove, len = array.length; i < len; i++) {',
      '						array[i - numberToRemove] = array[i];',
      '					}',
      '					array.length = array.length - numberToRemove;',
      '				}',
      '				return array;',
      '			}',
      '',
      '			function array_contains(arr, val) {',
      '				for (var i = 0, len = arr.length; i < len; i++) {',
      '					if (arr[i] == val) {',
      '						return true;',
      '					}',
      '				}',
      '				return false;',
      '			}',
      '',
      '			function getErrorMessage(ex) {',
      '				if (ex.message) {',
      '					return ex.message;',
      '				} else if (ex.description) {',
      '					return ex.description;',
      '				}',
      '				return "" + ex;',
      '			}',
      '',
      '			function moveCaretToEnd(input) {',
      '				if (input.setSelectionRange) {',
      '					input.focus();',
      '					var length = input.value.length;',
      '					input.setSelectionRange(length, length);',
      '				} else if (input.createTextRange) {',
      '					var range = input.createTextRange();',
      '					range.collapse(false);',
      '					range.select();',
      '				}',
      '				input.focus();',
      '			}',
      '',
      '			function stopPropagation(evt) {',
      '				if (evt.stopPropagation) {',
      '					evt.stopPropagation();',
      '				} else if (typeof evt.cancelBubble != "undefined") {',
      '					evt.cancelBubble = true;',
      '				}',
      '			}',
      '',
      '			function getEvent(evt) {',
      '				return evt ? evt : event;',
      '			}',
      '',
      '			function getTarget(evt) {',
      '				return evt.target ? evt.target : evt.srcElement;',
      '			}',
      '',
      '			function getRelatedTarget(evt) {',
      '				if (evt.relatedTarget) {',
      '					return evt.relatedTarget;',
      '				} else if (evt.srcElement) {',
      '					switch(evt.type) {',
      '						case "mouseover":',
      '							return evt.fromElement;',
      '						case "mouseout":',
      '							return evt.toElement;',
      '						default:',
      '							return evt.srcElement;',
      '					}',
      '				}',
      '			}',
      '',
      '			function cancelKeyEvent(evt) {',
      '				evt.returnValue = false;',
      '				stopPropagation(evt);',
      '			}',
      '',
      '			function evalCommandLine() {',
      '				var expr = $("command").value;',
      '				evalCommand(expr);',
      '				$("command").value = "";',
      '			}',
      '',
      '			function evalLastCommand() {',
      '				if (lastCommand != null) {',
      '					evalCommand(lastCommand);',
      '				}',
      '			}',
      '',
      '			var lastCommand = null;',
      '			var commandHistory = [];',
      '			var currentCommandIndex = 0;',
      '',
      '			function evalCommand(expr) {',
      '				if (appender) {',
      '					appender.evalCommandAndAppend(expr);',
      '				} else {',
      '					var prefix = ">>> " + expr + "\\r\\n";',
      '					try {',
      '						log("INFO", prefix + eval(expr));',
      '					} catch (ex) {',
      '						log("ERROR", prefix + "Error: " + getErrorMessage(ex));',
      '					}',
      '				}',
      '				// Update command history',
      '				if (expr != commandHistory[commandHistory.length - 1]) {',
      '					commandHistory.push(expr);',
      '					// Update the appender',
      '					if (appender) {',
      '						appender.storeCommandHistory(commandHistory);',
      '					}',
      '				}',
      '				currentCommandIndex = (expr == commandHistory[currentCommandIndex]) ? currentCommandIndex + 1 : commandHistory.length;',
      '				lastCommand = expr;',
      '			}',
      '			//]]>',
      '		</script>',
      '		<style type="text/css">',
      '			body {',
      '				background-color: white;',
      '				color: black;',
      '				padding: 0;',
      '				margin: 0;',
      '				font-family: tahoma, verdana, arial, helvetica, sans-serif;',
      '				overflow: hidden;',
      '			}',
      '',
      '			div#switchesContainer input {',
      '				margin-bottom: 0;',
      '			}',
      '',
      '			div.toolbar {',
      '				border-top: solid #ffffff 1px;',
      '				border-bottom: solid #aca899 1px;',
      '				background-color: #f1efe7;',
      '				padding: 3px 5px;',
      '				font-size: 68.75%;',
      '			}',
      '',
      '			div.toolbar, div#search input {',
      '				font-family: tahoma, verdana, arial, helvetica, sans-serif;',
      '			}',
      '',
      '			div.toolbar input.button {',
      '				padding: 0 5px;',
      '				font-size: 100%;',
      '			}',
      '',
      '			div.toolbar input.hidden {',
      '				display: none;',
      '			}',
      '',
      '			div#switches input#clearButton {',
      '				margin-left: 20px;',
      '			}',
      '',
      '			div#levels label {',
      '				font-weight: bold;',
      '			}',
      '',
      '			div#levels label, div#options label {',
      '				margin-right: 5px;',
      '			}',
      '',
      '			div#levels label#wrapLabel {',
      '				font-weight: normal;',
      '			}',
      '',
      '			div#search label {',
      '				margin-right: 10px;',
      '			}',
      '',
      '			div#search label.searchboxlabel {',
      '				margin-right: 0;',
      '			}',
      '',
      '			div#search input {',
      '				font-size: 100%;',
      '			}',
      '',
      '			div#search input.validregex {',
      '				color: green;',
      '			}',
      '',
      '			div#search input.invalidregex {',
      '				color: red;',
      '			}',
      '',
      '			div#search input.nomatches {',
      '				color: white;',
      '				background-color: #ff6666;',
      '			}',
      '',
      '			div#search input.nomatches {',
      '				color: white;',
      '				background-color: #ff6666;',
      '			}',
      '',
      '			div#searchNav {',
      '				display: none;',
      '			}',
      '',
      '			div#commandLine {',
      '				display: none;',
      '			}',
      '',
      '			div#commandLine input#command {',
      '				font-size: 100%;',
      '				font-family: Courier New, Courier;',
      '			}',
      '',
      '			div#commandLine input#evaluateButton {',
      '			}',
      '',
      '			*.greyedout {',
      '				color: gray !important;',
      '				border-color: gray !important;',
      '			}',
      '',
      '			*.greyedout *.alwaysenabled { color: black; }',
      '',
      '			*.unselectable {',
      '				-khtml-user-select: none;',
      '				-moz-user-select: none;',
      '				user-select: none;',
      '			}',
      '',
      '			div#log {',
      '				font-family: Courier New, Courier;',
      '				font-size: 75%;',
      '				width: 100%;',
      '				overflow: auto;',
      '				clear: both;',
      '				position: relative;',
      '			}',
      '',
      '			div.group {',
      '				border-color: #cccccc;',
      '				border-style: solid;',
      '				border-width: 1px 0 1px 1px;',
      '				overflow: visible;',
      '			}',
      '',
      '			div.oldIe div.group, div.oldIe div.group *, div.oldIe *.logentry {',
      '				height: 1%;',
      '			}',
      '',
      '			div.group div.groupheading span.expander {',
      '				border: solid black 1px;',
      '				font-family: Courier New, Courier;',
      '				font-size: 0.833em;',
      '				background-color: #eeeeee;',
      '				position: relative;',
      '				top: -1px;',
      '				color: black;',
      '				padding: 0 2px;',
      '				cursor: pointer;',
      '				cursor: hand;',
      '				height: 1%;',
      '			}',
      '',
      '			div.group div.groupcontent {',
      '				margin-left: 10px;',
      '				padding-bottom: 2px;',
      '				overflow: visible;',
      '			}',
      '',
      '			div.group div.expanded {',
      '				display: block;',
      '			}',
      '',
      '			div.group div.collapsed {',
      '				display: none;',
      '			}',
      '',
      '			*.logentry {',
      '				overflow: visible;',
      '				display: none;',
      '				white-space: pre;',
      '			}',
      '',
      '			span.pre {',
      '				white-space: pre;',
      '			}',
      '			',
      '			pre.unwrapped {',
      '				display: inline !important;',
      '			}',
      '',
      '			pre.unwrapped pre.pre, div.wrapped pre.pre {',
      '				display: inline;',
      '			}',
      '',
      '			div.wrapped pre.pre {',
      '				white-space: normal;',
      '			}',
      '',
      '			div.wrapped {',
      '				display: none;',
      '			}',
      '',
      '			body.searching *.logentry span.currentmatch {',
      '				color: white !important;',
      '				background-color: green !important;',
      '			}',
      '',
      '			body.searching div.searchhighlight *.logentry span.searchterm {',
      '				color: black;',
      '				background-color: yellow;',
      '			}',
      '',
      '			div.wrap *.logentry {',
      '				white-space: normal !important;',
      '				border-width: 0 0 1px 0;',
      '				border-color: #dddddd;',
      '				border-style: dotted;',
      '			}',
      '',
      '			div.wrap #log_wrapped, #log_unwrapped {',
      '				display: block;',
      '			}',
      '',
      '			div.wrap #log_unwrapped, #log_wrapped {',
      '				display: none;',
      '			}',
      '',
      '			div.wrap *.logentry span.pre {',
      '				overflow: visible;',
      '				white-space: normal;',
      '			}',
      '',
      '			div.wrap *.logentry pre.unwrapped {',
      '				display: none;',
      '			}',
      '',
      '			div.wrap *.logentry span.wrapped {',
      '				display: inline;',
      '			}',
      '',
      '			div.searchfilter *.searchnonmatch {',
      '				display: none !important;',
      '			}',
      '',
      '			div#log *.TRACE, label#label_TRACE {',
      '				color: #666666;',
      '			}',
      '',
      '			div#log *.DEBUG, label#label_DEBUG {',
      '				color: green;',
      '			}',
      '',
      '			div#log *.INFO, label#label_INFO {',
      '				color: #000099;',
      '			}',
      '',
      '			div#log *.WARN, label#label_WARN {',
      '				color: #999900;',
      '			}',
      '',
      '			div#log *.ERROR, label#label_ERROR {',
      '				color: red;',
      '			}',
      '',
      '			div#log *.FATAL, label#label_FATAL {',
      '				color: #660066;',
      '			}',
      '',
      '			div.TRACE#log *.TRACE,',
      '			div.DEBUG#log *.DEBUG,',
      '			div.INFO#log *.INFO,',
      '			div.WARN#log *.WARN,',
      '			div.ERROR#log *.ERROR,',
      '			div.FATAL#log *.FATAL {',
      '				display: block;',
      '			}',
      '',
      '			div#log div.separator {',
      '				background-color: #cccccc;',
      '				margin: 5px 0;',
      '				line-height: 1px;',
      '			}',
      '		</style>',
      '	</head>',
      '',
      '	<body id="body">',
      '		<div id="switchesContainer">',
      '			<div id="switches">',
      '				<div id="levels" class="toolbar">',
      '					Filters:',
      '					<input type="checkbox" id="switch_TRACE" onclick="applyFilters(); checkAllLevels()" checked="checked" title="Show/hide trace messages" /><label for="switch_TRACE" id="label_TRACE">trace</label>',
      '					<input type="checkbox" id="switch_DEBUG" onclick="applyFilters(); checkAllLevels()" checked="checked" title="Show/hide debug messages" /><label for="switch_DEBUG" id="label_DEBUG">debug</label>',
      '					<input type="checkbox" id="switch_INFO" onclick="applyFilters(); checkAllLevels()" checked="checked" title="Show/hide info messages" /><label for="switch_INFO" id="label_INFO">info</label>',
      '					<input type="checkbox" id="switch_WARN" onclick="applyFilters(); checkAllLevels()" checked="checked" title="Show/hide warn messages" /><label for="switch_WARN" id="label_WARN">warn</label>',
      '					<input type="checkbox" id="switch_ERROR" onclick="applyFilters(); checkAllLevels()" checked="checked" title="Show/hide error messages" /><label for="switch_ERROR" id="label_ERROR">error</label>',
      '					<input type="checkbox" id="switch_FATAL" onclick="applyFilters(); checkAllLevels()" checked="checked" title="Show/hide fatal messages" /><label for="switch_FATAL" id="label_FATAL">fatal</label>',
      '					<input type="checkbox" id="switch_ALL" onclick="toggleAllLevels(); applyFilters()" checked="checked" title="Show/hide all messages" /><label for="switch_ALL" id="label_ALL">all</label>',
      '				</div>',
      '				<div id="search" class="toolbar">',
      '					<label for="searchBox" class="searchboxlabel">Search:</label> <input type="text" id="searchBox" onclick="toggleSearchEnabled(true)" onkeyup="scheduleSearch()" size="20" />',
      '					<input type="button" id="searchReset" disabled="disabled" value="Reset" onclick="clearSearch()" class="button" title="Reset the search" />',
      '					<input type="checkbox" id="searchRegex" onclick="doSearch()" title="If checked, search is treated as a regular expression" /><label for="searchRegex">Regex</label>',
      '					<input type="checkbox" id="searchCaseSensitive" onclick="doSearch()" title="If checked, search is case sensitive" /><label for="searchCaseSensitive">Match case</label>',
      '					<input type="checkbox" id="searchDisable" onclick="toggleSearchEnabled()" title="Enable/disable search" /><label for="searchDisable" class="alwaysenabled">Disable</label>',
      '					<div id="searchNav">',
      '						<input type="button" id="searchNext" disabled="disabled" value="Next" onclick="searchNext()" class="button" title="Go to the next matching log entry" />',
      '						<input type="button" id="searchPrevious" disabled="disabled" value="Previous" onclick="searchPrevious()" class="button" title="Go to the previous matching log entry" />',
      '						<input type="checkbox" id="searchFilter" onclick="toggleSearchFilter()" title="If checked, non-matching log entries are filtered out" /><label for="searchFilter">Filter</label>',
      '						<input type="checkbox" id="searchHighlight" onclick="toggleSearchHighlight()" title="Highlight matched search terms" /><label for="searchHighlight" class="alwaysenabled">Highlight all</label>',
      '					</div>',
      '				</div>',
      '				<div id="options" class="toolbar">',
      '					Options:',
      '					<input type="checkbox" id="enableLogging" onclick="toggleLoggingEnabled()" checked="checked" title="Enable/disable logging" /><label for="enableLogging" id="enableLoggingLabel">Log</label>',
      '					<input type="checkbox" id="wrap" onclick="toggleWrap()" title="Enable / disable word wrap" /><label for="wrap" id="wrapLabel">Wrap</label>',
      '					<input type="checkbox" id="newestAtTop" onclick="toggleNewestAtTop()" title="If checked, causes newest messages to appear at the top" /><label for="newestAtTop" id="newestAtTopLabel">Newest at the top</label>',
      '					<input type="checkbox" id="scrollToLatest" onclick="toggleScrollToLatest()" checked="checked" title="If checked, window automatically scrolls to a new message when it is added" /><label for="scrollToLatest" id="scrollToLatestLabel">Scroll to latest</label>',
      '					<input type="button" id="clearButton" value="Clear" onclick="clearLog()" class="button" title="Clear all log messages"  />',
      '					<input type="button" id="hideButton" value="Hide" onclick="hide()" class="hidden button" title="Hide the console" />',
      '					<input type="button" id="closeButton" value="Close" onclick="closeWindow()" class="hidden button" title="Close the window" />',
      '				</div>',
      '			</div>',
      '		</div>',
      '		<div id="log" class="TRACE DEBUG INFO WARN ERROR FATAL"></div>',
      '		<div id="commandLine" class="toolbar">',
      '			<div id="commandLineContainer">',
      '				<input type="text" id="command" title="Enter a JavaScript command here and hit return or press \'Evaluate\'" />',
      '				<input type="button" id="evaluateButton" value="Evaluate" class="button" title="Evaluate the command" onclick="evalCommandLine()" />',
      '			</div>',
      '		</div>',
      '	</body>',
      '</html>',
      ''
    ];
  };

  var defaultCommandLineFunctions = [];

  ConsoleAppender = function() {};

  var consoleAppenderIdCounter = 1;
  ConsoleAppender.prototype = new Appender();

  ConsoleAppender.prototype.create = function(inPage, container,
                                              lazyInit, initiallyMinimized, useDocumentWrite, width, height, focusConsoleWindow) {
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
    var showLogEntryDeleteButtons = this.defaults.showLogEntryDeleteButtons;

    this.setLayout(this.defaults.layout);

    // Functions whose implementations vary between subclasses
    var init, createWindow, safeToAppend, getConsoleWindow, open;

    // Configuration methods. The function scope is used to prevent
    // direct alteration to the appender configuration properties.
    var appenderName = inPage ? "InPageAppender" : "PopUpAppender";
    var checkCanConfigure = function(configOptionName) {
      if (consoleWindowCreated) {
        handleError(appenderName + ": configuration option '" + configOptionName + "' may not be set after the appender has been initialized");
        return false;
      }
      return true;
    };

    var consoleWindowExists = function() {
      return (consoleWindowLoaded && isSupported && !consoleClosed);
    };

    this.isNewestMessageAtTop = function() { return newestMessageAtTop; };
    this.setNewestMessageAtTop = function(newestMessageAtTopParam) {
      newestMessageAtTop = bool(newestMessageAtTopParam);
      if (consoleWindowExists()) {
        getConsoleWindow().setNewestAtTop(newestMessageAtTop);
      }
    };

    this.isScrollToLatestMessage = function() { return scrollToLatestMessage; };
    this.setScrollToLatestMessage = function(scrollToLatestMessageParam) {
      scrollToLatestMessage = bool(scrollToLatestMessageParam);
      if (consoleWindowExists()) {
        getConsoleWindow().setScrollToLatest(scrollToLatestMessage);
      }
    };

    this.getWidth = function() { return width; };
    this.setWidth = function(widthParam) {
      if (checkCanConfigure("width")) {
        width = extractStringFromParam(widthParam, width);
      }
    };

    this.getHeight = function() { return height; };
    this.setHeight = function(heightParam) {
      if (checkCanConfigure("height")) {
        height = extractStringFromParam(heightParam, height);
      }
    };

    this.getMaxMessages = function() { return maxMessages; };
    this.setMaxMessages = function(maxMessagesParam) {
      maxMessages = extractIntFromParam(maxMessagesParam, maxMessages);
      if (consoleWindowExists()) {
        getConsoleWindow().setMaxMessages(maxMessages);
      }
    };

    this.isShowCommandLine = function() { return showCommandLine; };
    this.setShowCommandLine = function(showCommandLineParam) {
      showCommandLine = bool(showCommandLineParam);
      if (consoleWindowExists()) {
        getConsoleWindow().setShowCommandLine(showCommandLine);
      }
    };

    this.isShowHideButton = function() { return showHideButton; };
    this.setShowHideButton = function(showHideButtonParam) {
      showHideButton = bool(showHideButtonParam);
      if (consoleWindowExists()) {
        getConsoleWindow().setShowHideButton(showHideButton);
      }
    };

    this.isShowCloseButton = function() { return showCloseButton; };
    this.setShowCloseButton = function(showCloseButtonParam) {
      showCloseButton = bool(showCloseButtonParam);
      if (consoleWindowExists()) {
        getConsoleWindow().setShowCloseButton(showCloseButton);
      }
    };

    this.getCommandLineObjectExpansionDepth = function() { return commandLineObjectExpansionDepth; };
    this.setCommandLineObjectExpansionDepth = function(commandLineObjectExpansionDepthParam) {
      commandLineObjectExpansionDepth = extractIntFromParam(commandLineObjectExpansionDepthParam, commandLineObjectExpansionDepth);
    };

    var minimized = initiallyMinimized;
    this.isInitiallyMinimized = function() { return initiallyMinimized; };
    this.setInitiallyMinimized = function(initiallyMinimizedParam) {
      if (checkCanConfigure("initiallyMinimized")) {
        initiallyMinimized = bool(initiallyMinimizedParam);
        minimized = initiallyMinimized;
      }
    };

    this.isUseDocumentWrite = function() { return useDocumentWrite; };
    this.setUseDocumentWrite = function(useDocumentWriteParam) {
      if (checkCanConfigure("useDocumentWrite")) {
        useDocumentWrite = bool(useDocumentWriteParam);
      }
    };

    // Common methods
    function QueuedLoggingEvent(loggingEvent, formattedMessage) {
      this.loggingEvent = loggingEvent;
      this.levelName = loggingEvent.level.name;
      this.formattedMessage = formattedMessage;
    }

    QueuedLoggingEvent.prototype.append = function() {
      getConsoleWindow().log(this.levelName, this.formattedMessage);
    };

    function QueuedGroup(name, initiallyExpanded) {
      this.name = name;
      this.initiallyExpanded = initiallyExpanded;
    }

    QueuedGroup.prototype.append = function() {
      getConsoleWindow().group(this.name, this.initiallyExpanded);
    };

    function QueuedGroupEnd() {}

    QueuedGroupEnd.prototype.append = function() {
      getConsoleWindow().groupEnd();
    };

    var checkAndAppend = function() {
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

    this.append = function(loggingEvent) {
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

    this.group = function(name, initiallyExpanded) {
      if (isSupported) {
        queuedLoggingEvents.push(new QueuedGroup(name, initiallyExpanded));
        checkAndAppend();
      }
    };

    this.groupEnd = function() {
      if (isSupported) {
        queuedLoggingEvents.push(new QueuedGroupEnd());
        checkAndAppend();
      }
    };

    var appendQueuedLoggingEvents = function() {
      var currentLoggingEvent;
      while (queuedLoggingEvents.length > 0) {
        queuedLoggingEvents.shift().append();
      }
      if (focusConsoleWindow) {
        getConsoleWindow().focus();
      }
    };

    this.setAddedToLogger = function(logger) {
      this.loggers.push(logger);
      if (enabled && !lazyInit) {
        init();
      }
    };

    this.clear = function() {
      if (consoleWindowExists()) {
        getConsoleWindow().clearLog();
      }
      queuedLoggingEvents.length = 0;
    };

    this.focus = function() {
      if (consoleWindowExists()) {
        getConsoleWindow().focus();
      }
    };

    this.focusCommandLine = function() {
      if (consoleWindowExists()) {
        getConsoleWindow().focusCommandLine();
      }
    };

    this.focusSearch = function() {
      if (consoleWindowExists()) {
        getConsoleWindow().focusSearch();
      }
    };

    var commandWindow = window;

    this.getCommandWindow = function() { return commandWindow; };
    this.setCommandWindow = function(commandWindowParam) {
      commandWindow = commandWindowParam;
    };

    this.executeLastCommand = function() {
      if (consoleWindowExists()) {
        getConsoleWindow().evalLastCommand();
      }
    };

    var commandLayout = new PatternLayout("%m");
    this.getCommandLayout = function() { return commandLayout; };
    this.setCommandLayout = function(commandLayoutParam) {
      commandLayout = commandLayoutParam;
    };

    this.evalCommandAndAppend = function(expr) {
      var commandReturnValue = { appendResult: true, isError: false };
      var commandOutput = "";
      // Evaluate the command
      try {
        var result, i;
        // The next three lines constitute a workaround for IE. Bizarrely, iframes seem to have no
        // eval method on the window object initially, but once execScript has been called on
        // it once then the eval method magically appears. See http://www.thismuchiknow.co.uk/?p=25
        if (!commandWindow.eval && commandWindow.execScript) {
          commandWindow.execScript("null");
        }

        var commandLineFunctionsHash = {};
        for (i = 0, len = commandLineFunctions.length; i < len; i++) {
          commandLineFunctionsHash[commandLineFunctions[i][0]] = commandLineFunctions[i][1];
        }

        // Keep an array of variables that are being changed in the command window so that they
        // can be restored to their original values afterwards
        var objectsToRestore = [];
        var addObjectToRestore = function(name) {
          objectsToRestore.push([name, commandWindow[name]]);
        };

        addObjectToRestore("appender");
        commandWindow.appender = appender;

        addObjectToRestore("commandReturnValue");
        commandWindow.commandReturnValue = commandReturnValue;

        addObjectToRestore("commandLineFunctionsHash");
        commandWindow.commandLineFunctionsHash = commandLineFunctionsHash;

        var addFunctionToWindow = function(name) {
          addObjectToRestore(name);
          commandWindow[name] = function() {
            return this.commandLineFunctionsHash[name](appender, arguments, commandReturnValue);
          };
        };

        for (i = 0, len = commandLineFunctions.length; i < len; i++) {
          addFunctionToWindow(commandLineFunctions[i][0]);
        }

        // Another bizarre workaround to get IE to eval in the global scope
        if (commandWindow === window && commandWindow.execScript) {
          addObjectToRestore("evalExpr");
          addObjectToRestore("result");
          window.evalExpr = expr;
          commandWindow.execScript("window.result=eval(window.evalExpr);");
          result = window.result;
        } else {
          result = commandWindow.eval(expr);
        }
        commandOutput = isUndefined(result) ? result : formatObjectExpansion(result, commandLineObjectExpansionDepth);

        // Restore variables in the command window to their original state
        for (i = 0, len = objectsToRestore.length; i < len; i++) {
          commandWindow[objectsToRestore[i][0]] = objectsToRestore[i][1];
        }
      } catch (ex) {
        commandOutput = "Error evaluating command: " + getExceptionStringRep(ex);
        commandReturnValue.isError = true;
      }
      // Append command output
      if (commandReturnValue.appendResult) {
        var message = ">>> " + expr;
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

    this.addCommandLineFunction = function(functionName, commandLineFunction) {
      commandLineFunctions.push([functionName, commandLineFunction]);
    };

    var commandHistoryCookieName = "log4javascriptCommandHistory";
    this.storeCommandHistory = function(commandHistory) {
      setCookie(commandHistoryCookieName, commandHistory.join(","));
    };

    var writeHtml = function(doc) {
      var lines = getConsoleHtmlLines();
      doc.open();
      for (var i = 0, len = lines.length; i < len; i++) {
        doc.writeln(lines[i]);
      }
      doc.close();
    };

    // Set up event listeners
    this.setEventTypes(["load", "unload"]);

    var consoleWindowLoadHandler = function() {
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
        win.commandHistory = storedValue.split(",");
        win.currentCommandIndex = win.commandHistory.length;
      }

      appender.dispatchEvent("load", { "win" : win });
    };

    this.unload = function() {
      logLog.debug("unload " + this + ", caller: " + this.unload.caller);
      if (!consoleClosed) {
        logLog.debug("really doing unload " + this);
        consoleClosed = true;
        consoleWindowLoaded = false;
        consoleWindowCreated = false;
        appender.dispatchEvent("unload", {});
      }
    };

    var pollConsoleWindow = function(windowTest, interval, successCallback, errorMessage) {
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

    var getConsoleUrl = function() {
      var documentDomainSet = (document.domain != location.hostname);
      return useDocumentWrite ? "" : getBaseUrl() + "console_uncompressed.html" +
        (documentDomainSet ? "?log4javascript_domain=" + escape(document.domain) : "");
    };

    // Define methods and properties that vary between subclasses
    if (inPage) {
      // InPageAppender

      var containerElement = null;

      // Configuration methods. The function scope is used to prevent
      // direct alteration to the appender configuration properties.
      var cssProperties = [];
      this.addCssProperty = function(name, value) {
        if (checkCanConfigure("cssProperties")) {
          cssProperties.push([name, value]);
        }
      };

      // Define useful variables
      var windowCreationStarted = false;
      var iframeContainerDiv;
      var iframeId = uniqueId + "_InPageAppender_" + consoleAppenderId;

      this.hide = function() {
        if (initialized && consoleWindowCreated) {
          if (consoleWindowExists()) {
            getConsoleWindow().$("command").blur();
          }
          iframeContainerDiv.style.display = "none";
          minimized = true;
        }
      };

      this.show = function() {
        if (initialized) {
          if (consoleWindowCreated) {
            iframeContainerDiv.style.display = "block";
            this.setShowCommandLine(showCommandLine); // Force IE to update
            minimized = false;
          } else if (!windowCreationStarted) {
            createWindow(true);
          }
        }
      };

      this.isVisible = function() {
        return !minimized && !consoleClosed;
      };

      this.close = function(fromButton) {
        if (!consoleClosed && (!fromButton || confirm("This will permanently remove the console from the page. No more messages will be logged. Do you wish to continue?"))) {
          iframeContainerDiv.parentNode.removeChild(iframeContainerDiv);
          this.unload();
        }
      };

      // Create open, init, getConsoleWindow and safeToAppend functions
      open = function() {
        var initErrorMessage = "InPageAppender.open: unable to create console iframe";

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
            var windowTest = function(win) { return isLoaded(win); };
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
        iframeContainerDiv = containerElement.appendChild(document.createElement("div"));

        iframeContainerDiv.style.width = width;
        iframeContainerDiv.style.height = height;
        iframeContainerDiv.style.border = "solid gray 1px";

        for (var i = 0, len = cssProperties.length; i < len; i++) {
          iframeContainerDiv.style[cssProperties[i][0]] = cssProperties[i][1];
        }

        var iframeSrc = useDocumentWrite ? "" : " src='" + getConsoleUrl() + "'";

        // Adding an iframe using the DOM would be preferable, but it doesn't work
        // in IE5 on Windows, or in Konqueror prior to version 3.5 - in Konqueror
        // it creates the iframe fine but I haven't been able to find a way to obtain
        // the iframe's window object
        iframeContainerDiv.innerHTML = "<iframe id='" + iframeId + "' name='" + iframeId +
          "' width='100%' height='100%' frameborder='0'" + iframeSrc +
          " scrolling='no'></iframe>";
        consoleClosed = false;

        // Write the console HTML to the iframe
        var iframeDocumentExistsTest = function(win) {
          try {
            return bool(win) && bool(win.document);
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

      createWindow = function(show) {
        if (show || !initiallyMinimized) {
          var pageLoadHandler = function() {
            if (!container) {
              // Set up default container element
              containerElement = document.createElement("div");
              containerElement.style.position = "fixed";
              containerElement.style.left = "0";
              containerElement.style.right = "0";
              containerElement.style.bottom = "0";
              document.body.appendChild(containerElement);
              appender.addCssProperty("borderWidth", "1px 0 0 0");
              appender.addCssProperty("zIndex", 1000000); // Can't find anything authoritative that says how big z-index can be
              open();
            } else {
              try {
                var el = document.getElementById(container);
                if (el.nodeType == 1) {
                  containerElement = el;
                }
                open();
              } catch (ex) {
                handleError("InPageAppender.init: invalid container element '" + container + "' supplied", ex);
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
            log4javascript.addEventListener("load", pageLoadHandler);
          }
          windowCreationStarted = true;
        }
      };

      init = function() {
        createWindow();
        initialized = true;
      };

      getConsoleWindow = function() {
        var iframe = window.frames[iframeId];
        if (iframe) {
          return iframe;
        }
      };

      safeToAppend = function() {
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
      this.isUseOldPopUp = function() { return useOldPopUp; };
      this.setUseOldPopUp = function(useOldPopUpParam) {
        if (checkCanConfigure("useOldPopUp")) {
          useOldPopUp = bool(useOldPopUpParam);
        }
      };

      this.isComplainAboutPopUpBlocking = function() { return complainAboutPopUpBlocking; };
      this.setComplainAboutPopUpBlocking = function(complainAboutPopUpBlockingParam) {
        if (checkCanConfigure("complainAboutPopUpBlocking")) {
          complainAboutPopUpBlocking = bool(complainAboutPopUpBlockingParam);
        }
      };

      this.isFocusPopUp = function() { return focusConsoleWindow; };
      this.setFocusPopUp = function(focusPopUpParam) {
        // This property can be safely altered after logging has started
        focusConsoleWindow = bool(focusPopUpParam);
      };

      this.isReopenWhenClosed = function() { return reopenWhenClosed; };
      this.setReopenWhenClosed = function(reopenWhenClosedParam) {
        // This property can be safely altered after logging has started
        reopenWhenClosed = bool(reopenWhenClosedParam);
      };

      this.close = function() {
        logLog.debug("close " + this);
        try {
          popUp.close();
          this.unload();
        } catch (ex) {
          // Do nothing
        }
      };

      this.hide = function() {
        logLog.debug("hide " + this);
        if (consoleWindowExists()) {
          this.close();
        }
      };

      this.show = function() {
        logLog.debug("show " + this);
        if (!consoleWindowCreated) {
          open();
        }
      };

      this.isVisible = function() {
        return safeToAppend();
      };

      // Define useful variables
      var popUp;

      // Create open, init, getConsoleWindow and safeToAppend functions
      open = function() {
        var windowProperties = "width=" + width + ",height=" + height + ",status,resizable";
        var frameInfo = "";
        try {
          var frameEl = window.frameElement;
          if (frameEl) {
            frameInfo = "_" + frameEl.tagName + "_" + (frameEl.name || frameEl.id || "");
          }
        } catch (e) {
          frameInfo = "_inaccessibleParentFrame";
        }
        var windowName = "PopUp_" + location.host.replace(/[^a-z0-9]/gi, "_") + "_" + consoleAppenderId + frameInfo;
        if (!useOldPopUp || !useDocumentWrite) {
          // Ensure a previous window isn't used by using a unique name
          windowName = windowName + "_" + uniqueId;
        }

        var checkPopUpClosed = function(win) {
          if (consoleClosed) {
            return true;
          } else {
            try {
              return bool(win) && win.closed;
            } catch(ex) {}
          }
          return false;
        };

        var popUpClosedCallback = function() {
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
            "PopUpAppender.checkPopUpClosed: error checking pop-up window");
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
              var popUpLoadedTest = function(win) { return bool(win) && isLoaded(win); };
              if (isLoaded(popUp)) {
                finalInit();
              } else {
                pollConsoleWindow(popUpLoadedTest, 100, finalInit,
                  "PopUpAppender.init: unable to create console window");
              }
            }
          } else {
            isSupported = false;
            logLog.warn("PopUpAppender.init: pop-ups blocked, please unblock to use PopUpAppender");
            if (complainAboutPopUpBlocking) {
              handleError("log4javascript: pop-up windows appear to be blocked. Please unblock them to use pop-up logging.");
            }
          }
        } catch (ex) {
          handleError("PopUpAppender.init: error creating pop-up", ex);
        }
      };

      createWindow = function() {
        if (!initiallyMinimized) {
          open();
        }
      };

      init = function() {
        createWindow();
        initialized = true;
      };

      getConsoleWindow = function() {
        return popUp;
      };

      safeToAppend = function() {
        if (isSupported && !isUndefined(popUp) && !consoleClosed) {
          if (popUp.closed ||
            (consoleWindowLoaded && isUndefined(popUp.closed))) { // Extra check for Opera
            appender.unload();
            logLog.debug("PopUpAppender: pop-up closed");
            return false;
          }
          if (!consoleWindowLoaded && isLoaded(popUp)) {
            consoleWindowLoaded = true;
          }
        }
        return isSupported && consoleWindowLoaded && !consoleClosed;
      };
    }

    // Expose getConsoleWindow so that automated tests can check the DOM
    this.getConsoleWindow = getConsoleWindow;
  };

  ConsoleAppender.addGlobalCommandLineFunction = function(functionName, commandLineFunction) {
    defaultCommandLineFunctions.push([functionName, commandLineFunction]);
  };

  /* ------------------------------------------------------------------ */

  function PopUpAppender(lazyInit, initiallyMinimized, useDocumentWrite,
                         width, height) {
    this.create(false, null, lazyInit, initiallyMinimized,
      useDocumentWrite, width, height, this.defaults.focusPopUp);
  }

  PopUpAppender.prototype = new ConsoleAppender();

  PopUpAppender.prototype.defaults = {
    layout: new PatternLayout("%d{HH:mm:ss} %-5p - %m{1}%n"),
    initiallyMinimized: false,
    focusPopUp: false,
    lazyInit: true,
    useOldPopUp: true,
    complainAboutPopUpBlocking: true,
    newestMessageAtTop: false,
    scrollToLatestMessage: true,
    width: "600",
    height: "400",
    reopenWhenClosed: false,
    maxMessages: null,
    showCommandLine: true,
    commandLineObjectExpansionDepth: 1,
    showHideButton: false,
    showCloseButton: true,
    showLogEntryDeleteButtons: true,
    useDocumentWrite: true
  };

  PopUpAppender.prototype.toString = function() {
    return "PopUpAppender";
  };

  log4javascript.PopUpAppender = PopUpAppender;


  /* ------------------------------------------------------------------ */

  function InPageAppender(container, lazyInit, initiallyMinimized,
                          useDocumentWrite, width, height) {
    this.create(true, container, lazyInit, initiallyMinimized,
      useDocumentWrite, width, height, false);
  }

  InPageAppender.prototype = new ConsoleAppender();

  InPageAppender.prototype.defaults = {
    layout: new PatternLayout("%d{HH:mm:ss} %-5p - %m{1}%n"),
    initiallyMinimized: false,
    lazyInit: true,
    newestMessageAtTop: false,
    scrollToLatestMessage: true,
    width: "100%",
    height: "220px",
    maxMessages: null,
    showCommandLine: true,
    commandLineObjectExpansionDepth: 1,
    showHideButton: false,
    showCloseButton: false,
    showLogEntryDeleteButtons: true,
    useDocumentWrite: true
  };

  InPageAppender.prototype.toString = function() {
    return "InPageAppender";
  };

  log4javascript.InPageAppender = InPageAppender;

  // Next line for backwards compatibility
  log4javascript.InlineAppender = InPageAppender;
})();

/* ---------------------------------------------------------------------- */
// Console extension functions

function padWithSpaces(str, len) {
  if (str.length < len) {
    var spaces = [];
    var numberOfSpaces = Math.max(0, len - str.length);
    for (var i = 0; i < numberOfSpaces; i++) {
      spaces[i] = " ";
    }
    str += spaces.join("");
  }
  return str;
}

(function() {
  function dir(obj) {
    var maxLen = 0;
    // Obtain the length of the longest property name
    for (var p in obj) {
      maxLen = Math.max(toStr(p).length, maxLen);
    }
    // Create the nicely formatted property list
    var propList = [];
    for (p in obj) {
      var propNameStr = "  " + padWithSpaces(toStr(p), maxLen + 2);
      var propVal;
      try {
        propVal = splitIntoLines(toStr(obj[p])).join(padWithSpaces(newLine, maxLen + 6));
      } catch (ex) {
        propVal = "[Error obtaining property. Details: " + getExceptionMessage(ex) + "]";
      }
      propList.push(propNameStr + propVal);
    }
    return propList.join(newLine);
  }

  var nodeTypes = {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
  };

  var preFormattedElements = ["script", "pre"];

  // This should be the definitive list, as specified by the XHTML 1.0 Transitional DTD
  var emptyElements = ["br", "img", "hr", "param", "link", "area", "input", "col", "base", "meta"];
  var indentationUnit = "  ";

  // Create and return an XHTML string from the node specified
  function getXhtml(rootNode, includeRootNode, indentation, startNewLine, preformatted) {
    includeRootNode = (typeof includeRootNode == "undefined") ? true : !!includeRootNode;
    if (typeof indentation != "string") {
      indentation = "";
    }
    startNewLine = !!startNewLine;
    preformatted = !!preformatted;
    var xhtml;

    function isWhitespace(node) {
      return ((node.nodeType == nodeTypes.TEXT_NODE) && /^[ \t\r\n]*$/.test(node.nodeValue));
    }

    function fixAttributeValue(attrValue) {
      return attrValue.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    }

    function getStyleAttributeValue(el) {
      var stylePairs = el.style.cssText.split(";");
      var styleValue = "";
      var isFirst = true;
      for (var j = 0, len = stylePairs.length; j < len; j++) {
        var nameValueBits = stylePairs[j].split(":");
        var props = [];
        if (!/^\s*$/.test(nameValueBits[0])) {
          props.push(trim(nameValueBits[0]).toLowerCase() + ":" + trim(nameValueBits[1]));
        }
        styleValue = props.join(";");
      }
      return styleValue;
    }

    function getNamespace(el) {
      if (el.prefix) {
        return el.prefix;
      } else if (el.outerHTML) {
        var regex = new RegExp("<([^:]+):" + el.tagName + "[^>]*>", "i");
        if (regex.test(el.outerHTML)) {
          return RegExp.$1.toLowerCase();
        }
      }
      return "";
    }

    var lt = "<";
    var gt = ">";

    if (includeRootNode && rootNode.nodeType != nodeTypes.DOCUMENT_FRAGMENT_NODE) {
      switch (rootNode.nodeType) {
        case nodeTypes.ELEMENT_NODE:
          var tagName = rootNode.tagName.toLowerCase();
          xhtml = startNewLine ? newLine + indentation : "";
          xhtml += lt;
          // Allow for namespaces, where present
          var prefix = getNamespace(rootNode);
          var hasPrefix = !!prefix;
          if (hasPrefix) {
            xhtml += prefix + ":";
          }
          xhtml += tagName;
          for (i = 0, len = rootNode.attributes.length; i < len; i++) {
            var currentAttr = rootNode.attributes[i];
            // Check the attribute is valid.
            if (!	currentAttr.specified ||
              currentAttr.nodeValue === null ||
              currentAttr.nodeName.toLowerCase() === "style" ||
              typeof currentAttr.nodeValue !== "string" ||
              currentAttr.nodeName.indexOf("_moz") === 0) {
              continue;
            }
            xhtml += " " + currentAttr.nodeName.toLowerCase() + "=\"";
            xhtml += fixAttributeValue(currentAttr.nodeValue);
            xhtml += "\"";
          }
          // Style needs to be done separately as it is not reported as an
          // attribute in IE
          if (rootNode.style.cssText) {
            var styleValue = getStyleAttributeValue(rootNode);
            if (styleValue !== "") {
              xhtml += " style=\"" + getStyleAttributeValue(rootNode) + "\"";
            }
          }
          if (array_contains(emptyElements, tagName) ||
            (hasPrefix && !rootNode.hasChildNodes())) {
            xhtml += "/" + gt;
          } else {
            xhtml += gt;
            // Add output for childNodes collection (which doesn't include attribute nodes)
            var childStartNewLine = !(rootNode.childNodes.length === 1 &&
              rootNode.childNodes[0].nodeType === nodeTypes.TEXT_NODE);
            var childPreformatted = array_contains(preFormattedElements, tagName);
            for (var i = 0, len = rootNode.childNodes.length; i < len; i++) {
              xhtml += getXhtml(rootNode.childNodes[i], true, indentation + indentationUnit,
                childStartNewLine, childPreformatted);
            }
            // Add the end tag
            var endTag = lt + "/" + tagName + gt;
            xhtml += childStartNewLine ? newLine + indentation + endTag : endTag;
          }
          return xhtml;
        case nodeTypes.TEXT_NODE:
          if (isWhitespace(rootNode)) {
            xhtml = "";
          } else {
            if (preformatted) {
              xhtml = rootNode.nodeValue;
            } else {
              // Trim whitespace from each line of the text node
              var lines = splitIntoLines(trim(rootNode.nodeValue));
              var trimmedLines = [];
              for (var i = 0, len = lines.length; i < len; i++) {
                trimmedLines[i] = trim(lines[i]);
              }
              xhtml = trimmedLines.join(newLine + indentation);
            }
            if (startNewLine) {
              xhtml = newLine + indentation + xhtml;
            }
          }
          return xhtml;
        case nodeTypes.CDATA_SECTION_NODE:
          return "<![CDA" + "TA[" + rootNode.nodeValue + "]" + "]>" + newLine;
        case nodeTypes.DOCUMENT_NODE:
          xhtml = "";
          // Add output for childNodes collection (which doesn't include attribute nodes)
          for (var i = 0, len = rootNode.childNodes.length; i < len; i++) {
            xhtml += getXhtml(rootNode.childNodes[i], true, indentation);
          }
          return xhtml;
        default:
          return "";
      }
    } else {
      xhtml = "";
      // Add output for childNodes collection (which doesn't include attribute nodes)
      for (var i = 0, len = rootNode.childNodes.length; i < len; i++) {
        xhtml += getXhtml(rootNode.childNodes[i], true, indentation + indentationUnit);
      }
      return xhtml;
    }
  }

  function createCommandLineFunctions() {
    ConsoleAppender.addGlobalCommandLineFunction("$", function(appender, args, returnValue) {
      return document.getElementById(args[0]);
    });

    ConsoleAppender.addGlobalCommandLineFunction("dir", function(appender, args, returnValue) {
      var lines = [];
      for (var i = 0, len = args.length; i < len; i++) {
        lines[i] = dir(args[i]);
      }
      return lines.join(newLine + newLine);
    });

    ConsoleAppender.addGlobalCommandLineFunction("dirxml", function(appender, args, returnValue) {
      var lines = [];
      for (var i = 0, len = args.length; i < len; i++) {
        var win = appender.getCommandWindow();
        lines[i] = getXhtml(args[i]);
      }
      return lines.join(newLine + newLine);
    });

    ConsoleAppender.addGlobalCommandLineFunction("cd", function(appender, args, returnValue) {
      var win, message;
      if (args.length === 0 || args[0] === "") {
        win = window;
        message = "Command line set to run in main window";
      } else {
        if (args[0].window == args[0]) {
          win = args[0];
          message = "Command line set to run in frame '" + args[0].name + "'";
        } else {
          win = window.frames[args[0]];
          if (win) {
            message = "Command line set to run in frame '" + args[0] + "'";
          } else {
            returnValue.isError = true;
            message = "Frame '" + args[0] + "' does not exist";
            win = appender.getCommandWindow();
          }
        }
      }
      appender.setCommandWindow(win);
      return message;
    });

    ConsoleAppender.addGlobalCommandLineFunction("clear", function(appender, args, returnValue) {
      returnValue.appendResult = false;
      appender.clear();
    });

    ConsoleAppender.addGlobalCommandLineFunction("keys", function(appender, args, returnValue) {
      var keys = [];
      for (var k in args[0]) {
        keys.push(k);
      }
      return keys;
    });

    ConsoleAppender.addGlobalCommandLineFunction("values", function(appender, args, returnValue) {
      var values = [];
      for (var k in args[0]) {
        try {
          values.push(args[0][k]);
        } catch (ex) {
          logLog.warn("values(): Unable to obtain value for key " + k + ". Details: " + getExceptionMessage(ex));
        }
      }
      return values;
    });

    ConsoleAppender.addGlobalCommandLineFunction("expansionDepth", function(appender, args, returnValue) {
      var expansionDepth = parseInt(args[0], 10);
      if (isNaN(expansionDepth) || expansionDepth < 0) {
        returnValue.isError = true;
        return "" + args[0] + " is not a valid expansion depth";
      } else {
        appender.setCommandLineObjectExpansionDepth(expansionDepth);
        return "Object expansion depth set to " + expansionDepth;
      }
    });
  }

  function init() {
    // Add command line functions
    createCommandLineFunctions();
  }

  /* ------------------------------------------------------------------ */

  init();
})();