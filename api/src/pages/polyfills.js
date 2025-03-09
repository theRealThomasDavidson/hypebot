// Core JavaScript Polyfills for Chrome 52 WebView
(function(global) {
    'use strict';

    // Promise polyfill (if not supported)
    if (typeof Promise === 'undefined') {
        global.Promise = function(executor) {
            var callbacks = [];
            var value = null;
            var state = 'pending';

            this.then = function(onFulfilled) {
                if (state === 'pending') {
                    callbacks.push(onFulfilled);
                    return this;
                } else if (state === 'fulfilled') {
                    onFulfilled(value);
                    return this;
                }
            };

            function resolve(val) {
                value = val;
                state = 'fulfilled';
                callbacks.forEach(function(callback) {
                    callback(value);
                });
            }

            executor(resolve);
        };
    }

    // Array.from polyfill
    if (!Array.from) {
        Array.from = function(arrayLike) {
            return Array.prototype.slice.call(arrayLike);
        };
    }

    // Object.assign polyfill
    if (!Object.assign) {
        Object.assign = function(target) {
            if (target === null || target === undefined) {
                throw new TypeError('Cannot convert undefined or null to object');
            }
            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource !== null && nextSource !== undefined) {
                    for (var nextKey in nextSource) {
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        };
    }

    // Array.prototype.find polyfill
    if (!Array.prototype.find) {
        Object.defineProperty(Array.prototype, 'find', {
            value: function(predicate) {
                if (this === null || this === undefined) {
                    throw new TypeError('Array.prototype.find called on null or undefined');
                }
                if (typeof predicate !== 'function') {
                    throw new TypeError('predicate must be a function');
                }
                var list = Object(this);
                var length = list.length >>> 0;
                var thisArg = arguments[1];

                for (var i = 0; i < length; i++) {
                    var value = list[i];
                    if (predicate.call(thisArg, value, i, list)) {
                        return value;
                    }
                }
                return undefined;
            },
            configurable: true,
            writable: true
        });
    }

    // String.prototype.includes polyfill
    if (!String.prototype.includes) {
        String.prototype.includes = function(search, start) {
            if (typeof start !== 'number') {
                start = 0;
            }
            if (start + search.length > this.length) {
                return false;
            }
            return this.indexOf(search, start) !== -1;
        };
    }

    // Element.closest polyfill
    if (!Element.prototype.closest) {
        Element.prototype.closest = function(s) {
            var el = this;
            do {
                if (el.matches(s)) return el;
                el = el.parentElement || el.parentNode;
            } while (el !== null && el.nodeType === 1);
            return null;
        };
    }

    // Element.matches polyfill
    if (!Element.prototype.matches) {
        Element.prototype.matches = 
            Element.prototype.matchesSelector || 
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector || 
            Element.prototype.oMatchesSelector || 
            Element.prototype.webkitMatchesSelector ||
            function(s) {
                var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                    i = matches.length;
                while (--i >= 0 && matches.item(i) !== this) {}
                return i > -1;            
            };
    }

    // Debug helper to check what features need polyfilling
    global.checkFeatureSupport = function() {
        var support = {
            promise: typeof Promise !== 'undefined',
            arrayFrom: typeof Array.from !== 'undefined',
            objectAssign: typeof Object.assign !== 'undefined',
            arrayFind: Array.prototype.find !== undefined,
            stringIncludes: String.prototype.includes !== undefined,
            elementClosest: Element.prototype.closest !== undefined,
            elementMatches: Element.prototype.matches !== undefined
        };
        
        console.log('Feature Support:', support);
        return support;
    };
})(typeof window !== 'undefined' ? window : this); 