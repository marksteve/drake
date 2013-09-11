
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};

require.register("component-json-fallback/index.js", function(exports, require, module){
/*
    json2.js
    2011-10-19

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON = {};

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

module.exports = JSON
});
require.register("component-json/index.js", function(exports, require, module){

module.exports = 'undefined' == typeof JSON
  ? require('component-json-fallback')
  : JSON;

});
require.register("components-jquery/jquery.js", function(exports, require, module){
/*!
 * jQuery JavaScript Library v2.0.3
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-07-03T13:30Z
 */
(function( window, undefined ) {

// Can't do this because several apps including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
// Support: Firefox 18+
//"use strict";
var
	// A central reference to the root jQuery(document)
	rootjQuery,

	// The deferred used on DOM ready
	readyList,

	// Support: IE9
	// For `typeof xmlNode.method` instead of `xmlNode.method !== undefined`
	core_strundefined = typeof undefined,

	// Use the correct document accordingly with window argument (sandbox)
	location = window.location,
	document = window.document,
	docElem = document.documentElement,

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// [[Class]] -> type pairs
	class2type = {},

	// List of deleted data cache ids, so we can reuse them
	core_deletedIds = [],

	core_version = "2.0.3",

	// Save a reference to some core methods
	core_concat = core_deletedIds.concat,
	core_push = core_deletedIds.push,
	core_slice = core_deletedIds.slice,
	core_indexOf = core_deletedIds.indexOf,
	core_toString = class2type.toString,
	core_hasOwn = class2type.hasOwnProperty,
	core_trim = core_version.trim,

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Used for matching numbers
	core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,

	// Used for splitting on whitespace
	core_rnotwhite = /\S+/g,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	},

	// The ready event handler and self cleanup method
	completed = function() {
		document.removeEventListener( "DOMContentLoaded", completed, false );
		window.removeEventListener( "load", completed, false );
		jQuery.ready();
	};

jQuery.fn = jQuery.prototype = {
	// The current version of jQuery being used
	jquery: core_version,

	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;

					// scripts is true for back-compat
					jQuery.merge( this, jQuery.parseHTML(
						match[1],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {
							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return core_slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Add the callback
		jQuery.ready.promise().done( fn );

		return this;
	},

	slice: function() {
		return this.pushStack( core_slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: core_push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( core_version + Math.random() ).replace( /\D/g, "" ),

	noConflict: function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.trigger ) {
			jQuery( document ).trigger("ready").off("ready");
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray,

	isWindow: function( obj ) {
		return obj != null && obj === obj.window;
	},

	isNumeric: function( obj ) {
		return !isNaN( parseFloat(obj) ) && isFinite( obj );
	},

	type: function( obj ) {
		if ( obj == null ) {
			return String( obj );
		}
		// Support: Safari <= 5.1 (functionish RegExp)
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ core_toString.call(obj) ] || "object" :
			typeof obj;
	},

	isPlainObject: function( obj ) {
		// Not plain objects:
		// - Any object or value whose internal [[Class]] property is not "[object Object]"
		// - DOM nodes
		// - window
		if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		// Support: Firefox <20
		// The try/catch suppresses exceptions thrown when attempting to access
		// the "constructor" property of certain host objects, ie. |window.location|
		// https://bugzilla.mozilla.org/show_bug.cgi?id=814622
		try {
			if ( obj.constructor &&
					!core_hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
				return false;
			}
		} catch ( e ) {
			return false;
		}

		// If the function hasn't returned already, we're confident that
		// |obj| is a plain object, created by {} or constructed with new Object
		return true;
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw new Error( msg );
	},

	// data: string of html
	// context (optional): If specified, the fragment will be created in this context, defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string
	parseHTML: function( data, context, keepScripts ) {
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		if ( typeof context === "boolean" ) {
			keepScripts = context;
			context = false;
		}
		context = context || document;

		var parsed = rsingleTag.exec( data ),
			scripts = !keepScripts && [];

		// Single tag
		if ( parsed ) {
			return [ context.createElement( parsed[1] ) ];
		}

		parsed = jQuery.buildFragment( [ data ], context, scripts );

		if ( scripts ) {
			jQuery( scripts ).remove();
		}

		return jQuery.merge( [], parsed.childNodes );
	},

	parseJSON: JSON.parse,

	// Cross-browser xml parsing
	parseXML: function( data ) {
		var xml, tmp;
		if ( !data || typeof data !== "string" ) {
			return null;
		}

		// Support: IE9
		try {
			tmp = new DOMParser();
			xml = tmp.parseFromString( data , "text/xml" );
		} catch ( e ) {
			xml = undefined;
		}

		if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	},

	noop: function() {},

	// Evaluates a script in a global context
	globalEval: function( code ) {
		var script,
				indirect = eval;

		code = jQuery.trim( code );

		if ( code ) {
			// If the code includes a valid, prologue position
			// strict mode pragma, execute code by injecting a
			// script tag into the document.
			if ( code.indexOf("use strict") === 1 ) {
				script = document.createElement("script");
				script.text = code;
				document.head.appendChild( script ).parentNode.removeChild( script );
			} else {
			// Otherwise, avoid the DOM node creation, insertion
			// and removal by using an indirect global eval
				indirect( code );
			}
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var value,
			i = 0,
			length = obj.length,
			isArray = isArraylike( obj );

		if ( args ) {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	trim: function( text ) {
		return text == null ? "" : core_trim.call( text );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArraylike( Object(arr) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				core_push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : core_indexOf.call( arr, elem, i );
	},

	merge: function( first, second ) {
		var l = second.length,
			i = first.length,
			j = 0;

		if ( typeof l === "number" ) {
			for ( ; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}
		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var retVal,
			ret = [],
			i = 0,
			length = elems.length;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value,
			i = 0,
			length = elems.length,
			isArray = isArraylike( elems ),
			ret = [];

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return core_concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var tmp, args, proxy;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = core_slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( core_slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	access: function( elems, fn, key, value, chainable, emptyGet, raw ) {
		var i = 0,
			length = elems.length,
			bulk = key == null;

		// Sets many values
		if ( jQuery.type( key ) === "object" ) {
			chainable = true;
			for ( i in key ) {
				jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
			}

		// Sets one value
		} else if ( value !== undefined ) {
			chainable = true;

			if ( !jQuery.isFunction( value ) ) {
				raw = true;
			}

			if ( bulk ) {
				// Bulk operations run against the entire set
				if ( raw ) {
					fn.call( elems, value );
					fn = null;

				// ...except when executing function values
				} else {
					bulk = fn;
					fn = function( elem, key, value ) {
						return bulk.call( jQuery( elem ), value );
					};
				}
			}

			if ( fn ) {
				for ( ; i < length; i++ ) {
					fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
				}
			}
		}

		return chainable ?
			elems :

			// Gets
			bulk ?
				fn.call( elems ) :
				length ? fn( elems[0], key ) : emptyGet;
	},

	now: Date.now,

	// A method for quickly swapping in/out CSS properties to get correct calculations.
	// Note: this method belongs to the css module but it's needed here for the support module.
	// If support gets modularized, this method should be moved back to the css module.
	swap: function( elem, options, callback, args ) {
		var ret, name,
			old = {};

		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		ret = callback.apply( elem, args || [] );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}

		return ret;
	}
});

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// we once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready );

		} else {

			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed, false );
		}
	}
	return readyList.promise( obj );
};

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function isArraylike( obj ) {
	var length = obj.length,
		type = jQuery.type( obj );

	if ( jQuery.isWindow( obj ) ) {
		return false;
	}

	if ( obj.nodeType === 1 && length ) {
		return true;
	}

	return type === "array" || type !== "function" &&
		( length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj );
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);
/*!
 * Sizzle CSS Selector Engine v1.9.4-pre
 * http://sizzlejs.com/
 *
 * Copyright 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-06-03
 */
(function( window, undefined ) {

var i,
	support,
	cachedruns,
	Expr,
	getText,
	isXML,
	compile,
	outermostContext,
	sortInput,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + -(new Date()),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	hasDuplicate = false,
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}
		return 0;
	},

	// General-purpose constants
	strundefined = typeof undefined,
	MAX_NEGATIVE = 1 << 31,

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf if we can't use a native one
	indexOf = arr.indexOf || function( elem ) {
		var i = 0,
			len = this.length;
		for ( ; i < len; i++ ) {
			if ( this[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
		"*(?:([*^$|!~]?=)" + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

	// Prefer arguments quoted,
	//   then not containing pseudos/brackets,
	//   then attribute selectors/non-parenthetical expressions,
	//   then anything else
	// These preferences are here to reduce the number of selectors
	//   needing tokenize in the PSEUDO preFilter
	pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace( 3, 8 ) + ")*)|.*)\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rsibling = new RegExp( whitespace + "*[+~]" ),
	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			// BMP codepoint
			high < 0 ?
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var match, elem, m, nodeType,
		// QSA vars
		i, groups, old, nid, newContext, newSelector;

	if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
		setDocument( context );
	}

	context = context || document;
	results = results || [];

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {
		return [];
	}

	if ( documentIsHTML && !seed ) {

		// Shortcuts
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, context.getElementsByTagName( selector ) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && support.getElementsByClassName && context.getElementsByClassName ) {
				push.apply( results, context.getElementsByClassName( m ) );
				return results;
			}
		}

		// QSA path
		if ( support.qsa && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
			nid = old = expando;
			newContext = context;
			newSelector = nodeType === 9 && selector;

			// qSA works strangely on Element-rooted queries
			// We can work around this by specifying an extra ID on the root
			// and working up from there (Thanks to Andrew Dupont for the technique)
			// IE 8 doesn't work on object elements
			if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
				groups = tokenize( selector );

				if ( (old = context.getAttribute("id")) ) {
					nid = old.replace( rescape, "\\$&" );
				} else {
					context.setAttribute( "id", nid );
				}
				nid = "[id='" + nid + "'] ";

				i = groups.length;
				while ( i-- ) {
					groups[i] = nid + toSelector( groups[i] );
				}
				newContext = rsibling.test( selector ) && context.parentNode || context;
				newSelector = groups.join(",");
			}

			if ( newSelector ) {
				try {
					push.apply( results,
						newContext.querySelectorAll( newSelector )
					);
					return results;
				} catch(qsaError) {
				} finally {
					if ( !old ) {
						context.removeAttribute("id");
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key += " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = attrs.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			( ~b.sourceIndex || MAX_NEGATIVE ) -
			( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Detect xml
 * @param {Element|Object} elem An element or a document
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var doc = node ? node.ownerDocument || node : preferredDoc,
		parent = doc.defaultView;

	// If no document and documentElement is available, return
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Set our document
	document = doc;
	docElem = doc.documentElement;

	// Support tests
	documentIsHTML = !isXML( doc );

	// Support: IE>8
	// If iframe document is assigned to "document" variable and if iframe has been reloaded,
	// IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
	// IE6-8 do not support the defaultView property so parent will be undefined
	if ( parent && parent.attachEvent && parent !== parent.top ) {
		parent.attachEvent( "onbeforeunload", function() {
			setDocument();
		});
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		div.appendChild( doc.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Check if getElementsByClassName can be trusted
	support.getElementsByClassName = assert(function( div ) {
		div.innerHTML = "<div class='a'></div><div class='a i'></div>";

		// Support: Safari<4
		// Catch class over-caching
		div.firstChild.className = "i";
		// Support: Opera<10
		// Catch gEBCN failure to find non-leading classes
		return div.getElementsByClassName("i").length === 2;
	});

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !doc.getElementsByName || !doc.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== strundefined && documentIsHTML ) {
				var m = context.getElementById( id );
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		// Support: IE6/7
		// getElementById is not reliable as a find shortcut
		delete Expr.find["ID"];

		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== strundefined ) {
				return context.getElementsByTagName( tag );
			}
		} :
		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== strundefined && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( doc.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			div.innerHTML = "<select><option selected=''></option></select>";

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}
		});

		assert(function( div ) {

			// Support: Opera 10-12/IE8
			// ^= $= *= and empty values
			// Should not select anything
			// Support: Windows 8 Native Apps
			// The type attribute is restricted during .innerHTML assignment
			var input = doc.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "t", "" );

			if ( div.querySelectorAll("[t^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */

	// Element contains another
	// Purposefully does not implement inclusive descendent
	// As in, an element does not contain itself
	contains = rnative.test( docElem.contains ) || docElem.compareDocumentPosition ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = docElem.compareDocumentPosition ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition( b );

		if ( compare ) {
			// Disconnected nodes
			if ( compare & 1 ||
				(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

				// Choose the first element that is related to our preferred document
				if ( a === doc || contains(preferredDoc, a) ) {
					return -1;
				}
				if ( b === doc || contains(preferredDoc, b) ) {
					return 1;
				}

				// Maintain original order
				return sortInput ?
					( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
					0;
			}

			return compare & 4 ? -1 : 1;
		}

		// Not directly comparable, sort on existence of method
		return a.compareDocumentPosition ? -1 : 1;
	} :
	function( a, b ) {
		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Parentless nodes are either documents or disconnected
		} else if ( !aup || !bup ) {
			return a === doc ? -1 :
				b === doc ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return doc;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch(e) {}
	}

	return Sizzle( expr, document, null, [elem] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val === undefined ?
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null :
		val;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		for ( ; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (see #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[5] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] && match[4] !== undefined ) {
				match[2] = match[4];

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, outerCache, node, diff, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {
							// Seek `elem` from a previously-cached index
							outerCache = parent[ expando ] || (parent[ expando ] = {});
							cache = outerCache[ type ] || [];
							nodeIndex = cache[0] === dirruns && cache[1];
							diff = cache[0] === dirruns && cache[2];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						// Use previously-cached element index if available
						} else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
							diff = cache[1];

						// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
						} else {
							// Use the same loop as above to seek `elem` from the start
							while ( (node = ++nodeIndex && node && node[ dir ] ||
								(diff = nodeIndex = 0) || start.pop()) ) {

								if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
									// Cache the index of each encountered element
									if ( useCache ) {
										(node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
									}

									if ( node === elem ) {
										break;
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf.call( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
			//   not comment, processing instructions, or others
			// Thanks to Diego Perini for the nodeName shortcut
			//   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeName > "@" || elem.nodeType === 3 || elem.nodeType === 4 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === elem.type );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

function tokenize( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( tokens = [] );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
}

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var data, cache, outerCache,
				dirkey = dirruns + " " + doneName;

			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});
						if ( (cache = outerCache[ dir ]) && cache[0] === dirkey ) {
							if ( (data = cache[1]) === true || data === cachedruns ) {
								return data === true;
							}
						} else {
							cache = outerCache[ dir ] = [ dirkey ];
							cache[1] = matcher( elem, context, xml ) || cachedruns;
							if ( cache[1] === true ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf.call( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	// A counter to specify which element is currently being matched
	var matcherCachedRuns = 0,
		bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, expandContext ) {
			var elem, j, matcher,
				setMatched = [],
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				outermost = expandContext != null,
				contextBackup = outermostContext,
				// We must always have either seed elements or context
				elems = seed || byElement && Expr.find["TAG"]( "*", expandContext && context.parentNode || context ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1);

			if ( outermost ) {
				outermostContext = context !== document && context;
				cachedruns = matcherCachedRuns;
			}

			// Add elements passing elementMatchers directly to results
			// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
			for ( ; (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
						cachedruns = ++matcherCachedRuns;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, group /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !group ) {
			group = tokenize( selector );
		}
		i = group.length;
		while ( i-- ) {
			cached = matcherFromTokens( group[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
	}
	return cached;
};

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function select( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		match = tokenize( selector );

	if ( !seed ) {
		// Try to minimize operations if there is only one group
		if ( match.length === 1 ) {

			// Take a shortcut and set the context if the root selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					support.getById && context.nodeType === 9 && documentIsHTML &&
					Expr.relative[ tokens[1].type ] ) {

				context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
				if ( !context ) {
					return results;
				}
				selector = selector.slice( tokens.shift().value.length );
			}

			// Fetch a seed set for right-to-left matching
			i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
			while ( i-- ) {
				token = tokens[i];

				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( runescape, funescape ),
						rsibling.test( tokens[0].type ) && context.parentNode || context
					)) ) {

						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && toSelector( tokens );
						if ( !selector ) {
							push.apply( results, seed );
							return results;
						}

						break;
					}
				}
			}
		}
	}

	// Compile and execute a filtering function
	// Provide `match` to avoid retokenization if we modified the selector above
	compile( selector, match )(
		seed,
		context,
		!documentIsHTML,
		results,
		rsibling.test( selector )
	);
	return results;
}

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome<14
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
	// Should return 1, but returns 4 (following)
	return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	return div.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
	div.innerHTML = "<input/>";
	div.firstChild.setAttribute( "value", "" );
	return div.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
	return div.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return (val = elem.getAttributeNode( name )) && val.specified ?
				val.value :
				elem[ name ] === true ? name.toLowerCase() : null;
		}
	});
}

jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})( window );
// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.match( core_rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// Flag to know if list is currently firing
		firing,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				firingLength = 0;
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( list && ( !fired || stack ) ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};
jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var action = tuple[ 0 ],
								fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ](function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.done( newDefer.resolve )
										.fail( newDefer.reject )
										.progress( newDefer.notify );
								} else {
									newDefer[ action + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
								}
							});
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[0] ] = function() {
				deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = core_slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
					if( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});
jQuery.support = (function( support ) {
	var input = document.createElement("input"),
		fragment = document.createDocumentFragment(),
		div = document.createElement("div"),
		select = document.createElement("select"),
		opt = select.appendChild( document.createElement("option") );

	// Finish early in limited environments
	if ( !input.type ) {
		return support;
	}

	input.type = "checkbox";

	// Support: Safari 5.1, iOS 5.1, Android 4.x, Android 2.3
	// Check the default checkbox/radio value ("" on old WebKit; "on" elsewhere)
	support.checkOn = input.value !== "";

	// Must access the parent to make an option select properly
	// Support: IE9, IE10
	support.optSelected = opt.selected;

	// Will be defined later
	support.reliableMarginRight = true;
	support.boxSizingReliable = true;
	support.pixelPosition = false;

	// Make sure checked status is properly cloned
	// Support: IE9, IE10
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Check if an input maintains its value after becoming a radio
	// Support: IE9, IE10
	input = document.createElement("input");
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";

	// #11217 - WebKit loses check when the name is after the checked attribute
	input.setAttribute( "checked", "t" );
	input.setAttribute( "name", "t" );

	fragment.appendChild( input );

	// Support: Safari 5.1, Android 4.x, Android 2.3
	// old WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: Firefox, Chrome, Safari
	// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP)
	support.focusinBubbles = "onfocusin" in window;

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	// Run tests that need a body at doc ready
	jQuery(function() {
		var container, marginDiv,
			// Support: Firefox, Android 2.3 (Prefixed box-sizing versions).
			divReset = "padding:0;margin:0;border:0;display:block;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box",
			body = document.getElementsByTagName("body")[ 0 ];

		if ( !body ) {
			// Return for frameset docs that don't have a body
			return;
		}

		container = document.createElement("div");
		container.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px";

		// Check box-sizing and margin behavior.
		body.appendChild( container ).appendChild( div );
		div.innerHTML = "";
		// Support: Firefox, Android 2.3 (Prefixed box-sizing versions).
		div.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%";

		// Workaround failing boxSizing test due to offsetWidth returning wrong value
		// with some non-1 values of body zoom, ticket #13543
		jQuery.swap( body, body.style.zoom != null ? { zoom: 1 } : {}, function() {
			support.boxSizing = div.offsetWidth === 4;
		});

		// Use window.getComputedStyle because jsdom on node.js will break without it.
		if ( window.getComputedStyle ) {
			support.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
			support.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";

			// Support: Android 2.3
			// Check if div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container. (#3333)
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			marginDiv = div.appendChild( document.createElement("div") );
			marginDiv.style.cssText = div.style.cssText = divReset;
			marginDiv.style.marginRight = marginDiv.style.width = "0";
			div.style.width = "1px";

			support.reliableMarginRight =
				!parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
		}

		body.removeChild( container );
	});

	return support;
})( {} );

/*
	Implementation Summary

	1. Enforce API surface and semantic compatibility with 1.9.x branch
	2. Improve the module's maintainability by reducing the storage
		paths to a single mechanism.
	3. Use the same single mechanism to support "private" and "user" data.
	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
	5. Avoid exposing implementation details on user objects (eg. expando properties)
	6. Provide a clear path for implementation upgrade to WeakMap in 2014
*/
var data_user, data_priv,
	rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
	rmultiDash = /([A-Z])/g;

function Data() {
	// Support: Android < 4,
	// Old WebKit does not have Object.preventExtensions/freeze method,
	// return new empty object instead with no [[set]] accessor
	Object.defineProperty( this.cache = {}, 0, {
		get: function() {
			return {};
		}
	});

	this.expando = jQuery.expando + Math.random();
}

Data.uid = 1;

Data.accepts = function( owner ) {
	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	return owner.nodeType ?
		owner.nodeType === 1 || owner.nodeType === 9 : true;
};

Data.prototype = {
	key: function( owner ) {
		// We can accept data for non-element nodes in modern browsers,
		// but we should not, see #8335.
		// Always return the key for a frozen object.
		if ( !Data.accepts( owner ) ) {
			return 0;
		}

		var descriptor = {},
			// Check if the owner object already has a cache key
			unlock = owner[ this.expando ];

		// If not, create one
		if ( !unlock ) {
			unlock = Data.uid++;

			// Secure it in a non-enumerable, non-writable property
			try {
				descriptor[ this.expando ] = { value: unlock };
				Object.defineProperties( owner, descriptor );

			// Support: Android < 4
			// Fallback to a less secure definition
			} catch ( e ) {
				descriptor[ this.expando ] = unlock;
				jQuery.extend( owner, descriptor );
			}
		}

		// Ensure the cache object
		if ( !this.cache[ unlock ] ) {
			this.cache[ unlock ] = {};
		}

		return unlock;
	},
	set: function( owner, data, value ) {
		var prop,
			// There may be an unlock assigned to this node,
			// if there is no entry for this "owner", create one inline
			// and set the unlock as though an owner entry had always existed
			unlock = this.key( owner ),
			cache = this.cache[ unlock ];

		// Handle: [ owner, key, value ] args
		if ( typeof data === "string" ) {
			cache[ data ] = value;

		// Handle: [ owner, { properties } ] args
		} else {
			// Fresh assignments by object are shallow copied
			if ( jQuery.isEmptyObject( cache ) ) {
				jQuery.extend( this.cache[ unlock ], data );
			// Otherwise, copy the properties one-by-one to the cache object
			} else {
				for ( prop in data ) {
					cache[ prop ] = data[ prop ];
				}
			}
		}
		return cache;
	},
	get: function( owner, key ) {
		// Either a valid cache is found, or will be created.
		// New caches will be created and the unlock returned,
		// allowing direct access to the newly created
		// empty data object. A valid owner object must be provided.
		var cache = this.cache[ this.key( owner ) ];

		return key === undefined ?
			cache : cache[ key ];
	},
	access: function( owner, key, value ) {
		var stored;
		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				((key && typeof key === "string") && value === undefined) ) {

			stored = this.get( owner, key );

			return stored !== undefined ?
				stored : this.get( owner, jQuery.camelCase(key) );
		}

		// [*]When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i, name, camel,
			unlock = this.key( owner ),
			cache = this.cache[ unlock ];

		if ( key === undefined ) {
			this.cache[ unlock ] = {};

		} else {
			// Support array or space separated string of keys
			if ( jQuery.isArray( key ) ) {
				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = key.concat( key.map( jQuery.camelCase ) );
			} else {
				camel = jQuery.camelCase( key );
				// Try the string as a key before any manipulation
				if ( key in cache ) {
					name = [ key, camel ];
				} else {
					// If a key with the spaces exists, use it.
					// Otherwise, create an array by matching non-whitespace
					name = camel;
					name = name in cache ?
						[ name ] : ( name.match( core_rnotwhite ) || [] );
				}
			}

			i = name.length;
			while ( i-- ) {
				delete cache[ name[ i ] ];
			}
		}
	},
	hasData: function( owner ) {
		return !jQuery.isEmptyObject(
			this.cache[ owner[ this.expando ] ] || {}
		);
	},
	discard: function( owner ) {
		if ( owner[ this.expando ] ) {
			delete this.cache[ owner[ this.expando ] ];
		}
	}
};

// These may be used throughout the jQuery core codebase
data_user = new Data();
data_priv = new Data();


jQuery.extend({
	acceptData: Data.accepts,

	hasData: function( elem ) {
		return data_user.hasData( elem ) || data_priv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return data_user.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		data_user.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to data_priv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return data_priv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		data_priv.remove( elem, name );
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var attrs, name,
			elem = this[ 0 ],
			i = 0,
			data = null;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = data_user.get( elem );

				if ( elem.nodeType === 1 && !data_priv.get( elem, "hasDataAttrs" ) ) {
					attrs = elem.attributes;
					for ( ; i < attrs.length; i++ ) {
						name = attrs[ i ].name;

						if ( name.indexOf( "data-" ) === 0 ) {
							name = jQuery.camelCase( name.slice(5) );
							dataAttr( elem, name, data[ name ] );
						}
					}
					data_priv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each(function() {
				data_user.set( this, key );
			});
		}

		return jQuery.access( this, function( value ) {
			var data,
				camelKey = jQuery.camelCase( key );

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {
				// Attempt to get data from the cache
				// with the key as-is
				data = data_user.get( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to get data from the cache
				// with the key camelized
				data = data_user.get( elem, camelKey );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, camelKey, undefined );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each(function() {
				// First, attempt to store a copy or reference of any
				// data that might've been store with a camelCased key.
				var data = data_user.get( this, camelKey );

				// For HTML5 data-* attribute interop, we have to
				// store property names with dashes in a camelCase form.
				// This might not apply to all properties...*
				data_user.set( this, camelKey, value );

				// *... In the case of properties that might _actually_
				// have dashes, we need to also store a copy of that
				// unchanged property.
				if ( key.indexOf("-") !== -1 && data !== undefined ) {
					data_user.set( this, key, value );
				}
			});
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each(function() {
			data_user.remove( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :
					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? JSON.parse( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			data_user.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}
jQuery.extend({
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = data_priv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray( data ) ) {
					queue = data_priv.access( elem, type, jQuery.makeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object, or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return data_priv.get( elem, key ) || data_priv.access( elem, key, {
			empty: jQuery.Callbacks("once memory").add(function() {
				data_priv.remove( elem, [ type + "queue", key ] );
			})
		});
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = setTimeout( next, time );
			hooks.stop = function() {
				clearTimeout( timeout );
			};
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while( i-- ) {
			tmp = data_priv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
});
var nodeHook, boolHook,
	rclass = /[\t\r\n\f]/g,
	rreturn = /\r/g,
	rfocusable = /^(?:input|select|textarea|button)$/i;

jQuery.fn.extend({
	attr: function( name, value ) {
		return jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	},

	prop: function( name, value ) {
		return jQuery.access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each(function() {
			delete this[ jQuery.propFix[ name ] || name ];
		});
	},

	addClass: function( value ) {
		var classes, elem, cur, clazz, j,
			i = 0,
			len = this.length,
			proceed = typeof value === "string" && value;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call( this, j, this.className ) );
			});
		}

		if ( proceed ) {
			// The disjunction here is for better compressibility (see removeClass)
			classes = ( value || "" ).match( core_rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					" "
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}
					elem.className = jQuery.trim( cur );

				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, clazz, j,
			i = 0,
			len = this.length,
			proceed = arguments.length === 0 || typeof value === "string" && value;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call( this, j, this.className ) );
			});
		}
		if ( proceed ) {
			classes = ( value || "" ).match( core_rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					""
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}
					elem.className = value ? jQuery.trim( cur ) : "";
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value;

		if ( typeof stateVal === "boolean" && type === "string" ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					classNames = value.match( core_rnotwhite ) || [];

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( type === core_strundefined || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					data_priv.set( this, "__className__", this.className );
				}

				// If the element has a class name or if we're passed "false",
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				this.className = this.className || value === false ? "" : data_priv.get( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
				return true;
			}
		}

		return false;
	},

	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map(val, function ( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				// attributes.value is undefined in Blackberry 4.7 but
				// uses .value. See #6932
				var val = elem.attributes.value;
				return !val || val.specified ? elem.value : elem.text;
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// IE6-9 doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&
							// Don't return options that are disabled or in a disabled optgroup
							( jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null ) &&
							( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];
					if ( (option.selected = jQuery.inArray( jQuery(option).val(), values ) >= 0) ) {
						optionSet = true;
					}
				}

				// force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	},

	attr: function( elem, name, value ) {
		var hooks, ret,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === core_strundefined ) {
			return jQuery.prop( elem, name, value );
		}

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );

			} else if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, value + "" );
				return value;
			}

		} else if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {
			ret = jQuery.find.attr( elem, name );

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( core_rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( (name = attrNames[i++]) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( jQuery.expr.match.bool.test( name ) ) {
					// Set corresponding property to false
					elem[ propName ] = false;
				}

				elem.removeAttribute( name );
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to default in case type is set after value during creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			return hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ?
				ret :
				( elem[ name ] = value );

		} else {
			return hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ?
				ret :
				elem[ name ];
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				return elem.hasAttribute( "tabindex" ) || rfocusable.test( elem.nodeName ) || elem.href ?
					elem.tabIndex :
					-1;
			}
		}
	}
});

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};
jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = jQuery.expr.attrHandle[ name ] || jQuery.find.attr;

	jQuery.expr.attrHandle[ name ] = function( elem, name, isXML ) {
		var fn = jQuery.expr.attrHandle[ name ],
			ret = isXML ?
				undefined :
				/* jshint eqeqeq: false */
				// Temporarily disable this handler to check existence
				(jQuery.expr.attrHandle[ name ] = undefined) !=
					getter( elem, name, isXML ) ?

					name.toLowerCase() :
					null;

		// Restore handler
		jQuery.expr.attrHandle[ name ] = fn;

		return ret;
	};
});

// Support: IE9+
// Selectedness for an option in an optgroup can be inaccurate
if ( !jQuery.support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {
			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		}
	};
}

jQuery.each([
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
});

// Radios and checkboxes getter/setter
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	};
	if ( !jQuery.support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			// Support: Webkit
			// "" is returned instead of "on" if a value isn't specified
			return elem.getAttribute("value") === null ? "on" : elem.value;
		};
	}
});
var rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = data_priv.get( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !(events = elemData.events) ) {
			events = elemData.events = {};
		}
		if ( !(eventHandle = elemData.handle) ) {
			eventHandle = elemData.handle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== core_strundefined && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( core_rnotwhite ) || [""];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !(handlers = events[ type ]) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = data_priv.hasData( elem ) && data_priv.get( elem );

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( core_rnotwhite ) || [""];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;
			data_priv.remove( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special,
			eventPath = [ elem || document ],
			type = core_hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = core_hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf(".") >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf(":") < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join(".");
		event.namespace_re = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === (elem.ownerDocument || document) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( data_priv.get( cur, "events" ) || {} )[ event.type ] && data_priv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && jQuery.acceptData( cur ) && handle.apply && handle.apply( cur, data ) === false ) {
				event.preventDefault();
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( eventPath.pop(), data ) === false) &&
				jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, j, ret, matched, handleObj,
			handlerQueue = [],
			args = core_slice.call( arguments ),
			handlers = ( data_priv.get( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( (event.result = ret) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, matches, sel, handleObj,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.disabled !== true || event.type !== "click" ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) >= 0 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, handlers: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
		}

		return handlerQueue;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: Cordova 2.5 (WebKit) (#13255)
		// All events should have a target; Cordova deviceready doesn't
		if ( !event.target ) {
			event.target = document;
		}

		// Support: Safari 6.0+, Chrome < 28
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		return fixHook.filter? fixHook.filter( event, originalEvent ) : event;
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {
			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					this.focus();
					return false;
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {
			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return jQuery.nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = function( elem, type, handle ) {
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle, false );
	}
};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = ( src.defaultPrevented ||
			src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e && e.preventDefault ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e && e.stopPropagation ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
// Support: Chrome 15+
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// Create "bubbling" focus and blur events
// Support: Firefox, Chrome, Safari
if ( !jQuery.support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler while someone wants focusin/focusout
		var attaches = 0,
			handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				if ( attaches++ === 0 ) {
					document.addEventListener( orig, handler, true );
				}
			},
			teardown: function() {
				if ( --attaches === 0 ) {
					document.removeEventListener( orig, handler, true );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		var elem = this[0];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
});
var isSimple = /^.[^:#\[\.,]*$/,
	rparentsprev = /^(?:parents|prev(?:Until|All))/,
	rneedsContext = jQuery.expr.match.needsContext,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	find: function( selector ) {
		var i,
			ret = [],
			self = this,
			len = self.length;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter(function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			}) );
		}

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = this.selector ? this.selector + " " + selector : selector;
		return ret;
	},

	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter(function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector || [], true) );
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector || [], false) );
	},

	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			pos = ( rneedsContext.test( selectors ) || typeof selectors !== "string" ) ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			for ( cur = this[i]; cur && cur !== context; cur = cur.parentNode ) {
				// Always skip document fragments
				if ( cur.nodeType < 11 && (pos ?
					pos.index(cur) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 &&
						jQuery.find.matchesSelector(cur, selectors)) ) {

					cur = matched.push( cur );
					break;
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.unique( matched ) : matched );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return core_indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return core_indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( jQuery.unique(all) );
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

function sibling( cur, dir ) {
	while ( (cur = cur[dir]) && cur.nodeType !== 1 ) {}

	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return elem.contentDocument || jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {
			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.unique( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		var elem = elems[ 0 ];

		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 && elem.nodeType === 1 ?
			jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
			jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
				return elem.nodeType === 1;
			}));
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			truncate = until !== undefined;

		while ( (elem = elem[ dir ]) && elem.nodeType !== 9 ) {
			if ( elem.nodeType === 1 ) {
				if ( truncate && jQuery( elem ).is( until ) ) {
					break;
				}
				matched.push( elem );
			}
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var matched = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				matched.push( n );
			}
		}

		return matched;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			/* jshint -W018 */
			return !!qualifier.call( elem, i, elem ) !== not;
		});

	}

	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		});

	}

	if ( typeof qualifier === "string" ) {
		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}

		qualifier = jQuery.filter( qualifier, elements );
	}

	return jQuery.grep( elements, function( elem ) {
		return ( core_indexOf.call( qualifier, elem ) >= 0 ) !== not;
	});
}
var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	rtagName = /<([\w:]+)/,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style|link)/i,
	manipulation_rcheckableType = /^(?:checkbox|radio)$/i,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /^$|\/(?:java|ecma)script/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

	// We have to close these tags to support XHTML (#13200)
	wrapMap = {

		// Support: IE 9
		option: [ 1, "<select multiple='multiple'>", "</select>" ],

		thead: [ 1, "<table>", "</table>" ],
		col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		_default: [ 0, "", "" ]
	};

// Support: IE 9
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

jQuery.fn.extend({
	text: function( value ) {
		return jQuery.access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().append( ( this[ 0 ] && this[ 0 ].ownerDocument || document ).createTextNode( value ) );
		}, null, value, arguments.length );
	},

	append: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		});
	},

	before: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		});
	},

	after: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		});
	},

	// keepData is for internal use only--do not document
	remove: function( selector, keepData ) {
		var elem,
			elems = selector ? jQuery.filter( selector, this ) : this,
			i = 0;

		for ( ; (elem = elems[i]) != null; i++ ) {
			if ( !keepData && elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem ) );
			}

			if ( elem.parentNode ) {
				if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
					setGlobalEval( getAll( elem, "script" ) );
				}
				elem.parentNode.removeChild( elem );
			}
		}

		return this;
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		return jQuery.access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = value.replace( rxhtmlTag, "<$1></$2>" );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var
			// Snapshot the DOM in case .domManip sweeps something relevant into its fragment
			args = jQuery.map( this, function( elem ) {
				return [ elem.nextSibling, elem.parentNode ];
			}),
			i = 0;

		// Make the changes, replacing each context element with the new content
		this.domManip( arguments, function( elem ) {
			var next = args[ i++ ],
				parent = args[ i++ ];

			if ( parent ) {
				// Don't use the snapshot next if it has moved (#13810)
				if ( next && next.parentNode !== parent ) {
					next = this.nextSibling;
				}
				jQuery( this ).remove();
				parent.insertBefore( elem, next );
			}
		// Allow new content to include elements from the context set
		}, true );

		// Force removal if there was no new content (e.g., from empty arguments)
		return i ? this : this.remove();
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, callback, allowIntersection ) {

		// Flatten any nested arrays
		args = core_concat.apply( [], args );

		var fragment, first, scripts, hasScripts, node, doc,
			i = 0,
			l = this.length,
			set = this,
			iNoClone = l - 1,
			value = args[ 0 ],
			isFunction = jQuery.isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction || !( l <= 1 || typeof value !== "string" || jQuery.support.checkClone || !rchecked.test( value ) ) ) {
			return this.each(function( index ) {
				var self = set.eq( index );
				if ( isFunction ) {
					args[ 0 ] = value.call( this, index, self.html() );
				}
				self.domManip( args, callback, allowIntersection );
			});
		}

		if ( l ) {
			fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, !allowIntersection && this );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			if ( first ) {
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {
							// Support: QtWebKit
							// jQuery.merge because core_push.apply(_, arraylike) throws
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call( this[ i ], node, i );
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!data_priv.access( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

							if ( node.src ) {
								// Hope ajax is available...
								jQuery._evalUrl( node.src );
							} else {
								jQuery.globalEval( node.textContent.replace( rcleanScript, "" ) );
							}
						}
					}
				}
			}
		}

		return this;
	}
});

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: QtWebKit
			// .get() because core_push.apply(_, arraylike) throws
			core_push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
});

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = jQuery.contains( elem.ownerDocument, elem );

		// Support: IE >= 9
		// Fix Cloning issues
		if ( !jQuery.support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) && !jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	buildFragment: function( elems, context, scripts, selection ) {
		var elem, tmp, tag, wrap, contains, j,
			i = 0,
			l = elems.length,
			fragment = context.createDocumentFragment(),
			nodes = [];

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {
					// Support: QtWebKit
					// jQuery.merge because core_push.apply(_, arraylike) throws
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || fragment.appendChild( context.createElement("div") );

					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || ["", ""] )[ 1 ].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					tmp.innerHTML = wrap[ 1 ] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[ 2 ];

					// Descend through wrappers to the right content
					j = wrap[ 0 ];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}

					// Support: QtWebKit
					// jQuery.merge because core_push.apply(_, arraylike) throws
					jQuery.merge( nodes, tmp.childNodes );

					// Remember the top-level container
					tmp = fragment.firstChild;

					// Fixes #12346
					// Support: Webkit, IE
					tmp.textContent = "";
				}
			}
		}

		// Remove wrapper from fragment
		fragment.textContent = "";

		i = 0;
		while ( (elem = nodes[ i++ ]) ) {

			// #4087 - If origin and destination elements are the same, and this is
			// that element, do not do anything
			if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
				continue;
			}

			contains = jQuery.contains( elem.ownerDocument, elem );

			// Append to fragment
			tmp = getAll( fragment.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( (elem = tmp[ j++ ]) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		return fragment;
	},

	cleanData: function( elems ) {
		var data, elem, events, type, key, j,
			special = jQuery.event.special,
			i = 0;

		for ( ; (elem = elems[ i ]) !== undefined; i++ ) {
			if ( Data.accepts( elem ) ) {
				key = elem[ data_priv.expando ];

				if ( key && (data = data_priv.cache[ key ]) ) {
					events = Object.keys( data.events || {} );
					if ( events.length ) {
						for ( j = 0; (type = events[j]) !== undefined; j++ ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}
					if ( data_priv.cache[ key ] ) {
						// Discard any remaining `private` data
						delete data_priv.cache[ key ];
					}
				}
			}
			// Discard any remaining `user` data
			delete data_user.cache[ elem[ data_user.expando ] ];
		}
	},

	_evalUrl: function( url ) {
		return jQuery.ajax({
			url: url,
			type: "GET",
			dataType: "script",
			async: false,
			global: false,
			"throws": true
		});
	}
});

// Support: 1.x compatibility
// Manipulating tables requires a tbody
function manipulationTarget( elem, content ) {
	return jQuery.nodeName( elem, "table" ) &&
		jQuery.nodeName( content.nodeType === 1 ? content : content.firstChild, "tr" ) ?

		elem.getElementsByTagName("tbody")[0] ||
			elem.appendChild( elem.ownerDocument.createElement("tbody") ) :
		elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );

	if ( match ) {
		elem.type = match[ 1 ];
	} else {
		elem.removeAttribute("type");
	}

	return elem;
}

// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var l = elems.length,
		i = 0;

	for ( ; i < l; i++ ) {
		data_priv.set(
			elems[ i ], "globalEval", !refElements || data_priv.get( refElements[ i ], "globalEval" )
		);
	}
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( data_priv.hasData( src ) ) {
		pdataOld = data_priv.access( src );
		pdataCur = data_priv.set( dest, pdataOld );
		events = pdataOld.events;

		if ( events ) {
			delete pdataCur.handle;
			pdataCur.events = {};

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( data_user.hasData( src ) ) {
		udataOld = data_user.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		data_user.set( dest, udataCur );
	}
}


function getAll( context, tag ) {
	var ret = context.getElementsByTagName ? context.getElementsByTagName( tag || "*" ) :
			context.querySelectorAll ? context.querySelectorAll( tag || "*" ) :
			[];

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], ret ) :
		ret;
}

// Support: IE >= 9
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && manipulation_rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}
jQuery.fn.extend({
	wrapAll: function( html ) {
		var wrap;

		if ( jQuery.isFunction( html ) ) {
			return this.each(function( i ) {
				jQuery( this ).wrapAll( html.call(this, i) );
			});
		}

		if ( this[ 0 ] ) {

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function( i ) {
				jQuery( this ).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function( i ) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	}
});
var curCSS, iframe,
	// swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rmargin = /^margin/,
	rnumsplit = new RegExp( "^(" + core_pnum + ")(.*)$", "i" ),
	rnumnonpx = new RegExp( "^(" + core_pnum + ")(?!px)[a-z%]+$", "i" ),
	rrelNum = new RegExp( "^([+-])=(" + core_pnum + ")", "i" ),
	elemdisplay = { BODY: "block" },

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: 0,
		fontWeight: 400
	},

	cssExpand = [ "Top", "Right", "Bottom", "Left" ],
	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];

// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in style ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt(0).toUpperCase() + name.slice(1),
		origName = name,
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in style ) {
			return name;
		}
	}

	return origName;
}

function isHidden( elem, el ) {
	// isHidden might be called from jQuery#filter function;
	// in that case, element will be second argument
	elem = el || elem;
	return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
}

// NOTE: we've included the "window" in window.getComputedStyle
// because jsdom on node.js will break without it.
function getStyles( elem ) {
	return window.getComputedStyle( elem, null );
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = data_priv.get( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {
			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = data_priv.access( elem, "olddisplay", css_defaultDisplay(elem.nodeName) );
			}
		} else {

			if ( !values[ index ] ) {
				hidden = isHidden( elem );

				if ( display && display !== "none" || !hidden ) {
					data_priv.set( elem, "olddisplay", hidden ? display : jQuery.css(elem, "display") );
				}
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.fn.extend({
	css: function( name, value ) {
		return jQuery.access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each(function() {
			if ( isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		});
	}
});

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"columnCount": true,
		"fillOpacity": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": "cssFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that NaN and null values aren't set. See: #7116
			if ( value == null || type === "number" && isNaN( value ) ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// Fixes #8908, it can be done more correctly by specifying setters in cssHooks,
			// but it would mean to define eight (for every problematic property) identical functions
			if ( !jQuery.support.clearCloneStyle && value === "" && name.indexOf("background") === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {
				style[ name ] = value;
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
		}
		return val;
	}
});

curCSS = function( elem, name, _computed ) {
	var width, minWidth, maxWidth,
		computed = _computed || getStyles( elem ),

		// Support: IE9
		// getPropertyValue is only needed for .css('filter') in IE9, see #12537
		ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined,
		style = elem.style;

	if ( computed ) {

		if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// Support: Safari 5.1
		// A tribute to the "awesome hack by Dean Edwards"
		// Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
		// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
		if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret;
};


function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?
		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {
		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {
			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {
			// at this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox && ( jQuery.support.boxSizingReliable || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

// Try to determine the default display value of an element
function css_defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {
			// Use the already-created iframe if possible
			iframe = ( iframe ||
				jQuery("<iframe frameborder='0' width='0' height='0'/>")
				.css( "cssText", "display:block !important" )
			).appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = ( iframe[0].contentWindow || iframe[0].contentDocument ).document;
			doc.write("<!doctype html><html><body>");
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}

// Called ONLY from within css_defaultDisplay
function actualDisplay( name, doc ) {
	var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),
		display = jQuery.css( elem[0], "display" );
	elem.remove();
	return display;
}

jQuery.each([ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {
				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				return elem.offsetWidth === 0 && rdisplayswap.test( jQuery.css( elem, "display" ) ) ?
					jQuery.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					}) :
					getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
});

// These hooks cannot be added until DOM ready because the support test
// for it is not run until after DOM ready
jQuery(function() {
	// Support: Android 2.3
	if ( !jQuery.support.reliableMarginRight ) {
		jQuery.cssHooks.marginRight = {
			get: function( elem, computed ) {
				if ( computed ) {
					// Support: Android 2.3
					// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
					// Work around by temporarily setting element display to inline-block
					return jQuery.swap( elem, { "display": "inline-block" },
						curCSS, [ elem, "marginRight" ] );
				}
			}
		};
	}

	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// getComputedStyle returns percent when specified for top/left/bottom/right
	// rather than make the css module depend on the offset module, we just check for it here
	if ( !jQuery.support.pixelPosition && jQuery.fn.position ) {
		jQuery.each( [ "top", "left" ], function( i, prop ) {
			jQuery.cssHooks[ prop ] = {
				get: function( elem, computed ) {
					if ( computed ) {
						computed = curCSS( elem, prop );
						// if curCSS returns percentage, fallback to offset
						return rnumnonpx.test( computed ) ?
							jQuery( elem ).position()[ prop ] + "px" :
							computed;
					}
				}
			};
		});
	}

});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		// Support: Opera <= 12.12
		// Opera reports offsetWidths and offsetHeights less than zero on some elements
		return elem.offsetWidth <= 0 && elem.offsetHeight <= 0;
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}

// These hooks are used by animate to expand properties
jQuery.each({
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
});
var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

jQuery.fn.extend({
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map(function(){
			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		})
		.filter(function(){
			var type = this.type;
			// Use .is(":disabled") so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !manipulation_rcheckableType.test( type ) );
		})
		.map(function( i, elem ){
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ){
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});

//Serialize an array of form elements or a set of
//key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// Item is non-scalar (array or object), encode its numeric index.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}
jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
});

jQuery.fn.extend({
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	}
});
var
	// Document location
	ajaxLocParts,
	ajaxLocation,

	ajax_nonce = jQuery.now(),

	ajax_rquery = /\?/,
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,

	// Keep a copy of the old load method
	_load = jQuery.fn.load,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat("*");

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( core_rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			while ( (dataType = dataTypes[i++]) ) {
				// Prepend if requested
				if ( dataType[0] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					(structure[ dataType ] = structure[ dataType ] || []).unshift( func );

				// Otherwise append
				} else {
					(structure[ dataType ] = structure[ dataType ] || []).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		});
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, type, response,
		self = this,
		off = url.indexOf(" ");

	if ( off >= 0 ) {
		selector = url.slice( off );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax({
			url: url,

			// if "type" variable is undefined, then "GET" method will be used
			type: type,
			dataType: "html",
			data: params
		}).done(function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		}).complete( callback && function( jqXHR, status ) {
			self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
		});
	}

	return this;
};

// Attach a bunch of functions for handling common AJAX events
jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ){
	jQuery.fn[ type ] = function( fn ){
		return this.on( type, fn );
	};
});

jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,
			// URL without anti-cache param
			cacheURL,
			// Response headers
			responseHeadersString,
			responseHeaders,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
				jQuery( callbackContext ) :
				jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks("once memory"),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( (match = rheaders.exec( responseHeadersString )) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {
								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {
							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" )
			.replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( core_rnotwhite ) || [""];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger("ajaxStart");
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + ajax_nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ajax_nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
			// Abort if not done already and return
			return jqXHR.abort();
		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout(function() {
					jqXHR.abort("timeout");
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader("etag");
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger("ajaxStop");
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		});
	};
});

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

		// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s[ "throws" ] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}
// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /(?:java|ecma)script/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {
	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery("<script>").prop({
					async: true,
					charset: s.scriptCharset,
					src: s.url
				}).on(
					"load error",
					callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					}
				);
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
});
var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( ajax_nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( ajax_rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});
jQuery.ajaxSettings.xhr = function() {
	try {
		return new XMLHttpRequest();
	} catch( e ) {}
};

var xhrSupported = jQuery.ajaxSettings.xhr(),
	xhrSuccessStatus = {
		// file protocol always yields status code 0, assume 200
		0: 200,
		// Support: IE9
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	// Support: IE9
	// We need to keep track of outbound xhr and abort them manually
	// because IE is not smart enough to do it all by itself
	xhrId = 0,
	xhrCallbacks = {};

if ( window.ActiveXObject ) {
	jQuery( window ).on( "unload", function() {
		for( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]();
		}
		xhrCallbacks = undefined;
	});
}

jQuery.support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
jQuery.support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport(function( options ) {
	var callback;
	// Cross domain only allowed if supported through XMLHttpRequest
	if ( jQuery.support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i, id,
					xhr = options.xhr();
				xhr.open( options.type, options.url, options.async, options.username, options.password );
				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}
				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}
				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers["X-Requested-With"] ) {
					headers["X-Requested-With"] = "XMLHttpRequest";
				}
				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}
				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							delete xhrCallbacks[ id ];
							callback = xhr.onload = xhr.onerror = null;
							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {
								complete(
									// file protocol always yields status 0, assume 404
									xhr.status || 404,
									xhr.statusText
								);
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,
									// Support: IE9
									// #11426: When requesting binary data, IE9 will throw an exception
									// on any attempt to access responseText
									typeof xhr.responseText === "string" ? {
										text: xhr.responseText
									} : undefined,
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};
				// Listen to events
				xhr.onload = callback();
				xhr.onerror = callback("error");
				// Create the abort callback
				callback = xhrCallbacks[( id = xhrId++ )] = callback("abort");
				// Do send the request
				// This may raise an exception which is actually
				// handled in jQuery.ajax (so no try/catch here)
				xhr.send( options.hasContent && options.data || null );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
});
var fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = new RegExp( "^(?:([+-])=|)(" + core_pnum + ")([a-z%]*)$", "i" ),
	rrun = /queueHooks$/,
	animationPrefilters = [ defaultPrefilter ],
	tweeners = {
		"*": [function( prop, value ) {
			var tween = this.createTween( prop, value ),
				target = tween.cur(),
				parts = rfxnum.exec( value ),
				unit = parts && parts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

				// Starting value computation is required for potential unit mismatches
				start = ( jQuery.cssNumber[ prop ] || unit !== "px" && +target ) &&
					rfxnum.exec( jQuery.css( tween.elem, prop ) ),
				scale = 1,
				maxIterations = 20;

			if ( start && start[ 3 ] !== unit ) {
				// Trust units reported by jQuery.css
				unit = unit || start[ 3 ];

				// Make sure we update the tween properties later on
				parts = parts || [];

				// Iteratively approximate from a nonzero starting point
				start = +target || 1;

				do {
					// If previous iteration zeroed out, double until we get *something*
					// Use a string for doubling factor so we don't accidentally see scale as unchanged below
					scale = scale || ".5";

					// Adjust and apply
					start = start / scale;
					jQuery.style( tween.elem, prop, start + unit );

				// Update scale, tolerating zero or NaN from tween.cur()
				// And breaking the loop if scale is unchanged or perfect, or if we've just had enough
				} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
			}

			// Update tween properties
			if ( parts ) {
				start = tween.start = +start || +target || 0;
				tween.unit = unit;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[ 1 ] ?
					start + ( parts[ 1 ] + 1 ) * parts[ 2 ] :
					+parts[ 2 ];
			}

			return tween;
		}]
	};

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout(function() {
		fxNow = undefined;
	});
	return ( fxNow = jQuery.now() );
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( (tween = collection[ index ].call( animation, prop, value )) ) {

			// we're done with this property
			return tween;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = animationPrefilters.length,
		deferred = jQuery.Deferred().always( function() {
			// don't match elem in the :animated selector
			delete tick.elem;
		}),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
				// archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ]);

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise({
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, { specialEasing: {} }, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,
					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		}),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		})
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

jQuery.Animation = jQuery.extend( Animation, {

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.split(" ");
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			tweeners[ prop ] = tweeners[ prop ] || [];
			tweeners[ prop ].unshift( callback );
		}
	},

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			animationPrefilters.unshift( callback );
		} else {
			animationPrefilters.push( callback );
		}
	}
});

function defaultPrefilter( elem, props, opts ) {
	/* jshint validthis: true */
	var prop, value, toggle, tween, hooks, oldfire,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHidden( elem ),
		dataShow = data_priv.get( elem, "fxshow" );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always(function() {
			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always(function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			});
		});
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE9-10 do not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		if ( jQuery.css( elem, "display" ) === "inline" &&
				jQuery.css( elem, "float" ) === "none" ) {

			style.display = "inline-block";
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always(function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		});
	}


	// show/hide pass
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// If there is dataShow left over from a stopped hide or show and we are going to proceed with show, we should pretend to be hidden
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );
		}
	}

	if ( !jQuery.isEmptyObject( orig ) ) {
		if ( dataShow ) {
			if ( "hidden" in dataShow ) {
				hidden = dataShow.hidden;
			}
		} else {
			dataShow = data_priv.access( elem, "fxshow", {} );
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done(function() {
				jQuery( elem ).hide();
			});
		}
		anim.done(function() {
			var prop;

			data_priv.remove( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		});
		for ( prop in orig ) {
			tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}
	}
}

function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || "swing";
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			if ( tween.elem[ tween.prop ] != null &&
				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
				return tween.elem[ tween.prop ];
			}

			// passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, "" );
			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {
			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE9
// Panic based approach to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
});

jQuery.fn.extend({
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || data_priv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = data_priv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each(function() {
			var index,
				data = data_priv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// enable finishing flag on private data
			data.finish = true;

			// empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// turn off finishing flag
			delete data.finish;
		});
	}
});

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		attrs = { height: type },
		i = 0;

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth? 1 : 0;
	for( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show"),
	slideUp: genFx("hide"),
	slideToggle: genFx("toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p*Math.PI ) / 2;
	}
};

jQuery.timers = [];
jQuery.fx = Tween.prototype.init;
jQuery.fx.tick = function() {
	var timer,
		timers = jQuery.timers,
		i = 0;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];
		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	if ( timer() && jQuery.timers.push( timer ) ) {
		jQuery.fx.start();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,
	// Default speed
	_default: 400
};

// Back Compat <1.8 extension point
jQuery.fx.step = {};

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}
jQuery.fn.offset = function( options ) {
	if ( arguments.length ) {
		return options === undefined ?
			this :
			this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
	}

	var docElem, win,
		elem = this[ 0 ],
		box = { top: 0, left: 0 },
		doc = elem && elem.ownerDocument;

	if ( !doc ) {
		return;
	}

	docElem = doc.documentElement;

	// Make sure it's not a disconnected DOM node
	if ( !jQuery.contains( docElem, elem ) ) {
		return box;
	}

	// If we don't have gBCR, just use 0,0 rather than error
	// BlackBerry 5, iOS 3 (original iPhone)
	if ( typeof elem.getBoundingClientRect !== core_strundefined ) {
		box = elem.getBoundingClientRect();
	}
	win = getWindow( doc );
	return {
		top: box.top + win.pageYOffset - docElem.clientTop,
		left: box.left + win.pageXOffset - docElem.clientLeft
	};
};

jQuery.offset = {

	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) && ( curCSSTop + curCSSLeft ).indexOf("auto") > -1;

		// Need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {
			// We assume that getBoundingClientRect is available when computed position is fixed
			offset = elem.getBoundingClientRect();

		} else {
			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || docElem;

			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position") === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || docElem;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( {scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return jQuery.access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : window.pageXOffset,
					top ? val : window.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
}
// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return jQuery.access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});
// Limit scope pollution from any deprecated API
// (function() {

// The number of elements contained in the matched element set
jQuery.fn.size = function() {
	return this.length;
};

jQuery.fn.andSelf = jQuery.fn.addBack;

// })();
if ( typeof module === "object" && module && typeof module.exports === "object" ) {
	// Expose jQuery as module.exports in loaders that implement the Node
	// module pattern (including browserify). Do not create the global, since
	// the user will be storing it themselves locally, and globals are frowned
	// upon in the Node module world.
	module.exports = jQuery;
} else {
	// Register as a named AMD module, since jQuery can be concatenated with other
	// files that may use define, but not via a proper concatenation script that
	// understands anonymous AMD modules. A named AMD is safest and most robust
	// way to register. Lowercase jquery is used because AMD module names are
	// derived from file names, and jQuery is normally delivered in a lowercase
	// file name. Do this after creating the global so that if an AMD module wants
	// to call noConflict to hide this version of jQuery, it will work.
	if ( typeof define === "function" && define.amd ) {
		define( "jquery", [], function () { return jQuery; } );
	}
}

// If there is a window object, that at least has a document property,
// define jQuery and $ identifiers
if ( typeof window === "object" && typeof window.document === "object" ) {
	window.jQuery = window.$ = jQuery;
}

})( window );

});
require.register("components-underscore/underscore.js", function(exports, require, module){
// Underscore.js 1.4.4
// ===================

// > http://underscorejs.org
// > (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
// > Underscore may be freely distributed under the MIT license.

// Baseline setup
// --------------
(function() {

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push             = ArrayProto.push,
      slice            = ArrayProto.slice,
      concat           = ArrayProto.concat,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.4.4';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterat| (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? void 0 : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed > result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        index : index,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index < right.index ? -1 : 1;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, value, context, behavior) {
    var result = {};
    var iterator = lookupIterator(value == null ? _.identity : value);
    each(obj, function(value, index) {
      var key = iterator.call(context, value, index, obj);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key, value) {
      (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key) {
      if (!_.has(result, key)) result[key] = 0;
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, "length").concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, l = list.length; i < l; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error("bindAll must be passed function names");
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var result;
    var timeout = null;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var values = [];
    for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var pairs = [];
    for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);

});
require.register("components-backbone/backbone.js", function(exports, require, module){
//     Backbone.js 1.0.0

//     (c) 2010-2013 Jeremy Ashkenas, DocumentCloud Inc.
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(){

  // Initial Setup
  // -------------

  // Save a reference to the global object (`window` in the browser, `exports`
  // on the server).
  var root = this;

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create local references to array methods we'll want to use later.
  var array = [];
  var push = array.push;
  var slice = array.slice;
  var splice = array.splice;

  // The top-level namespace. All public Backbone classes and modules will
  // be attached to this. Exported for both the browser and the server.
  var Backbone;
  if (typeof exports !== 'undefined') {
    Backbone = exports;
  } else {
    Backbone = root.Backbone = {};
  }

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '1.0.0';

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) _ = require('underscore');

  // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
  // the `$` variable.
  Backbone.$ = root.jQuery || root.Zepto || root.ender || root.$;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = {};
        return this;
      }

      names = name ? [name] : _.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeners = this._listeners;
      if (!listeners) return this;
      var deleteListener = !name && !callback;
      if (typeof name === 'object') callback = this;
      if (obj) (listeners = {})[obj._listenerId] = obj;
      for (var id in listeners) {
        listeners[id].off(name, callback, this);
        if (deleteListener) delete this._listeners[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  _.each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback) {
      var listeners = this._listeners || (this._listeners = {});
      var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
      listeners[id] = obj;
      if (typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  });

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  _.extend(Backbone, Events);

  // Backbone.Model
  // --------------

  // Backbone **Models** are the basic data object in the framework --
  // frequently representing a row in a table in a database on your server.
  // A discrete chunk of data and a bunch of useful, related methods for
  // performing computations and transformations on that data.

  // Create a new model with the specified attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var defaults;
    var attrs = attributes || {};
    options || (options = {});
    this.cid = _.uniqueId('c');
    this.attributes = {};
    _.extend(this, _.pick(options, modelOptions));
    if (options.parse) attrs = this.parse(attrs, options) || {};
    if (defaults = _.result(this, 'defaults')) {
      attrs = _.defaults({}, attrs, defaults);
    }
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // A list of options to be attached directly to the model, if provided.
  var modelOptions = ['url', 'urlRoot', 'collection'];

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The value returned during the last failed validation.
    validationError: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Proxy `Backbone.sync` by default -- but override this if you need
    // custom syncing semantics for *this* particular model.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
    set: function(key, val, options) {
      var attr, attrs, unset, changes, silent, changing, prev, current;
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      unset           = options.unset;
      silent          = options.silent;
      changes         = [];
      changing        = this._changing;
      this._changing  = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }
      current = this.attributes, prev = this._previousAttributes;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      // For each `set` attribute, update or delete the current value.
      for (attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          this.changed[attr] = val;
        } else {
          delete this.changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = true;
        for (var i = 0, l = changes.length; i < l; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    // Clear all attributes on the model, firing `"change"`.
    clear: function(options) {
      var attrs = {};
      for (var key in this.attributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overridden,
    // triggering a `"change"` event.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        if (!model.set(model.parse(resp, options), options)) return false;
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, val, options) {
      var attrs, method, xhr, attributes = this.attributes;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key == null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      // If we're not waiting and attributes exist, save acts as `set(attr).save(null, opts)`.
      if (attrs && (!options || !options.wait) && !this.set(attrs, options)) return false;

      options = _.extend({validate: true}, options);

      // Do not persist invalid models.
      if (!this._validate(attrs, options)) return false;

      // Set temporary attributes if `{wait: true}`.
      if (attrs && options.wait) {
        this.attributes = _.extend({}, attributes, attrs);
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        // Ensure attributes are restored during synchronous saves.
        model.attributes = attributes;
        var serverAttrs = model.parse(resp, options);
        if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
        if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
          return false;
        }
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);

      method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
      if (method === 'patch') options.attrs = attrs;
      xhr = this.sync(method, this, options);

      // Restore attributes.
      if (attrs && options.wait) this.attributes = attributes;

      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var destroy = function() {
        model.trigger('destroy', model, model.collection, options);
      };

      options.success = function(resp) {
        if (options.wait || model.isNew()) destroy();
        if (success) success(model, resp, options);
        if (!model.isNew()) model.trigger('sync', model, resp, options);
      };

      if (this.isNew()) {
        options.success();
        return false;
      }
      wrapError(this, options);

      var xhr = this.sync('delete', this, options);
      if (!options.wait) destroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || urlError();
      if (this.isNew()) return base;
      return base + (base.charAt(base.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return this.id == null;
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return this._validate({}, _.extend(options || {}, { validate: true }));
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, _.extend(options || {}, {validationError: error}));
      return false;
    }

  });

  // Underscore methods that we want to implement on the Model.
  var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

  // Mix in each Underscore method as a proxy to `Model#attributes`.
  _.each(modelMethods, function(method) {
    Model.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.attributes);
      return _[method].apply(_, args);
    };
  });

  // Backbone.Collection
  // -------------------

  // If models tend to represent a single row of data, a Backbone Collection is
  // more analagous to a table full of data ... or a small slice or page of that
  // table, or a collection of rows that belong together for a particular reason
  // -- all of the messages in this particular folder, all of the documents
  // belonging to this particular author, and so on. Collections maintain
  // indexes of their models, both in order, and for lookup by `id`.

  // Create a new **Collection**, perhaps to contain a specific type of `model`.
  // If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.url) this.url = options.url;
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  // Default options for `Collection#set`.
  var setOptions = {add: true, remove: true, merge: true};
  var addOptions = {add: true, merge: false, remove: false};

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Add a model, or list of models to the set.
    add: function(models, options) {
      return this.set(models, _.defaults(options || {}, addOptions));
    },

    // Remove a model, or a list of models from the set.
    remove: function(models, options) {
      models = _.isArray(models) ? models.slice() : [models];
      options || (options = {});
      var i, l, index, model;
      for (i = 0, l = models.length; i < l; i++) {
        model = this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byId[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model);
      }
      return this;
    },

    // Update a collection by `set`-ing a new list of models, adding new ones,
    // removing models that are no longer present, and merging models that
    // already exist in the collection, as necessary. Similar to **Model#set**,
    // the core operation for updating the data contained by the collection.
    set: function(models, options) {
      options = _.defaults(options || {}, setOptions);
      if (options.parse) models = this.parse(models, options);
      if (!_.isArray(models)) models = models ? [models] : [];
      var i, l, model, attrs, existing, sort;
      var at = options.at;
      var sortable = this.comparator && (at == null) && options.sort !== false;
      var sortAttr = _.isString(this.comparator) ? this.comparator : null;
      var toAdd = [], toRemove = [], modelMap = {};

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      for (i = 0, l = models.length; i < l; i++) {
        if (!(model = this._prepareModel(models[i], options))) continue;

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        if (existing = this.get(model)) {
          if (options.remove) modelMap[existing.cid] = true;
          if (options.merge) {
            existing.set(model.attributes, options);
            if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
          }

        // This is a new model, push it to the `toAdd` list.
        } else if (options.add) {
          toAdd.push(model);

          // Listen to added models' events, and index models for lookup by
          // `id` and by `cid`.
          model.on('all', this._onModelEvent, this);
          this._byId[model.cid] = model;
          if (model.id != null) this._byId[model.id] = model;
        }
      }

      // Remove nonexistent models if appropriate.
      if (options.remove) {
        for (i = 0, l = this.length; i < l; ++i) {
          if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
        }
        if (toRemove.length) this.remove(toRemove, options);
      }

      // See if sorting is needed, update `length` and splice in new models.
      if (toAdd.length) {
        if (sortable) sort = true;
        this.length += toAdd.length;
        if (at != null) {
          splice.apply(this.models, [at, 0].concat(toAdd));
        } else {
          push.apply(this.models, toAdd);
        }
      }

      // Silently sort the collection if appropriate.
      if (sort) this.sort({silent: true});

      if (options.silent) return this;

      // Trigger `add` events.
      for (i = 0, l = toAdd.length; i < l; i++) {
        (model = toAdd[i]).trigger('add', model, this, options);
      }

      // Trigger `sort` if the collection was sorted.
      if (sort) this.trigger('sort', this, options);
      return this;
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any granular `add` or `remove` events. Fires `reset` when finished.
    // Useful for bulk operations and optimizations.
    reset: function(models, options) {
      options || (options = {});
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i]);
      }
      options.previousModels = this.models;
      this._reset();
      this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      model = this._prepareModel(model, options);
      this.add(model, _.extend({at: this.length}, options));
      return model;
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      model = this._prepareModel(model, options);
      this.add(model, _.extend({at: 0}, options));
      return model;
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Slice out a sub-array of models from the collection.
    slice: function(begin, end) {
      return this.models.slice(begin, end);
    },

    // Get a model from the set by id.
    get: function(obj) {
      if (obj == null) return void 0;
      return this._byId[obj.id != null ? obj.id : obj.cid || obj];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
    where: function(attrs, first) {
      if (_.isEmpty(attrs)) return first ? void 0 : [];
      return this[first ? 'find' : 'filter'](function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
    findWhere: function(attrs) {
      return this.where(attrs, true);
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      options || (options = {});

      // Run sort based on type of `comparator`.
      if (_.isString(this.comparator) || this.comparator.length === 1) {
        this.models = this.sortBy(this.comparator, this);
      } else {
        this.models.sort(_.bind(this.comparator, this));
      }

      if (!options.silent) this.trigger('sort', this, options);
      return this;
    },

    // Figure out the smallest index at which a model should be inserted so as
    // to maintain order.
    sortedIndex: function(model, value, context) {
      value || (value = this.comparator);
      var iterator = _.isFunction(value) ? value : function(model) {
        return model.get(value);
      };
      return _.sortedIndex(this.models, model, iterator, context);
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.invoke(this.models, 'get', attr);
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var success = options.success;
      var collection = this;
      options.success = function(resp) {
        var method = options.reset ? 'reset' : 'set';
        collection[method](resp, options);
        if (success) success(collection, resp, options);
        collection.trigger('sync', collection, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      options = options ? _.clone(options) : {};
      if (!(model = this._prepareModel(model, options))) return false;
      if (!options.wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function(resp) {
        if (options.wait) collection.add(model, options);
        if (success) success(model, resp, options);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new collection with an identical list of models as this one.
    clone: function() {
      return new this.constructor(this.models);
    },

    // Private method to reset all internal state. Called when the collection
    // is first initialized or reset.
    _reset: function() {
      this.length = 0;
      this.models = [];
      this._byId  = {};
    },

    // Prepare a hash of attributes (or other model) to be added to this
    // collection.
    _prepareModel: function(attrs, options) {
      if (attrs instanceof Model) {
        if (!attrs.collection) attrs.collection = this;
        return attrs;
      }
      options || (options = {});
      options.collection = this;
      var model = new this.model(attrs, options);
      if (!model._validate(attrs, options)) {
        this.trigger('invalid', this, attrs, options);
        return false;
      }
      return model;
    },

    // Internal method to sever a model's ties to a collection.
    _removeReference: function(model) {
      if (this === model.collection) delete model.collection;
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event === 'add' || event === 'remove') && collection !== this) return;
      if (event === 'destroy') this.remove(model, options);
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        if (model.id != null) this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  // 90% of the core usefulness of Backbone Collections is actually implemented
  // right here:
  var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'indexOf', 'shuffle', 'lastIndexOf',
    'isEmpty', 'chain'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Collection.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.models);
      return _[method].apply(_, args);
    };
  });

  // Underscore methods that take a property name as an argument.
  var attributeMethods = ['groupBy', 'countBy', 'sortBy'];

  // Use attributes instead of properties.
  _.each(attributeMethods, function(method) {
    Collection.prototype[method] = function(value, context) {
      var iterator = _.isFunction(value) ? value : function(model) {
        return model.get(value);
      };
      return _[method](this.models, iterator, context);
    };
  });

  // Backbone.View
  // -------------

  // Backbone Views are almost more convention than they are actual code. A View
  // is simply a JavaScript object that represents a logical chunk of UI in the
  // DOM. This might be a single item, an entire list, a sidebar or panel, or
  // even the surrounding frame which wraps your whole app. Defining a chunk of
  // UI as a **View** allows you to define your DOM events declaratively, without
  // having to worry about render order ... and makes it easy for the view to
  // react to specific changes in the state of your models.

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    this._configure(options || {});
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be prefered to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
      this.$el.remove();
      this.stopListening();
      return this;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function(element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save'
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = _.result(this, 'events')))) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) continue;

        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.on(eventName, method);
        } else {
          this.$el.on(eventName, selector, method);
        }
      }
      return this;
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      this.$el.off('.delegateEvents' + this.cid);
      return this;
    },

    // Performs the initial configuration of a View with a set of options.
    // Keys with special meaning *(e.g. model, collection, id, className)* are
    // attached directly to the view.  See `viewOptions` for an exhaustive
    // list.
    _configure: function(options) {
      if (this.options) options = _.extend({}, _.result(this, 'options'), options);
      _.extend(this, _.pick(options, viewOptions));
      this.options = options;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes'));
        if (this.id) attrs.id = _.result(this, 'id');
        if (this.className) attrs['class'] = _.result(this, 'className');
        var $el = Backbone.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
        this.setElement($el, false);
      } else {
        this.setElement(_.result(this, 'el'), false);
      }
    }

  });

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = _.result(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    // If we're sending a `PATCH` request, and we're in an old Internet Explorer
    // that still has ActiveX enabled by default, override jQuery to use that
    // for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
    if (params.type === 'PATCH' && window.ActiveXObject &&
          !(window.external && window.external.msActiveXFilteringEnabled)) {
      params.xhr = function() {
        return new ActiveXObject("Microsoft.XMLHTTP");
      };
    }

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch':  'PATCH',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
  // Override this if you'd like to use a different library.
  Backbone.ajax = function() {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };

  // Backbone.Router
  // ---------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) callback = this[name];
      var router = this;
      Backbone.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        callback && callback.apply(router, args);
        router.trigger.apply(router, ['route:' + name].concat(args));
        router.trigger('route', name, args);
        Backbone.history.trigger('route', router, name, args);
      });
      return this;
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      this.routes = _.result(this, 'routes');
      var route, routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional){
                     return optional ? match : '([^\/]+)';
                   })
                   .replace(splatParam, '(.*?)');
      return new RegExp('^' + route + '$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function(param) {
        return param ? decodeURIComponent(param) : null;
      });
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on either
  // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
  // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
  // and URL fragments. If the browser supports neither (old IE, natch),
  // falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
      this.location = window.location;
      this.history = window.history;
    }
  };

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;

  // Cached regex for stripping leading and trailing slashes.
  var rootStripper = /^\/+|\/+$/g;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Cached regex for removing a trailing slash.
  var trailingSlash = /\/$/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(window) {
      var match = (window || this).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || !this._wantsHashChange || forcePushState) {
          fragment = this.location.pathname;
          var root = this.root.replace(trailingSlash, '');
          if (!fragment.indexOf(root)) fragment = fragment.substr(root.length);
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error("Backbone.history has already been started");
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({}, {root: '/'}, this.options, options);
      this.root             = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && this.history && this.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

      // Normalize root to always include a leading and trailing slash.
      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

      if (oldIE && this._wantsHashChange) {
        this.iframe = Backbone.$('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        Backbone.$(window).on('popstate', this.checkUrl);
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
        Backbone.$(window).on('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      var loc = this.location;
      var atRoot = loc.pathname.replace(/[^\/]$/, '$&/') === this.root;

      // If we've started off with a route from a `pushState`-enabled browser,
      // but we're currently in a browser that doesn't support it...
      if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
        this.fragment = this.getFragment(null, true);
        this.location.replace(this.root + this.location.search + '#' + this.fragment);
        // Return immediately as browser will do redirect to new url
        return true;

      // Or if we've started out with a hash-based route, but we're currently
      // in a browser where it could be `pushState`-based instead...
      } else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
        this.fragment = this.getHash().replace(routeStripper, '');
        this.history.replaceState({}, document.title, this.root + this.fragment + loc.search);
      }

      if (!this.options.silent) return this.loadUrl();
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      Backbone.$(window).off('popstate', this.checkUrl).off('hashchange', this.checkUrl);
      clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current === this.fragment && this.iframe) {
        current = this.getFragment(this.getHash(this.iframe));
      }
      if (current === this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl() || this.loadUrl(this.getHash());
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragmentOverride) {
      var fragment = this.fragment = this.getFragment(fragmentOverride);
      var matched = _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
      return matched;
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: options};
      fragment = this.getFragment(fragment || '');
      if (this.fragment === fragment) return;
      this.fragment = fragment;
      var url = this.root + fragment;

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, fragment, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '');
        location.replace(href + '#' + fragment);
      } else {
        // Some browsers require that `hash` contains a leading #.
        location.hash = '#' + fragment;
      }
    }

  });

  // Create the default Backbone.history.
  Backbone.history = new History;

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set up inheritance for the model, collection, router, view and history.
  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function (model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error(model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

}).call(this);

});
require.register("component-jQuery/index.js", function(exports, require, module){
/*!
 * jQuery JavaScript Library v1.9.1
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2012 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-2-4
 */
(function( window, undefined ) {

// Can't do this because several apps including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
// Support: Firefox 18+
//"use strict";
var
	// The deferred used on DOM ready
	readyList,

	// A central reference to the root jQuery(document)
	rootjQuery,

	// Support: IE<9
	// For `typeof node.method` instead of `node.method !== undefined`
	core_strundefined = typeof undefined,

	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,
	location = window.location,

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// [[Class]] -> type pairs
	class2type = {},

	// List of deleted data cache ids, so we can reuse them
	core_deletedIds = [],

	core_version = "1.9.1",

	// Save a reference to some core methods
	core_concat = core_deletedIds.concat,
	core_push = core_deletedIds.push,
	core_slice = core_deletedIds.slice,
	core_indexOf = core_deletedIds.indexOf,
	core_toString = class2type.toString,
	core_hasOwn = class2type.hasOwnProperty,
	core_trim = core_version.trim,

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Used for matching numbers
	core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,

	// Used for splitting on whitespace
	core_rnotwhite = /\S+/g,

	// Make sure we trim BOM and NBSP (here's looking at you, Safari 5.0 and IE)
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	},

	// The ready event handler
	completed = function( event ) {

		// readyState === "complete" is good enough for us to call the dom ready in oldIE
		if ( document.addEventListener || event.type === "load" || document.readyState === "complete" ) {
			detach();
			jQuery.ready();
		}
	},
	// Clean-up method for dom ready events
	detach = function() {
		if ( document.addEventListener ) {
			document.removeEventListener( "DOMContentLoaded", completed, false );
			window.removeEventListener( "load", completed, false );

		} else {
			document.detachEvent( "onreadystatechange", completed );
			window.detachEvent( "onload", completed );
		}
	};

jQuery.fn = jQuery.prototype = {
	// The current version of jQuery being used
	jquery: core_version,

	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;

					// scripts is true for back-compat
					jQuery.merge( this, jQuery.parseHTML(
						match[1],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {
							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	toArray: function() {
		return core_slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Add the callback
		jQuery.ready.promise().done( fn );

		return this;
	},

	slice: function() {
		return this.pushStack( core_slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: core_push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
	var src, copyIsArray, copy, name, options, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	noConflict: function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( !document.body ) {
			return setTimeout( jQuery.ready );
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.trigger ) {
			jQuery( document ).trigger("ready").off("ready");
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	isWindow: function( obj ) {
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {
		return !isNaN( parseFloat(obj) ) && isFinite( obj );
	},

	type: function( obj ) {
		if ( obj == null ) {
			return String( obj );
		}
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ core_toString.call(obj) ] || "object" :
			typeof obj;
	},

	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!core_hasOwn.call(obj, "constructor") &&
				!core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || core_hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw new Error( msg );
	},

	// data: string of html
	// context (optional): If specified, the fragment will be created in this context, defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string
	parseHTML: function( data, context, keepScripts ) {
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		if ( typeof context === "boolean" ) {
			keepScripts = context;
			context = false;
		}
		context = context || document;

		var parsed = rsingleTag.exec( data ),
			scripts = !keepScripts && [];

		// Single tag
		if ( parsed ) {
			return [ context.createElement( parsed[1] ) ];
		}

		parsed = jQuery.buildFragment( [ data ], context, scripts );
		if ( scripts ) {
			jQuery( scripts ).remove();
		}
		return jQuery.merge( [], parsed.childNodes );
	},

	parseJSON: function( data ) {
		// Attempt to parse using the native JSON parser first
		if ( window.JSON && window.JSON.parse ) {
			return window.JSON.parse( data );
		}

		if ( data === null ) {
			return data;
		}

		if ( typeof data === "string" ) {

			// Make sure leading/trailing whitespace is removed (IE can't handle it)
			data = jQuery.trim( data );

			if ( data ) {
				// Make sure the incoming data is actual JSON
				// Logic borrowed from http://json.org/json2.js
				if ( rvalidchars.test( data.replace( rvalidescape, "@" )
					.replace( rvalidtokens, "]" )
					.replace( rvalidbraces, "")) ) {

					return ( new Function( "return " + data ) )();
				}
			}
		}

		jQuery.error( "Invalid JSON: " + data );
	},

	// Cross-browser xml parsing
	parseXML: function( data ) {
		var xml, tmp;
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		try {
			if ( window.DOMParser ) { // Standard
				tmp = new DOMParser();
				xml = tmp.parseFromString( data , "text/xml" );
			} else { // IE
				xml = new ActiveXObject( "Microsoft.XMLDOM" );
				xml.async = "false";
				xml.loadXML( data );
			}
		} catch( e ) {
			xml = undefined;
		}
		if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	},

	noop: function() {},

	// Evaluates a script in a global context
	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && jQuery.trim( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var value,
			i = 0,
			length = obj.length,
			isArray = isArraylike( obj );

		if ( args ) {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// Use native String.trim function wherever possible
	trim: core_trim && !core_trim.call("\uFEFF\xA0") ?
		function( text ) {
			return text == null ?
				"" :
				core_trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				( text + "" ).replace( rtrim, "" );
		},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArraylike( Object(arr) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				core_push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		var len;

		if ( arr ) {
			if ( core_indexOf ) {
				return core_indexOf.call( arr, elem, i );
			}

			len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var l = second.length,
			i = first.length,
			j = 0;

		if ( typeof l === "number" ) {
			for ( ; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}
		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var retVal,
			ret = [],
			i = 0,
			length = elems.length;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value,
			i = 0,
			length = elems.length,
			isArray = isArraylike( elems ),
			ret = [];

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return core_concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var args, proxy, tmp;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = core_slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( core_slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	access: function( elems, fn, key, value, chainable, emptyGet, raw ) {
		var i = 0,
			length = elems.length,
			bulk = key == null;

		// Sets many values
		if ( jQuery.type( key ) === "object" ) {
			chainable = true;
			for ( i in key ) {
				jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
			}

		// Sets one value
		} else if ( value !== undefined ) {
			chainable = true;

			if ( !jQuery.isFunction( value ) ) {
				raw = true;
			}

			if ( bulk ) {
				// Bulk operations run against the entire set
				if ( raw ) {
					fn.call( elems, value );
					fn = null;

				// ...except when executing function values
				} else {
					bulk = fn;
					fn = function( elem, key, value ) {
						return bulk.call( jQuery( elem ), value );
					};
				}
			}

			if ( fn ) {
				for ( ; i < length; i++ ) {
					fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
				}
			}
		}

		return chainable ?
			elems :

			// Gets
			bulk ?
				fn.call( elems ) :
				length ? fn( elems[0], key ) : emptyGet;
	},

	now: function() {
		return ( new Date() ).getTime();
	}
});

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// we once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready );

		// Standards-based browsers support DOMContentLoaded
		} else if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed, false );

		// If IE event model is used
		} else {
			// Ensure firing before onload, maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", completed );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", completed );

			// If IE and not a frame
			// continually check to see if the document is ready
			var top = false;

			try {
				top = window.frameElement == null && document.documentElement;
			} catch(e) {}

			if ( top && top.doScroll ) {
				(function doScrollCheck() {
					if ( !jQuery.isReady ) {

						try {
							// Use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							top.doScroll("left");
						} catch(e) {
							return setTimeout( doScrollCheck, 50 );
						}

						// detach all dom ready events
						detach();

						// and execute any waiting functions
						jQuery.ready();
					}
				})();
			}
		}
	}
	return readyList.promise( obj );
};

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function isArraylike( obj ) {
	var length = obj.length,
		type = jQuery.type( obj );

	if ( jQuery.isWindow( obj ) ) {
		return false;
	}

	if ( obj.nodeType === 1 && length ) {
		return true;
	}

	return type === "array" || type !== "function" &&
		( length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj );
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);
// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.match( core_rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,
		// Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				args = args || [];
				args = [ context, args.slice ? args.slice() : args ];
				if ( list && ( !fired || stack ) ) {
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};
jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var action = tuple[ 0 ],
								fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ](function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.done( newDefer.resolve )
										.fail( newDefer.reject )
										.progress( newDefer.notify );
								} else {
									newDefer[ action + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
								}
							});
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[0] ] = function() {
				deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = core_slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
					if( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});
jQuery.support = (function() {

	var support, all, a,
		input, select, fragment,
		opt, eventName, isSupported, i,
		div = document.createElement("div");

	// Setup
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

	// Support tests won't run in some limited or non-browser environments
	all = div.getElementsByTagName("*");
	a = div.getElementsByTagName("a")[ 0 ];
	if ( !all || !a || !all.length ) {
		return {};
	}

	// First batch of tests
	select = document.createElement("select");
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName("input")[ 0 ];

	a.style.cssText = "top:1px;float:left;opacity:.5";
	support = {
		// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
		getSetAttribute: div.className !== "t",

		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: div.firstChild.nodeType === 3,

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName("tbody").length,

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName("link").length,

		// Get the style information from getAttribute
		// (IE uses .cssText instead)
		style: /top/.test( a.getAttribute("style") ),

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: a.getAttribute("href") === "/a",

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		opacity: /^0.5/.test( a.style.opacity ),

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,

		// Check the default checkbox/radio value ("" on WebKit; "on" elsewhere)
		checkOn: !!input.value,

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		optSelected: opt.selected,

		// Tests for enctype support on a form (#6743)
		enctype: !!document.createElement("form").enctype,

		// Makes sure cloning an html5 element does not cause problems
		// Where outerHTML is undefined, this still works
		html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",

		// jQuery.support.boxModel DEPRECATED in 1.8 since we don't support Quirks Mode
		boxModel: document.compatMode === "CSS1Compat",

		// Will be defined later
		deleteExpando: true,
		noCloneEvent: true,
		inlineBlockNeedsLayout: false,
		shrinkWrapBlocks: false,
		reliableMarginRight: true,
		boxSizingReliable: true,
		pixelPosition: false
	};

	// Make sure checked status is properly cloned
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE<9
	try {
		delete div.test;
	} catch( e ) {
		support.deleteExpando = false;
	}

	// Check if we can trust getAttribute("value")
	input = document.createElement("input");
	input.setAttribute( "value", "" );
	support.input = input.getAttribute( "value" ) === "";

	// Check if an input maintains its value after becoming a radio
	input.value = "t";
	input.setAttribute( "type", "radio" );
	support.radioValue = input.value === "t";

	// #11217 - WebKit loses check when the name is after the checked attribute
	input.setAttribute( "checked", "t" );
	input.setAttribute( "name", "t" );

	fragment = document.createDocumentFragment();
	fragment.appendChild( input );

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	support.appendChecked = input.checked;

	// WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<9
	// Opera does not clone events (and typeof div.attachEvent === undefined).
	// IE9-10 clones events bound via attachEvent, but they don't trigger with .click()
	if ( div.attachEvent ) {
		div.attachEvent( "onclick", function() {
			support.noCloneEvent = false;
		});

		div.cloneNode( true ).click();
	}

	// Support: IE<9 (lack submit/change bubble), Firefox 17+ (lack focusin event)
	// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP), test/csp.php
	for ( i in { submit: true, change: true, focusin: true }) {
		div.setAttribute( eventName = "on" + i, "t" );

		support[ i + "Bubbles" ] = eventName in window || div.attributes[ eventName ].expando === false;
	}

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	// Run tests that need a body at doc ready
	jQuery(function() {
		var container, marginDiv, tds,
			divReset = "padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;",
			body = document.getElementsByTagName("body")[0];

		if ( !body ) {
			// Return for frameset docs that don't have a body
			return;
		}

		container = document.createElement("div");
		container.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px";

		body.appendChild( container ).appendChild( div );

		// Support: IE8
		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
		tds = div.getElementsByTagName("td");
		tds[ 0 ].style.cssText = "padding:0;margin:0;border:0;display:none";
		isSupported = ( tds[ 0 ].offsetHeight === 0 );

		tds[ 0 ].style.display = "";
		tds[ 1 ].style.display = "none";

		// Support: IE8
		// Check if empty table cells still have offsetWidth/Height
		support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

		// Check box-sizing and margin behavior
		div.innerHTML = "";
		div.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;";
		support.boxSizing = ( div.offsetWidth === 4 );
		support.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== 1 );

		// Use window.getComputedStyle because jsdom on node.js will break without it.
		if ( window.getComputedStyle ) {
			support.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
			support.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";

			// Check if div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container. (#3333)
			// Fails in WebKit before Feb 2011 nightlies
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			marginDiv = div.appendChild( document.createElement("div") );
			marginDiv.style.cssText = div.style.cssText = divReset;
			marginDiv.style.marginRight = marginDiv.style.width = "0";
			div.style.width = "1px";

			support.reliableMarginRight =
				!parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
		}

		if ( typeof div.style.zoom !== core_strundefined ) {
			// Support: IE<8
			// Check if natively block-level elements act like inline-block
			// elements when setting their display to 'inline' and giving
			// them layout
			div.innerHTML = "";
			div.style.cssText = divReset + "width:1px;padding:1px;display:inline;zoom:1";
			support.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );

			// Support: IE6
			// Check if elements with layout shrink-wrap their children
			div.style.display = "block";
			div.innerHTML = "<div></div>";
			div.firstChild.style.width = "5px";
			support.shrinkWrapBlocks = ( div.offsetWidth !== 3 );

			if ( support.inlineBlockNeedsLayout ) {
				// Prevent IE 6 from affecting layout for positioned elements #11048
				// Prevent IE from shrinking the body in IE 7 mode #12869
				// Support: IE<8
				body.style.zoom = 1;
			}
		}

		body.removeChild( container );

		// Null elements to avoid leaks in IE
		container = div = tds = marginDiv = null;
	});

	// Null elements to avoid leaks in IE
	all = select = fragment = opt = a = input = null;

	return support;
})();

var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
	rmultiDash = /([A-Z])/g;

function internalData( elem, name, data, pvt /* Internal Use Only */ ){
	if ( !jQuery.acceptData( elem ) ) {
		return;
	}

	var thisCache, ret,
		internalKey = jQuery.expando,
		getByName = typeof name === "string",

		// We have to handle DOM nodes and JS objects differently because IE6-7
		// can't GC object references properly across the DOM-JS boundary
		isNode = elem.nodeType,

		// Only DOM nodes need the global jQuery cache; JS object data is
		// attached directly to the object so GC can occur automatically
		cache = isNode ? jQuery.cache : elem,

		// Only defining an ID for JS objects if its cache already exists allows
		// the code to shortcut on the same path as a DOM node with no cache
		id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

	// Avoid doing any more work than we need to when trying to get data on an
	// object that has no data at all
	if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && getByName && data === undefined ) {
		return;
	}

	if ( !id ) {
		// Only DOM nodes need a new unique ID for each element since their data
		// ends up in the global cache
		if ( isNode ) {
			elem[ internalKey ] = id = core_deletedIds.pop() || jQuery.guid++;
		} else {
			id = internalKey;
		}
	}

	if ( !cache[ id ] ) {
		cache[ id ] = {};

		// Avoids exposing jQuery metadata on plain JS objects when the object
		// is serialized using JSON.stringify
		if ( !isNode ) {
			cache[ id ].toJSON = jQuery.noop;
		}
	}

	// An object can be passed to jQuery.data instead of a key/value pair; this gets
	// shallow copied over onto the existing cache
	if ( typeof name === "object" || typeof name === "function" ) {
		if ( pvt ) {
			cache[ id ] = jQuery.extend( cache[ id ], name );
		} else {
			cache[ id ].data = jQuery.extend( cache[ id ].data, name );
		}
	}

	thisCache = cache[ id ];

	// jQuery data() is stored in a separate object inside the object's internal data
	// cache in order to avoid key collisions between internal data and user-defined
	// data.
	if ( !pvt ) {
		if ( !thisCache.data ) {
			thisCache.data = {};
		}

		thisCache = thisCache.data;
	}

	if ( data !== undefined ) {
		thisCache[ jQuery.camelCase( name ) ] = data;
	}

	// Check for both converted-to-camel and non-converted data property names
	// If a data property was specified
	if ( getByName ) {

		// First Try to find as-is property data
		ret = thisCache[ name ];

		// Test for null|undefined property data
		if ( ret == null ) {

			// Try to find the camelCased property
			ret = thisCache[ jQuery.camelCase( name ) ];
		}
	} else {
		ret = thisCache;
	}

	return ret;
}

function internalRemoveData( elem, name, pvt ) {
	if ( !jQuery.acceptData( elem ) ) {
		return;
	}

	var i, l, thisCache,
		isNode = elem.nodeType,

		// See jQuery.data for more information
		cache = isNode ? jQuery.cache : elem,
		id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

	// If there is already no cache entry for this object, there is no
	// purpose in continuing
	if ( !cache[ id ] ) {
		return;
	}

	if ( name ) {

		thisCache = pvt ? cache[ id ] : cache[ id ].data;

		if ( thisCache ) {

			// Support array or space separated string names for data keys
			if ( !jQuery.isArray( name ) ) {

				// try the string as a key before any manipulation
				if ( name in thisCache ) {
					name = [ name ];
				} else {

					// split the camel cased version by spaces unless a key with the spaces exists
					name = jQuery.camelCase( name );
					if ( name in thisCache ) {
						name = [ name ];
					} else {
						name = name.split(" ");
					}
				}
			} else {
				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = name.concat( jQuery.map( name, jQuery.camelCase ) );
			}

			for ( i = 0, l = name.length; i < l; i++ ) {
				delete thisCache[ name[i] ];
			}

			// If there is no data left in the cache, we want to continue
			// and let the cache object itself get destroyed
			if ( !( pvt ? isEmptyDataObject : jQuery.isEmptyObject )( thisCache ) ) {
				return;
			}
		}
	}

	// See jQuery.data for more information
	if ( !pvt ) {
		delete cache[ id ].data;

		// Don't destroy the parent cache unless the internal data object
		// had been the only thing left in it
		if ( !isEmptyDataObject( cache[ id ] ) ) {
			return;
		}
	}

	// Destroy the cache
	if ( isNode ) {
		jQuery.cleanData( [ elem ], true );

	// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
	} else if ( jQuery.support.deleteExpando || cache != cache.window ) {
		delete cache[ id ];

	// When all else fails, null
	} else {
		cache[ id ] = null;
	}
}

jQuery.extend({
	cache: {},

	// Unique for each copy of jQuery on the page
	// Non-digits removed to match rinlinejQuery
	expando: "jQuery" + ( core_version + Math.random() ).replace( /\D/g, "" ),

	// The following elements throw uncatchable exceptions if you
	// attempt to add expando properties to them.
	noData: {
		"embed": true,
		// Ban all objects except for Flash (which handle expandos)
		"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
		"applet": true
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data ) {
		return internalData( elem, name, data );
	},

	removeData: function( elem, name ) {
		return internalRemoveData( elem, name );
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return internalData( elem, name, data, true );
	},

	_removeData: function( elem, name ) {
		return internalRemoveData( elem, name, true );
	},

	// A method for determining if a DOM node can handle the data expando
	acceptData: function( elem ) {
		// Do not set data on non-element because it will not be cleared (#8335).
		if ( elem.nodeType && elem.nodeType !== 1 && elem.nodeType !== 9 ) {
			return false;
		}

		var noData = elem.nodeName && jQuery.noData[ elem.nodeName.toLowerCase() ];

		// nodes accept data unless otherwise specified; rejection can be conditional
		return !noData || noData !== true && elem.getAttribute("classid") === noData;
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var attrs, name,
			elem = this[0],
			i = 0,
			data = null;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = jQuery.data( elem );

				if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
					attrs = elem.attributes;
					for ( ; i < attrs.length; i++ ) {
						name = attrs[i].name;

						if ( !name.indexOf( "data-" ) ) {
							name = jQuery.camelCase( name.slice(5) );

							dataAttr( elem, name, data[ name ] );
						}
					}
					jQuery._data( elem, "parsedAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

		return jQuery.access( this, function( value ) {

			if ( value === undefined ) {
				// Try to fetch any internally stored data first
				return elem ? dataAttr( elem, key, jQuery.data( elem, key ) ) : null;
			}

			this.each(function() {
				jQuery.data( this, key, value );
			});
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :
					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
						data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	var name;
	for ( name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}
jQuery.extend({
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray(data) ) {
					queue = jQuery._data( elem, type, jQuery.makeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		hooks.cur = fn;
		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object, or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return jQuery._data( elem, key ) || jQuery._data( elem, key, {
			empty: jQuery.Callbacks("once memory").add(function() {
				jQuery._removeData( elem, type + "queue" );
				jQuery._removeData( elem, key );
			})
		});
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = setTimeout( next, time );
			hooks.stop = function() {
				clearTimeout( timeout );
			};
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while( i-- ) {
			tmp = jQuery._data( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
});
var nodeHook, boolHook,
	rclass = /[\t\r\n]/g,
	rreturn = /\r/g,
	rfocusable = /^(?:input|select|textarea|button|object)$/i,
	rclickable = /^(?:a|area)$/i,
	rboolean = /^(?:checked|selected|autofocus|autoplay|async|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped)$/i,
	ruseDefault = /^(?:checked|selected)$/i,
	getSetAttribute = jQuery.support.getSetAttribute,
	getSetInput = jQuery.support.input;

jQuery.fn.extend({
	attr: function( name, value ) {
		return jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	},

	prop: function( name, value ) {
		return jQuery.access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each(function() {
			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch( e ) {}
		});
	},

	addClass: function( value ) {
		var classes, elem, cur, clazz, j,
			i = 0,
			len = this.length,
			proceed = typeof value === "string" && value;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call( this, j, this.className ) );
			});
		}

		if ( proceed ) {
			// The disjunction here is for better compressibility (see removeClass)
			classes = ( value || "" ).match( core_rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					" "
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}
					elem.className = jQuery.trim( cur );

				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, clazz, j,
			i = 0,
			len = this.length,
			proceed = arguments.length === 0 || typeof value === "string" && value;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call( this, j, this.className ) );
			});
		}
		if ( proceed ) {
			classes = ( value || "" ).match( core_rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					""
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}
					elem.className = value ? jQuery.trim( cur ) : "";
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isBool = typeof stateVal === "boolean";

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					state = stateVal,
					classNames = value.match( core_rnotwhite ) || [];

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space separated list
					state = isBool ? state : !self.hasClass( className );
					self[ state ? "addClass" : "removeClass" ]( className );
				}

			// Toggle whole class name
			} else if ( type === core_strundefined || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					jQuery._data( this, "__className__", this.className );
				}

				// If the element has a class name or if we're passed "false",
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
				return true;
			}
		}

		return false;
	},

	val: function( value ) {
		var ret, hooks, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var val,
				self = jQuery(this);

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, self.val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map(val, function ( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				// attributes.value is undefined in Blackberry 4.7 but
				// uses .value. See #6932
				var val = elem.attributes.value;
				return !val || val.specified ? elem.value : elem.text;
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// oldIE doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&
							// Don't return options that are disabled or in a disabled optgroup
							( jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null ) &&
							( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var values = jQuery.makeArray( value );

				jQuery(elem).find("option").each(function() {
					this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
				});

				if ( !values.length ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	},

	attr: function( elem, name, value ) {
		var hooks, notxml, ret,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === core_strundefined ) {
			return jQuery.prop( elem, name, value );
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( notxml ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] || ( rboolean.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );

			} else if ( hooks && notxml && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, value + "" );
				return value;
			}

		} else if ( hooks && notxml && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {

			// In IE9+, Flash objects don't have .getAttribute (#12945)
			// Support: IE9+
			if ( typeof elem.getAttribute !== core_strundefined ) {
				ret =  elem.getAttribute( name );
			}

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( core_rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( (name = attrNames[i++]) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( rboolean.test( name ) ) {
					// Set corresponding property to false for boolean attributes
					// Also clear defaultChecked/defaultSelected (if appropriate) for IE<8
					if ( !getSetAttribute && ruseDefault.test( name ) ) {
						elem[ jQuery.camelCase( "default-" + name ) ] =
							elem[ propName ] = false;
					} else {
						elem[ propName ] = false;
					}

				// See #9699 for explanation of this approach (setting first, then removal)
				} else {
					jQuery.attr( elem, name, "" );
				}

				elem.removeAttribute( getSetAttribute ? name : propName );
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to default in case type is set after value during creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	propFix: {
		tabindex: "tabIndex",
		readonly: "readOnly",
		"for": "htmlFor",
		"class": "className",
		maxlength: "maxLength",
		cellspacing: "cellSpacing",
		cellpadding: "cellPadding",
		rowspan: "rowSpan",
		colspan: "colSpan",
		usemap: "useMap",
		frameborder: "frameBorder",
		contenteditable: "contentEditable"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				return ( elem[ name ] = value );
			}

		} else {
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
				return ret;

			} else {
				return elem[ name ];
			}
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				var attributeNode = elem.getAttributeNode("tabindex");

				return attributeNode && attributeNode.specified ?
					parseInt( attributeNode.value, 10 ) :
					rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
						0 :
						undefined;
			}
		}
	}
});

// Hook for boolean attributes
boolHook = {
	get: function( elem, name ) {
		var
			// Use .prop to determine if this attribute is understood as boolean
			prop = jQuery.prop( elem, name ),

			// Fetch it accordingly
			attr = typeof prop === "boolean" && elem.getAttribute( name ),
			detail = typeof prop === "boolean" ?

				getSetInput && getSetAttribute ?
					attr != null :
					// oldIE fabricates an empty string for missing boolean attributes
					// and conflates checked/selected into attroperties
					ruseDefault.test( name ) ?
						elem[ jQuery.camelCase( "default-" + name ) ] :
						!!attr :

				// fetch an attribute node for properties not recognized as boolean
				elem.getAttributeNode( name );

		return detail && detail.value !== false ?
			name.toLowerCase() :
			undefined;
	},
	set: function( elem, value, name ) {
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
			// IE<8 needs the *property* name
			elem.setAttribute( !getSetAttribute && jQuery.propFix[ name ] || name, name );

		// Use defaultChecked and defaultSelected for oldIE
		} else {
			elem[ jQuery.camelCase( "default-" + name ) ] = elem[ name ] = true;
		}

		return name;
	}
};

// fix oldIE value attroperty
if ( !getSetInput || !getSetAttribute ) {
	jQuery.attrHooks.value = {
		get: function( elem, name ) {
			var ret = elem.getAttributeNode( name );
			return jQuery.nodeName( elem, "input" ) ?

				// Ignore the value *property* by using defaultValue
				elem.defaultValue :

				ret && ret.specified ? ret.value : undefined;
		},
		set: function( elem, value, name ) {
			if ( jQuery.nodeName( elem, "input" ) ) {
				// Does not return so that setAttribute is also used
				elem.defaultValue = value;
			} else {
				// Use nodeHook if defined (#1954); otherwise setAttribute is fine
				return nodeHook && nodeHook.set( elem, value, name );
			}
		}
	};
}

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret = elem.getAttributeNode( name );
			return ret && ( name === "id" || name === "name" || name === "coords" ? ret.value !== "" : ret.specified ) ?
				ret.value :
				undefined;
		},
		set: function( elem, value, name ) {
			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				elem.setAttributeNode(
					(ret = elem.ownerDocument.createAttribute( name ))
				);
			}

			ret.value = value += "";

			// Break association with cloned elements by also using setAttribute (#9646)
			return name === "value" || value === elem.getAttribute( name ) ?
				value :
				undefined;
		}
	};

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		get: nodeHook.get,
		set: function( elem, value, name ) {
			nodeHook.set( elem, value === "" ? false : value, name );
		}
	};

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each([ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		});
	});
}


// Some attributes require a special call on IE
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !jQuery.support.hrefNormalized ) {
	jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			get: function( elem ) {
				var ret = elem.getAttribute( name, 2 );
				return ret == null ? undefined : ret;
			}
		});
	});

	// href/src property should get the full normalized URL (#10299/#12915)
	jQuery.each([ "href", "src" ], function( i, name ) {
		jQuery.propHooks[ name ] = {
			get: function( elem ) {
				return elem.getAttribute( name, 4 );
			}
		};
	});
}

if ( !jQuery.support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {
			// Return undefined in the case of empty string
			// Note: IE uppercases css property names, but if we were to .toLowerCase()
			// .cssText, that would destroy case senstitivity in URL's, like in "background"
			return elem.style.cssText || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = value + "" );
		}
	};
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {
	jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		}
	});
}

// IE6/7 call enctype encoding
if ( !jQuery.support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}

// Radios and checkboxes getter/setter
if ( !jQuery.support.checkOn ) {
	jQuery.each([ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			get: function( elem ) {
				// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
				return elem.getAttribute("value") === null ? "on" : elem.value;
			}
		};
	});
}
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	});
});
var rformElems = /^(?:input|select|textarea)$/i,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {
		var tmp, events, t, handleObjIn,
			special, eventHandle, handleObj,
			handlers, type, namespaces, origType,
			elemData = jQuery._data( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !(events = elemData.events) ) {
			events = elemData.events = {};
		}
		if ( !(eventHandle = elemData.handle) ) {
			eventHandle = elemData.handle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== core_strundefined && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		// jQuery(...).bind("mouseover mouseout", fn);
		types = ( types || "" ).match( core_rnotwhite ) || [""];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !(handlers = events[ type ]) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {
		var j, handleObj, tmp,
			origCount, t, events,
			special, handlers, type,
			namespaces, origType,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem );

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( core_rnotwhite ) || [""];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery._removeData( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		var handle, ontype, cur,
			bubbleType, special, tmp, i,
			eventPath = [ elem || document ],
			type = core_hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = core_hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf(".") >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf(":") < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		event.isTrigger = true;
		event.namespace = namespaces.join(".");
		event.namespace_re = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === (elem.ownerDocument || document) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && jQuery.acceptData( cur ) && handle.apply && handle.apply( cur, data ) === false ) {
				event.preventDefault();
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) &&
				!(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && elem[ type ] && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					try {
						elem[ type ]();
					} catch ( e ) {
						// IE<9 dies on focus/blur to hidden element (#1486,#12518)
						// only reproducible on winXP IE8 native, not IE9 in IE8 mode
					}
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, ret, handleObj, matched, j,
			handlerQueue = [],
			args = core_slice.call( arguments ),
			handlers = ( jQuery._data( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( (event.result = ret) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var sel, handleObj, matches, i,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

			for ( ; cur != this; cur = cur.parentNode || this ) {

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && (cur.disabled !== true || event.type !== "click") ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) >= 0 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, handlers: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
		}

		return handlerQueue;
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: IE<9
		// Fix target property (#1925)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Support: Chrome 23+, Safari?
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Support: IE<9
		// For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
		event.metaKey = !!event.metaKey;

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var body, eventDoc, doc,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		click: {
			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( jQuery.nodeName( this, "input" ) && this.type === "checkbox" && this.click ) {
					this.click();
					return false;
				}
			}
		},
		focus: {
			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== document.activeElement && this.focus ) {
					try {
						this.focus();
						return false;
					} catch ( e ) {
						// Support: IE<9
						// If we error on focus to hidden element (#1486, #12518),
						// let .trigger() run the handlers
					}
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === document.activeElement && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Even when returnValue equals to undefined Firefox will still show alert
				if ( event.result !== undefined ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{ type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		var name = "on" + type;

		if ( elem.detachEvent ) {

			// #8545, #7054, preventing memory leaks for custom events in IE6-8
			// detachEvent needed property on element, by name of that event, to properly expose it to GC
			if ( typeof elem[ name ] === core_strundefined ) {
				elem[ name ] = null;
			}

			elem.detachEvent( name, handle );
		}
	};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
			src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;
		if ( !e ) {
			return;
		}

		// If preventDefault exists, run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// Support: IE
		// Otherwise set the returnValue property of the original event to false
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;
		if ( !e ) {
			return;
		}
		// If stopPropagation exists, run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}

		// Support: IE
		// Set the cancelBubble property of the original event to true
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// IE submit delegation
if ( !jQuery.support.submitBubbles ) {

	jQuery.event.special.submit = {
		setup: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
				if ( form && !jQuery._data( form, "submitBubbles" ) ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						event._submit_bubble = true;
					});
					jQuery._data( form, "submitBubbles", true );
				}
			});
			// return undefined since we don't need an event listener
		},

		postDispatch: function( event ) {
			// If form was submitted by the user, bubble the event up the tree
			if ( event._submit_bubble ) {
				delete event._submit_bubble;
				if ( this.parentNode && !event.isTrigger ) {
					jQuery.event.simulate( "submit", this.parentNode, event, true );
				}
			}
		},

		teardown: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !jQuery.support.changeBubbles ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {
				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._just_changed = true;
						}
					});
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._just_changed && !event.isTrigger ) {
							this._just_changed = false;
						}
						// Allow triggered, simulated change events (#11500)
						jQuery.event.simulate( "change", this, event, true );
					});
				}
				return false;
			}
			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "changeBubbles" ) ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event, true );
						}
					});
					jQuery._data( elem, "changeBubbles", true );
				}
			});
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return !rformElems.test( this.nodeName );
		}
	};
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler while someone wants focusin/focusout
		var attaches = 0,
			handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				if ( attaches++ === 0 ) {
					document.addEventListener( orig, handler, true );
				}
			},
			teardown: function() {
				if ( --attaches === 0 ) {
					document.removeEventListener( orig, handler, true );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var type, origFn;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		var elem = this[0];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
});
/*!
 * Sizzle CSS Selector Engine
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license
 * http://sizzlejs.com/
 */
(function( window, undefined ) {

var i,
	cachedruns,
	Expr,
	getText,
	isXML,
	compile,
	hasDuplicate,
	outermostContext,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsXML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,
	sortOrder,

	// Instance-specific data
	expando = "sizzle" + -(new Date()),
	preferredDoc = window.document,
	support = {},
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),

	// General-purpose constants
	strundefined = typeof undefined,
	MAX_NEGATIVE = 1 << 31,

	// Array methods
	arr = [],
	pop = arr.pop,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf if we can't use a native one
	indexOf = arr.indexOf || function( elem ) {
		var i = 0,
			len = this.length;
		for ( ; i < len; i++ ) {
			if ( this[i] === elem ) {
				return i;
			}
		}
		return -1;
	},


	// Regular expressions

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
	operators = "([*^$|!~]?=)",
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
		"*(?:" + operators + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

	// Prefer arguments quoted,
	//   then not containing pseudos/brackets,
	//   then attribute selectors/non-parenthetical expressions,
	//   then anything else
	// These preferences are here to reduce the number of selectors
	//   needing tokenize in the PSEUDO preFilter
	pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace( 3, 8 ) + ")*)|.*)\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([\\x20\\t\\r\\n\\f>+~])" + whitespace + "*" ),
	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"NAME": new RegExp( "^\\[name=['\"]?(" + characterEncoding + ")['\"]?\\]" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rsibling = /[\x20\t\r\n\f]*[+~]/,

	rnative = /^[^{]+\{\s*\[native code/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rescape = /'|\\/g,
	rattributeQuotes = /\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = /\\([\da-fA-F]{1,6}[\x20\t\r\n\f]?|.)/g,
	funescape = function( _, escaped ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		return high !== high ?
			escaped :
			// BMP codepoint
			high < 0 ?
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	};

// Use a stripped-down slice if we can't use a native one
try {
	slice.call( preferredDoc.documentElement.childNodes, 0 )[0].nodeType;
} catch ( e ) {
	slice = function( i ) {
		var elem,
			results = [];
		while ( (elem = this[i++]) ) {
			results.push( elem );
		}
		return results;
	};
}

/**
 * For feature detection
 * @param {Function} fn The function to test for native support
 */
function isNative( fn ) {
	return rnative.test( fn + "" );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var cache,
		keys = [];

	return (cache = function( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key += " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key ] = value);
	});
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return fn( div );
	} catch (e) {
		return false;
	} finally {
		// release memory in IE
		div = null;
	}
}

function Sizzle( selector, context, results, seed ) {
	var match, elem, m, nodeType,
		// QSA vars
		i, groups, old, nid, newContext, newSelector;

	if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
		setDocument( context );
	}

	context = context || document;
	results = results || [];

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {
		return [];
	}

	if ( !documentIsXML && !seed ) {

		// Shortcuts
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, slice.call(context.getElementsByTagName( selector ), 0) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && support.getByClassName && context.getElementsByClassName ) {
				push.apply( results, slice.call(context.getElementsByClassName( m ), 0) );
				return results;
			}
		}

		// QSA path
		if ( support.qsa && !rbuggyQSA.test(selector) ) {
			old = true;
			nid = expando;
			newContext = context;
			newSelector = nodeType === 9 && selector;

			// qSA works strangely on Element-rooted queries
			// We can work around this by specifying an extra ID on the root
			// and working up from there (Thanks to Andrew Dupont for the technique)
			// IE 8 doesn't work on object elements
			if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
				groups = tokenize( selector );

				if ( (old = context.getAttribute("id")) ) {
					nid = old.replace( rescape, "\\$&" );
				} else {
					context.setAttribute( "id", nid );
				}
				nid = "[id='" + nid + "'] ";

				i = groups.length;
				while ( i-- ) {
					groups[i] = nid + toSelector( groups[i] );
				}
				newContext = rsibling.test( selector ) && context.parentNode || context;
				newSelector = groups.join(",");
			}

			if ( newSelector ) {
				try {
					push.apply( results, slice.call( newContext.querySelectorAll(
						newSelector
					), 0 ) );
					return results;
				} catch(qsaError) {
				} finally {
					if ( !old ) {
						context.removeAttribute("id");
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Detect xml
 * @param {Element|Object} elem An element or a document
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var doc = node ? node.ownerDocument || node : preferredDoc;

	// If no document and documentElement is available, return
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Set our document
	document = doc;
	docElem = doc.documentElement;

	// Support tests
	documentIsXML = isXML( doc );

	// Check if getElementsByTagName("*") returns only elements
	support.tagNameNoComments = assert(function( div ) {
		div.appendChild( doc.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Check if attributes should be retrieved by attribute nodes
	support.attributes = assert(function( div ) {
		div.innerHTML = "<select></select>";
		var type = typeof div.lastChild.getAttribute("multiple");
		// IE8 returns a string for some attributes even when not present
		return type !== "boolean" && type !== "string";
	});

	// Check if getElementsByClassName can be trusted
	support.getByClassName = assert(function( div ) {
		// Opera can't find a second classname (in 9.6)
		div.innerHTML = "<div class='hidden e'></div><div class='hidden'></div>";
		if ( !div.getElementsByClassName || !div.getElementsByClassName("e").length ) {
			return false;
		}

		// Safari 3.2 caches class attributes and doesn't catch changes
		div.lastChild.className = "e";
		return div.getElementsByClassName("e").length === 2;
	});

	// Check if getElementById returns elements by name
	// Check if getElementsByName privileges form controls or returns elements by ID
	support.getByName = assert(function( div ) {
		// Inject content
		div.id = expando + 0;
		div.innerHTML = "<a name='" + expando + "'></a><div name='" + expando + "'></div>";
		docElem.insertBefore( div, docElem.firstChild );

		// Test
		var pass = doc.getElementsByName &&
			// buggy browsers will return fewer than the correct 2
			doc.getElementsByName( expando ).length === 2 +
			// buggy browsers will return more than the correct 0
			doc.getElementsByName( expando + 0 ).length;
		support.getIdNotName = !doc.getElementById( expando );

		// Cleanup
		docElem.removeChild( div );

		return pass;
	});

	// IE6/7 return modified attributes
	Expr.attrHandle = assert(function( div ) {
		div.innerHTML = "<a href='#'></a>";
		return div.firstChild && typeof div.firstChild.getAttribute !== strundefined &&
			div.firstChild.getAttribute("href") === "#";
	}) ?
		{} :
		{
			"href": function( elem ) {
				return elem.getAttribute( "href", 2 );
			},
			"type": function( elem ) {
				return elem.getAttribute("type");
			}
		};

	// ID find and filter
	if ( support.getIdNotName ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== strundefined && !documentIsXML ) {
				var m = context.getElementById( id );
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== strundefined && !documentIsXML ) {
				var m = context.getElementById( id );

				return m ?
					m.id === id || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").value === id ?
						[m] :
						undefined :
					[];
			}
		};
		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.tagNameNoComments ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== strundefined ) {
				return context.getElementsByTagName( tag );
			}
		} :
		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Name
	Expr.find["NAME"] = support.getByName && function( tag, context ) {
		if ( typeof context.getElementsByName !== strundefined ) {
			return context.getElementsByName( name );
		}
	};

	// Class
	Expr.find["CLASS"] = support.getByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== strundefined && !documentIsXML ) {
			return context.getElementsByClassName( className );
		}
	};

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21),
	// no need to also add to buggyMatches since matches checks buggyQSA
	// A support test would require too much code (would include document ready)
	rbuggyQSA = [ ":focus" ];

	if ( (support.qsa = isNative(doc.querySelectorAll)) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explictly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			div.innerHTML = "<select><option selected=''></option></select>";

			// IE8 - Some boolean attributes are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:checked|disabled|ismap|multiple|readonly|selected|value)" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}
		});

		assert(function( div ) {

			// Opera 10-12/IE8 - ^= $= *= and empty values
			// Should not select anything
			div.innerHTML = "<input type='hidden' i=''/>";
			if ( div.querySelectorAll("[i^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:\"\"|'')" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = isNative( (matches = docElem.matchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.webkitMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = new RegExp( rbuggyMatches.join("|") );

	// Element contains another
	// Purposefully does not implement inclusive descendent
	// As in, an element does not contain itself
	contains = isNative(docElem.contains) || docElem.compareDocumentPosition ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	// Document order sorting
	sortOrder = docElem.compareDocumentPosition ?
	function( a, b ) {
		var compare;

		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( (compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition( b )) ) {
			if ( compare & 1 || a.parentNode && a.parentNode.nodeType === 11 ) {
				if ( a === doc || contains( preferredDoc, a ) ) {
					return -1;
				}
				if ( b === doc || contains( preferredDoc, b ) ) {
					return 1;
				}
				return 0;
			}
			return compare & 4 ? -1 : 1;
		}

		return a.compareDocumentPosition ? -1 : 1;
	} :
	function( a, b ) {
		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Parentless nodes are either documents or disconnected
		} else if ( !aup || !bup ) {
			return a === doc ? -1 :
				b === doc ? 1 :
				aup ? -1 :
				bup ? 1 :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	// Always assume the presence of duplicates if sort doesn't
	// pass them to our comparison function (as in Google Chrome).
	hasDuplicate = false;
	[0, 0].sort( sortOrder );
	support.detectDuplicates = hasDuplicate;

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	// rbuggyQSA always contains :focus, so no need for an existence check
	if ( support.matchesSelector && !documentIsXML && (!rbuggyMatches || !rbuggyMatches.test(expr)) && !rbuggyQSA.test(expr) ) {
		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch(e) {}
	}

	return Sizzle( expr, document, null, [elem] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	var val;

	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	if ( !documentIsXML ) {
		name = name.toLowerCase();
	}
	if ( (val = Expr.attrHandle[ name ]) ) {
		return val( elem );
	}
	if ( documentIsXML || support.attributes ) {
		return elem.getAttribute( name );
	}
	return ( (val = elem.getAttributeNode( name )) || elem.getAttribute( name ) ) && elem[ name ] === true ?
		name :
		val && val.specified ? val.value : null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

// Document sorting and removing duplicates
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		i = 1,
		j = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		for ( ; (elem = results[i]); i++ ) {
			if ( elem === results[ i - 1 ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	return results;
};

function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && ( ~b.sourceIndex || MAX_NEGATIVE ) - ( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

// Returns a function to use in pseudos for input types
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

// Returns a function to use in pseudos for buttons
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

// Returns a function to use in pseudos for positionals
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		for ( ; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (see #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[5] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[4] ) {
				match[2] = match[4];

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeName ) {
			if ( nodeName === "*" ) {
				return function() { return true; };
			}

			nodeName = nodeName.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
			};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( elem.className || (typeof elem.getAttribute !== strundefined && elem.getAttribute("class")) || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, outerCache, node, diff, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {
							// Seek `elem` from a previously-cached index
							outerCache = parent[ expando ] || (parent[ expando ] = {});
							cache = outerCache[ type ] || [];
							nodeIndex = cache[0] === dirruns && cache[1];
							diff = cache[0] === dirruns && cache[2];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						// Use previously-cached element index if available
						} else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
							diff = cache[1];

						// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
						} else {
							// Use the same loop as above to seek `elem` from the start
							while ( (node = ++nodeIndex && node && node[ dir ] ||
								(diff = nodeIndex = 0) || start.pop()) ) {

								if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
									// Cache the index of each encountered element
									if ( useCache ) {
										(node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
									}

									if ( node === elem ) {
										break;
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf.call( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifider
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsXML ?
						elem.getAttribute("xml:lang") || elem.getAttribute("lang") :
						elem.lang) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
			//   not comment, processing instructions, or others
			// Thanks to Diego Perini for the nodeName shortcut
			//   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeName > "@" || elem.nodeType === 3 || elem.nodeType === 4 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === elem.type );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

function tokenize( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( tokens = [] );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push( {
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			} );
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push( {
					value: matched,
					type: type,
					matches: match
				} );
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
}

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var data, cache, outerCache,
				dirkey = dirruns + " " + doneName;

			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});
						if ( (cache = outerCache[ dir ]) && cache[0] === dirkey ) {
							if ( (data = cache[1]) === true || data === cachedruns ) {
								return data === true;
							}
						} else {
							cache = outerCache[ dir ] = [ dirkey ];
							cache[1] = matcher( elem, context, xml ) || cachedruns;
							if ( cache[1] === true ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf.call( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector( tokens.slice( 0, i - 1 ) ).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	// A counter to specify which element is currently being matched
	var matcherCachedRuns = 0,
		bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, expandContext ) {
			var elem, j, matcher,
				setMatched = [],
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				outermost = expandContext != null,
				contextBackup = outermostContext,
				// We must always have either seed elements or context
				elems = seed || byElement && Expr.find["TAG"]( "*", expandContext && context.parentNode || context ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1);

			if ( outermost ) {
				outermostContext = context !== document && context;
				cachedruns = matcherCachedRuns;
			}

			// Add elements passing elementMatchers directly to results
			// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
			for ( ; (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
						cachedruns = ++matcherCachedRuns;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, group /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !group ) {
			group = tokenize( selector );
		}
		i = group.length;
		while ( i-- ) {
			cached = matcherFromTokens( group[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
	}
	return cached;
};

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function select( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		match = tokenize( selector );

	if ( !seed ) {
		// Try to minimize operations if there is only one group
		if ( match.length === 1 ) {

			// Take a shortcut and set the context if the root selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					context.nodeType === 9 && !documentIsXML &&
					Expr.relative[ tokens[1].type ] ) {

				context = Expr.find["ID"]( token.matches[0].replace( runescape, funescape ), context )[0];
				if ( !context ) {
					return results;
				}

				selector = selector.slice( tokens.shift().value.length );
			}

			// Fetch a seed set for right-to-left matching
			i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
			while ( i-- ) {
				token = tokens[i];

				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( runescape, funescape ),
						rsibling.test( tokens[0].type ) && context.parentNode || context
					)) ) {

						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && toSelector( tokens );
						if ( !selector ) {
							push.apply( results, slice.call( seed, 0 ) );
							return results;
						}

						break;
					}
				}
			}
		}
	}

	// Compile and execute a filtering function
	// Provide `match` to avoid retokenization if we modified the selector above
	compile( selector, match )(
		seed,
		context,
		documentIsXML,
		results,
		rsibling.test( selector )
	);
	return results;
}

// Deprecated
Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Easy API for creating new setFilters
function setFilters() {}
Expr.filters = setFilters.prototype = Expr.pseudos;
Expr.setFilters = new setFilters();

// Initialize with the default document
setDocument();

// Override sizzle attribute retrieval
Sizzle.attr = jQuery.attr;
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})( window );
var runtil = /Until$/,
	rparentsprev = /^(?:parents|prev(?:Until|All))/,
	isSimple = /^.[^:#\[\.,]*$/,
	rneedsContext = jQuery.expr.match.needsContext,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	find: function( selector ) {
		var i, ret, self,
			len = this.length;

		if ( typeof selector !== "string" ) {
			self = this;
			return this.pushStack( jQuery( selector ).filter(function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			}) );
		}

		ret = [];
		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, this[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = ( this.selector ? this.selector + " " : "" ) + selector;
		return ret;
	},

	has: function( target ) {
		var i,
			targets = jQuery( target, this ),
			len = targets.length;

		return this.filter(function() {
			for ( i = 0; i < len; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector, false) );
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector, true) );
	},

	is: function( selector ) {
		return !!selector && (
			typeof selector === "string" ?
				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				rneedsContext.test( selector ) ?
					jQuery( selector, this.context ).index( this[0] ) >= 0 :
					jQuery.filter( selector, this ).length > 0 :
				this.filter( selector ).length > 0 );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			ret = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			cur = this[i];

			while ( cur && cur.ownerDocument && cur !== context && cur.nodeType !== 11 ) {
				if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
					ret.push( cur );
					break;
				}
				cur = cur.parentNode;
			}
		}

		return this.pushStack( ret.length > 1 ? jQuery.unique( ret ) : ret );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[0] && this[0].parentNode ) ? this.first().prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[0], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( jQuery.unique(all) );
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

jQuery.fn.andSelf = jQuery.fn.addBack;

function sibling( cur, dir ) {
	do {
		cur = cur[ dir ];
	} while ( cur && cur.nodeType !== 1 );

	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( !runtil.test( name ) ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

		if ( this.length > 1 && rparentsprev.test( name ) ) {
			ret = ret.reverse();
		}

		return this.pushStack( ret );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			jQuery.find.matches(expr, elems);
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

	// Can't pass null or undefined to indexOf in Firefox 4
	// Set to 0 to skip string check
	qualifier = qualifier || 0;

	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep(elements, function( elem, i ) {
			var retVal = !!qualifier.call( elem, i, elem );
			return retVal === keep;
		});

	} else if ( qualifier.nodeType ) {
		return jQuery.grep(elements, function( elem ) {
			return ( elem === qualifier ) === keep;
		});

	} else if ( typeof qualifier === "string" ) {
		var filtered = jQuery.grep(elements, function( elem ) {
			return elem.nodeType === 1;
		});

		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter(qualifier, filtered, !keep);
		} else {
			qualifier = jQuery.filter( qualifier, filtered );
		}
	}

	return jQuery.grep(elements, function( elem ) {
		return ( jQuery.inArray( elem, qualifier ) >= 0 ) === keep;
	});
}
function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
		safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
		"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
	rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
	rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
	rleadingWhitespace = /^\s+/,
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	rtagName = /<([\w:]+)/,
	rtbody = /<tbody/i,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style|link)/i,
	manipulation_rcheckableType = /^(?:checkbox|radio)$/i,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /^$|\/(?:java|ecma)script/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

	// We have to close these tags to support XHTML (#13200)
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		area: [ 1, "<map>", "</map>" ],
		param: [ 1, "<object>", "</object>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
		// unless wrapped in a div with non-breaking characters in front of it.
		_default: jQuery.support.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>"  ]
	},
	safeFragment = createSafeFragment( document ),
	fragmentDiv = safeFragment.appendChild( document.createElement("div") );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

jQuery.fn.extend({
	text: function( value ) {
		return jQuery.access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().append( ( this[0] && this[0].ownerDocument || document ).createTextNode( value ) );
		}, null, value, arguments.length );
	},

	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapAll( html.call(this, i) );
			});
		}

		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function(i) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	},

	append: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				this.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				this.insertBefore( elem, this.firstChild );
			}
		});
	},

	before: function() {
		return this.domManip( arguments, false, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		});
	},

	after: function() {
		return this.domManip( arguments, false, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		});
	},

	// keepData is for internal use only--do not document
	remove: function( selector, keepData ) {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			if ( !selector || jQuery.filter( selector, [ elem ] ).length > 0 ) {
				if ( !keepData && elem.nodeType === 1 ) {
					jQuery.cleanData( getAll( elem ) );
				}

				if ( elem.parentNode ) {
					if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
						setGlobalEval( getAll( elem, "script" ) );
					}
					elem.parentNode.removeChild( elem );
				}
			}
		}

		return this;
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem, false ) );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}

			// If this is a select, ensure that it displays empty (#12336)
			// Support: IE<9
			if ( elem.options && jQuery.nodeName( elem, "select" ) ) {
				elem.options.length = 0;
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		return jQuery.access( this, function( value ) {
			var elem = this[0] || {},
				i = 0,
				l = this.length;

			if ( value === undefined ) {
				return elem.nodeType === 1 ?
					elem.innerHTML.replace( rinlinejQuery, "" ) :
					undefined;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				( jQuery.support.htmlSerialize || !rnoshimcache.test( value )  ) &&
				( jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
				!wrapMap[ ( rtagName.exec( value ) || ["", ""] )[1].toLowerCase() ] ) {

				value = value.replace( rxhtmlTag, "<$1></$2>" );

				try {
					for (; i < l; i++ ) {
						// Remove element nodes and prevent memory leaks
						elem = this[i] || {};
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch(e) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function( value ) {
		var isFunc = jQuery.isFunction( value );

		// Make sure that the elements are removed from the DOM before they are inserted
		// this can help fix replacing a parent with child elements
		if ( !isFunc && typeof value !== "string" ) {
			value = jQuery( value ).not( this ).detach();
		}

		return this.domManip( [ value ], true, function( elem ) {
			var next = this.nextSibling,
				parent = this.parentNode;

			if ( parent ) {
				jQuery( this ).remove();
				parent.insertBefore( elem, next );
			}
		});
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, table, callback ) {

		// Flatten any nested arrays
		args = core_concat.apply( [], args );

		var first, node, hasScripts,
			scripts, doc, fragment,
			i = 0,
			l = this.length,
			set = this,
			iNoClone = l - 1,
			value = args[0],
			isFunction = jQuery.isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction || !( l <= 1 || typeof value !== "string" || jQuery.support.checkClone || !rchecked.test( value ) ) ) {
			return this.each(function( index ) {
				var self = set.eq( index );
				if ( isFunction ) {
					args[0] = value.call( this, index, table ? self.html() : undefined );
				}
				self.domManip( args, table, callback );
			});
		}

		if ( l ) {
			fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, this );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			if ( first ) {
				table = table && jQuery.nodeName( first, "tr" );
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call(
						table && jQuery.nodeName( this[i], "table" ) ?
							findOrAppend( this[i], "tbody" ) :
							this[i],
						node,
						i
					);
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!jQuery._data( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

							if ( node.src ) {
								// Hope ajax is available...
								jQuery.ajax({
									url: node.src,
									type: "GET",
									dataType: "script",
									async: false,
									global: false,
									"throws": true
								});
							} else {
								jQuery.globalEval( ( node.text || node.textContent || node.innerHTML || "" ).replace( rcleanScript, "" ) );
							}
						}
					}
				}

				// Fix #11809: Avoid leaking memory
				fragment = first = null;
			}
		}

		return this;
	}
});

function findOrAppend( elem, tag ) {
	return elem.getElementsByTagName( tag )[0] || elem.appendChild( elem.ownerDocument.createElement( tag ) );
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	var attr = elem.getAttributeNode("type");
	elem.type = ( attr && attr.specified ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );
	if ( match ) {
		elem.type = match[1];
	} else {
		elem.removeAttribute("type");
	}
	return elem;
}

// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var elem,
		i = 0;
	for ( ; (elem = elems[i]) != null; i++ ) {
		jQuery._data( elem, "globalEval", !refElements || jQuery._data( refElements[i], "globalEval" ) );
	}
}

function cloneCopyEvent( src, dest ) {

	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type, events[ type ][ i ] );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function fixCloneNodeIssues( src, dest ) {
	var nodeName, e, data;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	nodeName = dest.nodeName.toLowerCase();

	// IE6-8 copies events bound via attachEvent when using cloneNode.
	if ( !jQuery.support.noCloneEvent && dest[ jQuery.expando ] ) {
		data = jQuery._data( dest );

		for ( e in data.events ) {
			jQuery.removeEvent( dest, e, data.handle );
		}

		// Event data gets referenced instead of copied if the expando gets copied too
		dest.removeAttribute( jQuery.expando );
	}

	// IE blanks contents when cloning scripts, and tries to evaluate newly-set text
	if ( nodeName === "script" && dest.text !== src.text ) {
		disableScript( dest ).text = src.text;
		restoreScript( dest );

	// IE6-10 improperly clones children of object elements using classid.
	// IE10 throws NoModificationAllowedError if parent is null, #12132.
	} else if ( nodeName === "object" ) {
		if ( dest.parentNode ) {
			dest.outerHTML = src.outerHTML;
		}

		// This path appears unavoidable for IE9. When cloning an object
		// element in IE9, the outerHTML strategy above is not sufficient.
		// If the src has innerHTML and the destination does not,
		// copy the src.innerHTML into the dest.innerHTML. #10324
		if ( jQuery.support.html5Clone && ( src.innerHTML && !jQuery.trim(dest.innerHTML) ) ) {
			dest.innerHTML = src.innerHTML;
		}

	} else if ( nodeName === "input" && manipulation_rcheckableType.test( src.type ) ) {
		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set

		dest.defaultChecked = dest.checked = src.checked;

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.defaultSelected = dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			i = 0,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone(true);
			jQuery( insert[i] )[ original ]( elems );

			// Modern browsers can apply jQuery collections as arrays, but oldIE needs a .get()
			core_push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
});

function getAll( context, tag ) {
	var elems, elem,
		i = 0,
		found = typeof context.getElementsByTagName !== core_strundefined ? context.getElementsByTagName( tag || "*" ) :
			typeof context.querySelectorAll !== core_strundefined ? context.querySelectorAll( tag || "*" ) :
			undefined;

	if ( !found ) {
		for ( found = [], elems = context.childNodes || context; (elem = elems[i]) != null; i++ ) {
			if ( !tag || jQuery.nodeName( elem, tag ) ) {
				found.push( elem );
			} else {
				jQuery.merge( found, getAll( elem, tag ) );
			}
		}
	}

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], found ) :
		found;
}

// Used in buildFragment, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
	if ( manipulation_rcheckableType.test( elem.type ) ) {
		elem.defaultChecked = elem.checked;
	}
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var destElements, node, clone, i, srcElements,
			inPage = jQuery.contains( elem.ownerDocument, elem );

		if ( jQuery.support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {
			clone = elem.cloneNode( true );

		// IE<=8 does not properly clone detached, unknown element nodes
		} else {
			fragmentDiv.innerHTML = elem.outerHTML;
			fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
		}

		if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			// Fix all IE cloning issues
			for ( i = 0; (node = srcElements[i]) != null; ++i ) {
				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[i] ) {
					fixCloneNodeIssues( node, destElements[i] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0; (node = srcElements[i]) != null; i++ ) {
					cloneCopyEvent( node, destElements[i] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		destElements = srcElements = node = null;

		// Return the cloned set
		return clone;
	},

	buildFragment: function( elems, context, scripts, selection ) {
		var j, elem, contains,
			tmp, tag, tbody, wrap,
			l = elems.length,

			// Ensure a safe fragment
			safe = createSafeFragment( context ),

			nodes = [],
			i = 0;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || safe.appendChild( context.createElement("div") );

					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;

					tmp.innerHTML = wrap[1] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[2];

					// Descend through wrappers to the right content
					j = wrap[0];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}

					// Manually add leading whitespace removed by IE
					if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
						nodes.push( context.createTextNode( rleadingWhitespace.exec( elem )[0] ) );
					}

					// Remove IE's autoinserted <tbody> from table fragments
					if ( !jQuery.support.tbody ) {

						// String was a <table>, *may* have spurious <tbody>
						elem = tag === "table" && !rtbody.test( elem ) ?
							tmp.firstChild :

							// String was a bare <thead> or <tfoot>
							wrap[1] === "<table>" && !rtbody.test( elem ) ?
								tmp :
								0;

						j = elem && elem.childNodes.length;
						while ( j-- ) {
							if ( jQuery.nodeName( (tbody = elem.childNodes[j]), "tbody" ) && !tbody.childNodes.length ) {
								elem.removeChild( tbody );
							}
						}
					}

					jQuery.merge( nodes, tmp.childNodes );

					// Fix #12392 for WebKit and IE > 9
					tmp.textContent = "";

					// Fix #12392 for oldIE
					while ( tmp.firstChild ) {
						tmp.removeChild( tmp.firstChild );
					}

					// Remember the top-level container for proper cleanup
					tmp = safe.lastChild;
				}
			}
		}

		// Fix #11356: Clear elements from fragment
		if ( tmp ) {
			safe.removeChild( tmp );
		}

		// Reset defaultChecked for any radios and checkboxes
		// about to be appended to the DOM in IE 6/7 (#8060)
		if ( !jQuery.support.appendChecked ) {
			jQuery.grep( getAll( nodes, "input" ), fixDefaultChecked );
		}

		i = 0;
		while ( (elem = nodes[ i++ ]) ) {

			// #4087 - If origin and destination elements are the same, and this is
			// that element, do not do anything
			if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
				continue;
			}

			contains = jQuery.contains( elem.ownerDocument, elem );

			// Append to fragment
			tmp = getAll( safe.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( (elem = tmp[ j++ ]) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		tmp = null;

		return safe;
	},

	cleanData: function( elems, /* internal */ acceptData ) {
		var elem, type, id, data,
			i = 0,
			internalKey = jQuery.expando,
			cache = jQuery.cache,
			deleteExpando = jQuery.support.deleteExpando,
			special = jQuery.event.special;

		for ( ; (elem = elems[i]) != null; i++ ) {

			if ( acceptData || jQuery.acceptData( elem ) ) {

				id = elem[ internalKey ];
				data = id && cache[ id ];

				if ( data ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Remove cache only if it was not already removed by jQuery.event.remove
					if ( cache[ id ] ) {

						delete cache[ id ];

						// IE does not allow us to delete expando properties from nodes,
						// nor does it have a removeAttribute function on Document nodes;
						// we must handle all of these cases
						if ( deleteExpando ) {
							delete elem[ internalKey ];

						} else if ( typeof elem.removeAttribute !== core_strundefined ) {
							elem.removeAttribute( internalKey );

						} else {
							elem[ internalKey ] = null;
						}

						core_deletedIds.push( id );
					}
				}
			}
		}
	}
});
var iframe, getStyles, curCSS,
	ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity\s*=\s*([^)]*)/,
	rposition = /^(top|right|bottom|left)$/,
	// swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rmargin = /^margin/,
	rnumsplit = new RegExp( "^(" + core_pnum + ")(.*)$", "i" ),
	rnumnonpx = new RegExp( "^(" + core_pnum + ")(?!px)[a-z%]+$", "i" ),
	rrelNum = new RegExp( "^([+-])=(" + core_pnum + ")", "i" ),
	elemdisplay = { BODY: "block" },

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: 0,
		fontWeight: 400
	},

	cssExpand = [ "Top", "Right", "Bottom", "Left" ],
	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];

// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in style ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt(0).toUpperCase() + name.slice(1),
		origName = name,
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in style ) {
			return name;
		}
	}

	return origName;
}

function isHidden( elem, el ) {
	// isHidden might be called from jQuery#filter function;
	// in that case, element will be second argument
	elem = el || elem;
	return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = jQuery._data( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {
			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = jQuery._data( elem, "olddisplay", css_defaultDisplay(elem.nodeName) );
			}
		} else {

			if ( !values[ index ] ) {
				hidden = isHidden( elem );

				if ( display && display !== "none" || !hidden ) {
					jQuery._data( elem, "olddisplay", hidden ? display : jQuery.css( elem, "display" ) );
				}
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.fn.extend({
	css: function( name, value ) {
		return jQuery.access( this, function( elem, name, value ) {
			var len, styles,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		var bool = typeof state === "boolean";

		return this.each(function() {
			if ( bool ? state : isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		});
	}
});

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Exclude the following css properties to add px
	cssNumber: {
		"columnCount": true,
		"fillOpacity": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that NaN and null values aren't set. See: #7116
			if ( value == null || type === "number" && isNaN( value ) ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// Fixes #8908, it can be done more correctly by specifing setters in cssHooks,
			// but it would mean to define eight (for every problematic property) identical functions
			if ( !jQuery.support.clearCloneStyle && value === "" && name.indexOf("background") === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {

				// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
				// Fixes bug #5509
				try {
					style[ name ] = value;
				} catch(e) {}
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var num, val, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
		}
		return val;
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations
	swap: function( elem, options, callback, args ) {
		var ret, name,
			old = {};

		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		ret = callback.apply( elem, args || [] );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}

		return ret;
	}
});

// NOTE: we've included the "window" in window.getComputedStyle
// because jsdom on node.js will break without it.
if ( window.getComputedStyle ) {
	getStyles = function( elem ) {
		return window.getComputedStyle( elem, null );
	};

	curCSS = function( elem, name, _computed ) {
		var width, minWidth, maxWidth,
			computed = _computed || getStyles( elem ),

			// getPropertyValue is only needed for .css('filter') in IE9, see #12537
			ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined,
			style = elem.style;

		if ( computed ) {

			if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
				ret = jQuery.style( elem, name );
			}

			// A tribute to the "awesome hack by Dean Edwards"
			// Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
			// Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
			// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
			if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		return ret;
	};
} else if ( document.documentElement.currentStyle ) {
	getStyles = function( elem ) {
		return elem.currentStyle;
	};

	curCSS = function( elem, name, _computed ) {
		var left, rs, rsLeft,
			computed = _computed || getStyles( elem ),
			ret = computed ? computed[ name ] : undefined,
			style = elem.style;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret == null && style && style[ name ] ) {
			ret = style[ name ];
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		// but not position css attributes, as those are proportional to the parent element instead
		// and we can't measure the parent instead because it might trigger a "stacking dolls" problem
		if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

			// Remember the original values
			left = style.left;
			rs = elem.runtimeStyle;
			rsLeft = rs && rs.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				rs.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ret;
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				rs.left = rsLeft;
			}
		}

		return ret === "" ? "auto" : ret;
	};
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?
		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {
		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {
			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {
			// at this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox && ( jQuery.support.boxSizingReliable || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

// Try to determine the default display value of an element
function css_defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {
			// Use the already-created iframe if possible
			iframe = ( iframe ||
				jQuery("<iframe frameborder='0' width='0' height='0'/>")
				.css( "cssText", "display:block !important" )
			).appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = ( iframe[0].contentWindow || iframe[0].contentDocument ).document;
			doc.write("<!doctype html><html><body>");
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}

// Called ONLY from within css_defaultDisplay
function actualDisplay( name, doc ) {
	var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),
		display = jQuery.css( elem[0], "display" );
	elem.remove();
	return display;
}

jQuery.each([ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {
				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				return elem.offsetWidth === 0 && rdisplayswap.test( jQuery.css( elem, "display" ) ) ?
					jQuery.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					}) :
					getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
});

if ( !jQuery.support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {
			// IE uses filters for opacity
			return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
				( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
				computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
			// if value === "", then remove inline opacity #12685
			if ( ( value >= 1 || value === "" ) &&
					jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
					style.removeAttribute ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there is no filter style applied in a css rule or unset inline opacity, we are done
				if ( value === "" || currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

// These hooks cannot be added until DOM ready because the support test
// for it is not run until after DOM ready
jQuery(function() {
	if ( !jQuery.support.reliableMarginRight ) {
		jQuery.cssHooks.marginRight = {
			get: function( elem, computed ) {
				if ( computed ) {
					// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
					// Work around by temporarily setting element display to inline-block
					return jQuery.swap( elem, { "display": "inline-block" },
						curCSS, [ elem, "marginRight" ] );
				}
			}
		};
	}

	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// getComputedStyle returns percent when specified for top/left/bottom/right
	// rather than make the css module depend on the offset module, we just check for it here
	if ( !jQuery.support.pixelPosition && jQuery.fn.position ) {
		jQuery.each( [ "top", "left" ], function( i, prop ) {
			jQuery.cssHooks[ prop ] = {
				get: function( elem, computed ) {
					if ( computed ) {
						computed = curCSS( elem, prop );
						// if curCSS returns percentage, fallback to offset
						return rnumnonpx.test( computed ) ?
							jQuery( elem ).position()[ prop ] + "px" :
							computed;
					}
				}
			};
		});
	}

});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		// Support: Opera <= 12.12
		// Opera reports offsetWidths and offsetHeights less than zero on some elements
		return elem.offsetWidth <= 0 && elem.offsetHeight <= 0 ||
			(!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || jQuery.css( elem, "display" )) === "none");
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}

// These hooks are used by animate to expand properties
jQuery.each({
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
});
var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

jQuery.fn.extend({
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map(function(){
			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		})
		.filter(function(){
			var type = this.type;
			// Use .is(":disabled") so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !manipulation_rcheckableType.test( type ) );
		})
		.map(function( i, elem ){
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ){
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});

//Serialize an array of form elements or a set of
//key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// Item is non-scalar (array or object), encode its numeric index.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}
jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
});

jQuery.fn.hover = function( fnOver, fnOut ) {
	return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
};
var
	// Document location
	ajaxLocParts,
	ajaxLocation,
	ajax_nonce = jQuery.now(),

	ajax_rquery = /\?/,
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,

	// Keep a copy of the old load method
	_load = jQuery.fn.load,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat("*");

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( core_rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			while ( (dataType = dataTypes[i++]) ) {
				// Prepend if requested
				if ( dataType[0] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					(structure[ dataType ] = structure[ dataType ] || []).unshift( func );

				// Otherwise append
				} else {
					(structure[ dataType ] = structure[ dataType ] || []).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		});
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var deep, key,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, response, type,
		self = this,
		off = url.indexOf(" ");

	if ( off >= 0 ) {
		selector = url.slice( off, url.length );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax({
			url: url,

			// if "type" variable is undefined, then "GET" method will be used
			type: type,
			dataType: "html",
			data: params
		}).done(function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		}).complete( callback && function( jqXHR, status ) {
			self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
		});
	}

	return this;
};

// Attach a bunch of functions for handling common AJAX events
jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ){
	jQuery.fn[ type ] = function( fn ){
		return this.on( type, fn );
	};
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		});
	};
});

jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": window.String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // Cross-domain detection vars
			parts,
			// Loop variable
			i,
			// URL without anti-cache param
			cacheURL,
			// Response headers as string
			responseHeadersString,
			// timeout handle
			timeoutTimer,

			// To know if global events are to be dispatched
			fireGlobals,

			transport,
			// Response headers
			responseHeaders,
			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
				jQuery( callbackContext ) :
				jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks("once memory"),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( (match = rheaders.exec( responseHeadersString )) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {
								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {
							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( core_rnotwhite ) || [""];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger("ajaxStart");
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + ajax_nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ajax_nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
			// Abort if not done already and return
			return jqXHR.abort();
		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout(function() {
					jqXHR.abort("timeout");
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// If successful, handle type chaining
			if ( status >= 200 && status < 300 || status === 304 ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader("etag");
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 ) {
					isSuccess = true;
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					isSuccess = true;
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					isSuccess = ajaxConvert( s, response );
					statusText = isSuccess.state;
					success = isSuccess.data;
					error = isSuccess.error;
					isSuccess = !error;
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger("ajaxStop");
				}
			}
		}

		return jqXHR;
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	}
});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {
	var firstDataType, ct, finalDataType, type,
		contents = s.contents,
		dataTypes = s.dataTypes,
		responseFields = s.responseFields;

	// Fill responseXXX fields
	for ( type in responseFields ) {
		if ( type in responses ) {
			jqXHR[ responseFields[type] ] = responses[ type ];
		}
	}

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {
	var conv2, current, conv, tmp,
		converters = {},
		i = 0,
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice(),
		prev = dataTypes[ 0 ];

	// Apply the dataFilter if provided
	if ( s.dataFilter ) {
		response = s.dataFilter( response, s.dataType );
	}

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	// Convert to each sequential dataType, tolerating list modification
	for ( ; (current = dataTypes[++i]); ) {

		// There's only work to do if current dataType is non-auto
		if ( current !== "*" ) {

			// Convert response if prev dataType is non-auto and differs from current
			if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split(" ");
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.splice( i--, 0, current );
								}

								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s["throws"] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}

			// Update prev for next iteration
			prev = current;
		}
	}

	return { state: "success", data: response };
}
// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /(?:java|ecma)script/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || jQuery("head")[0] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement("script");

				script.async = true;

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( script.parentNode ) {
							script.parentNode.removeChild( script );
						}

						// Dereference the script
						script = null;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};

				// Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending
				// Use native DOM manipulation to avoid our domManip AJAX trickery
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( undefined, true );
				}
			}
		};
	}
});
var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( ajax_nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( ajax_rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});
var xhrCallbacks, xhrSupported,
	xhrId = 0,
	// #5280: Internet Explorer will keep connections alive if we don't abort on unload
	xhrOnUnloadAbort = window.ActiveXObject && function() {
		// Abort all pending requests
		var key;
		for ( key in xhrCallbacks ) {
			xhrCallbacks[ key ]( undefined, true );
		}
	};

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject("Microsoft.XMLHTTP");
	} catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
	/* Microsoft failed to properly
	 * implement the XMLHttpRequest in IE7 (can't request local files),
	 * so we use the ActiveXObject when it is available
	 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
	 * we need a fallback.
	 */
	function() {
		return !this.isLocal && createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

// Determine support properties
xhrSupported = jQuery.ajaxSettings.xhr();
jQuery.support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
xhrSupported = jQuery.support.ajax = !!xhrSupported;

// Create transport if the browser can provide an xhr
if ( xhrSupported ) {

	jQuery.ajaxTransport(function( s ) {
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !s.crossDomain || jQuery.support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {

					// Get a new xhr
					var handle, i,
						xhr = s.xhr();

					// Open the socket
					// Passing null username, generates a login popup on Opera (#2865)
					if ( s.username ) {
						xhr.open( s.type, s.url, s.async, s.username, s.password );
					} else {
						xhr.open( s.type, s.url, s.async );
					}

					// Apply custom fields if provided
					if ( s.xhrFields ) {
						for ( i in s.xhrFields ) {
							xhr[ i ] = s.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( s.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( s.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !s.crossDomain && !headers["X-Requested-With"] ) {
						headers["X-Requested-With"] = "XMLHttpRequest";
					}

					// Need an extra try/catch for cross domain requests in Firefox 3
					try {
						for ( i in headers ) {
							xhr.setRequestHeader( i, headers[ i ] );
						}
					} catch( err ) {}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( s.hasContent && s.data ) || null );

					// Listener
					callback = function( _, isAbort ) {
						var status, responseHeaders, statusText, responses;

						// Firefox throws exceptions when accessing properties
						// of an xhr when a network error occurred
						// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
						try {

							// Was never called and is aborted or complete
							if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

								// Only called once
								callback = undefined;

								// Do not keep as active anymore
								if ( handle ) {
									xhr.onreadystatechange = jQuery.noop;
									if ( xhrOnUnloadAbort ) {
										delete xhrCallbacks[ handle ];
									}
								}

								// If it's an abort
								if ( isAbort ) {
									// Abort it manually if needed
									if ( xhr.readyState !== 4 ) {
										xhr.abort();
									}
								} else {
									responses = {};
									status = xhr.status;
									responseHeaders = xhr.getAllResponseHeaders();

									// When requesting binary data, IE6-9 will throw an exception
									// on any attempt to access responseText (#11426)
									if ( typeof xhr.responseText === "string" ) {
										responses.text = xhr.responseText;
									}

									// Firefox throws an exception when accessing
									// statusText for faulty cross-domain requests
									try {
										statusText = xhr.statusText;
									} catch( e ) {
										// We normalize with Webkit giving an empty statusText
										statusText = "";
									}

									// Filter status for non standard behaviors

									// If the request is local and we have data: assume a success
									// (success with no data won't get notified, that's the best we
									// can do given current implementations)
									if ( !status && s.isLocal && !s.crossDomain ) {
										status = responses.text ? 200 : 404;
									// IE - #1450: sometimes returns 1223 when it should be 204
									} else if ( status === 1223 ) {
										status = 204;
									}
								}
							}
						} catch( firefoxAccessException ) {
							if ( !isAbort ) {
								complete( -1, firefoxAccessException );
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, responseHeaders );
						}
					};

					if ( !s.async ) {
						// if we're in sync mode we fire the callback
						callback();
					} else if ( xhr.readyState === 4 ) {
						// (IE6 & IE7) if it's in cache and has been
						// retrieved directly we need to fire the callback
						setTimeout( callback );
					} else {
						handle = ++xhrId;
						if ( xhrOnUnloadAbort ) {
							// Create the active xhrs callbacks list if needed
							// and attach the unload handler
							if ( !xhrCallbacks ) {
								xhrCallbacks = {};
								jQuery( window ).unload( xhrOnUnloadAbort );
							}
							// Add to list of active xhrs callbacks
							xhrCallbacks[ handle ] = callback;
						}
						xhr.onreadystatechange = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback( undefined, true );
					}
				}
			};
		}
	});
}
var fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = new RegExp( "^(?:([+-])=|)(" + core_pnum + ")([a-z%]*)$", "i" ),
	rrun = /queueHooks$/,
	animationPrefilters = [ defaultPrefilter ],
	tweeners = {
		"*": [function( prop, value ) {
			var end, unit,
				tween = this.createTween( prop, value ),
				parts = rfxnum.exec( value ),
				target = tween.cur(),
				start = +target || 0,
				scale = 1,
				maxIterations = 20;

			if ( parts ) {
				end = +parts[2];
				unit = parts[3] || ( jQuery.cssNumber[ prop ] ? "" : "px" );

				// We need to compute starting value
				if ( unit !== "px" && start ) {
					// Iteratively approximate from a nonzero starting point
					// Prefer the current property, because this process will be trivial if it uses the same units
					// Fallback to end or a simple constant
					start = jQuery.css( tween.elem, prop, true ) || end || 1;

					do {
						// If previous iteration zeroed out, double until we get *something*
						// Use a string for doubling factor so we don't accidentally see scale as unchanged below
						scale = scale || ".5";

						// Adjust and apply
						start = start / scale;
						jQuery.style( tween.elem, prop, start + unit );

					// Update scale, tolerating zero or NaN from tween.cur()
					// And breaking the loop if scale is unchanged or perfect, or if we've just had enough
					} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
				}

				tween.unit = unit;
				tween.start = start;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[1] ? start + ( parts[1] + 1 ) * end : end;
			}
			return tween;
		}]
	};

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout(function() {
		fxNow = undefined;
	});
	return ( fxNow = jQuery.now() );
}

function createTweens( animation, props ) {
	jQuery.each( props, function( prop, value ) {
		var collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
			index = 0,
			length = collection.length;
		for ( ; index < length; index++ ) {
			if ( collection[ index ].call( animation, prop, value ) ) {

				// we're done with this property
				return;
			}
		}
	});
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = animationPrefilters.length,
		deferred = jQuery.Deferred().always( function() {
			// don't match elem in the :animated selector
			delete tick.elem;
		}),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
				// archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ]);

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise({
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, { specialEasing: {} }, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,
					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		}),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			return result;
		}
	}

	createTweens( animation, props );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		})
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

function propFilter( props, specialEasing ) {
	var value, name, index, easing, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

jQuery.Animation = jQuery.extend( Animation, {

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.split(" ");
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			tweeners[ prop ] = tweeners[ prop ] || [];
			tweeners[ prop ].unshift( callback );
		}
	},

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			animationPrefilters.unshift( callback );
		} else {
			animationPrefilters.push( callback );
		}
	}
});

function defaultPrefilter( elem, props, opts ) {
	/*jshint validthis:true */
	var prop, index, length,
		value, dataShow, toggle,
		tween, hooks, oldfire,
		anim = this,
		style = elem.style,
		orig = {},
		handled = [],
		hidden = elem.nodeType && isHidden( elem );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always(function() {
			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always(function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			});
		});
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE does not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		if ( jQuery.css( elem, "display" ) === "inline" &&
				jQuery.css( elem, "float" ) === "none" ) {

			// inline-level elements accept inline-block;
			// block-level elements need to be inline with layout
			if ( !jQuery.support.inlineBlockNeedsLayout || css_defaultDisplay( elem.nodeName ) === "inline" ) {
				style.display = "inline-block";

			} else {
				style.zoom = 1;
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		if ( !jQuery.support.shrinkWrapBlocks ) {
			anim.always(function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			});
		}
	}


	// show/hide pass
	for ( index in props ) {
		value = props[ index ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ index ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {
				continue;
			}
			handled.push( index );
		}
	}

	length = handled.length;
	if ( length ) {
		dataShow = jQuery._data( elem, "fxshow" ) || jQuery._data( elem, "fxshow", {} );
		if ( "hidden" in dataShow ) {
			hidden = dataShow.hidden;
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done(function() {
				jQuery( elem ).hide();
			});
		}
		anim.done(function() {
			var prop;
			jQuery._removeData( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		});
		for ( index = 0 ; index < length ; index++ ) {
			prop = handled[ index ];
			tween = anim.createTween( prop, hidden ? dataShow[ prop ] : 0 );
			orig[ prop ] = dataShow[ prop ] || jQuery.style( elem, prop );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}
	}
}

function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || "swing";
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			if ( tween.elem[ tween.prop ] != null &&
				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
				return tween.elem[ tween.prop ];
			}

			// passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, "" );
			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {
			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Remove in 2.0 - this supports IE8's panic based approach
// to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
});

jQuery.fn.extend({
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );
				doAnimation.finish = function() {
					anim.stop( true );
				};
				// Empty animations, or finishing resolves immediately
				if ( empty || jQuery._data( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = jQuery._data( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each(function() {
			var index,
				data = jQuery._data( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// enable finishing flag on private data
			data.finish = true;

			// empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.cur && hooks.cur.finish ) {
				hooks.cur.finish.call( this );
			}

			// look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// turn off finishing flag
			delete data.finish;
		});
	}
});

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		attrs = { height: type },
		i = 0;

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth? 1 : 0;
	for( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show"),
	slideUp: genFx("hide"),
	slideToggle: genFx("toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p*Math.PI ) / 2;
	}
};

jQuery.timers = [];
jQuery.fx = Tween.prototype.init;
jQuery.fx.tick = function() {
	var timer,
		timers = jQuery.timers,
		i = 0;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];
		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	if ( timer() && jQuery.timers.push( timer ) ) {
		jQuery.fx.start();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,
	// Default speed
	_default: 400
};

// Back Compat <1.8 extension point
jQuery.fx.step = {};

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}
jQuery.fn.offset = function( options ) {
	if ( arguments.length ) {
		return options === undefined ?
			this :
			this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
	}

	var docElem, win,
		box = { top: 0, left: 0 },
		elem = this[ 0 ],
		doc = elem && elem.ownerDocument;

	if ( !doc ) {
		return;
	}

	docElem = doc.documentElement;

	// Make sure it's not a disconnected DOM node
	if ( !jQuery.contains( docElem, elem ) ) {
		return box;
	}

	// If we don't have gBCR, just use 0,0 rather than error
	// BlackBerry 5, iOS 3 (original iPhone)
	if ( typeof elem.getBoundingClientRect !== core_strundefined ) {
		box = elem.getBoundingClientRect();
	}
	win = getWindow( doc );
	return {
		top: box.top  + ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),
		left: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )
	};
};

jQuery.offset = {

	setOffset: function( elem, options, i ) {
		var position = jQuery.css( elem, "position" );

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		var curElem = jQuery( elem ),
			curOffset = curElem.offset(),
			curCSSTop = jQuery.css( elem, "top" ),
			curCSSLeft = jQuery.css( elem, "left" ),
			calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
			props = {}, curPosition = {}, curTop, curLeft;

		// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			parentOffset = { top: 0, left: 0 },
			elem = this[ 0 ];

		// fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {
			// we assume that getBoundingClientRect is available when computed position is fixed
			offset = elem.getBoundingClientRect();
		} else {
			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top  += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		return {
			top:  offset.top  - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true)
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || document.documentElement;
			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position") === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || document.documentElement;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( {scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function( method, prop ) {
	var top = /Y/.test( prop );

	jQuery.fn[ method ] = function( val ) {
		return jQuery.access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? (prop in win) ? win[ prop ] :
					win.document.documentElement[ method ] :
					elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : jQuery( win ).scrollLeft(),
					top ? val : jQuery( win ).scrollTop()
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}
// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return jQuery.access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
					// unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});
// Limit scope pollution from any deprecated API
// (function() {

// })();

// Expose for component
module.exports = jQuery;

// Expose jQuery to the global object
//window.jQuery = window.$ = jQuery;

// Expose jQuery as an AMD module, but only for AMD loaders that
// understand the issues with loading multiple versions of jQuery
// in a page that all might call define(). The loader will indicate
// they have special allowances for multiple jQuery versions by
// specifying define.amd.jQuery = true. Register as a named module,
// since jQuery can be concatenated with other files that may use define,
// but not use a proper concatenation script that understands anonymous
// AMD modules. A named AMD is safest and most robust way to register.
// Lowercase jquery is used because AMD module names are derived from
// file names, and jQuery is normally delivered in a lowercase file name.
// Do this after creating the global so that if an AMD module wants to call
// noConflict to hide this version of jQuery, it will work.
if ( typeof define === "function" && define.amd && define.amd.jQuery ) {
	define( "jquery", [], function () { return jQuery; } );
}

})( window );

});
require.register("rstacruz-nprogress/nprogress.js", function(exports, require, module){
/*! NProgress (c) 2013, Rico Sta. Cruz
 *  http://ricostacruz.com/nprogress */

;(function(factory) {

  if (typeof module === 'function') {
    module.exports = factory(this.jQuery || require('jquery'));
  } else if (typeof define === 'function' && define.amd) {
    define(['jquery'], function($) {
      return factory($);
    });
  } else {
    this.NProgress = factory(this.jQuery);
  }

})(function($) {
  var NProgress = {};

  NProgress.version = '0.1.2';

  var Settings = NProgress.settings = {
    minimum: 0.08,
    easing: 'ease',
    positionUsing: '',
    speed: 200,
    trickle: true,
    trickleRate: 0.02,
    trickleSpeed: 800,
    showSpinner: true,
    template: '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
  };

  /**
   * Updates configuration.
   *
   *     NProgress.configure({
   *       minimum: 0.1
   *     });
   */
  NProgress.configure = function(options) {
    $.extend(Settings, options);
    return this;
  };

  /**
   * Last number.
   */

  NProgress.status = null;

  /**
   * Sets the progress bar status, where `n` is a number from `0.0` to `1.0`.
   *
   *     NProgress.set(0.4);
   *     NProgress.set(1.0);
   */

  NProgress.set = function(n) {
    var started = NProgress.isStarted();

    n = clamp(n, Settings.minimum, 1);
    NProgress.status = (n === 1 ? null : n);

    var $progress = NProgress.render(!started),
        $bar      = $progress.find('[role="bar"]'),
        speed     = Settings.speed,
        ease      = Settings.easing;

    $progress[0].offsetWidth; /* Repaint */

    $progress.queue(function(next) {
      // Set positionUsing if it hasn't already been set
      if (Settings.positionUsing === '') Settings.positionUsing = NProgress.getPositioningCSS();

      // Add transition
      $bar.css(barPositionCSS(n, speed, ease));

      if (n === 1) {
        // Fade out
        $progress.css({ transition: 'none', opacity: 1 });
        $progress[0].offsetWidth; /* Repaint */

        setTimeout(function() {
          $progress.css({ transition: 'all '+speed+'ms linear', opacity: 0 });
          setTimeout(function() {
            NProgress.remove();
            next();
          }, speed);
        }, speed);
      } else {
        setTimeout(next, speed);
      }
    });

    return this;
  };

  NProgress.isStarted = function() {
    return typeof NProgress.status === 'number';
  };

  /**
   * Shows the progress bar.
   * This is the same as setting the status to 0%, except that it doesn't go backwards.
   *
   *     NProgress.start();
   *
   */
  NProgress.start = function() {
    if (!NProgress.status) NProgress.set(0);

    var work = function() {
      setTimeout(function() {
        if (!NProgress.status) return;
        NProgress.trickle();
        work();
      }, Settings.trickleSpeed);
    };

    if (Settings.trickle) work();

    return this;
  };

  /**
   * Hides the progress bar.
   * This is the *sort of* the same as setting the status to 100%, with the
   * difference being `done()` makes some placebo effect of some realistic motion.
   *
   *     NProgress.done();
   *
   * If `true` is passed, it will show the progress bar even if its hidden.
   *
   *     NProgress.done(true);
   */

  NProgress.done = function(force) {
    if (!force && !NProgress.status) return this;

    return NProgress.inc(0.3 + 0.5 * Math.random()).set(1);
  };

  /**
   * Increments by a random amount.
   */

  NProgress.inc = function(amount) {
    var n = NProgress.status;

    if (!n) {
      return NProgress.start();
    } else {
      if (typeof amount !== 'number') {
        amount = (1 - n) * clamp(Math.random() * n, 0.1, 0.95);
      }

      n = clamp(n + amount, 0, 0.994);
      return NProgress.set(n);
    }
  };

  NProgress.trickle = function() {
    return NProgress.inc(Math.random() * Settings.trickleRate);
  };

  /**
   * (Internal) renders the progress bar markup based on the `template`
   * setting.
   */

  NProgress.render = function(fromStart) {
    if (NProgress.isRendered()) return $("#nprogress");
    $('html').addClass('nprogress-busy');

    var $el = $("<div id='nprogress'>")
      .html(Settings.template);

    var perc = fromStart ? '-100' : toBarPerc(NProgress.status || 0);

    $el.find('[role="bar"]').css({
      transition: 'all 0 linear',
      transform: 'translate3d('+perc+'%,0,0)'
    });

    if (!Settings.showSpinner)
      $el.find('[role="spinner"]').remove();

    $el.appendTo(document.body);

    return $el;
  };

  /**
   * Removes the element. Opposite of render().
   */

  NProgress.remove = function() {
    $('html').removeClass('nprogress-busy');
    $('#nprogress').remove();
  };

  /**
   * Checks if the progress bar is rendered.
   */

  NProgress.isRendered = function() {
    return ($("#nprogress").length > 0);
  };

  /**
   * Determine which positioning CSS rule to use.
   */

  NProgress.getPositioningCSS = function() {
    // Sniff on document.body.style
    var bodyStyle = document.body.style;

    // Sniff prefixes
    var vendorPrefix = ('WebkitTransform' in bodyStyle) ? 'Webkit' :
                       ('MozTransform' in bodyStyle) ? 'Moz' :
                       ('msTransform' in bodyStyle) ? 'ms' :
                       ('OTransform' in bodyStyle) ? 'O' : '';

    if (vendorPrefix + 'Perspective' in bodyStyle) {
      // Modern browsers with 3D support, e.g. Webkit, IE10
      return 'translate3d';
    } else if (vendorPrefix + 'Transform' in bodyStyle) {
      // Browsers without 3D support, e.g. IE9
      return 'translate';
    } else {
      // Browsers without translate() support, e.g. IE7-8
      return 'margin';
    }
  };

  /**
   * Helpers
   */

  function clamp(n, min, max) {
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }

  /**
   * (Internal) converts a percentage (`0..1`) to a bar translateX
   * percentage (`-100%..0%`).
   */

  function toBarPerc(n) {
    return (-1 + n) * 100;
  }


  /**
   * (Internal) returns the correct CSS for changing the bar's
   * position given an n percentage, and speed and ease from Settings
   */

  function barPositionCSS(n, speed, ease) {
    var barCSS;

    if (Settings.positionUsing === 'translate3d') {
      barCSS = { transform: 'translate3d('+toBarPerc(n)+'%,0,0)' };
    } else if (Settings.positionUsing === 'translate') {
      barCSS = { transform: 'translate('+toBarPerc(n)+'%,0)' };
    } else {
      barCSS = { 'margin-left': toBarPerc(n)+'%' };
    }

    barCSS.transition = 'all '+speed+'ms '+ease;

    return barCSS;
  }

  return NProgress;
});


});
require.register("marksteve-sjcl/sjcl.js", function(exports, require, module){
"use strict";function q(a){throw a;}var t=void 0,u=!1;var sjcl={cipher:{},hash:{},keyexchange:{},mode:{},misc:{},codec:{},exception:{corrupt:function(a){this.toString=function(){return"CORRUPT: "+this.message};this.message=a},invalid:function(a){this.toString=function(){return"INVALID: "+this.message};this.message=a},bug:function(a){this.toString=function(){return"BUG: "+this.message};this.message=a},notReady:function(a){this.toString=function(){return"NOT READY: "+this.message};this.message=a}}};
"undefined"!=typeof module&&module.exports&&(module.exports=sjcl);
sjcl.cipher.aes=function(a){this.j[0][0][0]||this.D();var b,c,d,e,f=this.j[0][4],g=this.j[1];b=a.length;var h=1;4!==b&&(6!==b&&8!==b)&&q(new sjcl.exception.invalid("invalid aes key size"));this.a=[d=a.slice(0),e=[]];for(a=b;a<4*b+28;a++){c=d[a-1];if(0===a%b||8===b&&4===a%b)c=f[c>>>24]<<24^f[c>>16&255]<<16^f[c>>8&255]<<8^f[c&255],0===a%b&&(c=c<<8^c>>>24^h<<24,h=h<<1^283*(h>>7));d[a]=d[a-b]^c}for(b=0;a;b++,a--)c=d[b&3?a:a-4],e[b]=4>=a||4>b?c:g[0][f[c>>>24]]^g[1][f[c>>16&255]]^g[2][f[c>>8&255]]^g[3][f[c&
255]]};
sjcl.cipher.aes.prototype={encrypt:function(a){return y(this,a,0)},decrypt:function(a){return y(this,a,1)},j:[[[],[],[],[],[]],[[],[],[],[],[]]],D:function(){var a=this.j[0],b=this.j[1],c=a[4],d=b[4],e,f,g,h=[],l=[],k,n,m,p;for(e=0;0x100>e;e++)l[(h[e]=e<<1^283*(e>>7))^e]=e;for(f=g=0;!c[f];f^=k||1,g=l[g]||1){m=g^g<<1^g<<2^g<<3^g<<4;m=m>>8^m&255^99;c[f]=m;d[m]=f;n=h[e=h[k=h[f]]];p=0x1010101*n^0x10001*e^0x101*k^0x1010100*f;n=0x101*h[m]^0x1010100*m;for(e=0;4>e;e++)a[e][f]=n=n<<24^n>>>8,b[e][m]=p=p<<24^p>>>8}for(e=
0;5>e;e++)a[e]=a[e].slice(0),b[e]=b[e].slice(0)}};
function y(a,b,c){4!==b.length&&q(new sjcl.exception.invalid("invalid aes block size"));var d=a.a[c],e=b[0]^d[0],f=b[c?3:1]^d[1],g=b[2]^d[2];b=b[c?1:3]^d[3];var h,l,k,n=d.length/4-2,m,p=4,s=[0,0,0,0];h=a.j[c];a=h[0];var r=h[1],v=h[2],w=h[3],x=h[4];for(m=0;m<n;m++)h=a[e>>>24]^r[f>>16&255]^v[g>>8&255]^w[b&255]^d[p],l=a[f>>>24]^r[g>>16&255]^v[b>>8&255]^w[e&255]^d[p+1],k=a[g>>>24]^r[b>>16&255]^v[e>>8&255]^w[f&255]^d[p+2],b=a[b>>>24]^r[e>>16&255]^v[f>>8&255]^w[g&255]^d[p+3],p+=4,e=h,f=l,g=k;for(m=0;4>
m;m++)s[c?3&-m:m]=x[e>>>24]<<24^x[f>>16&255]<<16^x[g>>8&255]<<8^x[b&255]^d[p++],h=e,e=f,f=g,g=b,b=h;return s}
sjcl.bitArray={bitSlice:function(a,b,c){a=sjcl.bitArray.O(a.slice(b/32),32-(b&31)).slice(1);return c===t?a:sjcl.bitArray.clamp(a,c-b)},extract:function(a,b,c){var d=Math.floor(-b-c&31);return((b+c-1^b)&-32?a[b/32|0]<<32-d^a[b/32+1|0]>>>d:a[b/32|0]>>>d)&(1<<c)-1},concat:function(a,b){if(0===a.length||0===b.length)return a.concat(b);var c=a[a.length-1],d=sjcl.bitArray.getPartial(c);return 32===d?a.concat(b):sjcl.bitArray.O(b,d,c|0,a.slice(0,a.length-1))},bitLength:function(a){var b=a.length;return 0===
b?0:32*(b-1)+sjcl.bitArray.getPartial(a[b-1])},clamp:function(a,b){if(32*a.length<b)return a;a=a.slice(0,Math.ceil(b/32));var c=a.length;b&=31;0<c&&b&&(a[c-1]=sjcl.bitArray.partial(b,a[c-1]&2147483648>>b-1,1));return a},partial:function(a,b,c){return 32===a?b:(c?b|0:b<<32-a)+0x10000000000*a},getPartial:function(a){return Math.round(a/0x10000000000)||32},equal:function(a,b){if(sjcl.bitArray.bitLength(a)!==sjcl.bitArray.bitLength(b))return u;var c=0,d;for(d=0;d<a.length;d++)c|=a[d]^b[d];return 0===
c},O:function(a,b,c,d){var e;e=0;for(d===t&&(d=[]);32<=b;b-=32)d.push(c),c=0;if(0===b)return d.concat(a);for(e=0;e<a.length;e++)d.push(c|a[e]>>>b),c=a[e]<<32-b;e=a.length?a[a.length-1]:0;a=sjcl.bitArray.getPartial(e);d.push(sjcl.bitArray.partial(b+a&31,32<b+a?c:d.pop(),1));return d},k:function(a,b){return[a[0]^b[0],a[1]^b[1],a[2]^b[2],a[3]^b[3]]}};
sjcl.codec.utf8String={fromBits:function(a){var b="",c=sjcl.bitArray.bitLength(a),d,e;for(d=0;d<c/8;d++)0===(d&3)&&(e=a[d/4]),b+=String.fromCharCode(e>>>24),e<<=8;return decodeURIComponent(escape(b))},toBits:function(a){a=unescape(encodeURIComponent(a));var b=[],c,d=0;for(c=0;c<a.length;c++)d=d<<8|a.charCodeAt(c),3===(c&3)&&(b.push(d),d=0);c&3&&b.push(sjcl.bitArray.partial(8*(c&3),d));return b}};
sjcl.codec.hex={fromBits:function(a){var b="",c;for(c=0;c<a.length;c++)b+=((a[c]|0)+0xf00000000000).toString(16).substr(4);return b.substr(0,sjcl.bitArray.bitLength(a)/4)},toBits:function(a){var b,c=[],d;a=a.replace(/\s|0x/g,"");d=a.length;a+="00000000";for(b=0;b<a.length;b+=8)c.push(parseInt(a.substr(b,8),16)^0);return sjcl.bitArray.clamp(c,4*d)}};
sjcl.codec.base64={I:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",fromBits:function(a,b,c){var d="",e=0,f=sjcl.codec.base64.I,g=0,h=sjcl.bitArray.bitLength(a);c&&(f=f.substr(0,62)+"-_");for(c=0;6*d.length<h;)d+=f.charAt((g^a[c]>>>e)>>>26),6>e?(g=a[c]<<6-e,e+=26,c++):(g<<=6,e-=6);for(;d.length&3&&!b;)d+="=";return d},toBits:function(a,b){a=a.replace(/\s|=/g,"");var c=[],d,e=0,f=sjcl.codec.base64.I,g=0,h;b&&(f=f.substr(0,62)+"-_");for(d=0;d<a.length;d++)h=f.indexOf(a.charAt(d)),
0>h&&q(new sjcl.exception.invalid("this isn't base64!")),26<e?(e-=26,c.push(g^h>>>e),g=h<<32-e):(e+=6,g^=h<<32-e);e&56&&c.push(sjcl.bitArray.partial(e&56,g,1));return c}};sjcl.codec.base64url={fromBits:function(a){return sjcl.codec.base64.fromBits(a,1,1)},toBits:function(a){return sjcl.codec.base64.toBits(a,1)}};sjcl.hash.sha256=function(a){this.a[0]||this.D();a?(this.q=a.q.slice(0),this.m=a.m.slice(0),this.g=a.g):this.reset()};sjcl.hash.sha256.hash=function(a){return(new sjcl.hash.sha256).update(a).finalize()};
sjcl.hash.sha256.prototype={blockSize:512,reset:function(){this.q=this.M.slice(0);this.m=[];this.g=0;return this},update:function(a){"string"===typeof a&&(a=sjcl.codec.utf8String.toBits(a));var b,c=this.m=sjcl.bitArray.concat(this.m,a);b=this.g;a=this.g=b+sjcl.bitArray.bitLength(a);for(b=512+b&-512;b<=a;b+=512)z(this,c.splice(0,16));return this},finalize:function(){var a,b=this.m,c=this.q,b=sjcl.bitArray.concat(b,[sjcl.bitArray.partial(1,1)]);for(a=b.length+2;a&15;a++)b.push(0);b.push(Math.floor(this.g/
4294967296));for(b.push(this.g|0);b.length;)z(this,b.splice(0,16));this.reset();return c},M:[],a:[],D:function(){function a(a){return 0x100000000*(a-Math.floor(a))|0}var b=0,c=2,d;a:for(;64>b;c++){for(d=2;d*d<=c;d++)if(0===c%d)continue a;8>b&&(this.M[b]=a(Math.pow(c,0.5)));this.a[b]=a(Math.pow(c,1/3));b++}}};
function z(a,b){var c,d,e,f=b.slice(0),g=a.q,h=a.a,l=g[0],k=g[1],n=g[2],m=g[3],p=g[4],s=g[5],r=g[6],v=g[7];for(c=0;64>c;c++)16>c?d=f[c]:(d=f[c+1&15],e=f[c+14&15],d=f[c&15]=(d>>>7^d>>>18^d>>>3^d<<25^d<<14)+(e>>>17^e>>>19^e>>>10^e<<15^e<<13)+f[c&15]+f[c+9&15]|0),d=d+v+(p>>>6^p>>>11^p>>>25^p<<26^p<<21^p<<7)+(r^p&(s^r))+h[c],v=r,r=s,s=p,p=m+d|0,m=n,n=k,k=l,l=d+(k&n^m&(k^n))+(k>>>2^k>>>13^k>>>22^k<<30^k<<19^k<<10)|0;g[0]=g[0]+l|0;g[1]=g[1]+k|0;g[2]=g[2]+n|0;g[3]=g[3]+m|0;g[4]=g[4]+p|0;g[5]=g[5]+s|0;g[6]=
g[6]+r|0;g[7]=g[7]+v|0}
sjcl.mode.ccm={name:"ccm",encrypt:function(a,b,c,d,e){var f,g=b.slice(0),h=sjcl.bitArray,l=h.bitLength(c)/8,k=h.bitLength(g)/8;e=e||64;d=d||[];7>l&&q(new sjcl.exception.invalid("ccm: iv must be at least 7 bytes"));for(f=2;4>f&&k>>>8*f;f++);f<15-l&&(f=15-l);c=h.clamp(c,8*(15-f));b=sjcl.mode.ccm.K(a,b,c,d,e,f);g=sjcl.mode.ccm.n(a,g,c,b,e,f);return h.concat(g.data,g.tag)},decrypt:function(a,b,c,d,e){e=e||64;d=d||[];var f=sjcl.bitArray,g=f.bitLength(c)/8,h=f.bitLength(b),l=f.clamp(b,h-e),k=f.bitSlice(b,
h-e),h=(h-e)/8;7>g&&q(new sjcl.exception.invalid("ccm: iv must be at least 7 bytes"));for(b=2;4>b&&h>>>8*b;b++);b<15-g&&(b=15-g);c=f.clamp(c,8*(15-b));l=sjcl.mode.ccm.n(a,l,c,k,e,b);a=sjcl.mode.ccm.K(a,l.data,c,d,e,b);f.equal(l.tag,a)||q(new sjcl.exception.corrupt("ccm: tag doesn't match"));return l.data},K:function(a,b,c,d,e,f){var g=[],h=sjcl.bitArray,l=h.k;e/=8;(e%2||4>e||16<e)&&q(new sjcl.exception.invalid("ccm: invalid tag length"));(0xffffffff<d.length||0xffffffff<b.length)&&q(new sjcl.exception.bug("ccm: can't deal with 4GiB or more data"));
f=[h.partial(8,(d.length?64:0)|e-2<<2|f-1)];f=h.concat(f,c);f[3]|=h.bitLength(b)/8;f=a.encrypt(f);if(d.length){c=h.bitLength(d)/8;65279>=c?g=[h.partial(16,c)]:0xffffffff>=c&&(g=h.concat([h.partial(16,65534)],[c]));g=h.concat(g,d);for(d=0;d<g.length;d+=4)f=a.encrypt(l(f,g.slice(d,d+4).concat([0,0,0])))}for(d=0;d<b.length;d+=4)f=a.encrypt(l(f,b.slice(d,d+4).concat([0,0,0])));return h.clamp(f,8*e)},n:function(a,b,c,d,e,f){var g,h=sjcl.bitArray;g=h.k;var l=b.length,k=h.bitLength(b);c=h.concat([h.partial(8,
f-1)],c).concat([0,0,0]).slice(0,4);d=h.bitSlice(g(d,a.encrypt(c)),0,e);if(!l)return{tag:d,data:[]};for(g=0;g<l;g+=4)c[3]++,e=a.encrypt(c),b[g]^=e[0],b[g+1]^=e[1],b[g+2]^=e[2],b[g+3]^=e[3];return{tag:d,data:h.clamp(b,k)}}};
sjcl.mode.ocb2={name:"ocb2",encrypt:function(a,b,c,d,e,f){128!==sjcl.bitArray.bitLength(c)&&q(new sjcl.exception.invalid("ocb iv must be 128 bits"));var g,h=sjcl.mode.ocb2.G,l=sjcl.bitArray,k=l.k,n=[0,0,0,0];c=h(a.encrypt(c));var m,p=[];d=d||[];e=e||64;for(g=0;g+4<b.length;g+=4)m=b.slice(g,g+4),n=k(n,m),p=p.concat(k(c,a.encrypt(k(c,m)))),c=h(c);m=b.slice(g);b=l.bitLength(m);g=a.encrypt(k(c,[0,0,0,b]));m=l.clamp(k(m.concat([0,0,0]),g),b);n=k(n,k(m.concat([0,0,0]),g));n=a.encrypt(k(n,k(c,h(c))));d.length&&
(n=k(n,f?d:sjcl.mode.ocb2.pmac(a,d)));return p.concat(l.concat(m,l.clamp(n,e)))},decrypt:function(a,b,c,d,e,f){128!==sjcl.bitArray.bitLength(c)&&q(new sjcl.exception.invalid("ocb iv must be 128 bits"));e=e||64;var g=sjcl.mode.ocb2.G,h=sjcl.bitArray,l=h.k,k=[0,0,0,0],n=g(a.encrypt(c)),m,p,s=sjcl.bitArray.bitLength(b)-e,r=[];d=d||[];for(c=0;c+4<s/32;c+=4)m=l(n,a.decrypt(l(n,b.slice(c,c+4)))),k=l(k,m),r=r.concat(m),n=g(n);p=s-32*c;m=a.encrypt(l(n,[0,0,0,p]));m=l(m,h.clamp(b.slice(c),p).concat([0,0,0]));
k=l(k,m);k=a.encrypt(l(k,l(n,g(n))));d.length&&(k=l(k,f?d:sjcl.mode.ocb2.pmac(a,d)));h.equal(h.clamp(k,e),h.bitSlice(b,s))||q(new sjcl.exception.corrupt("ocb: tag doesn't match"));return r.concat(h.clamp(m,p))},pmac:function(a,b){var c,d=sjcl.mode.ocb2.G,e=sjcl.bitArray,f=e.k,g=[0,0,0,0],h=a.encrypt([0,0,0,0]),h=f(h,d(d(h)));for(c=0;c+4<b.length;c+=4)h=d(h),g=f(g,a.encrypt(f(h,b.slice(c,c+4))));c=b.slice(c);128>e.bitLength(c)&&(h=f(h,d(h)),c=e.concat(c,[-2147483648,0,0,0]));g=f(g,c);return a.encrypt(f(d(f(h,
d(h))),g))},G:function(a){return[a[0]<<1^a[1]>>>31,a[1]<<1^a[2]>>>31,a[2]<<1^a[3]>>>31,a[3]<<1^135*(a[0]>>>31)]}};
sjcl.mode.gcm={name:"gcm",encrypt:function(a,b,c,d,e){var f=b.slice(0);b=sjcl.bitArray;d=d||[];a=sjcl.mode.gcm.n(!0,a,f,d,c,e||128);return b.concat(a.data,a.tag)},decrypt:function(a,b,c,d,e){var f=b.slice(0),g=sjcl.bitArray,h=g.bitLength(f);e=e||128;d=d||[];e<=h?(b=g.bitSlice(f,h-e),f=g.bitSlice(f,0,h-e)):(b=f,f=[]);a=sjcl.mode.gcm.n(u,a,f,d,c,e);g.equal(a.tag,b)||q(new sjcl.exception.corrupt("gcm: tag doesn't match"));return a.data},U:function(a,b){var c,d,e,f,g,h=sjcl.bitArray.k;e=[0,0,0,0];f=b.slice(0);
for(c=0;128>c;c++){(d=0!==(a[Math.floor(c/32)]&1<<31-c%32))&&(e=h(e,f));g=0!==(f[3]&1);for(d=3;0<d;d--)f[d]=f[d]>>>1|(f[d-1]&1)<<31;f[0]>>>=1;g&&(f[0]^=-0x1f000000)}return e},f:function(a,b,c){var d,e=c.length;b=b.slice(0);for(d=0;d<e;d+=4)b[0]^=0xffffffff&c[d],b[1]^=0xffffffff&c[d+1],b[2]^=0xffffffff&c[d+2],b[3]^=0xffffffff&c[d+3],b=sjcl.mode.gcm.U(b,a);return b},n:function(a,b,c,d,e,f){var g,h,l,k,n,m,p,s,r=sjcl.bitArray;m=c.length;p=r.bitLength(c);s=r.bitLength(d);h=r.bitLength(e);g=b.encrypt([0,
0,0,0]);96===h?(e=e.slice(0),e=r.concat(e,[1])):(e=sjcl.mode.gcm.f(g,[0,0,0,0],e),e=sjcl.mode.gcm.f(g,e,[0,0,Math.floor(h/0x100000000),h&0xffffffff]));h=sjcl.mode.gcm.f(g,[0,0,0,0],d);n=e.slice(0);d=h.slice(0);a||(d=sjcl.mode.gcm.f(g,h,c));for(k=0;k<m;k+=4)n[3]++,l=b.encrypt(n),c[k]^=l[0],c[k+1]^=l[1],c[k+2]^=l[2],c[k+3]^=l[3];c=r.clamp(c,p);a&&(d=sjcl.mode.gcm.f(g,h,c));a=[Math.floor(s/0x100000000),s&0xffffffff,Math.floor(p/0x100000000),p&0xffffffff];d=sjcl.mode.gcm.f(g,d,a);l=b.encrypt(e);d[0]^=l[0];
d[1]^=l[1];d[2]^=l[2];d[3]^=l[3];return{tag:r.bitSlice(d,0,f),data:c}}};sjcl.misc.hmac=function(a,b){this.L=b=b||sjcl.hash.sha256;var c=[[],[]],d,e=b.prototype.blockSize/32;this.o=[new b,new b];a.length>e&&(a=b.hash(a));for(d=0;d<e;d++)c[0][d]=a[d]^909522486,c[1][d]=a[d]^1549556828;this.o[0].update(c[0]);this.o[1].update(c[1])};sjcl.misc.hmac.prototype.encrypt=sjcl.misc.hmac.prototype.mac=function(a){a=(new this.L(this.o[0])).update(a).finalize();return(new this.L(this.o[1])).update(a).finalize()};
sjcl.misc.pbkdf2=function(a,b,c,d,e){c=c||1E3;(0>d||0>c)&&q(sjcl.exception.invalid("invalid params to pbkdf2"));"string"===typeof a&&(a=sjcl.codec.utf8String.toBits(a));e=e||sjcl.misc.hmac;a=new e(a);var f,g,h,l,k=[],n=sjcl.bitArray;for(l=1;32*k.length<(d||1);l++){e=f=a.encrypt(n.concat(b,[l]));for(g=1;g<c;g++){f=a.encrypt(f);for(h=0;h<f.length;h++)e[h]^=f[h]}k=k.concat(e)}d&&(k=n.clamp(k,d));return k};
sjcl.prng=function(a){this.b=[new sjcl.hash.sha256];this.h=[0];this.F=0;this.t={};this.C=0;this.J={};this.N=this.c=this.i=this.T=0;this.a=[0,0,0,0,0,0,0,0];this.e=[0,0,0,0];this.A=t;this.B=a;this.p=u;this.z={progress:{},seeded:{}};this.l=this.S=0;this.u=1;this.w=2;this.Q=0x10000;this.H=[0,48,64,96,128,192,0x100,384,512,768,1024];this.R=3E4;this.P=80};
sjcl.prng.prototype={randomWords:function(a,b){var c=[],d;d=this.isReady(b);var e;d===this.l&&q(new sjcl.exception.notReady("generator isn't seeded"));if(d&this.w){d=!(d&this.u);e=[];var f=0,g;this.N=e[0]=(new Date).valueOf()+this.R;for(g=0;16>g;g++)e.push(0x100000000*Math.random()|0);for(g=0;g<this.b.length&&!(e=e.concat(this.b[g].finalize()),f+=this.h[g],this.h[g]=0,!d&&this.F&1<<g);g++);this.F>=1<<this.b.length&&(this.b.push(new sjcl.hash.sha256),this.h.push(0));this.c-=f;f>this.i&&(this.i=f);this.F++;
this.a=sjcl.hash.sha256.hash(this.a.concat(e));this.A=new sjcl.cipher.aes(this.a);for(d=0;4>d&&!(this.e[d]=this.e[d]+1|0,this.e[d]);d++);}for(d=0;d<a;d+=4)0===(d+1)%this.Q&&A(this),e=B(this),c.push(e[0],e[1],e[2],e[3]);A(this);return c.slice(0,a)},setDefaultParanoia:function(a){this.B=a},addEntropy:function(a,b,c){c=c||"user";var d,e,f=(new Date).valueOf(),g=this.t[c],h=this.isReady(),l=0;d=this.J[c];d===t&&(d=this.J[c]=this.T++);g===t&&(g=this.t[c]=0);this.t[c]=(this.t[c]+1)%this.b.length;switch(typeof a){case "number":b===
t&&(b=1);this.b[g].update([d,this.C++,1,b,f,1,a|0]);break;case "object":c=Object.prototype.toString.call(a);if("[object Uint32Array]"===c){e=[];for(c=0;c<a.length;c++)e.push(a[c]);a=e}else{"[object Array]"!==c&&(l=1);for(c=0;c<a.length&&!l;c++)"number"!=typeof a[c]&&(l=1)}if(!l){if(b===t)for(c=b=0;c<a.length;c++)for(e=a[c];0<e;)b++,e>>>=1;this.b[g].update([d,this.C++,2,b,f,a.length].concat(a))}break;case "string":b===t&&(b=a.length);this.b[g].update([d,this.C++,3,b,f,a.length]);this.b[g].update(a);
break;default:l=1}l&&q(new sjcl.exception.bug("random: addEntropy only supports number, array of numbers or string"));this.h[g]+=b;this.c+=b;h===this.l&&(this.isReady()!==this.l&&C("seeded",Math.max(this.i,this.c)),C("progress",this.getProgress()))},isReady:function(a){a=this.H[a!==t?a:this.B];return this.i&&this.i>=a?this.h[0]>this.P&&(new Date).valueOf()>this.N?this.w|this.u:this.u:this.c>=a?this.w|this.l:this.l},getProgress:function(a){a=this.H[a?a:this.B];return this.i>=a?1:this.c>a?1:this.c/
a},startCollectors:function(){this.p||(window.addEventListener?(window.addEventListener("load",this.r,u),window.addEventListener("mousemove",this.s,u)):document.attachEvent?(document.attachEvent("onload",this.r),document.attachEvent("onmousemove",this.s)):q(new sjcl.exception.bug("can't attach event")),this.p=!0)},stopCollectors:function(){this.p&&(window.removeEventListener?(window.removeEventListener("load",this.r,u),window.removeEventListener("mousemove",this.s,u)):window.detachEvent&&(window.detachEvent("onload",
this.r),window.detachEvent("onmousemove",this.s)),this.p=u)},addEventListener:function(a,b){this.z[a][this.S++]=b},removeEventListener:function(a,b){var c,d,e=this.z[a],f=[];for(d in e)e.hasOwnProperty(d)&&e[d]===b&&f.push(d);for(c=0;c<f.length;c++)d=f[c],delete e[d]},s:function(a){sjcl.random.addEntropy([a.x||a.clientX||a.offsetX||0,a.y||a.clientY||a.offsetY||0],2,"mouse")},r:function(){sjcl.random.addEntropy((new Date).valueOf(),2,"loadtime")}};
function C(a,b){var c,d=sjcl.random.z[a],e=[];for(c in d)d.hasOwnProperty(c)&&e.push(d[c]);for(c=0;c<e.length;c++)e[c](b)}function A(a){a.a=B(a).concat(B(a));a.A=new sjcl.cipher.aes(a.a)}function B(a){for(var b=0;4>b&&!(a.e[b]=a.e[b]+1|0,a.e[b]);b++);return a.A.encrypt(a.e)}sjcl.random=new sjcl.prng(6);try{var D=new Uint32Array(32);crypto.getRandomValues(D);sjcl.random.addEntropy(D,1024,"crypto['getRandomValues']")}catch(E){}
sjcl.json={defaults:{v:1,iter:1E3,ks:128,ts:64,mode:"ccm",adata:"",cipher:"aes"},encrypt:function(a,b,c,d){c=c||{};d=d||{};var e=sjcl.json,f=e.d({iv:sjcl.random.randomWords(4,0)},e.defaults),g;e.d(f,c);c=f.adata;"string"===typeof f.salt&&(f.salt=sjcl.codec.base64.toBits(f.salt));"string"===typeof f.iv&&(f.iv=sjcl.codec.base64.toBits(f.iv));(!sjcl.mode[f.mode]||!sjcl.cipher[f.cipher]||"string"===typeof a&&100>=f.iter||64!==f.ts&&96!==f.ts&&128!==f.ts||128!==f.ks&&192!==f.ks&&0x100!==f.ks||2>f.iv.length||
4<f.iv.length)&&q(new sjcl.exception.invalid("json encrypt: invalid parameters"));"string"===typeof a?(g=sjcl.misc.cachedPbkdf2(a,f),a=g.key.slice(0,f.ks/32),f.salt=g.salt):sjcl.ecc&&a instanceof sjcl.ecc.elGamal.publicKey&&(g=a.kem(),f.kemtag=g.tag,a=g.key.slice(0,f.ks/32));"string"===typeof b&&(b=sjcl.codec.utf8String.toBits(b));"string"===typeof c&&(c=sjcl.codec.utf8String.toBits(c));g=new sjcl.cipher[f.cipher](a);e.d(d,f);d.key=a;f.ct=sjcl.mode[f.mode].encrypt(g,b,f.iv,c,f.ts);return e.encode(f)},
decrypt:function(a,b,c,d){c=c||{};d=d||{};var e=sjcl.json;b=e.d(e.d(e.d({},e.defaults),e.decode(b)),c,!0);var f;c=b.adata;"string"===typeof b.salt&&(b.salt=sjcl.codec.base64.toBits(b.salt));"string"===typeof b.iv&&(b.iv=sjcl.codec.base64.toBits(b.iv));(!sjcl.mode[b.mode]||!sjcl.cipher[b.cipher]||"string"===typeof a&&100>=b.iter||64!==b.ts&&96!==b.ts&&128!==b.ts||128!==b.ks&&192!==b.ks&&0x100!==b.ks||!b.iv||2>b.iv.length||4<b.iv.length)&&q(new sjcl.exception.invalid("json decrypt: invalid parameters"));
"string"===typeof a?(f=sjcl.misc.cachedPbkdf2(a,b),a=f.key.slice(0,b.ks/32),b.salt=f.salt):sjcl.ecc&&a instanceof sjcl.ecc.elGamal.secretKey&&(a=a.unkem(sjcl.codec.base64.toBits(b.kemtag)).slice(0,b.ks/32));"string"===typeof c&&(c=sjcl.codec.utf8String.toBits(c));f=new sjcl.cipher[b.cipher](a);c=sjcl.mode[b.mode].decrypt(f,b.ct,b.iv,c,b.ts);e.d(d,b);d.key=a;return sjcl.codec.utf8String.fromBits(c)},encode:function(a){var b,c="{",d="";for(b in a)if(a.hasOwnProperty(b))switch(b.match(/^[a-z0-9]+$/i)||
q(new sjcl.exception.invalid("json encode: invalid property name")),c+=d+'"'+b+'":',d=",",typeof a[b]){case "number":case "boolean":c+=a[b];break;case "string":c+='"'+escape(a[b])+'"';break;case "object":c+='"'+sjcl.codec.base64.fromBits(a[b],0)+'"';break;default:q(new sjcl.exception.bug("json encode: unsupported type"))}return c+"}"},decode:function(a){a=a.replace(/\s/g,"");a.match(/^\{.*\}$/)||q(new sjcl.exception.invalid("json decode: this isn't json!"));a=a.replace(/^\{|\}$/g,"").split(/,/);var b=
{},c,d;for(c=0;c<a.length;c++)(d=a[c].match(/^(?:(["']?)([a-z][a-z0-9]*)\1):(?:(\d+)|"([a-z0-9+\/%*_.@=\-]*)")$/i))||q(new sjcl.exception.invalid("json decode: this isn't json!")),b[d[2]]=d[3]?parseInt(d[3],10):d[2].match(/^(ct|salt|iv)$/)?sjcl.codec.base64.toBits(d[4]):unescape(d[4]);return b},d:function(a,b,c){a===t&&(a={});if(b===t)return a;for(var d in b)b.hasOwnProperty(d)&&(c&&(a[d]!==t&&a[d]!==b[d])&&q(new sjcl.exception.invalid("required parameter overridden")),a[d]=b[d]);return a},X:function(a,
b){var c={},d;for(d in a)a.hasOwnProperty(d)&&a[d]!==b[d]&&(c[d]=a[d]);return c},W:function(a,b){var c={},d;for(d=0;d<b.length;d++)a[b[d]]!==t&&(c[b[d]]=a[b[d]]);return c}};sjcl.encrypt=sjcl.json.encrypt;sjcl.decrypt=sjcl.json.decrypt;sjcl.misc.V={};
sjcl.misc.cachedPbkdf2=function(a,b){var c=sjcl.misc.V,d;b=b||{};d=b.iter||1E3;c=c[a]=c[a]||{};d=c[d]=c[d]||{firstSalt:b.salt&&b.salt.length?b.salt.slice(0):sjcl.random.randomWords(2,0)};c=b.salt===t?d.firstSalt:b.salt;d[c]=d[c]||sjcl.misc.pbkdf2(a,c,b.iter);return{key:d[c].slice(0),salt:c.slice(0)}};

});
require.register("matthewmueller-uid/index.js", function(exports, require, module){
/**
 * Export `uid`
 */

module.exports = uid;

/**
 * Create a `uid`
 *
 * @param {String} len
 * @return {String} uid
 */

function uid(len) {
  len = len || 7;
  return Math.random().toString(35).substr(2, len);
}

});
require.register("component-format-parser/index.js", function(exports, require, module){

/**
 * Parse the given format `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api public
 */

module.exports = function(str){
	return str.split(/ *\| */).map(function(call){
		var parts = call.split(':');
		var name = parts.shift();
		var args = parseArgs(parts.join(':'));

		return {
			name: name,
			args: args
		};
	});
};

/**
 * Parse args `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function parseArgs(str) {
	var args = [];
	var re = /"([^"]*)"|'([^']*)'|([^ \t,]+)/g;
	var m;
	
	while (m = re.exec(str)) {
		args.push(m[2] || m[1] || m[0]);
	}
	
	return args;
}

});
require.register("component-props/index.js", function(exports, require, module){

/**
 * Return immediate identifiers parsed from `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api public
 */

module.exports = function(str, prefix){
  var p = unique(props(str));
  if (prefix) return prefixed(str, p, prefix);
  return p;
};

/**
 * Return immediate identifiers in `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function props(str) {
  return str
    .replace(/\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\//g, '')
    .match(/[a-zA-Z_]\w*/g)
    || [];
}

/**
 * Return `str` with `props` prefixed with `prefix`.
 *
 * @param {String} str
 * @param {Array} props
 * @param {String} prefix
 * @return {String}
 * @api private
 */

function prefixed(str, props, prefix) {
  var re = /\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\/|[a-zA-Z_]\w*/g;
  return str.replace(re, function(_){
    if ('(' == _[_.length - 1]) return prefix + _;
    if (!~props.indexOf(_)) return _;
    return prefix + _;
  });
}

/**
 * Return unique array.
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

function unique(arr) {
  var ret = [];

  for (var i = 0; i < arr.length; i++) {
    if (~ret.indexOf(arr[i])) continue;
    ret.push(arr[i]);
  }

  return ret;
}

});
require.register("visionmedia-debug/index.js", function(exports, require, module){
if ('undefined' == typeof window) {
  module.exports = require('./lib/debug');
} else {
  module.exports = require('./debug');
}

});
require.register("visionmedia-debug/debug.js", function(exports, require, module){

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  if (!debug.enabled(name)) return function(){};

  return function(fmt){
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (debug[name] || curr);
    debug[name] = curr;

    fmt = name
      + ' '
      + fmt
      + ' +' + debug.humanize(ms);

    // This hackery is required for IE8
    // where `console.log` doesn't have 'apply'
    window.console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }
}

/**
 * The currently active debug mode names.
 */

debug.names = [];
debug.skips = [];

/**
 * Enables a debug mode by name. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} name
 * @api public
 */

debug.enable = function(name) {
  try {
    localStorage.debug = name;
  } catch(e){}

  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
    }
    else {
      debug.names.push(new RegExp('^' + name + '$'));
    }
  }
};

/**
 * Disable debug output.
 *
 * @api public
 */

debug.disable = function(){
  debug.enable('');
};

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

debug.humanize = function(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function(name) {
  for (var i = 0, len = debug.skips.length; i < len; i++) {
    if (debug.skips[i].test(name)) {
      return false;
    }
  }
  for (var i = 0, len = debug.names.length; i < len; i++) {
    if (debug.names[i].test(name)) {
      return true;
    }
  }
  return false;
};

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

// persist

try {
  if (window.localStorage) debug.enable(localStorage.debug);
} catch(e){}

});
require.register("component-event/index.js", function(exports, require, module){

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  if (el.addEventListener) {
    el.addEventListener(type, fn, capture);
  } else {
    el.attachEvent('on' + type, fn);
  }
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  if (el.removeEventListener) {
    el.removeEventListener(type, fn, capture);
  } else {
    el.detachEvent('on' + type, fn);
  }
  return fn;
};

});
require.register("component-indexof/index.js", function(exports, require, module){
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-classes/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Whitespace regexp.
 */

var re = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

module.exports = function(el){
  return new ClassList(el);
};

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

function ClassList(el) {
  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function(name){
  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (!~i) arr.push(name);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove class `name` when present, or
 * pass a regular expression to remove
 * any which match.
 *
 * @param {String|RegExp} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function(name){
  if ('[object RegExp]' == toString.call(name)) {
    return this.removeMatching(name);
  }

  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (~i) arr.splice(i, 1);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @return {ClassList}
 * @api private
 */

ClassList.prototype.removeMatching = function(re){
  var arr = this.array();
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      this.remove(arr[i]);
    }
  }
  return this;
};

/**
 * Toggle class `name`.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function(name){
  // classList
  if (this.list) {
    this.list.toggle(name);
    return this;
  }

  // fallback
  if (this.has(name)) {
    this.remove(name);
  } else {
    this.add(name);
  }
  return this;
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function(){
  var arr = this.el.className.split(re);
  if ('' === arr[0]) arr.pop();
  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has =
ClassList.prototype.contains = function(name){
  return this.list
    ? this.list.contains(name)
    : !! ~index(this.array(), name);
};

});
require.register("component-query/index.js", function(exports, require, module){

function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
};

});
require.register("component-reactive/lib/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var adapter = require('./adapter');
var AttrBinding = require('./attr-binding');
var TextBinding = require('./text-binding');
var debug = require('debug')('reactive');
var bindings = require('./bindings');
var Binding = require('./binding');
var utils = require('./utils');
var query = require('query');

/**
 * Expose `Reactive`.
 */

exports = module.exports = Reactive;

/**
 * Bindings.
 */

exports.bindings = {};

/**
 * Define subscription function.
 *
 * @param {Function} fn
 * @api public
 */

exports.subscribe = function(fn){
  adapter.subscribe = fn;
};

/**
 * Define unsubscribe function.
 *
 * @param {Function} fn
 * @api public
 */

exports.unsubscribe = function(fn){
  adapter.unsubscribe = fn;
};

/**
 * Define a get function.
 *
 * @param {Function} fn
 * @api public
 */

exports.get = function(fn) {
  adapter.get = fn;
};

/**
 * Define a set function.
 *
 * @param {Function} fn
 * @api public
 */

exports.set = function(fn) {
  adapter.set = fn;
};

/**
 * Expose adapter
 */

exports.adapter = adapter;

/**
 * Define binding `name` with callback `fn(el, val)`.
 *
 * @param {String} name or object
 * @param {String|Object} name
 * @param {Function} fn
 * @api public
 */

exports.bind = function(name, fn){
  if ('object' == typeof name) {
    for (var key in name) {
      exports.bind(key, name[key]);
    }
    return;
  }

  exports.bindings[name] = fn;
};

/**
 * Middleware
 * @param {Function} fn
 * @api public
 */
 
exports.use = function(fn) {
  fn(exports);
  return this;
};

/**
 * Initialize a reactive template for `el` and `obj`.
 *
 * @param {Element} el
 * @param {Element} obj
 * @param {Object} options
 * @api public
 */

function Reactive(el, obj, options) {
  if (!(this instanceof Reactive)) return new Reactive(el, obj, options);
  this.el = el;
  this.obj = obj;
  this.els = [];
  this.fns = options || {}; // TODO: rename, this is awful
  this.bindAll();
  this.bindInterpolation(this.el, []);
}

/**
 * Subscribe to changes on `prop`.
 *
 * @param {String} prop
 * @param {Function} fn
 * @return {Reactive}
 * @api private
 */

Reactive.prototype.sub = function(prop, fn){
  adapter.subscribe(this.obj, prop, fn);
  return this;
};

/**
 * Unsubscribe to changes from `prop`.
 *
 * @param {String} prop
 * @param {Function} fn
 * @return {Reactive}
 * @api private
 */

Reactive.prototype.unsub = function(prop, fn){
  adapter.unsubscribe(this.obj, prop, fn);
  return this;
};

/**
 * Get a `prop`
 *
 * @param {String} prop
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

Reactive.prototype.get = function(prop) {
  return adapter.get(this.obj, prop);
};

/**
 * Set a `prop`
 *
 * @param {String} prop
 * @param {Mixed} val
 * @return {Reactive}
 * @api private
 */

Reactive.prototype.set = function(prop, val) {
  adapter.set(this.obj, prop, val);
  return this;
};

/**
 * Traverse and bind all interpolation within attributes and text.
 *
 * @param {Element} el
 * @api private
 */

Reactive.prototype.bindInterpolation = function(el, els){

  // element
  if (el.nodeType == 1) {
    for (var i = 0; i < el.attributes.length; i++) {
      var attr = el.attributes[i];
      if (utils.hasInterpolation(attr.value)) {
        new AttrBinding(this, el, attr);
      }
    }
  }

  // text node
  if (el.nodeType == 3) {
    if (utils.hasInterpolation(el.data)) {
      debug('bind text "%s"', el.data);
      new TextBinding(this, el);
    }
  }

  // walk nodes
  for (var i = 0; i < el.childNodes.length; i++) {
    var node = el.childNodes[i];
    this.bindInterpolation(node, els);
  }
};

/**
 * Apply all bindings.
 *
 * @api private
 */

Reactive.prototype.bindAll = function() {
  for (var name in exports.bindings) {
    this.bind(name, exports.bindings[name]);
  }
};

/**
 * Bind `name` to `fn`.
 *
 * @param {String|Object} name or object
 * @param {Function} fn
 * @api public
 */

Reactive.prototype.bind = function(name, fn) {
  if ('object' == typeof name) {
    for (var key in name) {
      this.bind(key, name[key]);
    }
    return;
  }

  var els = query.all('[' + name + ']', this.el);
  if (this.el.hasAttribute && this.el.hasAttribute(name)) {
    els = [].slice.call(els);
    els.unshift(this.el);
  }
  if (!els.length) return;

  debug('bind [%s] (%d elements)', name, els.length);
  for (var i = 0; i < els.length; i++) {
    var binding = new Binding(name, this, els[i], fn);
    binding.bind();
  }
};

/**
 * Use middleware
 *
 * @api public
 */

Reactive.prototype.use = function(fn) {
  fn(this);
  return this;
};

// bundled bindings

bindings(exports.bind);

});
require.register("component-reactive/lib/utils.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var debug = require('debug')('reactive:utils');
var props = require('props');
var adapter = require('./adapter');

/**
 * Function cache.
 */

var cache = {};

/**
 * Return interpolation property names in `str`,
 * for example "{foo} and {bar}" would return
 * ['foo', 'bar'].
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

exports.interpolationProps = function(str) {
  var m;
  var arr = [];
  var re = /\{([^}]+)\}/g;

  while (m = re.exec(str)) {
    var expr = m[1];
    arr = arr.concat(props(expr));
  }

  return unique(arr);
};

/**
 * Interpolate `str` with the given `fn`.
 *
 * @param {String} str
 * @param {Function} fn
 * @return {String}
 * @api private
 */

exports.interpolate = function(str, fn){
  return str.replace(/\{([^}]+)\}/g, function(_, expr){
    var cb = cache[expr];
    if (!cb) cb = cache[expr] = compile(expr);
    return fn(expr.trim(), cb);
  });
};

/**
 * Check if `str` has interpolation.
 *
 * @param {String} str
 * @return {Boolean}
 * @api private
 */

exports.hasInterpolation = function(str) {
  return ~str.indexOf('{');
};

/**
 * Remove computed properties notation from `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

exports.clean = function(str) {
  return str.split('<')[0].trim();
};

/**
 * Call `prop` on `model` or `view`.
 *
 * @param {Object} model
 * @param {Object} view
 * @param {String} prop
 * @return {Mixed}
 * @api private
 */

exports.call = function(model, view, prop){
  // view method
  if ('function' == typeof view[prop]) {
    return view[prop]();
  }

  // view value
  if (view.hasOwnProperty(prop)) {
    return view[prop];
  }

  // get property from model
  return adapter.get(model, prop);
};

/**
 * Compile `expr` to a `Function`.
 *
 * @param {String} expr
 * @return {Function}
 * @api private
 */

function compile(expr) {
  // TODO: use props() callback instead
  var re = /\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\/|[a-zA-Z_]\w*/g;
  var p = props(expr);

  var body = expr.replace(re, function(_) {
    if ('(' == _[_.length - 1]) return access(_);
    if (!~p.indexOf(_)) return _;
    return call(_);
  });

  debug('compile `%s`', body);
  return new Function('model', 'view', 'call', 'return ' + body);
}

/**
 * Access a method `prop` with dot notation.
 *
 * @param {String} prop
 * @return {String}
 * @api private
 */

function access(prop) {
  return 'model.' + prop;
}

/**
 * Call `prop` on view, model, or access the model's property.
 *
 * @param {String} prop
 * @return {String}
 * @api private
 */

function call(prop) {
  return 'call(model, view, "' + prop + '")';
}

/**
 * Return unique array.
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

function unique(arr) {
  var ret = [];

  for (var i = 0; i < arr.length; i++) {
    if (~ret.indexOf(arr[i])) continue;
    ret.push(arr[i]);
  }

  return ret;
}

});
require.register("component-reactive/lib/text-binding.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var debug = require('debug')('reactive:text-binding');
var utils = require('./utils');

/**
 * Expose `TextBinding`.
 */

module.exports = TextBinding;

/**
 * Initialize a new text binding.
 *
 * @param {Reactive} view
 * @param {Element} node
 * @param {Attribute} attr
 * @api private
 */

function TextBinding(view, node) {
  var self = this;
  this.view = view;
  this.text = node.data;
  this.node = node;
  this.props = utils.interpolationProps(this.text);
  this.subscribe();
  this.render();
}

/**
 * Subscribe to changes.
 */

TextBinding.prototype.subscribe = function(){
  var self = this;
  var view = this.view;
  this.props.forEach(function(prop){
    view.sub(prop, function(){
      self.render();
    });
  });
};

/**
 * Render text.
 */

TextBinding.prototype.render = function(){
  var node = this.node;
  var text = this.text;
  var view = this.view;
  var obj = view.obj;

  // TODO: delegate most of this to `Reactive`
  debug('render "%s"', text);
  node.data = utils.interpolate(text, function(prop, fn){
    if (fn) {
      return fn(obj, view.fns, utils.call);
    } else {
      return view.get(obj, prop);
    }
  });
};

});
require.register("component-reactive/lib/attr-binding.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var debug = require('debug')('reactive:attr-binding');
var utils = require('./utils');

/**
 * Expose `AttrBinding`.
 */

module.exports = AttrBinding;

/**
 * Initialize a new attribute binding.
 *
 * @param {Reactive} view
 * @param {Element} node
 * @param {Attribute} attr
 * @api private
 */

function AttrBinding(view, node, attr) {
  var self = this;
  this.view = view;
  this.node = node;
  this.attr = attr;
  this.text = attr.value;
  this.props = utils.interpolationProps(this.text);
  this.subscribe();
  this.render();
}

/**
 * Subscribe to changes.
 */

AttrBinding.prototype.subscribe = function(){
  var self = this;
  var view = this.view;
  this.props.forEach(function(prop){
    view.sub(prop, function(){
      self.render();
    });
  });
};

/**
 * Render the value.
 */

AttrBinding.prototype.render = function(){
  var attr = this.attr;
  var text = this.text;
  var view = this.view;
  var obj = view.obj;

  // TODO: delegate most of this to `Reactive`
  debug('render %s "%s"', attr.name, text);
  attr.value = utils.interpolate(text, function(prop, fn){
    if (fn) {
      return fn(obj, view.fns, utils.call);
    } else {
      return view.get(obj, prop);
    }
  });
};

});
require.register("component-reactive/lib/binding.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var parse = require('format-parser');

/**
 * Expose `Binding`.
 */

module.exports = Binding;

/**
 * Initialize a binding.
 *
 * @api private
 */

function Binding(name, view, el, fn) {
  this.name = name;
  this.view = view;
  this.obj = view.obj;
  this.fns = view.fns;
  this.el = el;
  this.fn = fn;
}

/**
 * Apply the binding.
 *
 * @api private
 */

Binding.prototype.bind = function() {
  var val = this.el.getAttribute(this.name);
  this.fn(this.el, val, this.obj);
};

/**
 * Perform interpolation on `name`.
 *
 * @param {String} name
 * @return {String}
 * @api public
 */

Binding.prototype.interpolate = function(name) {
  var self = this;
  name = clean(name);

  if (~name.indexOf('{')) {
    return name.replace(/{([^}]+)}/g, function(_, name){
      return self.value(name);
    });
  }

  return this.formatted(name);
};

/**
 * Return value for property `name`.
 *
 *  - check if the "view" has a `name` method
 *  - check if the "model" has a `name` method
 *  - check if the "model" has a `name` property
 *
 * @param {String} name
 * @return {Mixed}
 * @api public
 */

Binding.prototype.value = function(name) {
  var self = this;
  var obj = this.obj;
  var view = this.view;
  var fns = view.fns;
  name = clean(name);

  // view method
  if ('function' == typeof fns[name]) {
    return fns[name]();
  }

  // view value
  if (fns.hasOwnProperty(name)) {
    return fns[name];
  }

  return view.get(name);
};

/**
 * Return formatted property.
 *
 * @param {String} fmt
 * @return {Mixed}
 * @api public
 */

Binding.prototype.formatted = function(fmt) {
  var calls = parse(clean(fmt));
  var name = calls[0].name;
  var val = this.value(name);

  for (var i = 1; i < calls.length; ++i) {
    var call = calls[i];
    call.args.unshift(val);
    var fn = this.fns[call.name];
    val = fn.apply(this.fns, call.args);
  }

  return val;
};

/**
 * Invoke `fn` on changes.
 *
 * @param {Function} fn
 * @api public
 */

Binding.prototype.change = function(fn) {
  fn.call(this);

  var self = this;
  var view = this.view;
  var val = this.el.getAttribute(this.name);

  // computed props
  var parts = val.split('<');
  val = parts[0];
  var computed = parts[1];
  if (computed) computed = computed.trim().split(/\s+/);

  // interpolation
  if (hasInterpolation(val)) {
    var props = interpolationProps(val);
    props.forEach(function(prop){
      view.sub(prop, fn.bind(self));
    });
    return;
  }

  // formatting
  var calls = parse(val);
  var prop = calls[0].name;

  // computed props
  if (computed) {
    computed.forEach(function(prop){
      view.sub(prop, fn.bind(self));
    });
    return;
  }

  // bind to prop
  view.sub(prop, fn.bind(this));
};

/**
 * Return interpolation property names in `str`,
 * for example "{foo} and {bar}" would return
 * ['foo', 'bar'].
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function interpolationProps(str) {
  var m;
  var arr = [];
  var re = /\{([^}]+)\}/g;
  while (m = re.exec(str)) {
    arr.push(m[1]);
  }
  return arr;
}

/**
 * Check if `str` has interpolation.
 *
 * @param {String} str
 * @return {Boolean}
 * @api private
 */

function hasInterpolation(str) {
  return ~str.indexOf('{');
}

/**
 * Remove computed properties notation from `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function clean(str) {
  return str.split('<')[0].trim();
}

});
require.register("component-reactive/lib/bindings.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var classes = require('classes');
var event = require('event');

/**
 * Attributes supported.
 */

var attrs = [
  'id',
  'src',
  'rel',
  'cols',
  'rows',
  'name',
  'href',
  'title',
  'class',
  'style',
  'width',
  'value',
  'height',
  'tabindex',
  'placeholder'
];

/**
 * Events supported.
 */

var events = [
  'change',
  'click',
  'dblclick',
  'mousedown',
  'mouseup',
  'blur',
  'focus',
  'input',
  'submit',
  'keydown',
  'keypress',
  'keyup'
];

/**
 * Apply bindings.
 */

module.exports = function(bind){

  /**
   * Generate attribute bindings.
   */

  attrs.forEach(function(attr){
    bind('data-' + attr, function(el, name, obj){
      this.change(function(){
        el.setAttribute(attr, this.interpolate(name));
      });
    });
  });

/**
 * Append child element.
 */

  bind('data-append', function(el, name){
    var other = this.value(name);
    el.appendChild(other);
  });

/**
 * Replace element.
 */

  bind('data-replace', function(el, name){
    var other = this.value(name);
    el.parentNode.replaceChild(other, el);
  });

  /**
   * Show binding.
   */

  bind('data-show', function(el, name){
    this.change(function(){
      if (this.value(name)) {
        classes(el).add('show').remove('hide');
      } else {
        classes(el).remove('show').add('hide');
      }
    });
  });

  /**
   * Hide binding.
   */

  bind('data-hide', function(el, name){
    this.change(function(){
      if (this.value(name)) {
        classes(el).remove('show').add('hide');
      } else {
        classes(el).add('show').remove('hide');
      }
    });
  });

  /**
   * Checked binding.
   */

  bind('data-checked', function(el, name){
    this.change(function(){
      if (this.value(name)) {
        el.setAttribute('checked', 'checked');
      } else {
        el.removeAttribute('checked');
      }
    });
  });

  /**
   * Text binding.
   */

  bind('data-text', function(el, name){
    this.change(function(){
      el.textContent = this.interpolate(name);
    });
  });

  /**
   * HTML binding.
   */

  bind('data-html', function(el, name){
    this.change(function(){
      el.innerHTML = this.formatted(name);
    });
  });

  /**
   * Generate event bindings.
   */

  events.forEach(function(name){
    bind('on-' + name, function(el, method){
      var fns = this.view.fns
      event.bind(el, name, function(e){
        var fn = fns[method];
        if (!fn) throw new Error('method .' + method + '() missing');
        fns[method](e);
      });
    });
  });
};

});
require.register("component-reactive/lib/adapter.js", function(exports, require, module){
/**
 * Default subscription method.
 * Subscribe to changes on the model.
 *
 * @param {Object} obj
 * @param {String} prop
 * @param {Function} fn
 */

exports.subscribe = function(obj, prop, fn) {
  if (!obj.on) return;
  obj.on('change ' + prop, fn);
};

/**
 * Default unsubscription method.
 * Unsubscribe from changes on the model.
 */

exports.unsubscribe = function(obj, prop, fn) {
  if (!obj.off) return;
  obj.off('change ' + prop, fn);
};

/**
 * Default setter method.
 * Set a property on the model.
 *
 * @param {Object} obj
 * @param {String} prop
 * @param {Mixed} val
 */

exports.set = function(obj, prop, val) {
  if ('function' == typeof obj[prop]) {
    obj[prop](val);
  } else {
    obj[prop] = val;
  }
};

/**
 * Default getter method.
 * Get a property from the model.
 *
 * @param {Object} obj
 * @param {String} prop
 * @return {Mixed}
 */

exports.get = function(obj, prop) {
  if ('function' == typeof obj[prop]) {
    return obj[prop]();
  } else {
    return obj[prop];
  }
};

});
require.register("segmentio-on-enter/index.js", function(exports, require, module){

var bind = require('event').bind
  , indexOf = require('indexof');


/**
 * Expose `onEnter`.
 */

module.exports = exports = onEnter;


/**
 * Handlers.
 */

var fns = [];


/**
 * Escape binder.
 *
 * @param {Function} fn
 */

function onEnter (fn) {
  fns.push(fn);
}


/**
 * Bind a handler, for symmetry.
 */

exports.bind = onEnter;


/**
 * Unbind a handler.
 *
 * @param {Function} fn
 */

exports.unbind = function (fn) {
  var index = indexOf(fns, fn);
  if (index) fns.splice(index, 1);
};


/**
 * Bind to `document` once.
 */

bind(document, 'keydown', function (e) {
  if (13 !== e.keyCode) return;
  for (var i = 0, fn; fn = fns[i]; i++) fn(e);
});
});
require.register("segmentio-on-escape/index.js", function(exports, require, module){

var bind = require('event').bind
  , indexOf = require('indexof');


/**
 * Expose `onEscape`.
 */

module.exports = exports = onEscape;


/**
 * Handlers.
 */

var fns = [];


/**
 * Escape binder.
 *
 * @param {Function} fn
 */

function onEscape (fn) {
  fns.push(fn);
}


/**
 * Bind a handler, for symmetry.
 */

exports.bind = onEscape;


/**
 * Unbind a handler.
 *
 * @param {Function} fn
 */

exports.unbind = function (fn) {
  var index = indexOf(fns, fn);
  if (index) fns.splice(index, 1);
};


/**
 * Bind to `document` once.
 */

bind(document, 'keydown', function (e) {
  if (27 !== e.keyCode) return;
  for (var i = 0, fn; fn = fns[i]; i++) fn(e);
});
});
require.register("rstacruz-passwordgen.js/lib/index.js", function(exports, require, module){
function Passwordgen(options) {
  if (!options) options = {};

  this.random = options.random || Math.random;
}

/**
 * Password generator.
 *
 *     var gen = new Passwordgen();
 *
 *     gen.secure();       // Use a better RNG (only for Node.js)
 *
 *     gen.word();         //=> "kitten"
 *     gen.phrase();       //=> "television pen card small"
 *     gen.words();        //=> ['hello', 'honey', 'mittens', 'score']
 *     gen.chars();        //=> "uAC4bGA0tXG"
 *
 * Available options:
 *
 *     gen.phrase(3);
 *     gen.phrase({ symbols: true });
 *     gen.phrase({ separator: '_' });
 *
 *     gen.words(3);
 *     gen.words({ symbols: true });
 *
 *     gen.chars(10);
 *     gen.chars(10, { letters: false });
 *     gen.chars(10, { numbers: false });
 *     gen.chars(10, { symbols: true });
 */

Passwordgen.prototype = {
  letters: ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','W','Y','Z'],
  numbers: ['0','1','2','3','4','5','6','7','8','9'],
  symbols: ['!','@','#','$','%','^','&','*','`','~','/','=','?','+','|','_','-',':',';','.',','],
  wordlist: require('./words'),

  /**
   * Turns on secure random for Node.js.
   */

  secure: function() {
    this.random = require('./secure_random');
    return this;
  },

  /**
   * Returns a random member of an `array`.
   */

  sample: function(array) {
    return array[this.rand(this.random() * (array.length-1))];
  },

  /**
   * Returns a random integer less than `max`.
   */

  rand: function(max) {
    return Math.floor(this.random() * max);
  },

  /**
   * Returns a string of characters.
   *
   *     gen.chars();       // "uAC4bGA0tXG"
   *     gen.chars(10);
   *     gen.chars(10, { letters: false });
   *     gen.chars(10, { numbers: false });
   *     gen.chars(10, { symbols: true });
   */

  chars: function(length, options) {
    if (!length) length = 10;

    var pool = [];
    if (!options || options.letters !== false) pool = pool.concat(this.letters);
    if (!options || options.numbers !== false) pool = pool.concat(this.numbers);

    var str = "";
    for (var i=0; i<length; ++i) { str += this.sample(pool); }

    if (options && options.symbols) {
      var symbols = this.rand(length * 0.4) + 1;

      for (i=0; i<symbols; ++i) {
        var pos = this.rand(length-1) + 1;
        str = str.substr(0, pos) + this.sample(this.symbols) + str.substr(pos+1);
      }
    }
    return str;
  },

  /**
   * Generates a random word.
   *
   *     gen.word();         // "kitten"
   */

  word: function() {
    return this.sample(this.wordlist);
  },

  /**
   * Generates words.
   *
   *     gen.words();       // ['hello', 'honey', 'mittens', 'score']
   *     gen.words(3);
   *     gen.words({ symbols: true });
   */

  words: function(length, options) {
    if (!length) length = 4;

    var list = [];
    for (var i=0; i<length; ++i) { list.push(this.word()); }

    if (options && options.symbols) {
      list.push(this.chars(this.rand(3)+2, { letters: false, symbols: true }));
    }

    return list;
  },

  /**
   * Generates a phrase.
   *
   *     gen.phrase();       // "television pen card small"
   *     gen.phrase(3);
   *     gen.phrase({ symbols: true });
   *     gen.phrase({ separator: '_' });
   */

  phrase: function(length, options) {
    var sep = (options && options.separator) || ' ';
    return this.words(length, options).join(sep);
  }
};

module.exports = Passwordgen;

});
require.register("rstacruz-passwordgen.js/lib/words.js", function(exports, require, module){
module.exports = [
  "undefined",
  "the",
  "of",
  "and",
  "to",
  "in",
  "I",
  "that",
  "was",
  "his",
  "he",
  "it",
  "with",
  "is",
  "for",
  "as",
  "had",
  "you",
  "not",
  "be",
  "her",
  "on",
  "at",
  "by",
  "which",
  "have",
  "or",
  "from",
  "this",
  "him",
  "but",
  "all",
  "she",
  "they",
  "were",
  "my",
  "are",
  "me",
  "one",
  "their",
  "so",
  "an",
  "said",
  "them",
  "we",
  "who",
  "would",
  "been",
  "will",
  "no",
  "when",
  "there",
  "if",
  "more",
  "out",
  "up",
  "into",
  "do",
  "any",
  "your",
  "what",
  "has",
  "man",
  "could",
  "other",
  "than",
  "our",
  "some",
  "very",
  "time",
  "upon",
  "about",
  "may",
  "its",
  "only",
  "now",
  "like",
  "little",
  "then",
  "can",
  "should",
  "made",
  "did",
  "us",
  "such",
  "a",
  "great",
  "before",
  "must",
  "two",
  "these",
  "see",
  "know",
  "over",
  "much",
  "down",
  "after",
  "first",
  "mr",
  "good",
  "men",
  "own",
  "never",
  "most",
  "old",
  "shall",
  "day",
  "where",
  "those",
  "came",
  "come",
  "himself",
  "way",
  "work",
  "life",
  "without",
  "go",
  "make",
  "well",
  "through",
  "being",
  "long",
  "say",
  "might",
  "how",
  "am",
  "too",
  "even",
  "def",
  "again",
  "many",
  "back",
  "here",
  "think",
  "every",
  "people",
  "went",
  "same",
  "last",
  "thought",
  "away",
  "under",
  "take",
  "found",
  "hand",
  "eyes",
  "still",
  "place",
  "while",
  "just",
  "also",
  "young",
  "yet",
  "though",
  "against",
  "things",
  "get",
  "ever",
  "give",
  "god",
  "years",
  "off",
  "face",
  "nothing",
  "right",
  "once",
  "another",
  "left",
  "part",
  "saw",
  "house",
  "world",
  "head",
  "three",
  "took",
  "new",
  "love",
  "always",
  "mrs",
  "put",
  "night",
  "each",
  "king",
  "between",
  "tell",
  "mind",
  "heart",
  "few",
  "because",
  "thing",
  "whom",
  "far",
  "seemed",
  "looked",
  "called",
  "whole",
  "de",
  "set",
  "both",
  "got",
  "find",
  "done",
  "heard",
  "look",
  "name",
  "days",
  "told",
  "let",
  "lord",
  "country",
  "asked",
  "going",
  "seen",
  "better",
  "p",
  "having",
  "home",
  "knew",
  "side",
  "something",
  "moment",
  "father",
  "among",
  "course",
  "hands",
  "woman",
  "enough",
  "words",
  "mother",
  "soon",
  "full",
  "end",
  "gave",
  "room",
  "almost",
  "small",
  "thou",
  "cannot",
  "water",
  "want",
  "however",
  "light",
  "quite",
  "brought",
  "nor",
  "word",
  "whose",
  "given",
  "door",
  "best",
  "turned",
  "taken",
  "does",
  "use",
  "morning",
  "myself",
  "Gutenberg",
  "felt",
  "until",
  "since",
  "power",
  "themselves",
  "used",
  "rather",
  "began",
  "present",
  "voice",
  "others",
  "white",
  "works",
  "less",
  "money",
  "next",
  "poor",
  "death",
  "stood",
  "form",
  "within",
  "together",
  "till",
  "thy",
  "large",
  "matter",
  "kind",
  "often",
  "certain",
  "herself",
  "year",
  "friend",
  "half",
  "order",
  "round",
  "true",
  "anything",
  "keep",
  "sent",
  "wife",
  "means",
  "believe",
  "passed",
  "feet",
  "near",
  "public",
  "state",
  "son",
  "hundred",
  "children",
  "thus",
  "hope",
  "alone",
  "above",
  "case",
  "dear",
  "thee",
  "says",
  "person",
  "high",
  "read",
  "city",
  "already",
  "received",
  "fact",
  "gone",
  "girl",
  "known",
  "hear",
  "times",
  "least",
  "perhaps",
  "sure",
  "indeed",
  "english",
  "open",
  "body",
  "itself",
  "along",
  "land",
  "return",
  "leave",
  "air",
  "nature",
  "answered",
  "either",
  "law",
  "help",
  "lay",
  "point",
  "child",
  "letter",
  "four",
  "wish",
  "fire",
  "cried",
  "women",
  "speak",
  "number",
  "therefore",
  "hour",
  "friends",
  "held",
  "free",
  "war",
  "during",
  "several",
  "business",
  "whether",
  "er",
  "manner",
  "second",
  "reason",
  "replied",
  "united",
  "call",
  "general",
  "why",
  "behind",
  "became",
  "john",
  "become",
  "dead",
  "earth",
  "boy",
  "lost",
  "forth",
  "thousand",
  "looking",
  "I'll",
  "family",
  "soul",
  "feel",
  "coming",
  "England",
  "spirit",
  "question",
  "care",
  "truth",
  "ground",
  "really",
  "rest",
  "mean",
  "different",
  "making",
  "possible",
  "fell",
  "towards",
  "human",
  "kept",
  "short",
  "town",
  "following",
  "need",
  "cause",
  "met",
  "evening",
  "returned",
  "five",
  "strong",
  "able",
  "french",
  "live",
  "lady",
  "subject",
  "sn",
  "answer",
  "sea",
  "fear",
  "understand",
  "hard",
  "terms",
  "doubt",
  "around",
  "ask",
  "arms",
  "turn",
  "sense",
  "seems",
  "black",
  "bring",
  "followed",
  "beautiful",
  "close",
  "dark",
  "hold",
  "character",
  "sort",
  "sight",
  "ten",
  "show",
  "party",
  "fine",
  "ye",
  "ready",
  "story",
  "common",
  "book",
  "electronic",
  "talk",
  "account",
  "mark",
  "interest",
  "written",
  "can't",
  "bed",
  "necessary",
  "age",
  "else",
  "force",
  "idea",
  "longer",
  "art",
  "spoke",
  "across",
  "brother",
  "early",
  "ought",
  "sometimes",
  "line",
  "saying",
  "table",
  "appeared",
  "river",
  "continued",
  "eye",
  "ety",
  "sun",
  "information",
  "later",
  "everything",
  "reached",
  "suddenly",
  "past",
  "hours",
  "strange",
  "deep",
  "change",
  "miles",
  "feeling",
  "act",
  "meet",
  "paid",
  "further",
  "purpose",
  "happy",
  "added",
  "seem",
  "taking",
  "blood",
  "rose",
  "south",
  "beyond",
  "cold",
  "neither",
  "forward",
  "view",
  "I've",
  "position",
  "sound",
  "none",
  "entered",
  "clear",
  "road",
  "late",
  "stand",
  "suppose",
  "la",
  "daughter",
  "real",
  "nearly",
  "mine",
  "laws",
  "knowledge",
  "comes",
  "toward",
  "bad",
  "cut",
  "copy",
  "husband",
  "six",
  "france",
  "living",
  "peace",
  "didn't",
  "low",
  "north",
  "remember",
  "effect",
  "natural",
  "pretty",
  "fall",
  "fair",
  "service",
  "below",
  "except",
  "american",
  "hair",
  "london",
  "laid",
  "pass",
  "led",
  "copyright",
  "doing",
  "army",
  "run",
  "horse",
  "future",
  "opened",
  "pleasure",
  "history",
  "west",
  "pay",
  "red",
  "an'",
  "hath",
  "note",
  "although",
  "wanted",
  "gold",
  "makes",
  "desire",
  "play",
  "master",
  "office",
  "tried",
  "front",
  "big",
  "dr",
  "lived",
  "certainly",
  "wind",
  "receive",
  "attention",
  "government",
  "unto",
  "church",
  "strength",
  "length",
  "company",
  "placed",
  "paper",
  "letters",
  "probably",
  "glad",
  "important",
  "especially",
  "greater",
  "yourself",
  "fellow",
  "bear",
  "opinion",
  "window",
  "ran",
  "faith",
  "ago",
  "agreement",
  "charge",
  "beauty",
  "lips",
  "remained",
  "arm",
  "latter",
  "duty",
  "send",
  "distance",
  "silence",
  "foot",
  "wild",
  "object",
  "die",
  "save",
  "gentleman",
  "trees",
  "green",
  "trouble",
  "smile",
  "books",
  "wrong",
  "various",
  "sleep",
  "persons",
  "blockquote",
  "happened",
  "particular",
  "drew",
  "minutes",
  "hardly",
  "walked",
  "chief",
  "chance",
  "according",
  "beginning",
  "action",
  "deal",
  "loved",
  "visit",
  "thinking",
  "follow",
  "standing",
  "knows",
  "try",
  "presence",
  "heavy",
  "sweet",
  "plain",
  "donations",
  "immediately",
  "wrote",
  "mouth",
  "rich",
  "thoughts",
  "months",
  "u",
  "won't",
  "afraid",
  "paris",
  "single",
  "joy",
  "enemy",
  "broken",
  "unless",
  "states",
  "ship",
  "condition",
  "carry",
  "exclaimed",
  "including",
  "filled",
  "seeing",
  "influence",
  "write",
  "boys",
  "appear",
  "outside",
  "secret",
  "parts",
  "please",
  "appearance",
  "evil",
  "march",
  "George",
  "whatever",
  "slowly",
  "tears",
  "horses",
  "places",
  "caught",
  "stay",
  "instead",
  "struck",
  "blue",
  "york",
  "impossible",
  "period",
  "sister",
  "battle",
  "school",
  "mary",
  "raised",
  "occasion",
  "married",
  "man's",
  "former",
  "food",
  "youth",
  "learned",
  "merely",
  "reach",
  "system",
  "twenty",
  "dinner",
  "quiet",
  "easily",
  "moved",
  "afterwards",
  "giving",
  "walk",
  "stopped",
  "laughed",
  "language",
  "expression",
  "week",
  "hall",
  "danger",
  "property",
  "wonder",
  "usual",
  "figure",
  "born",
  "court",
  "generally",
  "grew",
  "showed",
  "getting",
  "ancient",
  "respect",
  "third",
  "worth",
  "simple",
  "tree",
  "leaving",
  "remain",
  "society",
  "fight",
  "wall",
  "result",
  "heaven",
  "william",
  "started",
  "command",
  "tone",
  "regard",
  "expected",
  "mere",
  "month",
  "beside",
  "silent",
  "perfect",
  "experience",
  "street",
  "writing",
  "goes",
  "circumstances",
  "entirely",
  "fresh",
  "duke",
  "covered",
  "bound",
  "east",
  "wood",
  "stone",
  "quickly",
  "notice",
  "bright",
  "christ",
  "boat",
  "noble",
  "meant",
  "somewhat",
  "sudden",
  "value",
  "direction",
  "chair",
  "due",
  "support",
  "tom",
  "date",
  "waiting",
  "christian",
  "village",
  "lives",
  "reading",
  "agree",
  "lines",
  "considered",
  "field",
  "observed",
  "scarcely",
  "wished",
  "wait",
  "greatest",
  "permission",
  "success",
  "piece",
  "british",
  "ex",
  "charles",
  "formed",
  "speaking",
  "trying",
  "conversation",
  "proper",
  "hill",
  "music",
  "opportunity",
  "that's",
  "german",
  "afternoon",
  "cry",
  "cost",
  "allowed",
  "girls",
  "considerable",
  "c",
  "broke",
  "honour",
  "seven",
  "private",
  "sit",
  "news",
  "top",
  "scene",
  "discovered",
  "marriage",
  "step",
  "garden",
  "race",
  "begin",
  "per",
  "individual",
  "sitting",
  "learn",
  "political",
  "difficult",
  "bit",
  "speech",
  "henry",
  "lie",
  "cast",
  "eat",
  "authority",
  "floor",
  "ill",
  "ways",
  "officers",
  "offered",
  "original",
  "happiness",
  "flowers",
  "produced",
  "summer",
  "provide",
  "study",
  "religion",
  "picture",
  "walls",
  "personal",
  "america",
  "watch",
  "pleased",
  "leaves",
  "declared",
  "hot",
  "understood",
  "effort",
  "prepared",
  "escape",
  "attempt",
  "supposed",
  "killed",
  "fast",
  "author",
  "indian",
  "brown",
  "determined",
  "pain",
  "spring",
  "takes",
  "drawn",
  "soldiers",
  "houses",
  "beneath",
  "talking",
  "turning",
  "century",
  "steps",
  "intended",
  "soft",
  "straight",
  "matters",
  "likely",
  "corner",
  "trademark",
  "justice",
  "simply",
  "produce",
  "trust",
  "appears",
  "rome",
  "laugh",
  "forget",
  "europe",
  "passage",
  "eight",
  "closed",
  "ourselves",
  "gives",
  "dress",
  "passing",
  "terrible",
  "required",
  "medium",
  "efforts",
  "sake",
  "breath",
  "wise",
  "ladies",
  "possession",
  "pleasant",
  "perfectly",
  "o'",
  "memory",
  "usually",
  "grave",
  "fixed",
  "modern",
  "spot",
  "troops",
  "rise",
  "break",
  "fifty",
  "island",
  "meeting",
  "camp",
  "nation",
  "existence",
  "reply",
  "I'd",
  "copies",
  "sky",
  "touch",
  "equal",
  "fortune",
  "shore",
  "domain",
  "named",
  "situation",
  "looks",
  "promise",
  "orders",
  "degree",
  "middle",
  "winter",
  "plan",
  "spent",
  "allow",
  "pale",
  "conduct",
  "running",
  "religious",
  "surprise",
  "minute",
  "roman",
  "cases",
  "shot",
  "lead",
  "move",
  "names",
  "stop",
  "higher",
  "et",
  "father's",
  "threw",
  "worse",
  "built",
  "spoken",
  "glass",
  "board",
  "vain",
  "affairs",
  "instance",
  "safe",
  "loss",
  "doctor",
  "offer",
  "class",
  "complete",
  "access",
  "lower",
  "wouldn't",
  "repeated",
  "forms",
  "darkness",
  "military",
  "warm",
  "drink",
  "passion",
  "ones",
  "physical",
  "example",
  "ears",
  "questions",
  "start",
  "lying",
  "smiled",
  "keeping",
  "spite",
  "shown",
  "directly",
  "james",
  "hart",
  "serious",
  "hat",
  "dog",
  "silver",
  "sufficient",
  "main",
  "mentioned",
  "servant",
  "pride",
  "crowd",
  "train",
  "wonderful",
  "moral",
  "instant",
  "associated",
  "path",
  "greek",
  "meaning",
  "fit",
  "ordered",
  "lot",
  "he's",
  "proved",
  "obliged",
  "enter",
  "rule",
  "sword",
  "attack",
  "seat",
  "game",
  "health",
  "paragraph",
  "statement",
  "social",
  "refund",
  "sorry",
  "courage",
  "members",
  "grace",
  "official",
  "dream",
  "worthy",
  "rock",
  "jack",
  "provided",
  "special",
  "shook",
  "request",
  "mighty",
  "glance",
  "heads",
  "movement",
  "fee",
  "share",
  "expect",
  "couldn't",
  "dollars",
  "spread",
  "opposite",
  "glory",
  "twelve",
  "space",
  "engaged",
  "peter",
  "wine",
  "ordinary",
  "mountains",
  "taste",
  "iron",
  "isn't",
  "distribute",
  "trade",
  "consider",
  "greatly",
  "accepted",
  "forced",
  "advantage",
  "ideas",
  "decided",
  "using",
  "officer",
  "rate",
  "clothes",
  "sign",
  "feelings",
  "native",
  "promised",
  "judge",
  "difference",
  "working",
  "anxious",
  "marry",
  "captain",
  "finished",
  "extent",
  "watched",
  "curious",
  "foreign",
  "besides",
  "method",
  "excellent",
  "confidence",
  "marked",
  "'em",
  "jesus",
  "exactly",
  "importance",
  "finally",
  "bill",
  "vast",
  "prove",
  "fancy",
  "quick",
  "yes",
  "sought",
  "prevent",
  "neck",
  "hearts",
  "liberty",
  "interesting",
  "sides",
  "legal",
  "gentlemen",
  "dry",
  "serve",
  "aside",
  "pure",
  "concerning",
  "forgotten",
  "lose",
  "powers",
  "possessed",
  "thrown",
  "evidence",
  "distant",
  "Michael",
  "progress",
  "similar",
  "narrow",
  "altogether",
  "building",
  "page",
  "particularly",
  "knowing",
  "weeks",
  "settled",
  "holding",
  "mountain",
  "search",
  "sad",
  "sin",
  "lies",
  "proud",
  "pieces",
  "clearly",
  "price",
  "ships",
  "thirty",
  "sick",
  "honest",
  "shut",
  "talked",
  "bank",
  "fate",
  "dropped",
  "judgment",
  "conditions",
  "king's",
  "accept",
  "hills",
  "removed",
  "forest",
  "measure",
  "species",
  "seek",
  "highest",
  "otherwise",
  "stream",
  "honor",
  "carefully",
  "obtained",
  "ear",
  "bread",
  "bottom",
  "additional",
  "presented",
  "aid",
  "fingers",
  "q",
  "remembered",
  "choose",
  "agreed",
  "animal",
  "events",
  "there's",
  "fully",
  "delight",
  "rights",
  "amount",
  "obtain",
  "tax",
  "servants",
  "sons",
  "cross",
  "shoulders",
  "thick",
  "points",
  "stranger",
  "woods",
  "facts",
  "dare",
  "grow",
  "creature",
  "hung",
  "rain",
  "false",
  "tall",
  "gate",
  "nations",
  "created",
  "refused",
  "quietly",
  "surface",
  "freely",
  "holy",
  "streets",
  "blow",
  "july",
  "regarded",
  "fashion",
  "report",
  "coast",
  "daily",
  "file",
  "shoulder",
  "surprised",
  "faces",
  "succeeded",
  "birds",
  "distribution",
  "royal",
  "song",
  "wealth",
  "comfort",
  "failed",
  "freedom",
  "peculiar",
  "anyone",
  "advance",
  "gentle",
  "surely",
  "animals",
  "waited",
  "secure",
  "desired",
  "grass",
  "touched",
  "occupied",
  "draw",
  "stage",
  "portion",
  "expressed",
  "opening",
  "june",
  "spirits",
  "fish",
  "tongue",
  "capital",
  "angry",
  "growing",
  "served",
  "carriage",
  "weather",
  "breast",
  "presently",
  "snow",
  "david",
  "papers",
  "necessity",
  "practice",
  "claim",
  "hast",
  "education",
  "sharp",
  "prince",
  "permitted",
  "group",
  "enemies",
  "robert",
  "played",
  "throughout",
  "pity",
  "expense",
  "yours",
  "million",
  "add",
  "pray",
  "taught",
  "explained",
  "tired",
  "leading",
  "kill",
  "shadow",
  "companion",
  "weight",
  "mass",
  "established",
  "suffered",
  "gray",
  "brave",
  "thin",
  "satisfied",
  "check",
  "virtue",
  "golden",
  "numerous",
  "frequently",
  "famous",
  "telling",
  "powerful",
  "alive",
  "waters",
  "national",
  "weak",
  "divine",
  "material",
  "principal",
  "gathered",
  "suggested",
  "frank",
  "valley",
  "guess",
  "finding",
  "yellow",
  "heat",
  "remains",
  "bent",
  "seized",
  "guard",
  "equally",
  "naturally",
  "box",
  "remarkable",
  "gods",
  "moon",
  "slight",
  "style",
  "pointed",
  "saved",
  "windows",
  "crossed",
  "louis",
  "pounds",
  "ain't",
  "evidently",
  "principle",
  "immediate",
  "willing",
  "consequence",
  "richard",
  "principles",
  "characters",
  "paul",
  "season",
  "remarked",
  "science",
  "tender",
  "worked",
  "grown",
  "whispered",
  "interested",
  "quarter",
  "midst",
  "liked",
  "advanced",
  "apparently",
  "bore",
  "pwh",
  "active",
  "noticed",
  "aware",
  "thomas",
  "uncle",
  "list",
  "dangerous",
  "august",
  "calm",
  "genius",
  "sacred",
  "kingdom",
  "entire",
  "popular",
  "unknown",
  "nice",
  "habit",
  "spanish",
  "familiar",
  "reader",
  "published",
  "direct",
  "handsome",
  "you'll",
  "joined",
  "actually",
  "kings",
  "sd",
  "posted",
  "approach",
  "washington",
  "hearing",
  "needed",
  "increased",
  "walking",
  "twice",
  "throw",
  "intellectual",
  "appointed",
  "wisdom",
  "ceased",
  "truly",
  "numbers",
  "demanded",
  "priest",
  "wounded",
  "sorrow",
  "drive",
  "fault",
  "listened",
  "palace",
  "affair",
  "contact",
  "distinguished",
  "station",
  "beat",
  "distributed",
  "e",
  "listen",
  "italy",
  "fool",
  "becomes",
  "watching",
  "hurt",
  "wants",
  "express",
  "occurred",
  "favour",
  "height",
  "size",
  "edge",
  "subjects",
  "task",
  "follows",
  "interests",
  "nine",
  "sympathy",
  "burst",
  "putting",
  "dressed",
  "lifted",
  "hopes",
  "suffer",
  "noise",
  "smiling",
  "rode",
  "tells",
  "minds",
  "farther",
  "literature",
  "vessel",
  "affection",
  "suffering",
  "proceeded",
  "flesh",
  "advice",
  "grand",
  "carrying",
  "legs",
  "spain",
  "post",
  "collection",
  "empty",
  "rank",
  "storm",
  "god's",
  "imagine",
  "wore",
  "duties",
  "admitted",
  "countries",
  "pocket",
  "arrival",
  "imagination",
  "driven",
  "loud",
  "sentence",
  "lovely",
  "extraordinary",
  "november",
  "december",
  "happen",
  "absence",
  "breakfast",
  "population",
  "thank",
  "rules",
  "inhabitants",
  "series",
  "laughing",
  "address",
  "relief",
  "bird",
  "owner",
  "impression",
  "satisfaction",
  "coat",
  "prepare",
  "relations",
  "shape",
  "birth",
  "rapidly",
  "smoke",
  "january",
  "mother's",
  "machine",
  "content",
  "consideration",
  "accompanied",
  "regular",
  "moving",
  "stands",
  "wholly",
  "teeth",
  "busy",
  "treated",
  "burning",
  "shame",
  "quality",
  "bay",
  "discover",
  "inside",
  "brain",
  "soil",
  "completely",
  "message",
  "ring",
  "resolved",
  "calling",
  "phrase",
  "acts",
  "mention",
  "square",
  "pair",
  "won",
  "title",
  "understanding",
  "sunday",
  "fruit",
  "mad",
  "forces",
  "included",
  "tea",
  "rocks",
  "nearer",
  "slaves",
  "falling",
  "absolutely",
  "slow",
  "bearing",
  "mercy",
  "larger",
  "explain",
  "contain",
  "grief",
  "soldier",
  "wasn't",
  "countenance",
  "previous",
  "explanation",
  "welcome",
  "proposed",
  "prayer",
  "stars",
  "germany",
  "belief",
  "informed",
  "moments",
  "poetry",
  "constant",
  "buy",
  "final",
  "faithful",
  "ride",
  "policy",
  "supper",
  "drawing",
  "excitement",
  "dying",
  "demand",
  "fighting",
  "fields",
  "drove",
  "upper",
  "sum",
  "philip",
  "motion",
  "assistance",
  "forty",
  "april",
  "stones",
  "edward",
  "fees",
  "kindly",
  "dignity",
  "catch",
  "october",
  "seated",
  "knees",
  "amongst",
  "current",
  "sending",
  "parties",
  "objects",
  "gained",
  "bitter",
  "possibly",
  "slave",
  "separate",
  "loose",
  "text",
  "receiving",
  "worst",
  "sold",
  "don",
  "credit",
  "chosen",
  "hoped",
  "printed",
  "terror",
  "features",
  "fond",
  "control",
  "capable",
  "fifteen",
  "doesn't",
  "firm",
  "superior",
  "cruel",
  "spiritual",
  "harry",
  "splendid",
  "proof",
  "pressed",
  "sooner",
  "join",
  "process",
  "crime",
  "dust",
  "instantly",
  "lands",
  "relation",
  "doors",
  "concerned",
  "deeply",
  "practical",
  "colour",
  "sing",
  "destroy",
  "anger",
  "distributing",
  "results",
  "increase",
  "reasons",
  "nose",
  "friendly",
  "entrance",
  "rooms",
  "admit",
  "supply",
  "clean",
  "useful",
  "yesterday",
  "delicate",
  "fail",
  "continue",
  "remove",
  "addressed",
  "choice",
  "huge",
  "needs",
  "wear",
  "blind",
  "unable",
  "cover",
  "double",
  "victory",
  "dozen",
  "constantly",
  "level",
  "india",
  "release",
  "rough",
  "ended",
  "shows",
  "fly",
  "praise",
  "devil",
  "ahead",
  "smith",
  "connected",
  "degrees",
  "gain",
  "addition",
  "committed",
  "chamber",
  "notes",
  "italian",
  "gradually",
  "acquaintance",
  "bought",
  "souls",
  "mission",
  "sacrifice",
  "cities",
  "mistake",
  "exercise",
  "conscience",
  "based",
  "car",
  "buried",
  "theory",
  "commanded",
  "nobody",
  "minister",
  "closely",
  "energy",
  "dick",
  "bare",
  "fought",
  "partly",
  "mistress",
  "hate",
  "arose",
  "playing",
  "color",
  "lake",
  "safety",
  "provisions",
  "description",
  "asleep",
  "centre",
  "faint",
  "thinks",
  "parents",
  "escaped",
  "careful",
  "enjoy",
  "drop",
  "brilliant",
  "brief",
  "bringing",
  "worship",
  "goods",
  "tale",
  "skin",
  "roof",
  "grey",
  "highly",
  "crown",
  "castle",
  "excited",
  "throne",
  "stated",
  "despair",
  "ease",
  "attached",
  "total",
  "kindness",
  "mile",
  "citizens",
  "circle",
  "dull",
  "extreme",
  "clouds",
  "figures",
  "intention",
  "prison",
  "term",
  "assured",
  "hidden",
  "thoroughly",
  "cup",
  "member",
  "civil",
  "apply",
  "labor",
  "everywhere",
  "intelligence",
  "strike",
  "fairly",
  "comply",
  "fellows",
  "haven't",
  "event",
  "gently",
  "connection",
  "protection",
  "conscious",
  "edition",
  "directed",
  "pulled",
  "flight",
  "evident",
  "surrounded",
  "wishes",
  "yards",
  "voices",
  "weary",
  "couple",
  "variety",
  "whilst",
  "volume",
  "details",
  "older",
  "requirements",
  "custom",
  "apart",
  "bow",
  "awful",
  "everybody",
  "labour",
  "asking",
  "lover",
  "showing",
  "introduced",
  "suit",
  "becoming",
  "composed",
  "plans",
  "rendered",
  "pictures",
  "lest",
  "volunteers",
  "singing",
  "eager",
  "precious",
  "paused",
  "require",
  "meat",
  "whenever",
  "milk",
  "dogs",
  "successful",
  "plants",
  "vision",
  "rare",
  "granted",
  "raise",
  "Egypt",
  "manners",
  "cousin",
  "you've",
  "development",
  "arthur",
  "obs",
  "cool",
  "trial",
  "learning",
  "approached",
  "bridge",
  "abroad",
  "devoted",
  "paying",
  "literary",
  "writer",
  "fn",
  "israel",
  "disappeared",
  "interrupted",
  "stock",
  "readers",
  "dreadful",
  "female",
  "protect",
  "accustomed",
  "virginia",
  "type",
  "recognized",
  "salt",
  "destroyed",
  "signs",
  "innocent",
  "temper",
  "plenty",
  "pope",
  "avoid",
  "hurried",
  "represented",
  "favor",
  "mental",
  "attitude",
  "returning",
  "admiration",
  "brothers",
  "anxiety",
  "queen",
  "teach",
  "count",
  "curiosity",
  "solemn",
  "causes",
  "vessels",
  "compelled",
  "dance",
  "hotel",
  "wicked",
  "fled",
  "kissed",
  "guns",
  "fill",
  "visible",
  "younger",
  "guide",
  "earnest",
  "actual",
  "companions",
  "prisoner",
  "miserable",
  "lad",
  "harm",
  "views",
  "irish",
  "utterly",
  "ends",
  "shop",
  "stairs",
  "pardon",
  "gay",
  "beg",
  "seldom",
  "kinds",
  "record",
  "fat",
  "sand",
  "violent",
  "branches",
  "inquired",
  "iv",
  "september",
  "worn",
  "ireland",
  "flat",
  "departure",
  "delivered",
  "gift",
  "ruin",
  "skill",
  "cattle",
  "equipment",
  "temple",
  "calls",
  "earlier",
  "license",
  "visited",
  "en",
  "consent",
  "sufficiently",
  "natives",
  "wound",
  "laughter",
  "contained",
  "perceived",
  "scattered",
  "whence",
  "rushed",
  "chiefly",
  "bold",
  "anywhere",
  "witness",
  "foolish",
  "helped",
  "kitchen",
  "sell",
  "anybody",
  "self",
  "extremely",
  "treatment",
  "throat",
  "dreams",
  "patient",
  "speed",
  "growth",
  "quantity",
  "latin",
  "immense",
  "conclusion",
  "computer",
  "affected",
  "severe",
  "excuse",
  "triumph",
  "origin",
  "joseph",
  "slept",
  "eternal",
  "thine",
  "audience",
  "pages",
  "sounds",
  "swift",
  "limited",
  "wings",
  "stepped",
  "services",
  "library",
  "remaining",
  "containing",
  "base",
  "confusion",
  "win",
  "maid",
  "charming",
  "editions",
  "attended",
  "softly",
  "reality",
  "performed",
  "glorious",
  "likewise",
  "site",
  "sail",
  "frightened",
  "acquainted",
  "unhappy",
  "feared",
  "article",
  "prisoners",
  "store",
  "adopted",
  "shalt",
  "remark",
  "cook",
  "thousands",
  "pause",
  "inclined",
  "convinced",
  "band",
  "valuable",
  "hence",
  "desert",
  "effects",
  "kiss",
  "plant",
  "ice",
  "ball",
  "stick",
  "absolute",
  "readily",
  "behold",
  "fierce",
  "argument",
  "observe",
  "blessed",
  "bosom",
  "rage",
  "striking",
  "discovery",
  "creatures",
  "shouted",
  "guilty",
  "related",
  "setting",
  "forgot",
  "punishment",
  "gun",
  "slightly",
  "articles",
  "police",
  "mysterious",
  "extended",
  "confess",
  "shade",
  "murder",
  "emotion",
  "destruction",
  "wondered",
  "increasing",
  "hide",
  "expedition",
  "horror",
  "local",
  "expenses",
  "ignorant",
  "doctrine",
  "generous",
  "range",
  "host",
  "wet",
  "cloud",
  "mystery",
  "ed",
  "waste",
  "changes",
  "possess",
  "consciousness",
  "february",
  "trembling",
  "disease",
  "formerly",
  "spend",
  "production",
  "source",
  "mankind",
  "universal",
  "deck",
  "sees",
  "habits",
  "estate",
  "aunt",
  "reign",
  "humble",
  "compliance",
  "delay",
  "shining",
  "reported",
  "hers",
  "unfortunate",
  "midnight",
  "listening",
  "flower",
  "hero",
  "accomplished",
  "doth",
  "classes",
  "thanks",
  "banks",
  "philosophy",
  "belong",
  "finger",
  "comfortable",
  "market",
  "cap",
  "waves",
  "woman's",
  "glanced",
  "troubled",
  "difficulties",
  "picked",
  "european",
  "purposes",
  "somewhere",
  "delighted",
  "pushed",
  "press",
  "household",
  "fleet",
  "baby",
  "region",
  "lately",
  "uttered",
  "exact",
  "image",
  "ages",
  "murmured",
  "melancholy",
  "suspicion",
  "bowed",
  "refuse",
  "elizabeth",
  "staff",
  "liability",
  "we'll",
  "enjoyed",
  "stretched",
  "gaze",
  "belonged",
  "ashamed",
  "reward",
  "meal",
  "blame",
  "nodded",
  "status",
  "opinions",
  "indicate",
  "poem",
  "savage",
  "arise",
  "voyage",
  "misery",
  "guests",
  "painted",
  "attend",
  "afford",
  "donate",
  "job",
  "proceed",
  "loves",
  "forehead",
  "regret",
  "plainly",
  "risk",
  "ad",
  "lighted",
  "angel",
  "rapid",
  "distinct",
  "doubtless",
  "properly",
  "wit",
  "fame",
  "singular",
  "error",
  "utmost",
  "methods",
  "reputation",
  "appeal",
  "she's",
  "w",
  "strongly",
  "margaret",
  "lack",
  "breaking",
  "dawn",
  "violence",
  "fatal",
  "render",
  "career",
  "design",
  "displayed",
  "gets",
  "commercial",
  "forgive",
  "lights",
  "agreeable",
  "suggestion",
  "utter",
  "sheep",
  "resolution",
  "spare",
  "patience",
  "domestic",
  "concluded",
  "'tis",
  "farm",
  "reference",
  "chinese",
  "exist",
  "corn",
  "approaching",
  "alike",
  "mounted",
  "jane",
  "issue",
  "key",
  "providing",
  "majority",
  "measures",
  "towns",
  "flame",
  "boston",
  "dared",
  "ignorance",
  "reduced",
  "occasionally",
  "y",
  "weakness",
  "furnished",
  "china",
  "priests",
  "flying",
  "cloth",
  "gazed",
  "profit",
  "fourth",
  "bell",
  "hitherto",
  "benefit",
  "movements",
  "eagerly",
  "acted",
  "urged",
  "ascii",
  "disposed",
  "electronically",
  "atmosphere",
  "chapter",
  "begged",
  "helen",
  "hole",
  "invited",
  "borne",
  "departed",
  "catholic",
  "files",
  "reasonable",
  "sugar",
  "replacement",
  "sigh",
  "humanity",
  "thrust",
  "frame",
  "opposition",
  "disk",
  "haste",
  "lonely",
  "artist",
  "knight",
  "quarters",
  "charm",
  "substance",
  "rolled",
  "email",
  "flung",
  "celebrated",
  "division",
  "slavery",
  "verse",
  "decision",
  "probable",
  "painful",
  "governor",
  "forever",
  "turns",
  "branch",
  "ocean",
  "rear",
  "leader",
  "delightful",
  "stared",
  "boats",
  "keen",
  "disposition",
  "senses",
  "occasions",
  "readable",
  "beloved",
  "inches",
  "bones",
  "enthusiasm",
  "materials",
  "luck",
  "derived",
  "managed",
  "community",
  "apparent",
  "preserved",
  "magnificent",
  "hurry",
  "scheme",
  "oil",
  "thence",
  "reaching",
  "dim",
  "wretched",
  "hanging",
  "pipe",
  "useless",
  "nevertheless",
  "print",
  "smooth",
  "solid",
  "pursued",
  "necessarily",
  "build",
  "attempted",
  "centuries",
  "eggs",
  "equivalent",
  "hastily",
  "burned",
  "you'd",
  "recent",
  "oh",
  "travel",
  "cries",
  "noon",
  "crying",
  "generations",
  "located",
  "cabin",
  "announcement",
  "britain",
  "compared",
  "handed",
  "cease",
  "smaller",
  "circumstance",
  "tent",
  "frequent",
  "alarm",
  "nervous",
  "beast",
  "what's",
  "aloud",
  "independent",
  "gates",
  "distinction",
  "essential",
  "observation",
  "stronger",
  "recovered",
  "belonging",
  "loving",
  "masters",
  "writers",
  "permanent",
  "mortal",
  "stern",
  "gratitude",
  "preserve",
  "burden",
  "aspect",
  "millions",
  "merry",
  "knife",
  "dread",
  "clever",
  "applicable",
  "district",
  "shadows",
  "jim",
  "silk",
  "failure",
  "links",
  "cent",
  "sentiment",
  "amid",
  "profits",
  "agent",
  "finds",
  "russia",
  "bade",
  "russian",
  "desperate",
  "union",
  "imagined",
  "contempt",
  "raising",
  "lords",
  "hell",
  "separated",
  "grant",
  "seriously",
  "tribes",
  "hit",
  "enormous",
  "defective",
  "conviction",
  "secured",
  "mixed",
  "insisted",
  "wooden",
  "prefer",
  "prayers",
  "fever",
  "selected",
  "daughters",
  "treat",
  "warning",
  "flew",
  "speaks",
  "developed",
  "impulse",
  "slipped",
  "ours",
  "johnson",
  "mistaken",
  "damages",
  "ambition",
  "resumed",
  "christmas",
  "yield",
  "ideal",
  "schools",
  "confirmed",
  "descended",
  "rush",
  "falls",
  "deny",
  "calculated",
  "correct",
  "perform",
  "hadn't",
  "somehow",
  "accordingly",
  "stayed",
  "acquired",
  "counsel",
  "distress",
  "sins",
  "notion",
  "discussion",
  "constitution",
  "anne",
  "hundreds",
  "instrument",
  "firmly",
  "actions",
  "steady",
  "remarks",
  "empire",
  "elements",
  "idle",
  "pen",
  "entering",
  "online",
  "africa",
  "permit",
  "th'",
  "tide",
  "vol",
  "leaned",
  "college",
  "maintain",
  "sovereign",
  "tail",
  "generation",
  "crowded",
  "fears",
  "nights",
  "limitation",
  "tied",
  "horrible",
  "cat",
  "displaying",
  "port",
  "male",
  "experienced",
  "opposed",
  "treaty",
  "contents",
  "rested",
  "mode",
  "poured",
  "les",
  "occur",
  "seeking",
  "practically",
  "abandoned",
  "reports",
  "eleven",
  "sank",
  "begins",
  "founded",
  "brings",
  "trace",
  "instinct",
  "collected",
  "scotland",
  "characteristic",
  "chose",
  "cheerful",
  "tribe",
  "costs",
  "threatened",
  "arrangement",
  "western",
  "sang",
  "beings",
  "sam",
  "pressure",
  "politics",
  "sorts",
  "shelter",
  "rude",
  "scientific",
  "revealed",
  "winds",
  "riding",
  "scenes",
  "shake",
  "industry",
  "claims",
  "merit",
  "profession",
  "lamp",
  "interview",
  "territory",
  "sleeping",
  "sex",
  "coffee",
  "devotion",
  "thereof",
  "creation",
  "trail",
  "romans",
  "supported",
  "requires",
  "fathers",
  "prospect",
  "obey",
  "alexander",
  "shone",
  "operation",
  "northern",
  "nurse",
  "profound",
  "hungry",
  "scott",
  "sisters",
  "assure",
  "exceedingly",
  "match",
  "wrath",
  "continually",
  "gifts",
  "folly",
  "chain",
  "uniform",
  "debt",
  "teaching",
  "venture",
  "execution",
  "shoes",
  "mood",
  "crew",
  "perceive",
  "accounts",
  "eating",
  "multitude",
  "declare",
  "yard",
  "o'er",
  "astonishment",
  "version",
  "vague",
  "odd",
  "grateful",
  "nearest",
  "infinite",
  "elsewhere",
  "copying",
  "apartment",
  "activity",
  "wives",
  "parted",
  "security",
  "cared",
  "sensible",
  "owing",
  "martin",
  "saturday",
  "cottage",
  "jews",
  "leaning",
  "capacity",
  "joe",
  "settle",
  "referred",
  "francis",
  "holder",
  "involved",
  "sunshine",
  "dutch",
  "council",
  "princes",
  "ate",
  "examination",
  "steel",
  "strangers",
  "beheld",
  "test",
  "noted",
  "slightest",
  "widow",
  "charity",
  "realized",
  "element",
  "shed",
  "errors",
  "communication",
  "reflection",
  "attacked",
  "organization",
  "maintained",
  "restored",
  "folks",
  "concealed",
  "accordance",
  "heavens",
  "star",
  "examined",
  "deeds",
  "wordforms",
  "somebody",
  "incident",
  "oath",
  "guest",
  "bar",
  "row",
  "poverty",
  "bottle",
  "prevented",
  "bless",
  "stir",
  "intense",
  "completed",
  "quarrel",
  "touching",
  "inner",
  "available",
  "fix",
  "resistance",
  "unusual",
  "deed",
  "derive",
  "hollow",
  "suspected",
  "contains",
  "sighed",
  "province",
  "deserted",
  "establishment",
  "vote",
  "muttered",
  "thither",
  "oxford",
  "cavalry",
  "lofty",
  "endure",
  "succeed",
  "leg",
  "bid",
  "alice",
  "hated",
  "civilization",
  "acting",
  "landed",
  "christians",
  "passions",
  "interior",
  "scarce",
  "lightly",
  "disturbed",
  "rev",
  "supreme",
  "hang",
  "notwithstanding",
  "shock",
  "exception",
  "offering",
  "display",
  "strain",
  "drank",
  "confined",
  "o",
  "exhausted",
  "poets",
  "sounded",
  "aim",
  "critical",
  "jerusalem",
  "directions",
  "negro",
  "fearful",
  "standard",
  "studied",
  "bag",
  "n",
  "buildings",
  "consequences",
  "commenced",
  "deeper",
  "repeat",
  "driving",
  "beasts",
  "track",
  "rid",
  "holds",
  "residence",
  "steadily",
  "intimate",
  "drinking",
  "swear",
  "treasure",
  "fun",
  "throwing",
  "apt",
  "enterprise",
  "queer",
  "seed",
  "tower",
  "runs",
  "defend",
  "favourite",
  "desires",
  "heavily",
  "assembled",
  "existed",
  "depends",
  "poems",
  "hesitated",
  "stuff",
  "section",
  "settlement",
  "staring",
  "sole",
  "roads",
  "plate",
  "mexico",
  "overcome",
  "pains",
  "performing",
  "dwell",
  "grounds",
  "taxes",
  "marble",
  "recently",
  "tones",
  "ability",
  "awake",
  "walter",
  "wave",
  "shaking",
  "folk",
  "possibility",
  "butter",
  "fury",
  "marched",
  "moses",
  "writes",
  "issued",
  "sailed",
  "instructions",
  "hatred",
  "pursuit",
  "pull",
  "furniture",
  "additions",
  "hid",
  "rope",
  "vi",
  "adventure",
  "royalty",
  "vanished",
  "arts",
  "elder",
  "signal",
  "wanting",
  "supplied",
  "feast",
  "safely",
  "burn",
  "describe",
  "references",
  "lesson",
  "annual",
  "card",
  "passes",
  "application",
  "intelligent",
  "county",
  "beaten",
  "presents",
  "format",
  "flow",
  "sixty",
  "scale",
  "damage",
  "marks",
  "obtaining",
  "moreover",
  "commerce",
  "startled",
  "southern",
  "consequently",
  "outer",
  "belongs",
  "ben",
  "wrought",
  "average",
  "naked",
  "conducted",
  "rivers",
  "songs",
  "obvious",
  "foundation",
  "concern",
  "ceremony",
  "magic",
  "campaign",
  "hunting",
  "carolina",
  "liberal",
  "whisper",
  "largely",
  "commonly",
  "torn",
  "exists",
  "contributions",
  "hunt",
  "teacher",
  "christianity",
  "lawyer",
  "operations",
  "detail",
  "shortly",
  "caesar",
  "wondering",
  "leaders",
  "blessing",
  "princess",
  "he'd",
  "altar",
  "tenderness",
  "tiny",
  "web",
  "cardinal",
  "sharply",
  "regiment",
  "chest",
  "distinctly",
  "purple",
  "creating",
  "gather",
  "depth",
  "indignation",
  "performance",
  "election",
  "prosperity",
  "gloomy",
  "conception",
  "clerk",
  "decide",
  "drunk",
  "victim",
  "reflected",
  "pour",
  "preceding",
  "individuals",
  "gazing",
  "absurd",
  "lift",
  "gesture",
  "armies",
  "limbs",
  "manage",
  "brethren",
  "hugh",
  "plays",
  "hastened",
  "dragged",
  "motive",
  "whatsoever",
  "pointing",
  "verses",
  "pronounced",
  "exchange",
  "definite",
  "emperor",
  "tendency",
  "remote",
  "finish",
  "flag",
  "boots",
  "enabled",
  "administration",
  "denied",
  "churches",
  "rarely",
  "earnestly",
  "considering",
  "previously",
  "ugly",
  "bears",
  "signed",
  "genuine",
  "harmless",
  "mingled",
  "obedience",
  "walks",
  "training",
  "badly",
  "feed",
  "central",
  "contrast",
  "relieved",
  "romance",
  "mississippi",
  "structure",
  "payment",
  "pace",
  "passages",
  "succession",
  "persuaded",
  "sources",
  "inquiry",
  "inspired",
  "angels",
  "roll",
  "wilt",
  "inch",
  "troubles",
  "perfection",
  "lee",
  "wherever",
  "owe",
  "handle",
  "advantages",
  "trip",
  "shoot",
  "fortunate",
  "newspaper",
  "employment",
  "fitted",
  "refuge",
  "misfortune",
  "providence",
  "owns",
  "cutting",
  "beard",
  "stirred",
  "tear",
  "dan",
  "resist",
  "bob",
  "depths",
  "maiden",
  "determine",
  "commission",
  "merchant",
  "whereas",
  "crossing",
  "independence",
  "lively",
  "breeze",
  "provinces",
  "jean",
  "virtues",
  "conceived",
  "relative",
  "solitary",
  "smell",
  "wandering",
  "thereby",
  "eighteen",
  "locked",
  "provision",
  "courts",
  "eaten",
  "historical",
  "regarding",
  "florence",
  "preferred",
  "pick",
  "ruined",
  "wherein",
  "vanity",
  "condemned",
  "deliver",
  "unexpected",
  "desk",
  "gross",
  "lane",
  "happens",
  "represent",
  "billy",
  "root",
  "holland",
  "mud",
  "respectable",
  "cleared",
  "feels",
  "fruits",
  "testimony",
  "milton",
  "existing",
  "bride",
  "rang",
  "ranks",
  "responsibility",
  "beating",
  "disappointed",
  "suitable",
  "depend",
  "judges",
  "giant",
  "grasp",
  "arrive",
  "simplicity",
  "autumn",
  "absent",
  "legally",
  "veil",
  "gloom",
  "doubtful",
  "suspect",
  "weapons",
  "limits",
  "determination",
  "feeble",
  "prophet",
  "shak",
  "gathering",
  "basis",
  "examine",
  "corrupt",
  "payments",
  "returns",
  "laying",
  "prize",
  "instances",
  "greeks",
  "d",
  "they're",
  "theatre",
  "purchase",
  "comparison",
  "composition",
  "rival",
  "someone",
  "realize",
  "defeat",
  "demands",
  "foe",
  "shared",
  "consists",
  "studies",
  "balance",
  "intercourse",
  "id",
  "forming",
  "slender",
  "coach",
  "criminal",
  "knocked",
  "silly",
  "humour",
  "masses",
  "indifferent",
  "recall",
  "occupation",
  "discourse",
  "keeps",
  "regions",
  "intervals",
  "assist",
  "novel",
  "intellect",
  "leads",
  "hither",
  "tales",
  "sale",
  "revenge",
  "lucy",
  "yonder",
  "resources",
  "jealous",
  "we're",
  "wheel",
  "invitation",
  "narrative",
  "risen",
  "burnt",
  "sentiments",
  "inferior",
  "amusement",
  "marie",
  "flash",
  "recognize",
  "swiftly",
  "portrait",
  "create",
  "summoned",
  "suggest",
  "induced",
  "conflict",
  "fed",
  "curse",
  "disappointment",
  "helpless",
  "preparing",
  "construction",
  "lincoln",
  "zeal",
  "responsible",
  "indicated",
  "groups",
  "positive",
  "germans",
  "attracted",
  "vengeance",
  "fort",
  "club",
  "cure",
  "stout",
  "missed",
  "gracious",
  "include",
  "flood",
  "satisfy",
  "agony",
  "respects",
  "ventured",
  "implied",
  "maria",
  "stupid",
  "seas",
  "spaniards",
  "grain",
  "enjoyment",
  "wearing",
  "indifference",
  "conceal",
  "horizon",
  "pleasures",
  "therein",
  "precisely",
  "canada",
  "day's",
  "assume",
  "registered",
  "estimate",
  "steep",
  "route",
  "gardens",
  "visitor",
  "closer",
  "harmony",
  "non",
  "thunder",
  "wire",
  "graceful",
  "crept",
  "greece",
  "childhood",
  "knee",
  "saddle",
  "supplies",
  "weeping",
  "mostly",
  "paragraphs",
  "unconscious",
  "mutual",
  "scorn",
  "grows",
  "external",
  "agents",
  "software",
  "institutions",
  "losing",
  "universe",
  "clock",
  "attempts",
  "instruction",
  "injury",
  "roots",
  "receipt",
  "jumped",
  "dearest",
  "sore",
  "earliest",
  "finest",
  "enable",
  "discipline",
  "motives",
  "fastened",
  "introduction",
  "converted",
  "wilderness",
  "confused",
  "fancied",
  "offices",
  "slip",
  "revolution",
  "wedding",
  "girl's",
  "farmer",
  "silently",
  "fires",
  "wept",
  "behalf",
  "reckon",
  "responded",
  "uncertain",
  "neglected",
  "stroke",
  "exquisite",
  "engagement",
  "dirty",
  "rolling",
  "platform",
  "messenger",
  "privilege",
  "admirable",
  "offers",
  "mischief",
  "physician",
  "imposed",
  "organized",
  "covering",
  "student",
  "daring",
  "cave",
  "wars",
  "convey",
  "he'll",
  "sincere",
  "tradition",
  "gravely",
  "combined",
  "gallant",
  "sensation",
  "travelling",
  "charges",
  "submit",
  "tragedy",
  "specific",
  "commander",
  "inn",
  "stiff",
  "accompany",
  "score",
  "virgin",
  "farewell",
  "paradise",
  "villages",
  "hunger",
  "trembled",
  "favorite",
  "criticism",
  "proprietary",
  "customs",
  "cotton",
  "ruth",
  "hospital",
  "restrictions",
  "outward",
  "impressed",
  "blows",
  "plains",
  "flashed",
  "rent",
  "prey",
  "owed",
  "longing",
  "musical",
  "satisfactory",
  "ridiculous",
  "sheet",
  "disgrace",
  "colored",
  "shouldn't",
  "originally",
  "samuel",
  "wages",
  "papa",
  "gas",
  "inevitable",
  "extensive",
  "leisure",
  "deadly",
  "chin",
  "claimed",
  "glow",
  "husband's",
  "emotions",
  "adam",
  "jealousy",
  "leaf",
  "publication",
  "englishman",
  "allah",
  "jones",
  "hostile",
  "wandered",
  "railway",
  "translation",
  "procession",
  "betrayed",
  "pound",
  "admired",
  "elected",
  "pierre",
  "sunk",
  "ruins",
  "eastern",
  "roses",
  "citizen",
  "reminded",
  "deceived",
  "tables",
  "beach",
  "starting",
  "funeral",
  "arrested",
  "flour",
  "feature",
  "correspondence",
  "consisted",
  "counted",
  "reserve",
  "proceedings",
  "roar",
  "romantic",
  "twenty-five",
  "hut",
  "strangely",
  "absorbed",
  "propose",
  "seats",
  "bark",
  "reception",
  "pleasing",
  "attained",
  "wake",
  "research",
  "prayed",
  "monarch",
  "clothing",
  "dollar",
  "illness",
  "calmly",
  "obeyed",
  "heartily",
  "pressing",
  "daylight",
  "warriors",
  "jest",
  "abruptly",
  "washed",
  "comment",
  "metal",
  "preparations",
  "nerves",
  "solution",
  "pretended",
  "sixteen",
  "assembly",
  "tobacco",
  "entity",
  "dwelling",
  "depart",
  "swung",
  "bitterly",
  "alteration",
  "colony",
  "disclaimers",
  "wing",
  "peaceful",
  "lion",
  "opportunities",
  "alarmed",
  "furnish",
  "resting",
  "accused",
  "culture",
  "writings",
  "dwelt",
  "conquered",
  "trick",
  "trusted",
  "column",
  "financial",
  "cunning",
  "preparation",
  "drama",
  "joke",
  "entertained",
  "mist",
  "hypertext",
  "shell",
  "medicine",
  "proofread",
  "nest",
  "reverence",
  "situated",
  "yielded",
  "conceive",
  "appointment",
  "lessons",
  "fetch",
  "tomb",
  "candle",
  "offence",
  "coarse",
  "heap",
  "mixture",
  "homes",
  "model",
  "men's",
  "defect",
  "destined",
  "occasional",
  "fourteen",
  "hint",
  "knights",
  "solicit",
  "dreamed",
  "objection",
  "craft",
  "acid",
  "namely",
  "asia",
  "neglect",
  "data",
  "weapon",
  "confessed",
  "arrangements",
  "repose",
  "complying",
  "copied",
  "pink",
  "user",
  "heels",
  "grandfather",
  "other's",
  "income",
  "regards",
  "streams",
  "vigorous",
  "accepting",
  "bishop",
  "lightning",
  "authors",
  "flames",
  "observations",
  "compressed",
  "sport",
  "powder",
  "beds",
  "orange",
  "painting",
  "shout",
  "austria",
  "bath",
  "careless",
  "chap",
  "derivative",
  "roused",
  "primitive",
  "doorway",
  "climbed",
  "volumes",
  "vulgar",
  "arguments",
  "1st",
  "sunset",
  "convenient",
  "mail",
  "recalled",
  "wrapped",
  "abode",
  "planted",
  "paint",
  "surrender",
  "establish",
  "mild",
  "promptly",
  "appearing",
  "department",
  "parish",
  "stephen",
  "nay",
  "lit",
  "handkerchief",
  "basket",
  "easier",
  "deserve",
  "quit",
  "assurance",
  "mirror",
  "plot",
  "yer",
  "upward",
  "sadly",
  "secretary",
  "adding",
  "modest",
  "dish",
  "cares",
  "straw",
  "net",
  "advised",
  "heavenly",
  "largest",
  "proceeding",
  "impatient",
  "wounds",
  "warmth",
  "certainty",
  "restless",
  "meantime",
  "rays",
  "salvation",
  "lovers",
  "experiment",
  "shores",
  "today",
  "tremendous",
  "afforded",
  "moonlight",
  "intend",
  "california",
  "cultivated",
  "flushed",
  "shakespeare",
  "newspapers",
  "rocky",
  "pious",
  "wont",
  "steam",
  "improvement",
  "garments",
  "ned",
  "treasury",
  "merchants",
  "perpetual",
  "trained",
  "products",
  "affectionate",
  "dispute",
  "visitors",
  "poison",
  "proposition",
  "maybe",
  "rifle",
  "warned",
  "parting",
  "shield",
  "erected",
  "employ",
  "prevailed",
  "talent",
  "rises",
  "climate",
  "chairs",
  "searched",
  "unlike",
  "recover",
  "mate",
  "arrange",
  "fortunes",
  "puzzled",
  "committee",
  "aged",
  "ohio",
  "ashes",
  "ghost",
  "b",
  "promises",
  "bushes",
  "effective",
  "distinguish",
  "manifest",
  "comparatively",
  "esteem",
  "blew",
  "revelation",
  "wash",
  "recognition",
  "confession",
  "clay",
  "nonsense",
  "trunk",
  "management",
  "undoubtedly",
  "dried",
  "dorothy",
  "chiefs",
  "coal",
  "stolen",
  "earthly",
  "restore",
  "indirectly",
  "lasted",
  "selfish",
  "renewed",
  "canoe",
  "protest",
  "vice",
  "races",
  "deemed",
  "temporary",
  "pile",
  "frederick",
  "chapel",
  "moderate",
  "spell",
  "massachusetts",
  "upright",
  "quoted",
  "area",
  "bone",
  "solitude",
  "instruments",
  "formal",
  "students",
  "greatness",
  "struggling",
  "monday",
  "reproach",
  "altered",
  "grim",
  "leaped",
  "venice",
  "federal",
  "questioned",
  "editor",
  "desirable",
  "acknowledge",
  "motionless",
  "remedy",
  "bestowed",
  "pursue",
  "representative",
  "pole",
  "gladly",
  "linen",
  "vital",
  "sink",
  "pacific",
  "hopeless",
  "dangers",
  "gratefully",
  "president",
  "travelled",
  "ward",
  "nephew",
  "ms",
  "cheer",
  "bloody",
  "siege",
  "commands",
  "justified",
  "atlantic",
  "stomach",
  "improved",
  "admire",
  "openly",
  "sailors",
  "abide",
  "advancing",
  "forests",
  "records",
  "polly",
  "recorded",
  "modification",
  "dramatic",
  "statements",
  "upstairs",
  "varied",
  "letting",
  "wilson",
  "comrades",
  "sets",
  "descent",
  "whither",
  "envy",
  "load",
  "pretend",
  "folded",
  "brass",
  "internal",
  "furious",
  "curtain",
  "healthy",
  "obscure",
  "summit",
  "alas",
  "fifth",
  "center",
  "faced",
  "cheap",
  "saints",
  "colonel",
  "egyptian",
  "contest",
  "owned",
  "adventures",
  "exclusion",
  "seize",
  "chances",
  "springs",
  "alter",
  "landing",
  "fence",
  "leagues",
  "glimpse",
  "statue",
  "contract",
  "luxury",
  "artillery",
  "doubts",
  "saving",
  "fro",
  "string",
  "combination",
  "awakened",
  "faded",
  "arrest",
  "protected",
  "temperature",
  "strict",
  "contented",
  "professional",
  "intent",
  "brother's",
  "injured",
  "neighborhood",
  "andrew",
  "abundance",
  "smoking",
  "yourselves",
  "medical",
  "garrison",
  "likes",
  "corps",
  "heroic",
  "inform",
  "wife's",
  "retained",
  "agitation",
  "nobles",
  "prominent",
  "institution",
  "judged",
  "embrace",
  "wheels",
  "closing",
  "damaged",
  "pack",
  "affections",
  "eldest",
  "anguish",
  "surrounding",
  "obviously",
  "strictly",
  "capture",
  "drops",
  "inquire",
  "ample",
  "remainder",
  "justly",
  "recollection",
  "deer",
  "answers",
  "bedroom",
  "purely",
  "bush",
  "plunged",
  "thyself",
  "joint",
  "refer",
  "expecting",
  "madam",
  "railroad",
  "spake",
  "respecting",
  "jan",
  "columns",
  "weep",
  "identify",
  "discharge",
  "bench",
  "ralph",
  "heir",
  "oak",
  "rescue",
  "limit",
  "unpleasant",
  "anxiously",
  "innocence",
  "awoke",
  "expectation",
  "incomplete",
  "program",
  "reserved",
  "secretly",
  "we've",
  "invention",
  "faults",
  "disagreeable",
  "piano",
  "defeated",
  "charms",
  "purse",
  "persuade",
  "deprived",
  "electric",
  "endless",
  "interval",
  "chase",
  "heroes",
  "invisible",
  "well-known",
  "occupy",
  "jacob",
  "gown",
  "cruelty",
  "lock",
  "lowest",
  "hesitation",
  "withdrew",
  "proposal",
  "destiny",
  "recognised",
  "commons",
  "foul",
  "loaded",
  "amidst",
  "titles",
  "ancestors",
  "types",
  "commanding",
  "madness",
  "happily",
  "assigned",
  "declined",
  "temptation",
  "lady's",
  "subsequent",
  "jewels",
  "breathed",
  "willingly",
  "youthful",
  "bells",
  "spectacle",
  "uneasy",
  "shine",
  "formidable",
  "stately",
  "machinery",
  "fragments",
  "rushing",
  "attractive",
  "product",
  "economic",
  "sickness",
  "uses",
  "dashed",
  "engine",
  "ashore",
  "dates",
  "theirs",
  "adv",
  "clasped",
  "international",
  "leather",
  "spared",
  "crushed",
  "interfere",
  "subtle",
  "waved",
  "slope",
  "floating",
  "worry",
  "effected",
  "passengers",
  "violently",
  "donation",
  "steamer",
  "witnesses",
  "specified",
  "learnt",
  "stores",
  "designed",
  "guessed",
  "roger",
  "timber",
  "talents",
  "heed",
  "jackson",
  "murdered",
  "vivid",
  "woe",
  "calculate",
  "killing",
  "laura",
  "savages",
  "wasted",
  "trifle",
  "funny",
  "pockets",
  "philosopher",
  "insult",
  "den",
  "representation",
  "incapable",
  "eloquence",
  "dine",
  "temples",
  "ann",
  "sensitive",
  "robin",
  "appetite",
  "wishing",
  "picturesque",
  "douglas",
  "courtesy",
  "flowing",
  "remembrance",
  "lawyers",
  "sphere",
  "murmur",
  "elegant",
  "honourable",
  "stopping",
  "guilt",
  "welfare",
  "avoided",
  "fishing",
  "perish",
  "sober",
  "steal",
  "delicious",
  "infant",
  "lip",
  "norman",
  "offended",
  "dost",
  "memories",
  "wheat",
  "japanese",
  "humor",
  "exhibited",
  "encounter",
  "footsteps",
  "marquis",
  "smiles",
  "amiable",
  "twilight",
  "arrows",
  "consisting",
  "park",
  "retire",
  "economy",
  "sufferings",
  "secrets",
  "na",
  "halted",
  "govern",
  "favourable",
  "colors",
  "translated",
  "stretch",
  "formation",
  "immortal",
  "gallery",
  "parallel",
  "lean",
  "tempted",
  "frontier",
  "continent",
  "knock",
  "impatience",
  "unity",
  "dealing",
  "prohibition",
  "decent",
  "fiery",
  "images",
  "tie",
  "punished",
  "submitted",
  "julia",
  "albert",
  "rejoined",
  "speedily",
  "consented",
  "major",
  "preliminary",
  "cell",
  "void",
  "placing",
  "prudence",
  "egg",
  "amazement",
  "border",
  "artificial",
  "hereafter",
  "fanny",
  "crimes",
  "breathe",
  "exempt",
  "anchor",
  "chicago",
  "sits",
  "purchased",
  "eminent",
  "neighbors",
  "glowing",
  "sunlight",
  "examples",
  "exercised",
  "wealthy",
  "seeming",
  "bonaparte",
  "shouting",
  "thanked",
  "illustrious",
  "curiously",
  "inspiration",
  "seeds",
  "naval",
  "foes",
  "everyone",
  "longed",
  "abundant",
  "doubted",
  "painter",
  "greeted",
  "erect",
  "glasses",
  "meanwhile",
  "shooting",
  "athens",
  "wagon",
  "lend",
  "lent",
  "crisis",
  "undertake",
  "particulars",
  "eh",
  "veins",
  "polite",
  "anna",
  "experiences",
  "seal",
  "header",
  "clergy",
  "mount",
  "array",
  "corners",
  "magazine",
  "loudly",
  "bitterness",
  "texas",
  "guardian",
  "searching",
  "rejected",
  "harsh",
  "includes",
  "boldly",
  "maurice",
  "kate",
  "lunch",
  "pine",
  "shells",
  "seconds",
  "despite",
  "hoping",
  "injustice",
  "expressions",
  "flies",
  "push",
  "tight",
  "problems",
  "landscape",
  "sue",
  "protested",
  "scarlet",
  "abandon",
  "artistic",
  "mainly",
  "measured",
  "loyal",
  "boiling",
  "desirous",
  "suited",
  "alliance",
  "advise",
  "waist",
  "sinking",
  "apprehension",
  "stable",
  "gregory",
  "maximum",
  "commit",
  "hideous",
  "hamilton",
  "sweetness",
  "dismissed",
  "tore",
  "affect",
  "shaken",
  "evils",
  "unworthy",
  "significance",
  "modified",
  "miracle",
  "lieu",
  "peasant",
  "considerably",
  "observing",
  "conveyed",
  "resemblance",
  "extend",
  "riches",
  "personally",
  "morality",
  "rebellion",
  "thread",
  "dumb",
  "inclination",
  "forbidden",
  "copper",
  "differences",
  "sailor",
  "requested",
  "alfred",
  "response",
  "promoting",
  "imperial",
  "blank",
  "purity",
  "victor",
  "bending",
  "solemnly",
  "twenty-four",
  "minor",
  "del",
  "crimson",
  "republic",
  "teachers",
  "ma'am",
  "danced",
  "bargain",
  "dealt",
  "fatigue",
  "telephone",
  "cents",
  "whip",
  "adams",
  "dislike",
  "witnessed",
  "infantry",
  "acres",
  "checked",
  "countrymen",
  "enemy's",
  "companies",
  "normal",
  "shirt",
  "addresses",
  "introduce",
  "sofa",
  "mothers",
  "sweep",
  "conversion",
  "sketch",
  "african",
  "deserved",
  "answering",
  "virtuous",
  "persian",
  "anyway",
  "thief",
  "driver",
  "retain",
  "constructed",
  "daniel",
  "ut",
  "philadelphia",
  "conspicuous",
  "channel",
  "nobility",
  "edith",
  "berlin",
  "editing",
  "cambridge",
  "declaration",
  "guards",
  "personality",
  "smallest",
  "excess",
  "separation",
  "disgust",
  "ha",
  "accomplish",
  "speeches",
  "herbert",
  "convent",
  "rightly",
  "suspended",
  "reform",
  "mob",
  "thirst",
  "unnecessary",
  "treasures",
  "asks",
  "viewed",
  "designs",
  "gleam",
  "threatening",
  "palm",
  "missouri",
  "filling",
  "quoth",
  "fur",
  "fortnight",
  "holes",
  "addressing",
  "frightful",
  "encourage",
  "speaker",
  "tribute",
  "procure",
  "frankly",
  "recommended",
  "relieve",
  "intentions",
  "unjust",
  "legislation",
  "project",
  "threshold",
  "merits",
  "morrow",
  "traces",
  "induce",
  "spear",
  "inward",
  "pupils",
  "corresponding",
  "fairy",
  "conclude",
  "clung",
  "neat",
  "lucky",
  "lap",
  "session",
  "torture",
  "damp",
  "ridge",
  "spoil",
  "liable",
  "swords",
  "hearty",
  "bc",
  "abraham",
  "thoughtful",
  "traveller",
  "chains",
  "favorable",
  "tin",
  "strongest",
  "horace",
  "dependent",
  "couch",
  "bills",
  "warrant",
  "complaint",
  "endeavour",
  "sails",
  "dined",
  "convention",
  "guarded",
  "angle",
  "widely",
  "illinois",
  "charlotte",
  "endeavoured",
  "ardent",
  "cow",
  "mill",
  "victims",
  "prejudice",
  "foremost",
  "map",
  "probability",
  "porch",
  "lieutenant",
  "surprising",
  "fountain",
  "sustained",
  "appropriate",
  "ford",
  "clara",
  "assisted",
  "lewis",
  "rejoice",
  "extending",
  "marvellous",
  "clothed",
  "jew",
  "collar",
  "bands",
  "confident",
  "hasty",
  "nigh",
  "organ",
  "prose",
  "privileges",
  "selection",
  "inquiries",
  "codes",
  "replace",
  "saint",
  "districts",
  "deliberately",
  "awe",
  "beforehand",
  "strife",
  "released",
  "compare",
  "beer",
  "retorted",
  "relate",
  "cheerfully",
  "pistol",
  "presume",
  "velvet",
  "wretch",
  "susan",
  "pennsylvania",
  "stirring",
  "righteousness",
  "missing",
  "fain",
  "facing",
  "fashionable",
  "producing",
  "peoples",
  "positively",
  "reasoning",
  "gravity",
  "disturb",
  "sermon",
  "exchanged",
  "partner",
  "brains",
  "lowered",
  "association",
  "estates",
  "abuse",
  "flock",
  "niece",
  "languages",
  "asserted",
  "bodily",
  "notions",
  "oliver",
  "faculty",
  "cannon",
  "thirteen",
  "sailing",
  "rings",
  "smart",
  "possessions",
  "disciples",
  "petty",
  "widest",
  "divisions",
  "prudent",
  "caution",
  "justify",
  "awhile",
  "boxes",
  "manuscript",
  "cigar",
  "warrior",
  "impressions",
  "aught",
  "lifting",
  "inaccurate",
  "tidings",
  "friday",
  "liquid",
  "staying",
  "concept",
  "creek",
  "lo",
  "brush",
  "download",
  "specially",
  "cream",
  "meetings",
  "jump",
  "unwilling",
  "adapted",
  "practised",
  "combat",
  "subdued",
  "jewish",
  "innumerable",
  "blowing",
  "extra",
  "civilized",
  "invented",
  "japan",
  "pitch",
  "cliff",
  "crowned",
  "portions",
  "awkward",
  "horrid",
  "pulling",
  "appreciate",
  "communicated",
  "kentucky",
  "jury",
  "encountered",
  "attacks",
  "monster",
  "simon",
  "maintaining",
  "sites",
  "frozen",
  "invariably",
  "dies",
  "survive",
  "literally",
  "consolation",
  "m",
  "phenomena",
  "pot",
  "ellen",
  "briefly",
  "rice",
  "planned",
  "barbara",
  "respected",
  "sublime",
  "dropping",
  "guy",
  "behaviour",
  "desolate",
  "penny",
  "adopt",
  "replaced",
  "revenue",
  "formats",
  "hired",
  "regularly",
  "infringement",
  "curtains",
  "eagerness",
  "helping",
  "investigation",
  "constitutional",
  "insist",
  "occurs",
  "fools",
  "inheritance",
  "latest",
  "leap",
  "games",
  "apple",
  "visiting",
  "travellers",
  "experiments",
  "hasn't",
  "pupil",
  "enjoying",
  "totally",
  "twisted",
  "discuss",
  "firing",
  "background",
  "subscribe",
  "tenderly",
  "transcribe",
  "descend",
  "differ",
  "majesty's",
  "avail",
  "disaster",
  "bet",
  "periodic",
  "bull",
  "entertainment",
  "computers",
  "cursed",
  "raw",
  "fulfilled",
  "georgia",
  "virus",
  "log",
  "skies",
  "scotch",
  "embraced",
  "hospitality",
  "faintly",
  "solomon",
  "robbed",
  "cart",
  "influences",
  "ascended",
  "incidents",
  "childish",
  "robe",
  "aboard",
  "resembling",
  "reflect",
  "dominion",
  "dreary",
  "serving",
  "complexion",
  "engage",
  "tents",
  "herd",
  "attain",
  "collect",
  "disclaims",
  "pan",
  "relatives",
  "borrowed",
  "convert",
  "outline",
  "blown",
  "comprehend",
  "peasants",
  "opera",
  "assault",
  "deceive",
  "doctrines",
  "representatives",
  "dedicated",
  "struggled",
  "officials",
  "hiding",
  "paths",
  "backs",
  "prominently",
  "prices",
  "procured",
  "mourning",
  "compliment",
  "heights",
  "approval",
  "gasped",
  "breadth",
  "withdraw",
  "tune",
  "compassion",
  "polished",
  "latitude",
  "dishes",
  "parent",
  "contrived",
  "delicacy",
  "projected",
  "akin",
  "f",
  "betray",
  "traced",
  "resentment",
  "indemnify",
  "pseud",
  "sacrifices",
  "disguise",
  "transcription",
  "document",
  "neighbour",
  "squire",
  "punish",
  "bars",
  "glittering",
  "tossed",
  "block",
  "lots",
  "worldly",
  "muscles",
  "elbow",
  "obligation",
  "trifling",
  "decline",
  "attachment",
  "ambitious",
  "filename",
  "artists",
  "bloom",
  "holiday",
  "brute",
  "repair",
  "fist",
  "recollect",
  "eagle",
  "honorable",
  "significant",
  "barren",
  "functions",
  "guided",
  "dense",
  "fiction",
  "adds",
  "rows",
  "recommend",
  "suspicious",
  "resulting",
  "seventy",
  "shillings",
  "educational",
  "duly",
  "governed",
  "scripture",
  "upwards",
  "sworn",
  "nicholas",
  "horn",
  "brook",
  "fund",
  "vienna",
  "lodge",
  "infinitely",
  "clergyman",
  "marshal",
  "ruled",
  "fiercely",
  "portuguese",
  "costume",
  "pit",
  "disorder",
  "sheer",
  "exalted",
  "fare",
  "applause",
  "chaucer",
  "remind",
  "binary",
  "packed",
  "pillow",
  "jersey",
  "abbey",
  "nowhere",
  "anyhow",
  "agitated",
  "marching",
  "catching",
  "el",
  "grasped",
  "arrow",
  "tend",
  "carved",
  "fitting",
  "bonds",
  "instructed",
  "elaborate",
  "corpse",
  "bewildered",
  "essence",
  "positions",
  "emily",
  "edited",
  "continues",
  "harold",
  "elevation",
  "realm",
  "debts",
  "glancing",
  "shops",
  "complained",
  "loyalty",
  "coin",
  "clad",
  "staircase",
  "documents",
  "interpreted",
  "4th",
  "extremity",
  "accord",
  "sally",
  "lace",
  "tremble",
  "exile",
  "gospel",
  "mechanical",
  "successfully",
  "scholar",
  "wonders",
  "arab",
  "temperament",
  "expressing",
  "fred",
  "trap",
  "spots",
  "awaiting",
  "potatoes",
  "likeness",
  "harbour",
  "proofs",
  "jolly",
  "contributed",
  "wits",
  "generosity",
  "ruler",
  "lawrence",
  "cake",
  "lamps",
  "crazy",
  "sincerity",
  "entertain",
  "madame",
  "sir",
  "faculties",
  "hesitate",
  "deepest",
  "seventeen",
  "lordship",
  "greeting",
  "feminine",
  "monstrous",
  "tongues",
  "barely",
  "3d",
  "mansion",
  "facility",
  "praised",
  "warranties",
  "sarah",
  "happier",
  "indicating",
  "rob",
  "gigantic",
  "honey",
  "ladder",
  "ending",
  "wales",
  "swallowed",
  "sunny",
  "knelt",
  "tyranny",
  "decree",
  "stake",
  "divide",
  "dreaming",
  "proclaimed",
  "dignified",
  "tread",
  "mines",
  "viewing",
  "defense",
  "oldest",
  "incredible",
  "bidding",
  "brick",
  "arch",
  "everlasting",
  "elect",
  "sprung",
  "harder",
  "winding",
  "deductible",
  "magistrate",
  "respective",
  "liquor",
  "imitation",
  "shy",
  "perished",
  "prime",
  "studying",
  "eighty",
  "hebrew",
  "unfortunately",
  "licensed",
  "fog",
  "coloured",
  "bits",
  "consult",
  "moves",
  "r",
  "warn",
  "taylor",
  "vile",
  "depended",
  "phil",
  "legend",
  "locations",
  "shallow",
  "doom",
  "dreaded",
  "encouragement",
  "impatiently",
  "scent",
  "varieties",
  "irregular",
  "battles",
  "compass",
  "neighbouring",
  "bliss",
  "harvest",
  "promotion",
  "stove",
  "faithfully",
  "anthony",
  "excellence",
  "transfer",
  "awaited",
  "heathen",
  "poetic",
  "consulted",
  "illustrated",
  "gilbert",
  "br",
  "fundamental",
  "bundle",
  "rebel",
  "cultivation",
  "joys",
  "rigid",
  "tragic",
  "review",
  "representing",
  "flowed",
  "brows",
  "whereupon",
  "terribly",
  "melted",
  "venerable",
  "towers",
  "cooking",
  "mustn't",
  "suspicions",
  "old-fashioned",
  "oppressed",
  "australia",
  "friend's",
  "revolt",
  "swell",
  "improve",
  "williams",
  "describes",
  "goddess",
  "wreck",
  "tennessee",
  "convince",
  "sentences",
  "bowl",
  "radiant",
  "prussia",
  "westward",
  "indignant",
  "refined",
  "unseen",
  "illustration",
  "pertaining",
  "swamp",
  "austrian",
  "saxon",
  "congregation",
  "nerve",
  "undertaking",
  "disclaimer",
  "characteristics",
  "stare",
  "specimens",
  "ascertain",
  "pledge",
  "earn",
  "warfare",
  "supposing",
  "subsequently",
  "attending",
  "angrily",
  "select",
  "animated",
  "industrial",
  "hurriedly",
  "manhood",
  "quantities",
  "interpretation",
  "dressing",
  "rejoiced",
  "edinburgh",
  "catherine",
  "challenge",
  "produces",
  "forbid",
  "gang",
  "boiled",
  "shouts",
  "so-called",
  "theme",
  "thankful",
  "admission",
  "enters",
  "elevated",
  "frenchman",
  "pool",
  "terrified",
  "lads",
  "persisted",
  "conference",
  "equality",
  "genus",
  "didst",
  "newly",
  "generals",
  "surroundings",
  "sorrows",
  "occasioned",
  "invasion",
  "workmen",
  "monks",
  "sends",
  "turkish",
  "discretion",
  "pattern",
  "reveal",
  "endured",
  "resolve",
  "columbia",
  "preach",
  "exceeding",
  "ringing",
  "triumphant",
  "defiance",
  "errand",
  "woke",
  "grandmother",
  "weighed",
  "wool",
  "orleans",
  "communicate",
  "strikes",
  "promising",
  "scenery",
  "righteous",
  "essentially",
  "oppose",
  "joyous",
  "specimen",
  "doctors",
  "eloquent",
  "manager",
  "organs",
  "sticks",
  "drag",
  "haunted",
  "chorus",
  "rational",
  "crop",
  "processing",
  "accurate",
  "wolf",
  "adorned",
  "sheets",
  "resort",
  "refusal",
  "bond",
  "vicinity",
  "preacher",
  "sympathetic",
  "casting",
  "opens",
  "prophets",
  "horns",
  "warmly",
  "salary",
  "continuous",
  "satan",
  "continual",
  "defended",
  "breaks",
  "workers",
  "lantern",
  "balls",
  "rod",
  "blaze",
  "examining",
  "naples",
  "peculiarly",
  "vegetables",
  "ingenious",
  "excite",
  "howard",
  "horseback",
  "re-use",
  "louisiana",
  "farmers",
  "wildly",
  "mouths",
  "carpet",
  "sadness",
  "customary",
  "circles",
  "aren't",
  "wonderfully",
  "max",
  "juan",
  "successor",
  "allied",
  "ceiling",
  "confirmation",
  "glances",
  "diamonds",
  "goal",
  "representations",
  "cash",
  "vacant",
  "antiquity",
  "despise",
  "lawn",
  "they'll",
  "appealed",
  "turkey",
  "texts",
  "neighbor",
  "spreading",
  "discharged",
  "phrases",
  "ultimate",
  "tastes",
  "submission",
  "entry",
  "rachel",
  "blush",
  "monument",
  "hardy",
  "thorough",
  "ein",
  "ecclesiastical",
  "fertile",
  "exciting",
  "captive",
  "severity",
  "considerations",
  "shew",
  "faster",
  "louise",
  "grandeur",
  "winning",
  "solely",
  "globe",
  "malice",
  "echoed",
  "lodging",
  "conservative",
  "throng",
  "prosperous",
  "whistle",
  "floated",
  "transferred",
  "declaring",
  "reckoned",
  "cheese",
  "bite",
  "thoughtfully",
  "breach",
  "enthusiastic",
  "cars",
  "downstairs",
  "allowing",
  "invite",
  "adjoining",
  "dusk",
  "cathedral",
  "truths",
  "plague",
  "sandy",
  "boil",
  "caroline",
  "beautifully",
  "inhabited",
  "tomorrow",
  "exclamation",
  "finishing",
  "shocked",
  "escort",
  "forgetting",
  "hanged",
  "hats",
  "mirth",
  "uncomfortable",
  "connecticut",
  "bows",
  "pierced",
  "harbor",
  "tricks",
  "rubbed",
  "apparatus",
  "mysteries",
  "honesty",
  "negroes",
  "concerns",
  "wander",
  "assert",
  "ceremonies",
  "sacrificed",
  "utterance",
  "dismay",
  "fright",
  "rail",
  "reflections",
  "crops",
  "pushing",
  "proves",
  "jimmy",
  "pathetic",
  "imperfect",
  "haughty",
  "navy",
  "fortress",
  "hurrying",
  "x",
  "blessings",
  "attempting",
  "insects",
  "selling",
  "appreciation",
  "suppressed",
  "acquire",
  "offensive",
  "ripe",
  "dresses",
  "reigned",
  "coldly",
  "candles",
  "km",
  "sixth",
  "blazing",
  "youngest",
  "mask",
  "florida",
  "lecture",
  "parlor",
  "decidedly",
  "whereby",
  "gordon",
  "reverend",
  "successive",
  "perception",
  "buffalo",
  "sire",
  "quitted",
  "keys",
  "develop",
  "function",
  "morals",
  "damned",
  "vexed",
  "2d",
  "pouring",
  "bullet",
  "excessive",
  "bind",
  "identical",
  "cliffs",
  "tools",
  "byron",
  "mexican",
  "piety",
  "superstition",
  "git",
  "substantial",
  "bulk",
  "prevail",
  "wiser",
  "preaching",
  "prolonged",
  "annoyed",
  "westminster",
  "splendour",
  "remembering",
  "richmond",
  "upset",
  "cab",
  "bunch",
  "pencil",
  "subjected",
  "vegetable",
  "exhibit",
  "emerged",
  "cooked",
  "hay",
  "kansas",
  "gale",
  "preached",
  "arnold",
  "trousers",
  "debate",
  "dated",
  "tumult",
  "corruption",
  "summons",
  "comrade",
  "eternity",
  "hears",
  "lingered",
  "propriety",
  "stillness",
  "partial",
  "welcomed",
  "cabinet",
  "proceeds",
  "vow",
  "quaint",
  "soup",
  "beef",
  "rests",
  "slay",
  "surgeon",
  "irresistible",
  "sealed",
  "repeating",
  "needn't",
  "allowance",
  "undertaken",
  "treachery",
  "posts",
  "borders",
  "attendant",
  "unite",
  "murderer",
  "owners",
  "nm",
  "sweeping",
  "unconsciously",
  "blade",
  "saviour",
  "theories",
  "graham",
  "behaved",
  "pleaded",
  "spy",
  "possesses",
  "lawful",
  "tommy",
  "seasons",
  "withdrawn",
  "reckless",
  "factory",
  "shades",
  "gossip",
  "seventh",
  "attendance",
  "robes",
  "journal",
  "systems",
  "dryden",
  "maine",
  "token",
  "intimacy",
  "abstract",
  "machines",
  "bestow",
  "chanced",
  "locks",
  "honestly",
  "legitimate",
  "accent",
  "symptoms",
  "votes",
  "ragged",
  "thursday",
  "manifested",
  "fidelity",
  "swinging",
  "descending",
  "sincerely",
  "bred",
  "whereof",
  "indies",
  "novels",
  "league",
  "failing",
  "succeeding",
  "santa",
  "approve",
  "cautiously",
  "miller",
  "afflicted",
  "lodgings",
  "petition",
  "traffic",
  "sparkling",
  "limb",
  "architecture",
  "disposal",
  "carriages",
  "crack",
  "kindred",
  "naught",
  "ornament",
  "slew",
  "steward",
  "fantastic",
  "evolution",
  "patiently",
  "reverse",
  "survey",
  "dug",
  "amuse",
  "stretching",
  "isaac",
  "forthwith",
  "contemporary",
  "foliage",
  "receives",
  "scandal",
  "donors",
  "deliberate",
  "influenced",
  "intolerable",
  "hearth",
  "symbol",
  "governments",
  "repaired",
  "pleasantly",
  "homage",
  "victorious",
  "columbus",
  "recovery",
  "defined",
  "attendants",
  "modesty",
  "diana",
  "washing",
  "pavement",
  "unnatural",
  "decisive",
  "wisely",
  "precise",
  "negative",
  "occurrence",
  "snatched",
  "shaft",
  "linked",
  "festival",
  "exclusively",
  "jove",
  "wickedness",
  "visions",
  "maggie",
  "rosy",
  "carelessly",
  "stem",
  "corporation",
  "dec",
  "feeding",
  "allen",
  "cows",
  "schemes",
  "preference",
  "urge",
  "husbands",
  "labours",
  "shrill",
  "exercises",
  "sovereignty",
  "reduce",
  "distressed",
  "clearing",
  "removal",
  "dean",
  "scottish",
  "assertion",
  "accessible",
  "comedy",
  "flush",
  "code",
  "philosophers",
  "adequate",
  "vaguely",
  "treason",
  "hunter",
  "chambers",
  "split",
  "yielding",
  "newsletter",
  "snake",
  "pub",
  "historian",
  "ass",
  "intensity",
  "democracy",
  "battery",
  "draws",
  "netherlands",
  "creed",
  "liking",
  "luke",
  "tyrant",
  "strove",
  "attraction",
  "slaughter",
  "dismal",
  "deposited",
  "assent",
  "cups",
  "concert",
  "downward",
  "canal",
  "evenings",
  "wax",
  "detective",
  "fancies",
  "spoiled",
  "revolver",
  "murray",
  "earned",
  "analysis",
  "finer",
  "paces",
  "roaring",
  "prompt",
  "paperwork",
  "wherefore",
  "emphasis",
  "sharing",
  "delayed",
  "inherited",
  "bronze",
  "waking",
  "garment",
  "redistributing",
  "wholesome",
  "remorse",
  "plato",
  "morris",
  "stooped",
  "dew",
  "monk",
  "thrill",
  "hue",
  "exclusive",
  "funds",
  "porter",
  "uncommon",
  "dash",
  "strained",
  "confounded",
  "swim",
  "strip",
  "middle-aged",
  "ultimately",
  "team",
  "missionary",
  "esteemed",
  "tracks",
  "envelope",
  "whoever",
  "expensive",
  "headquarters",
  "cherished",
  "brandy",
  "startling",
  "homer",
  "talks",
  "acute",
  "cigarette",
  "motor",
  "embarrassed",
  "janet",
  "volunteer",
  "offspring",
  "network",
  "reaches",
  "indispensable",
  "plane",
  "reaction",
  "regiments",
  "g",
  "sums",
  "partially",
  "prejudices",
  "proudly",
  "baggage",
  "terrace",
  "deaf",
  "allusion",
  "grip",
  "juice",
  "isabel",
  "resigned",
  "humility",
  "benjamin",
  "blast",
  "ministry",
  "sexual",
  "nile",
  "diameter",
  "troop",
  "onward",
  "crowds",
  "marrying",
  "tightly",
  "sullen",
  "brutal",
  "axe",
  "holmes",
  "penalty",
  "tops",
  "diamond",
  "boards",
  "corridor",
  "endowed",
  "strengthened",
  "cells",
  "proportions",
  "alternate",
  "echo",
  "restraint",
  "trials",
  "reads",
  "identity",
  "headed",
  "softened",
  "quivering",
  "stages",
  "sway",
  "poetical",
  "objected",
  "screen",
  "professed",
  "dirt",
  "ascertained",
  "era",
  "wider",
  "ambassador",
  "constituted",
  "breed",
  "interference",
  "eyebrows",
  "shapes",
  "afar",
  "consist",
  "acceptance",
  "displays",
  "flashing",
  "hunted",
  "beauties",
  "lazy",
  "shrewd",
  "extravagant",
  "momentary",
  "cordial",
  "engineer",
  "rapidity",
  "nov",
  "halt",
  "alternative",
  "devils",
  "stamp",
  "compact",
  "whites",
  "breathless",
  "encoding",
  "drift",
  "disappear",
  "roared",
  "revived",
  "counter",
  "venus",
  "imaginary",
  "diminished",
  "honoured",
  "5th",
  "despatched",
  "objections",
  "ray",
  "climbing",
  "attract",
  "astonishing",
  "competition",
  "suggestions",
  "ink",
  "oft",
  "crystal",
  "shower",
  "diseases",
  "ferdinand",
  "obedient",
  "draught",
  "wondrous",
  "await",
  "armour",
  "massive",
  "bottles",
  "kin",
  "cellar",
  "falsehood",
  "pillars",
  "edgar",
  "philosophical",
  "martha",
  "worlds",
  "memorable",
  "jacques",
  "detected",
  "stealing",
  "noisy",
  "henceforth",
  "cicero",
  "laden",
  "frost",
  "device",
  "glare",
  "touches",
  "senate",
  "lasting",
  "communion",
  "transport",
  "constantinople",
  "coffin",
  "eventually",
  "johnny",
  "enclosed",
  "forgiveness",
  "awfully",
  "clinging",
  "darkened",
  "contemplation",
  "termed",
  "manufacture",
  "swallow",
  "commonplace",
  "nancy",
  "resembled",
  "she'd",
  "labors",
  "contracted",
  "inscription",
  "comfortably",
  "indulge",
  "indulgence",
  "bravely",
  "kneeling",
  "yea",
  "keenly",
  "exhibition",
  "agricultural",
  "enlightened",
  "quest",
  "compliments",
  "crest",
  "extension",
  "uneasiness",
  "constitute",
  "inflicted",
  "lakes",
  "swing",
  "meadow",
  "noblest",
  "downloading",
  "complex",
  "controversy",
  "freed",
  "resignation",
  "tempest",
  "guidance",
  "prospects",
  "humbly",
  "lined",
  "serene",
  "shrugged",
  "honours",
  "roughly",
  "checks",
  "remarkably",
  "dainty",
  "overhead",
  "commencement",
  "singularly",
  "brightness",
  "oppression",
  "repeatedly",
  "conspiracy",
  "restrain",
  "splendor",
  "preservation",
  "pub",
  "pepper",
  "basin",
  "creeping",
  "matthew",
  "publicly",
  "percy",
  "continuing",
  "grove",
  "calamity",
  "pony",
  "vigour",
  "melody",
  "profitable",
  "descendants",
  "hire",
  "speculation",
  "discoveries",
  "accepts",
  "drunken",
  "candidate",
  "principally",
  "worried",
  "obstinate",
  "hasten",
  "foreigners",
  "elderly",
  "overwhelmed",
  "instincts",
  "telegraph",
  "russell",
  "university",
  "ghastly",
  "patron",
  "varying",
  "barbarous",
  "celestial",
  "t'",
  "patriotism",
  "modify",
  "earnestness",
  "exertion",
  "fox",
  "refusing",
  "horsemen",
  "inspection",
  "stations",
  "grieved",
  "louder",
  "bursting",
  "regretted",
  "mournful",
  "pursuing",
  "traitor",
  "associations",
  "cautious",
  "foundations",
  "stamped",
  "prior",
  "undertook",
  "telegram",
  "beggar",
  "chimney",
  "complicated",
  "davis",
  "striving",
  "magistrates",
  "converse",
  "graces",
  "wiped",
  "oars",
  "apology",
  "scared",
  "imprisonment",
  "eastward",
  "substitute",
  "yahweh",
  "handful",
  "usage",
  "lodged",
  "villain",
  "banished",
  "restoration",
  "serpent",
  "hedge",
  "k",
  "jurisdiction",
  "captains",
  "settlers",
  "gaining",
  "valiant",
  "primary",
  "storms",
  "beam",
  "victoria",
  "tour",
  "prophecy",
  "spectacles",
  "obsolete",
  "buying",
  "shepherd",
  "wells",
  "harriet",
  "exaggerated",
  "heated",
  "penetrated",
  "travels",
  "earl",
  "hereditary",
  "ali",
  "supernatural",
  "competent",
  "piled",
  "hostess",
  "agriculture",
  "boughs",
  "urgent",
  "gratified",
  "suffice",
  "ports",
  "drifted",
  "accuracy",
  "deceased",
  "circular",
  "securing",
  "possibilities",
  "rhine",
  "alert",
  "neighboring",
  "democratic",
  "quebec",
  "bud",
  "accounted",
  "aided",
  "augustus",
  "blanket",
  "hail",
  "pretence",
  "beams",
  "andy",
  "pig",
  "shaped",
  "oven",
  "rounded",
  "ivory",
  "northward",
  "isolated",
  "policeman",
  "aug",
  "conventional",
  "babylon",
  "dusty",
  "bishops",
  "complaints",
  "stripped",
  "plead",
  "hinder",
  "8vo",
  "cord",
  "flows",
  "personage",
  "classical",
  "alongside",
  "wrongs",
  "extract",
  "rewarded",
  "lungs",
  "lighter",
  "kisses",
  "serves",
  "pint",
  "forgiven",
  "sternly",
  "proclamation",
  "realised",
  "pipes",
  "arising",
  "pitched",
  "tube",
  "observer",
  "smote",
  "avenue",
  "elephant",
  "burke",
  "footing",
  "statesman",
  "rebels",
  "nails",
  "wears",
  "doomed",
  "edges",
  "esther",
  "indiana",
  "affecting",
  "stormy",
  "bee",
  "bury",
  "efficient",
  "mix",
  "supporting",
  "actor",
  "disturbance",
  "sweat",
  "executive",
  "seemingly",
  "tenth",
  "blossoms",
  "ethel",
  "folds",
  "painfully",
  "polish",
  "shudder",
  "roofs",
  "comparative",
  "begging",
  "imposing",
  "notable",
  "invested",
  "imprisoned",
  "mute",
  "amy",
  "cage",
  "esq",
  "pg",
  "cured",
  "cargo",
  "negotiations",
  "assented",
  "jail",
  "skilful",
  "ideals",
  "conferred",
  "resulted",
  "illusion",
  "torment",
  "troublesome",
  "crowns",
  "feb",
  "repentance",
  "blankets",
  "proprietor",
  "uncertainty",
  "concentrated",
  "mediterranean",
  "covers",
  "scream",
  "compromise",
  "respectful",
  "chariot",
  "ammunition",
  "bonnet",
  "secondary",
  "persia",
  "persecution",
  "lesser",
  "assistant",
  "saluted",
  "fits",
  "indulged",
  "springing",
  "cane",
  "fold",
  "boundary",
  "valued",
  "she'll",
  "rugged",
  "aloft",
  "thieves",
  "parlour",
  "indebted",
  "tons",
  "processes",
  "dave",
  "moore",
  "argue",
  "dearly",
  "logic",
  "panic",
  "restrained",
  "lb",
  "vainly",
  "weariness",
  "enlarged",
  "franklin",
  "tasted",
  "rural",
  "torrent",
  "resolute",
  "refrain",
  "kissing",
  "gorgeous",
  "meets",
  "circulation",
  "passionately",
  "inasmuch",
  "unexpectedly",
  "stress",
  "consumption",
  "groan",
  "suits",
  "sustain",
  "hosts",
  "crash",
  "resemble",
  "epoch",
  "quote",
  "lacking",
  "nominally",
  "choked",
  "aristocracy",
  "granite",
  "gradual",
  "delights",
  "hurled",
  "joyful",
  "sack",
  "slumber",
  "detached",
  "snapped",
  "shadowy",
  "accompanying",
  "annoyance",
  "crush",
  "needle",
  "repent",
  "phenomenon",
  "execute",
  "canst",
  "smoked",
  "greet",
  "monarchy",
  "behave",
  "richly",
  "controlled",
  "strive",
  "endeavor",
  "barrier",
  "canadian",
  "curve",
  "politeness",
  "flora",
  "rely",
  "flank",
  "convenience",
  "courteous",
  "logs",
  "lamb",
  "effectually",
  "robinson",
  "logical",
  "shan't",
  "dimly",
  "withered",
  "diet",
  "praises",
  "fulfil",
  "mantle",
  "ne'er",
  "discussing",
  "chicken",
  "judicial",
  "consistent",
  "ridicule",
  "reins",
  "barrel",
  "distrust",
  "trunks",
  "verily",
  "hunters",
  "feather",
  "desperately",
  "goodly",
  "habitual",
  "voluntary",
  "luncheon",
  "eighteenth",
  "exertions",
  "expert",
  "coolly",
  "mistakes",
  "tedious",
  "contemplated",
  "clark",
  "jacket",
  "gleaming",
  "shrank",
  "swimming",
  "kent",
  "perplexed",
  "impressive",
  "universally",
  "displeasure",
  "maids",
  "rates",
  "underneath",
  "expedient",
  "emma",
  "impress",
  "bees",
  "bounded",
  "worshipped",
  "resisted",
  "provincial",
  "popularity",
  "baker",
  "shattered",
  "merciful",
  "olive",
  "tramp",
  "compensation",
  "ernest",
  "martial",
  "genial",
  "syria",
  "conjecture",
  "van",
  "waiter",
  "detained",
  "items",
  "promote",
  "delaware",
  "covenant",
  "nought",
  "interposed",
  "seizing",
  "sinner",
  "vigor",
  "devote",
  "decorated",
  "sentimental",
  "yoke",
  "properties",
  "warlike",
  "perilous",
  "threats",
  "kindled",
  "lays",
  "hostility",
  "dragging",
  "mare",
  "regulations",
  "obstacle",
  "sage",
  "destitute",
  "pays",
  "sleepy",
  "dublin",
  "jonathan",
  "posterity",
  "they'd",
  "nod",
  "mason",
  "patriotic",
  "plantation",
  "pitiful",
  "foster",
  "requisite",
  "expose",
  "oxen",
  "patch",
  "anderson",
  "stuart",
  "interruption",
  "lance",
  "payable",
  "definition",
  "birthday",
  "thumb",
  "wolves",
  "hammer",
  "overwhelming",
  "intensely",
  "revolutionary",
  "fragrant",
  "bleeding",
  "sheltered",
  "circuit",
  "dominions",
  "sales",
  "energetic",
  "insignificant",
  "repetition",
  "we'd",
  "amazing",
  "trains",
  "skirts",
  "tip",
  "trivial",
  "kick",
  "tended",
  "rejoicing",
  "dig",
  "pet",
  "skull",
  "lectures",
  "ness",
  "threat",
  "legislature",
  "plunder",
  "removing",
  "jungle",
  "ghosts",
  "numbered",
  "famine",
  "palaces",
  "sorrowful",
  "improvements",
  "coleridge",
  "fuller",
  "asp",
  "blocks",
  "darted",
  "shrine",
  "heel",
  "typical",
  "throws",
  "fortunately",
  "recognise",
  "fuel",
  "6th",
  "tranquil",
  "frown",
  "destination",
  "plunge",
  "moor",
  "pin",
  "mars",
  "associate",
  "here's",
  "owen",
  "10th",
  "arabic",
  "vicious",
  "framed",
  "banquet",
  "expressive",
  "instinctively",
  "lighting",
  "scanning",
  "subordinate",
  "jaws",
  "patent",
  "courtyard",
  "gulf",
  "destroying",
  "detailed",
  "regulating",
  "closet",
  "compel",
  "inland",
  "excepting",
  "pretext",
  "legislative",
  "stationed",
  "rash",
  "margin",
  "champion",
  "settling",
  "billion",
  "shorter",
  "betwixt",
  "admiring",
  "morgan",
  "nick",
  "chemical",
  "chapters",
  "worthless",
  "aristocratic",
  "nan",
  "especial",
  "hon",
  "attentive",
  "maintenance",
  "charlie",
  "explanatory",
  "differently",
  "furiously",
  "pulse",
  "scanty",
  "flee",
  "admiral",
  "clause",
  "resume",
  "compound",
  "pilot",
  "growled",
  "charmed",
  "imitate",
  "happening",
  "knot",
  "rags",
  "mock",
  "majestic",
  "messages",
  "prussian",
  "suspense",
  "clare",
  "relationship",
  "skirt",
  "agency",
  "arisen",
  "grin",
  "unusually",
  "michigan",
  "hoarse",
  "mills",
  "intently",
  "dining",
  "demonstration",
  "depression",
  "lain",
  "expectations",
  "joining",
  "weekly",
  "trenches",
  "technical",
  "vehicle",
  "aimed",
  "borrow",
  "flattering",
  "portugal",
  "prodigious",
  "scope",
  "vegetation",
  "switzerland",
  "arkansas",
  "swelling",
  "fortified",
  "favoured",
  "salute",
  "topic",
  "blushed",
  "superb",
  "strengthen",
  "confidential",
  "crow",
  "shawl",
  "sunrise",
  "sings",
  "coats",
  "sturdy",
  "dissolved",
  "lifetime",
  "dispersed",
  "sergeant",
  "contribute",
  "strode",
  "brigade",
  "verdict",
  "they've",
  "honors",
  "panting",
  "females",
  "richest",
  "attribute",
  "brighter",
  "hook",
  "discontent",
  "orderly",
  "airs",
  "tiger",
  "messengers",
  "penetrate",
  "sabbath",
  "identification",
  "holiness",
  "crooked",
  "housekeeper",
  "productions",
  "prescribed",
  "rector",
  "spark",
  "sleeve",
  "honored",
  "tame",
  "highway",
  "alabama",
  "edmund",
  "militia",
  "nobleman",
  "energies",
  "spacious",
  "tearing",
  "affliction",
  "photograph",
  "ally",
  "hampshire",
  "ascent",
  "ditch",
  "fishes",
  "jupiter",
  "rubbing",
  "tract",
  "standards",
  "afore",
  "ribbon",
  "cecilia",
  "oregon",
  "integrity",
  "plus",
  "transparent",
  "farms",
  "pulpit",
  "ropes",
  "nineteen",
  "rescued",
  "counting",
  "perfume",
  "socrates",
  "hounds",
  "solicited",
  "bother",
  "fascinating",
  "qualified",
  "desolation",
  "essay",
  "rains",
  "renew",
  "odious",
  "assuredly",
  "suggests",
  "rider",
  "loneliness",
  "pond",
  "activities",
  "dazzling",
  "leaping",
  "squadron",
  "bowing",
  "novelty",
  "wrist",
  "keeper",
  "homeward",
  "alexandria",
  "finely",
  "li",
  "efficiency",
  "marvel",
  "tranquillity",
  "agnes",
  "charities",
  "spenser",
  "condemn",
  "elephants",
  "elders",
  "julian",
  "tries",
  "2nd",
  "sweetly",
  "endurance",
  "bags",
  "reared",
  "jaw",
  "unique",
  "navigation",
  "inevitably",
  "admirably",
  "sect",
  "drum",
  "poles",
  "verge",
  "piercing",
  "sanction",
  "russians",
  "forlorn",
  "approbation",
  "organic",
  "stanley",
  "allegiance",
  "bin",
  "expressly",
  "ingenuity",
  "dispose",
  "stained",
  "theology",
  "withal",
  "duration",
  "fundraising",
  "collecting",
  "weigh",
  "sweetest",
  "float",
  "consul",
  "monastery",
  "raging",
  "publish",
  "knocking",
  "precaution",
  "privately",
  "aaron",
  "endeavored",
  "insight",
  "definitely",
  "stature",
  "troy",
  "miriam",
  "judah",
  "oblige",
  "urging",
  "shift",
  "mould",
  "courses",
  "countless",
  "associates",
  "hymn",
  "rapture",
  "tonight",
  "trumpet",
  "parker",
  "entrusted",
  "firmness",
  "comic",
  "breeding",
  "ken",
  "questioning",
  "factor",
  "monuments",
  "loveliness",
  "handled",
  "communities",
  "saloon",
  "stumbled",
  "witch",
  "confronted",
  "traveling",
  "seamen",
  "backed",
  "profoundly",
  "gladness",
  "pomp",
  "mess",
  "practise",
  "sanctuary",
  "superstitious",
  "casual",
  "iowa",
  "analyzed",
  "historic",
  "bored",
  "shrink",
  "judging",
  "treating",
  "expenditure",
  "encouraging",
  "diplomatic",
  "forcing",
  "studio",
  "exposure",
  "crude",
  "compilation",
  "vermont",
  "eve",
  "ascend",
  "unbroken",
  "apollo",
  "countess",
  "binding",
  "exceed",
  "frail",
  "hans",
  "champagne",
  "shuddered",
  "carter",
  "mule",
  "inserted",
  "parson",
  "rascal",
  "inspire",
  "banner",
  "divorce",
  "treacherous",
  "nineteenth",
  "invalid",
  "weaker",
  "organizations",
  "bolt",
  "ticket",
  "backwards",
  "captivity",
  "lame",
  "provoked",
  "vein",
  "lists",
  "gallop",
  "communications",
  "dagger",
  "passive",
  "shoe",
  "thrice",
  "corrected",
  "mystic",
  "infancy",
  "foam",
  "keith",
  "tavern",
  "fraud",
  "7th",
  "cradle",
  "rifles",
  "vigorously",
  "censure",
  "gentleness",
  "jr",
  "sobbing",
  "monotonous",
  "explosion",
  "catastrophe",
  "respectfully",
  "wearied",
  "cats",
  "blamed",
  "needful",
  "fireplace",
  "gravel",
  "affords",
  "discovering",
  "jar",
  "selfishness",
  "tolerably",
  "clerks",
  "ark",
  "moist",
  "wid",
  "sauce",
  "prompted",
  "exceptions",
  "bullets",
  "writ",
  "bruce",
  "insolent",
  "moisture",
  "thompson",
  "furnace",
  "healing",
  "fewer",
  "deem",
  "apron",
  "humiliation",
  "punctuation",
  "rolls",
  "doe",
  "rotten",
  "richer",
  "swiss",
  "behavior",
  "nowadays",
  "pamphlet",
  "loan",
  "beads",
  "divers",
  "unreasonable",
  "realise",
  "lust",
  "ah",
  "annually",
  "detach",
  "gaily",
  "shares",
  "gifted",
  "planet",
  "feverish",
  "resurrection",
  "saul",
  "consecrated",
  "enforced",
  "vincent",
  "shelf",
  "fan",
  "fluid",
  "brightly",
  "damsel",
  "gabriel",
  "kid",
  "frantic",
  "neatly",
  "anon",
  "ascribed",
  "insane",
  "tropical",
  "8th",
  "milan",
  "hardened",
  "overthrow",
  "phase",
  "achievement",
  "immortality",
  "obscurity",
  "assumption",
  "discern",
  "hopeful",
  "humorous",
  "composure",
  "turf",
  "poland",
  "dame",
  "missionaries",
  "orator",
  "perpetually",
  "arbitrary",
  "ecstasy",
  "retirement",
  "pronounce",
  "authorized",
  "familiarity",
  "nl",
  "hastings",
  "clubs",
  "reconciled",
  "grievous",
  "mercury",
  "elegance",
  "chivalry",
  "luminous",
  "beseech",
  "benevolent",
  "confided",
  "dances",
  "perplexity",
  "escaping",
  "terrific",
  "companionship",
  "commence",
  "daisy",
  "parliament",
  "9th",
  "creep",
  "pleading",
  "disdain",
  "pm",
  "sympathies",
  "guides",
  "emergency",
  "parcel",
  "suicide",
  "replies",
  "drawer",
  "contribution",
  "supposition",
  "vii",
  "weren't",
  "link",
  "homely",
  "pluck",
  "ruling",
  "patrick",
  "statesmen",
  "hannah",
  "printing",
  "joshua",
  "synonymous",
  "sinister",
  "advocate",
  "destructive",
  "environment",
  "blossom",
  "bridle",
  "yon",
  "waistcoat",
  "extends",
  "confirm",
  "listing",
  "solemnity",
  "projects",
  "reporter",
  "deprive",
  "detachment",
  "infernal",
  "traversed",
  "moss",
  "skilled",
  "announce",
  "hateful",
  "fugitive",
  "gothic",
  "coolness",
  "insurrection",
  "cum",
  "med",
  "coachman",
  "expend",
  "stepping",
  "julius",
  "resign",
  "despatch",
  "excluded",
  "reject",
  "tough",
  "plea",
  "roy",
  "fragment",
  "lacked",
  "wordsworth",
  "balcony",
  "darker",
  "mac",
  "nevada",
  "christopher",
  "fork",
  "flatter",
  "iniquity",
  "meditation",
  "disastrous",
  "stain",
  "patches",
  "hints",
  "ordained",
  "drinks",
  "whipped",
  "burial",
  "matt",
  "employee",
  "employer",
  "hypothesis",
  "steed",
  "width",
  "sweden",
  "transaction",
  "victories",
  "devout",
  "outrage",
  "vary",
  "attorney",
  "rouse",
  "doubled",
  "sidney",
  "schooner",
  "flaming",
  "offend",
  "sheriff",
  "encamped",
  "magnificence",
  "vent",
  "politely",
  "vines",
  "flags",
  "italians",
  "necessities",
  "austin",
  "nobler",
  "accusation",
  "impulses",
  "packet",
  "shabby",
  "irritated",
  "dakota",
  "industrious",
  "classic",
  "ranch",
  "ascending",
  "cruelly",
  "happiest",
  "antonio",
  "accuse",
  "insulted",
  "bridges",
  "players",
  "sixteenth",
  "solicitation",
  "embarked",
  "idol",
  "odds",
  "aims",
  "illuminated",
  "enchanted",
  "adversary",
  "pie",
  "reflecting",
  "pension",
  "luxurious",
  "pigs",
  "choir",
  "tumbled",
  "conqueror",
  "irritation",
  "verb",
  "monkey",
  "acceptable",
  "dynasty",
  "accurately",
  "divinity",
  "signature",
  "heretofore",
  "hazard",
  "dora",
  "stead",
  "attire",
  "fling",
  "marine",
  "occupations",
  "soothing",
  "devised",
  "singer",
  "spaces",
  "emerson",
  "disguised",
  "antique",
  "orthodox",
  "poisoned",
  "dove",
  "gratification",
  "sydney",
  "electricity",
  "alien",
  "sorely",
  "cracked",
  "supremacy",
  "summon",
  "depressed",
  "sexes",
  "offerings",
  "pledged",
  "irony",
  "recourse",
  "tortured",
  "thickly",
  "correspondent",
  "sounding",
  "sombre",
  "brushed",
  "reasonably",
  "12th",
  "duel",
  "reluctantly",
  "implies",
  "cable",
  "ridden",
  "acre",
  "grieve",
  "inquiring",
  "colonists",
  "addison",
  "republican",
  "illustrate",
  "tim",
  "liverpool",
  "gilded",
  "clumsy",
  "satin",
  "displeased",
  "odor",
  "clearer",
  "prairie",
  "hudson",
  "feudal",
  "flint",
  "easter",
  "freshness",
  "nursery",
  "explanations",
  "adoption",
  "reluctance",
  "crosses",
  "blushing",
  "imported",
  "notorious",
  "equipped",
  "sinful",
  "starving",
  "eugene",
  "bedside",
  "sovereigns",
  "abrupt",
  "excused",
  "injure",
  "incessant",
  "correctly",
  "drooping",
  "adored",
  "embroidered",
  "pasture",
  "pillar",
  "import",
  "founder",
  "torch",
  "vault",
  "worm",
  "ay",
  "bravery",
  "confinement",
  "trusting",
  "butler",
  "rattle",
  "transported",
  "estimation",
  "edit",
  "gotten",
  "cuts",
  "headlong",
  "outfit",
  "insolence",
  "secrecy",
  "thereupon",
  "unlucky",
  "eighth",
  "valour",
  "grammar",
  "relaxed",
  "mentions",
  "adjacent",
  "knives",
  "attacking",
  "exceptional",
  "recollections",
  "deposit",
  "establishing",
  "muddy",
  "arches",
  "aspects",
  "senior",
  "fragrance",
  "colonial",
  "penetrating",
  "refinement",
  "te",
  "yacht",
  "intelligible",
  "stray",
  "forcibly",
  "jenny",
  "superficial",
  "tends",
  "identified",
  "wan",
  "choosing",
  "frighten",
  "grotesque",
  "reprinted",
  "tutor",
  "contributing",
  "welsh",
  "gaiety",
  "besieged",
  "robbery",
  "transmitted",
  "swam",
  "consequential",
  "slid",
  "stony",
  "donald",
  "gratify",
  "heavier",
  "confidently",
  "mabel",
  "demon",
  "treatise",
  "mechanically",
  "batteries",
  "trading",
  "cock",
  "pilgrimage",
  "extinct",
  "idleness",
  "sicily",
  "merrily",
  "excursion",
  "handling",
  "utah",
  "eminence",
  "lump",
  "boyhood",
  "montana",
  "superfluous",
  "wee",
  "dome",
  "shivering",
  "accidental",
  "thickness",
  "darwin",
  "continuance",
  "fixing",
  "harris",
  "rustic",
  "cheered",
  "vernon",
  "premises",
  "delivery",
  "nodding",
  "snowy",
  "curved",
  "productive",
  "discouraged",
  "variations",
  "shilling",
  "swollen",
  "miraculous",
  "stubborn",
  "belgium",
  "drives",
  "jerome",
  "orchard",
  "persuasion",
  "invaded",
  "alps",
  "ungrateful",
  "insensible",
  "muscle",
  "madrid",
  "flanders",
  "cultivate",
  "involuntarily",
  "speedy",
  "variation",
  "marian",
  "harp",
  "peaks",
  "daybreak",
  "magnitude",
  "precautions",
  "rub",
  "requiring",
  "coral",
  "grapes",
  "fairest",
  "locality",
  "opponent",
  "bondage",
  "beans",
  "cowardly",
  "grandson",
  "leo",
  "gertrude",
  "nail",
  "protecting",
  "hospitable",
  "proving",
  "benevolence",
  "brussels",
  "civilisation",
  "mounting",
  "desiring",
  "rushes",
  "precision",
  "watchful",
  "harness",
  "perchance",
  "forbade",
  "channels",
  "indication",
  "zealous",
  "tact",
  "seventeenth",
  "theodore",
  "stating",
  "toast",
  "dreadfully",
  "judith",
  "asterisk",
  "virgil",
  "edifice",
  "swelled",
  "accomplishment",
  "sundry",
  "reckoning",
  "mouse",
  "prostrate",
  "helm",
  "slim",
  "whistling",
  "syllable",
  "handwriting",
  "commissioners",
  "lime",
  "spur",
  "unfit",
  "relish",
  "reduction",
  "sown",
  "venetian",
  "cordially",
  "hush",
  "breasts",
  "slipping",
  "pat",
  "arabian",
  "dialogue",
  "forwards",
  "entreat",
  "fascination",
  "belly",
  "neutral",
  "grasping",
  "diligence",
  "disgusted",
  "retiring",
  "strokes",
  "sob",
  "vine",
  "compose",
  "valentine",
  "harvey",
  "icy",
  "inconvenience",
  "v",
  "pots",
  "dimensions",
  "abused",
  "armor",
  "detect",
  "contradiction",
  "banker",
  "infamous",
  "powerless",
  "passenger",
  "crust",
  "historians",
  "disclaim",
  "norway",
  "peculiarities",
  "sting",
  "simultaneously",
  "watches",
  "episode",
  "achieve",
  "populace",
  "sherman",
  "incense",
  "rebecca",
  "jordan",
  "persistent",
  "wisconsin",
  "ho",
  "ta",
  "fruitful",
  "scoundrel",
  "coasts",
  "starve",
  "denmark",
  "scots",
  "consultation",
  "habitation",
  "goat",
  "howling",
  "tailor",
  "flourish",
  "trifles",
  "dashing",
  "disappearance",
  "sour",
  "practicable",
  "shameful",
  "inviting",
  "criminals",
  "leisurely",
  "accumulated",
  "audible",
  "topics",
  "expends",
  "radiance",
  "underline",
  "parade",
  "spoils",
  "helmet",
  "consternation",
  "expenditures",
  "impose",
  "originator",
  "pa",
  "unequal",
  "wooded",
  "enduring",
  "ox",
  "valet",
  "proclaim",
  "carl",
  "impossibility",
  "lydia",
  "territories",
  "deference",
  "ravine",
  "geoffrey",
  "blanche",
  "accommodation",
  "boyish",
  "spray",
  "theological",
  "anonymous",
  "injurious",
  "formally",
  "sports",
  "ab",
  "scales",
  "wyoming",
  "discontinue",
  "calf",
  "manual",
  "disturbing",
  "potent",
  "anticipation",
  "melt",
  "tilde",
  "thames",
  "grade",
  "mischievous",
  "pang",
  "pathos",
  "alternately",
  "brisk",
  "stool",
  "justification",
  "foreigner",
  "endeavouring",
  "satire",
  "al",
  "delete",
  "masculine",
  "spies",
  "umbrella",
  "transportation",
  "yell",
  "remnant",
  "boot",
  "ignored",
  "thrilling",
  "ale",
  "mineral",
  "goose",
  "nebraska",
  "truce",
  "lastly",
  "airy",
  "sketches",
  "groves",
  "11th",
  "comprehension",
  "cling",
  "duck",
  "abyss",
  "alaska",
  "baffled",
  "planning",
  "abominable",
  "aversion",
  "drawings",
  "customers",
  "weird",
  "stewart",
  "traveled",
  "alan",
  "incessantly",
  "flattery",
  "director",
  "improbable",
  "moderation",
  "awakening",
  "males",
  "pairs",
  "temporal",
  "con",
  "nicely",
  "lapse",
  "vitality",
  "soap",
  "patriot",
  "malicious",
  "eyed",
  "pirates",
  "enforce",
  "doll",
  "briskly",
  "sez",
  "skeleton",
  "comprehensive",
  "buttons",
  "crushing",
  "personages",
  "threaten",
  "nuts",
  "undone",
  "wright",
  "frankness",
  "hides",
  "progressive",
  "rogers",
  "villa",
  "aristotle",
  "resource",
  "irs",
  "confine",
  "sewing",
  "co",
  "congratulate",
  "walt",
  "reconcile",
  "insurance",
  "terminated",
  "dusky",
  "appoint",
  "pearl",
  "thrilled",
  "gains",
  "interrupt",
  "extravagance",
  "jokes",
  "suppress",
  "quod",
  "signify",
  "layer",
  "clue",
  "kettle",
  "contemplate",
  "aforesaid",
  "tooth",
  "sensibility",
  "boldness",
  "mature",
  "cuba",
  "tolerable",
  "rabbit",
  "befallen",
  "needless",
  "yankee",
  "awaken",
  "clasp",
  "lets",
  "blinded",
  "conductor",
  "dependence",
  "guarantee",
  "affectionately",
  "player",
  "wires",
  "thicket",
  "walker",
  "outstretched",
  "procedure",
  "wheeled",
  "aye",
  "oneself",
  "recommendation",
  "projecting",
  "shriek",
  "futile",
  "cheerfulness",
  "deity",
  "fifteenth",
  "gap",
  "muscular",
  "dripping",
  "insect",
  "values",
  "brooding",
  "restaurant",
  "baptism",
  "imaginative",
  "rhyme",
  "exhaustion",
  "intrigue",
  "senseless",
  "hercules",
  "yearly",
  "baron",
  "occupying",
  "imply",
  "absurdity",
  "launched",
  "resolutely",
  "vowed",
  "attach",
  "characterized",
  "fellowship",
  "posture",
  "caps",
  "leon",
  "demanding",
  "owl",
  "beset",
  "ensuring",
  "suite",
  "tennyson",
  "thereto",
  "heaped",
  "jewel",
  "regained",
  "voluntarily",
  "longitude",
  "permanently",
  "jumping",
  "babe",
  "secondly",
  "violin",
  "rogue",
  "rainy",
  "reconciliation",
  "emotional",
  "radical",
  "accursed",
  "tendencies",
  "concrete",
  "resident",
  "lustre",
  "hull",
  "ominous",
  "overboard",
  "uproar",
  "cavern",
  "combine",
  "respectively",
  "menace",
  "pilgrims",
  "jeff",
  "peak",
  "currency",
  "silken",
  "violet",
  "khan",
  "mastery",
  "objective",
  "plucked",
  "litter",
  "memorial",
  "bids",
  "fondly",
  "clapped",
  "tariff",
  "beneficial",
  "unsolicited",
  "reluctant",
  "separately",
  "patronage",
  "revenues",
  "dragon",
  "zeus",
  "mike",
  "ranges",
  "vexation",
  "indicates",
  "overheard",
  "tray",
  "raymond",
  "thereafter",
  "exporting",
  "mound",
  "taxation",
  "frenzy",
  "horizontal",
  "thirsty",
  "disputed",
  "charter",
  "redistribution",
  "boasted",
  "item",
  "moscow",
  "termination",
  "eminently",
  "suggestive",
  "linger",
  "shady",
  "calculation",
  "expansion",
  "mast",
  "confer",
  "sophia",
  "commanders",
  "pitied",
  "twist",
  "traditional",
  "involve",
  "interfered",
  "achilles",
  "wanton",
  "repay",
  "brother-in-law",
  "routine",
  "son-in-law",
  "gaul",
  "groom",
  "solve",
  "grassy",
  "tempt",
  "unsuccessful",
  "witty",
  "politician",
  "yearning",
  "lid",
  "noticing",
  "courtiers",
  "cheering",
  "bounty",
  "consequent",
  "renown",
  "regulation",
  "fowl",
  "mayor",
  "wrinkled",
  "defy",
  "threads",
  "violation",
  "junction",
  "boss",
  "particles",
  "glories",
  "signifies",
  "constrained",
  "paternal",
  "piles",
  "hardware",
  "engaging",
  "peer",
  "counties",
  "mocking",
  "avoiding",
  "rebuke",
  "abolished",
  "cheers",
  "idiot",
  "3rd",
  "morbid",
  "wrung",
  "e-mail",
  "outcome",
  "gilt",
  "coldness",
  "applying",
  "strand",
  "renowned",
  "fishermen",
  "creative",
  "circus",
  "moustache",
  "proverb",
  "lowering",
  "biggest",
  "sly",
  "nursing",
  "boon",
  "weighing",
  "oklahoma",
  "brink",
  "degraded",
  "avenge",
  "hum",
  "minority",
  "spaniard",
  "ridges",
  "perils",
  "larry",
  "merchandise",
  "aloof",
  "despairing",
  "acquisition",
  "asylum",
  "chickens",
  "placid",
  "affirm",
  "trod",
  "gardener",
  "schedule",
  "calmness",
  "protector",
  "concealment",
  "trench",
  "fore",
  "accession",
  "h",
  "dey",
  "connexion",
  "cairo",
  "mend",
  "considers",
  "twenty-one",
  "municipal",
  "achievements",
  "cherish",
  "deserving",
  "exert",
  "riot",
  "veteran",
  "advancement",
  "inventor",
  "meek",
  "cameron",
  "hopelessly",
  "judicious",
  "tending",
  "testify",
  "governess",
  "orchestra",
  "garb",
  "condemnation",
  "foregoing",
  "bacon",
  "maternal",
  "wasting",
  "australian",
  "strata",
  "hushed",
  "maryland",
  "sculpture",
  "miniature",
  "corrections",
  "tangled",
  "completion",
  "regulated",
  "athenian",
  "flavor",
  "brand",
  "intimately",
  "unlimited",
  "dipped",
  "luggage",
  "inconsistent",
  "forsaken",
  "feebly",
  "woven",
  "lloyd",
  "rubbish",
  "tool",
  "spirited",
  "christendom",
  "chaos",
  "twinkling",
  "muffled",
  "accents",
  "accidentally",
  "degradation",
  "emancipation",
  "prosecution",
  "cleveland",
  "outbreak",
  "defending",
  "dwarf",
  "abundantly",
  "turner",
  "disadvantage",
  "abolition",
  "disregard",
  "deliberation",
  "filthy",
  "ak",
  "notifies",
  "dealings",
  "demonstrated",
  "paced",
  "tense",
  "drums",
  "interpreter",
  "vanish",
  "astray",
  "hen",
  "workman",
  "asunder",
  "baked",
  "baltimore",
  "bustle",
  "winged",
  "mentioning",
  "pastoral",
  "fabric",
  "trim",
  "musician",
  "twenty-two",
  "patty",
  "mentally",
  "wrecked",
  "discreet",
  "godfrey",
  "apostle",
  "ledge",
  "roast",
  "accessed",
  "preface",
  "convincing",
  "quiver",
  "stocks",
  "mourn",
  "commented",
  "redistribute",
  "precipice",
  "outdated",
  "juliet",
  "dialect",
  "elementary",
  "freight",
  "cowardice",
  "wipe",
  "deserts",
  "shelves",
  "denial",
  "1b",
  "traits",
  "denounced",
  "eric",
  "underground",
  "phantom",
  "whirling",
  "pecuniary",
  "dire",
  "hostilities",
  "gait",
  "it'll",
  "vividly",
  "instruct",
  "dickens",
  "puritan",
  "clutched",
  "acknowledgment",
  "conjunction",
  "oppressive",
  "intermediate",
  "formula",
  "hungary",
  "sneer",
  "ore",
  "plentiful",
  "plump",
  "combinations",
  "purest",
  "cheat",
  "doubly",
  "inadequate",
  "leslie",
  "blest",
  "forbear",
  "haunt",
  "treaties",
  "fearless",
  "constable",
  "enveloped",
  "enmity",
  "watson",
  "bridegroom",
  "curate",
  "developing",
  "frock",
  "mining",
  "audacity",
  "improper",
  "motto",
  "parisian",
  "faction",
  "architect",
  "melting",
  "delicately",
  "register",
  "heroine",
  "indefinite",
  "console",
  "defensive",
  "perceptible",
  "fruitless",
  "ransom",
  "surplus",
  "solicitude",
  "effectual",
  "shiver",
  "gal",
  "wed",
  "contemptuous",
  "plough",
  "snakes",
  "felicity",
  "reef",
  "outset",
  "constitutes",
  "lament",
  "tissue",
  "draft",
  "impelled",
  "epic",
  "fisherman",
  "hawaii",
  "obstinacy",
  "ulysses",
  "lemon",
  "voltaire",
  "hound",
  "measuring",
  "conscientious",
  "robber",
  "toy",
  "impart",
  "statute",
  "barry",
  "girdle",
  "basil",
  "rebellious",
  "stair",
  "biting",
  "consulting",
  "perseverance",
  "manila",
  "massacre",
  "cough",
  "blazed",
  "claude",
  "transition",
  "button",
  "headache",
  "tenant",
  "burns",
  "harmonious",
  "dreamy",
  "burgundy",
  "collections",
  "unkind",
  "inscribed",
  "cushions",
  "programme",
  "din",
  "laborious",
  "manufacturing",
  "markets",
  "zone",
  "humane",
  "ac",
  "fertility",
  "languid",
  "ninth",
  "curses",
  "introducing",
  "alcohol",
  "impending",
  "declining",
  "advantageous",
  "heal",
  "millennium",
  "karl",
  "staid",
  "planting",
  "theatrical",
  "spectator",
  "winchester",
  "greedy",
  "commonwealth",
  "suffrage",
  "tremulous",
  "commodities",
  "stuffed",
  "admitting",
  "aching",
  "ninety",
  "discomfort",
  "imperative",
  "montreal",
  "bobby",
  "bachelor",
  "geographical",
  "longest",
  "courageous",
  "carpenter",
  "sundays",
  "concluding",
  "danish",
  "steer",
  "influential",
  "surround",
  "random",
  "ounce",
  "afresh",
  "dictated",
  "ruddy",
  "rusty",
  "drown",
  "irving",
  "slide",
  "sow",
  "appalling",
  "profess",
  "sickly",
  "rides",
  "spoon",
  "imminent",
  "dominant",
  "leadership",
  "pinch",
  "wearily",
  "ducks",
  "diary",
  "duchess",
  "regain",
  "rum",
  "churchyard",
  "fondness",
  "apprehend",
  "ordinarily",
  "quicker",
  "thereon",
  "ni",
  "balloon",
  "individuality",
  "securely",
  "connecting",
  "celebrate",
  "bluff",
  "dawned",
  "amiss",
  "chalk",
  "sticking",
  "fuss",
  "dazed",
  "deputy",
  "forsake",
  "automobile",
  "discussions",
  "harrison",
  "refreshment",
  "amendment",
  "appealing",
  "eden",
  "vertical",
  "insufficient",
  "manchester",
  "hem",
  "gorge",
  "baptized",
  "damn",
  "silvery",
  "pastor",
  "inherent",
  "preventing",
  "inference",
  "advertisement",
  "mutton",
  "packing",
  "enclosure",
  "theft",
  "publisher",
  "spontaneous",
  "otto",
  "rats",
  "apparition",
  "refreshing",
  "irene",
  "sweetheart",
  "renounce",
  "lifeless",
  "adore",
  "vinegar",
  "normandy",
  "uncovered",
  "utility",
  "orphan",
  "symbols",
  "gracefully",
  "mightily",
  "peculiarity",
  "ash",
  "floods",
  "partake",
  "contemptible",
  "deities",
  "profane",
  "foreseen",
  "ti",
  "conceit",
  "commend",
  "twelfth",
  "bristol",
  "manifestation",
  "revive",
  "prone",
  "connect",
  "princely",
  "overtake",
  "improving",
  "downwards",
  "ferocious",
  "intervention",
  "subsistence",
  "susceptible",
  "tunnel",
  "disciple",
  "revival",
  "twins",
  "ivy",
  "puzzle",
  "citadel",
  "temporarily",
  "despotism",
  "internet",
  "mechanism",
  "stoop",
  "directors",
  "mathematics",
  "raft",
  "fade",
  "soothe",
  "pork",
  "substituted",
  "physically",
  "brilliancy",
  "dot",
  "loaf",
  "expanse",
  "shocking",
  "rudely",
  "isle",
  "balanced",
  "extracted",
  "fable",
  "matches",
  "index",
  "gerard",
  "cigars",
  "liver",
  "transmit",
  "dispatch",
  "onto",
  "veranda",
  "dip",
  "inexplicable",
  "liar",
  "diminish",
  "dungeon",
  "unit",
  "pagan",
  "phillips",
  "brig",
  "monopoly",
  "rim",
  "sordid",
  "complaining",
  "temperate",
  "chat",
  "gambling",
  "maps",
  "amber",
  "trot",
  "howl",
  "shipping",
  "ton",
  "magazines",
  "bricks",
  "submarine",
  "roberts",
  "cumberland",
  "cecil",
  "semblance",
  "palestine",
  "perpendicular",
  "regardless",
  "fervent",
  "sane",
  "wreath",
  "animation",
  "earthquake",
  "sloping",
  "smoothly",
  "tension",
  "intrigues",
  "fearfully",
  "macaulay",
  "laboratory",
  "cork",
  "comments",
  "whale",
  "wedded",
  "whiteness",
  "convicted",
  "deception",
  "paved",
  "scruple",
  "paintings",
  "therewith",
  "religions",
  "governing",
  "colleagues",
  "shrinking",
  "tickets",
  "prophetic",
  "undergo",
  "hare",
  "haze",
  "poisonous",
  "omit",
  "beware",
  "sagacity",
  "concession",
  "worker",
  "ted",
  "incline",
  "caste",
  "leapt",
  "dissatisfied",
  "hardest",
  "self-control",
  "toilet",
  "buddha",
  "offense",
  "woodland",
  "gentry",
  "starvation",
  "grudge",
  "penance",
  "tips",
  "rooted",
  "outburst",
  "fortitude",
  "turk",
  "devour",
  "malignant",
  "accorded",
  "brandon",
  "anticipate",
  "speechless",
  "inquisition",
  "eccentric",
  "anecdote",
  "annals",
  "scrutiny",
  "burroughs",
  "rhythm",
  "discord",
  "marius",
  "diversion",
  "archie",
  "rat",
  "knit",
  "correspond",
  "detain",
  "dis",
  "esp",
  "interpret",
  "vehement",
  "soda",
  "naughty",
  "salon",
  "operate",
  "idly",
  "imperious",
  "peru",
  "candid",
  "whig",
  "blooming",
  "wharf",
  "disgraceful",
  "stunned",
  "redemption",
  "drain",
  "wage",
  "cooper",
  "embassy",
  "unfinished",
  "nasty",
  "impetuous",
  "cemetery",
  "oblivion",
  "prohibited",
  "breeches",
  "abound",
  "christine",
  "frivolous",
  "hugo",
  "essays",
  "plaster",
  "tap",
  "chairman",
  "dismiss",
  "katherine",
  "provoke",
  "reside",
  "deficient",
  "decoration",
  "heroism",
  "toe",
  "wade",
  "apparel",
  "hazel",
  "inability",
  "farthest",
  "invent",
  "knave",
  "twain",
  "carelessness",
  "affectation",
  "connections",
  "climax",
  "avowed",
  "industries",
  "brood",
  "tempting",
  "define",
  "antwerp",
  "forefathers",
  "stretches",
  "gratifying",
  "plight",
  "restricted",
  "cupboard",
  "ludicrous",
  "alms",
  "colossal",
  "stupidity",
  "monotony",
  "stimulus",
  "vigilance",
  "digest",
  "vale",
  "overcoat",
  "colorado",
  "wink",
  "nous",
  "rack",
  "incomprehensible",
  "antagonist",
  "methinks",
  "barley",
  "plateau",
  "superintendent",
  "indescribable",
  "expanded",
  "presentation",
  "archbishop",
  "devise",
  "rubber",
  "adieu",
  "exclude",
  "carts",
  "lone",
  "whisky",
  "abuses",
  "inflict",
  "nightfall",
  "counts",
  "chocolate",
  "privileged",
  "hermit",
  "exultation",
  "overtook",
  "coincidence",
  "scratch",
  "screw",
  "caravan",
  "divert",
  "eliza",
  "comparing",
  "hood",
  "explore",
  "glove",
  "chaste",
  "whirl",
  "adventurous",
  "skipper",
  "tiresome",
  "implements",
  "recompense",
  "plank",
  "insure",
  "laboured",
  "exaggeration",
  "mi",
  "shepherds",
  "lilies",
  "ballad",
  "befall",
  "cylinder",
  "teddy",
  "summary",
  "daresay",
  "photographs",
  "colleges",
  "dissolution",
  "geneva",
  "marches",
  "instituted",
  "seals",
  "vehemence",
  "chaplain",
  "knots",
  "wail",
  "kneel",
  "unlikely",
  "deceit",
  "challenged",
  "geography",
  "herald",
  "lowly",
  "peep",
  "swarm",
  "clarke",
  "joyfully",
  "engraved",
  "ll",
  "bowels",
  "purposely",
  "blindness",
  "systematic",
  "virtually",
  "conformity",
  "remedies",
  "maxim",
  "indexes",
  "marshall",
  "baking",
  "invincible",
  "impertinent",
  "bust",
  "visage",
  "intuition",
  "mingle",
  "bathing",
  "arched",
  "investment",
  "tabernacle",
  "client",
  "ghostly",
  "furs",
  "catalogue",
  "dock",
  "tenor",
  "arouse",
  "verbal",
  "excessively",
  "brazil",
  "strenuous",
  "irishman",
  "recess",
  "unclean",
  "psalms",
  "analogy",
  "chemistry",
  "peninsula",
  "infer",
  "maritime",
  "secular",
  "hawk",
  "rein",
  "averted",
  "bake",
  "constantine",
  "oracle",
  "alley",
  "softness",
  "pierce",
  "spinning",
  "snatch",
  "manufactured",
  "launch",
  "psychology",
  "worms",
  "regulate",
  "farming",
  "fasten",
  "actress",
  "etiquette",
  "theater",
  "thanksgiving",
  "valor",
  "untouched",
  "tactics",
  "drug",
  "adverse",
  "gaunt",
  "conducting",
  "veritable",
  "overtaken",
  "distorted",
  "rosa",
  "nina",
  "quart",
  "caprice",
  "candy",
  "obliging",
  "planets",
  "soothed",
  "sic",
  "opium",
  "pavilion",
  "strait",
  "sanguine",
  "cords",
  "odour",
  "trout",
  "paste",
  "regularity",
  "metallic",
  "scrap",
  "convict",
  "instructive",
  "investigate",
  "celtic",
  "package",
  "pirate",
  "fiend",
  "moan",
  "revealing",
  "trades",
  "rounds",
  "accomplishments",
  "crawl",
  "aft",
  "prevalent",
  "role",
  "dose",
  "evans",
  "hypocrisy",
  "l",
  "salmon",
  "snap",
  "alma",
  "magical",
  "tire",
  "hetty",
  "impenetrable",
  "geese",
  "madly",
  "manifold",
  "noticeable",
  "pudding",
  "volcanic",
  "locke",
  "magnetic",
  "deals",
  "core",
  "decency",
  "observance",
  "durst",
  "scratched",
  "predecessor",
  "diplomacy",
  "wert",
  "impartial",
  "disinterested",
  "wig",
  "pump",
  "swedish",
  "norfolk",
  "reigns",
  "similarly",
  "reap",
  "dam",
  "facilities",
  "slippery",
  "transformation",
  "oxygen",
  "suburbs",
  "dares",
  "ornamental",
  "pondered",
  "fringe",
  "raiment",
  "henrietta",
  "wellington",
  "foreman",
  "feat",
  "thirteenth",
  "sultan",
  "certificate",
  "rue",
  "heresy",
  "arabia",
  "medal",
  "location",
  "ether",
  "ruby",
  "heading",
  "subdue",
  "adorn",
  "ancestor",
  "warmer",
  "cluster",
  "quotation",
  "fullest",
  "exposition",
  "custody",
  "thermometer",
  "plausible",
  "toss",
  "desperation",
  "rhetoric",
  "scornful",
  "bailey",
  "rung",
  "civility",
  "dingy",
  "scaffold",
  "concentration",
  "avarice",
  "scrape",
  "pools",
  "oar",
  "flutter",
  "martyr",
  "handy",
  "montague",
  "bait",
  "login",
  "commotion",
  "congenial",
  "drawers",
  "telescope",
  "deposits",
  "edwards",
  "craving",
  "bureau",
  "oscar",
  "speculative",
  "huddled",
  "diverse",
  "slice",
  "renaissance",
  "angelo",
  "meg",
  "murderous",
  "serenity",
  "perspiration",
  "coventry",
  "impudent",
  "ardor",
  "necklace",
  "alight",
  "stimulated",
  "clifford",
  "steadfast",
  "genoa",
  "anglo-saxon",
  "courier",
  "inflamed",
  "xi",
  "drill",
  "spelling",
  "respond",
  "seriousness",
  "fourteenth",
  "womb",
  "literal",
  "singers",
  "usefulness",
  "cloudy",
  "mortality",
  "profusion",
  "fleeting",
  "twentieth",
  "maturity",
  "surf",
  "weed",
  "phases",
  "overcame",
  "womanhood",
  "envious",
  "tapped",
  "latent",
  "whiskey",
  "relatively",
  "forbidding",
  "cleopatra",
  "willow",
  "mathematical",
  "sojourn",
  "booty",
  "camel",
  "implore",
  "amateur",
  "morally",
  "qualifications",
  "gasp",
  "gliding",
  "tested",
  "racing",
  "brightest",
  "joel",
  "extremes",
  "damascus",
  "labored",
  "peggy",
  "exit",
  "originality",
  "humming",
  "isolation",
  "sometime",
  "glee",
  "adult",
  "solace",
  "biography",
  "hardship",
  "lied",
  "donkey",
  "trader",
  "rumour",
  "amply",
  "confide",
  "favors",
  "perspective",
  "belgian",
  "withstand",
  "robust",
  "pro",
  "val",
  "eats",
  "snare",
  "monthly",
  "wines",
  "ignore",
  "envoy",
  "flown",
  "reverie",
  "jehovah",
  "contrive",
  "chatter",
  "judas",
  "nourishment",
  "reforms",
  "clatter",
  "adrian",
  "allude",
  "corrupted",
  "thorn",
  "junior",
  "tony",
  "calcutta",
  "re",
  "holt",
  "psychological",
  "constancy",
  "misunderstood",
  "signals",
  "drying",
  "harshly",
  "distressing",
  "novelist",
  "cyril",
  "editors",
  "intricate",
  "limestone",
  "forty-five",
  "collision",
  "pebbles",
  "willie",
  "knitting",
  "ordeal",
  "foresee",
  "peas",
  "repast",
  "supplying",
  "clan",
  "abject",
  "dart",
  "berth",
  "bridal",
  "indirect",
  "unnoticed",
  "tint",
  "insults",
  "precedent",
  "twisting",
  "bully",
  "vacation",
  "'ll",
  "canon",
  "aisle",
  "click",
  "inspiring",
  "oval",
  "impracticable",
  "delirium",
  "cedar",
  "contradict",
  "ingratitude",
  "soften",
  "bewilderment",
  "servitude",
  "comely",
  "stump",
  "redeem",
  "spun",
  "elastic",
  "poultry",
  "horseman",
  "dictionary",
  "prettiest",
  "adoration",
  "wager",
  "involving",
  "pathway",
  "essex",
  "wistful",
  "advent",
  "gear",
  "celebration",
  "conceivable",
  "drowning",
  "faintest",
  "acquiring",
  "befell",
  "good-looking",
  "wares",
  "rendezvous",
  "snug",
  "watery",
  "accompaniment",
  "chaps",
  "crawling",
  "lumber",
  "publishing",
  "customer",
  "mediaeval",
  "prints",
  "lavish",
  "md",
  "genesis",
  "rug",
  "analogous",
  "eleventh",
  "noah",
  "galley",
  "partition",
  "blunder",
  "glasgow",
  "fanciful",
  "ham",
  "rainbow",
  "sentinel",
  "hereby",
  "outlook",
  "smitten",
  "unmarried",
  "mice",
  "installed",
  "vivacity",
  "marking",
  "aesthetic",
  "consume",
  "resent",
  "pose",
  "contentment",
  "sterling",
  "veneration",
  "barking",
  "bower",
  "organism",
  "unintelligible",
  "emphatic",
  "occurring",
  "factors",
  "guise",
  "editorial",
  "impudence",
  "midday",
  "corporal",
  "sg",
  "aright",
  "nigger",
  "lily",
  "noun",
  "scout",
  "spit",
  "cursing",
  "friedrich",
  "manifestly",
  "marco",
  "battalion",
  "heritage",
  "brotherhood",
  "nun",
  "wad",
  "folding",
  "discerned",
  "powerfully",
  "mitchell",
  "helpful",
  "persist",
  "ellis",
  "frigate",
  "spotted",
  "atoms",
  "curves",
  "outlet",
  "erroneous",
  "violated",
  "withheld",
  "fairies",
  "inherit",
  "sledge",
  "taller",
  "supervision",
  "butt",
  "handsomely",
  "tank",
  "velocity",
  "arctic",
  "colleague",
  "pins",
  "butcher",
  "drowsy",
  "butterfly",
  "chart",
  "twin",
  "sunken",
  "exasperated",
  "narrowly",
  "collins",
  "insulting",
  "deficiency",
  "operating",
  "overthrown",
  "gallows",
  "diligent",
  "hindu",
  "blunt",
  "omen",
  "bleak",
  "vehemently",
  "wretchedness",
  "e'er",
  "ensure",
  "denotes",
  "sentenced",
  "unfair",
  "encampment",
  "possessor",
  "absorbing",
  "descendant",
  "sub",
  "drugs",
  "engineers",
  "independently",
  "bucket",
  "clerical",
  "ache",
  "glitter",
  "ordinance",
  "bamboo",
  "amsterdam",
  "vocation",
  "admirer",
  "limp",
  "pallid",
  "mildly",
  "organisation",
  "timothy",
  "dealer",
  "yorkshire",
  "auspicious",
  "deuce",
  "emblem",
  "gibson",
  "primarily",
  "reducing",
  "ritual",
  "decorations",
  "thigh",
  "groaning",
  "scant",
  "fiscal",
  "mien",
  "charging",
  "cor",
  "railing",
  "peers",
  "inferred",
  "sanctity",
  "accumulation",
  "cynical",
  "inspector",
  "wardrobe",
  "jesuit",
  "texture",
  "adjustment",
  "epistle",
  "adventurer",
  "priesthood",
  "seaman",
  "turbulent",
  "chant",
  "marsh",
  "palmer",
  "unaware",
  "vase",
  "ty",
  "initial",
  "baths",
  "weighty",
  "minimum",
  "correction",
  "morsel",
  "overlook",
  "meagre",
  "unanimous",
  "magician",
  "mystical",
  "twenty-three",
  "inhabit",
  "shaggy",
  "unaccountable",
  "nightmare",
  "carbon",
  "coil",
  "lawless",
  "stairway",
  "willingness",
  "sarcasm",
  "crisp",
  "jerk",
  "tout",
  "vocabulary",
  "stroll",
  "poorly",
  "composing",
  "parliamentary",
  "controlling",
  "fitness",
  "thoughtless",
  "soames",
  "temperance",
  "illumination",
  "translations",
  "martyrdom",
  "mellow",
  "nationality",
  "jam",
  "austere",
  "shoots",
  "casually",
  "pensive",
  "flavour",
  "nets",
  "dice",
  "satisfactorily",
  "shrunk",
  "administer",
  "ante",
  "swine",
  "baptist",
  "listener",
  "unimportant",
  "genera",
  "contrivance",
  "deplorable",
  "museum",
  "benefactor",
  "tints",
  "alphabet",
  "rout",
  "scatter",
  "boer",
  "ftp",
  "steve",
  "extant",
  "bohemia",
  "misunderstanding",
  "universities",
  "dexterity",
  "rag",
  "inseparable",
  "punch",
  "brazen",
  "economical",
  "pernicious",
  "craig",
  "mythology",
  "drained",
  "bolted",
  "abel",
  "stride",
  "circumference",
  "meddle",
  "axis",
  "gum",
  "las",
  "kinder",
  "closes",
  "ferocity",
  "giddy",
  "secluded",
  "resisting",
  "satisfying",
  "reliable",
  "disgusting",
  "thirty-six",
  "ethical",
  "raleigh",
  "crouching",
  "lash",
  "recital",
  "buddhist",
  "collapse",
  "unsatisfactory",
  "lore",
  "varies",
  "mainland",
  "scot",
  "repute",
  "cushion",
  "confound",
  "scrub",
  "myth",
  "flights",
  "oats",
  "layers",
  "ownership",
  "cape",
  "glimmer",
  "scare",
  "waked",
  "bengal",
  "scrupulous",
  "equals",
  "redress",
  "brake",
  "nut",
  "stability",
  "crafty",
  "kirk",
  "bough",
  "momentous",
  "albeit",
  "enlarge",
  "hardness",
  "civilised",
  "dotted",
  "defiant",
  "timidity",
  "solar",
  "heartless",
  "thomson",
  "mat",
  "shun",
  "raid",
  "disclose",
  "suppression",
  "puff",
  "juncture",
  "beak",
  "unjustly",
  "foresaw",
  "rot",
  "aggressive",
  "predicted",
  "quaker",
  "grate",
  "lease",
  "ponderous",
  "maketh",
  "repaid",
  "charcoal",
  "chilly",
  "arrogance",
  "friction",
  "participation",
  "pier",
  "stale",
  "intoxicated",
  "commissioned",
  "ratio",
  "comb",
  "masterpiece",
  "wholesale",
  "embraces",
  "trodden",
  "ephraim",
  "shaw",
  "translate",
  "mortar",
  "recreation",
  "rite",
  "truthful",
  "cavalier",
  "caress",
  "si",
  "curling",
  "rivalry",
  "whim",
  "abreast",
  "thebes",
  "faust",
  "peg",
  "wilhelm",
  "pestilence",
  "ceremonial",
  "receiver",
  "sample",
  "distinctive",
  "consummate",
  "matron",
  "claiming",
  "plural",
  "initiative",
  "inexhaustible",
  "spider",
  "reed",
  "streak",
  "blocked",
  "titus",
  "smashed",
  "populous",
  "baronet",
  "commodore",
  "jelly",
  "advocates",
  "dinah",
  "salutation",
  "mutiny",
  "chronicles",
  "comforting",
  "serviceable",
  "parchment",
  "playful",
  "potato",
  "transient",
  "administrative",
  "anarchy",
  "barber",
  "revision",
  "operated",
  "farce",
  "germ",
  "profile",
  "provides",
  "noting",
  "disordered",
  "menacing",
  "heightened",
  "finance",
  "averse",
  "azure",
  "bathe",
  "campaigns",
  "lessen",
  "slate",
  "acquaint",
  "gin",
  "humiliating",
  "cleft",
  "conveyance",
  "chivalrous",
  "capricious",
  "tribune",
  "pilgrim",
  "entreaty",
  "womanly",
  "paltry",
  "sporting",
  "maker",
  "digestion",
  "bart",
  "infamy",
  "lambs",
  "gaping",
  "periodical",
  "standpoint",
  "amorous",
  "tub",
  "luxuriant",
  "basic",
  "mutually",
  "chris",
  "greed",
  "premature",
  "extinction",
  "boiler",
  "intimation",
  "scandalous",
  "separating",
  "oratory",
  "banish",
  "electrical",
  "herb",
  "multiply",
  "prosper",
  "friar",
  "nightly",
  "ole",
  "monkeys",
  "interminable",
  "enjoys",
  "similarity",
  "riddle",
  "cleaning",
  "subscription",
  "copious",
  "exclaim",
  "forged",
  "voting",
  "scourge",
  "darkly",
  "privacy",
  "arena",
  "bearded",
  "vera",
  "alacrity",
  "sensual",
  "spin",
  "neutrality",
  "flannel",
  "fasting",
  "trailer",
  "avert",
  "trustworthy",
  "jamaica",
  "unchanged",
  "traveler",
  "unfamiliar",
  "puffed",
  "mirrors",
  "phoebe",
  "father-in-law",
  "conform",
  "particle",
  "railways",
  "stupendous",
  "paddle",
  "innate",
  "reformation",
  "volley",
  "statistics",
  "agrees",
  "simpler",
  "padre",
  "congratulations",
  "lids",
  "muse",
  "inhabitant",
  "ishmael",
  "rustle",
  "clump",
  "calendar",
  "flute",
  "inaccessible",
  "yore",
  "jay",
  "repulsive",
  "fray",
  "po",
  "nomination",
  "conclusive",
  "peaceable",
  "beth",
  "inconceivable",
  "e'en",
  "emerald",
  "lava",
  "trillion",
  "uppermost",
  "arduous",
  "lyric",
  "downright",
  "reproduction",
  "foresight",
  "consistency",
  "ape",
  "senators",
  "pallor",
  "span",
  "salad",
  "snuff",
  "drooped",
  "greetings",
  "chestnut",
  "inquisitive",
  "vicar",
  "noel",
  "attic",
  "savings",
  "affirmative",
  "ills",
  "applications",
  "t",
  "dye",
  "gloucester",
  "nominal",
  "demonstrate",
  "dispense",
  "dissatisfaction",
  "merciless",
  "trusty",
  "coloring",
  "perusal",
  "plaintive",
  "discarded",
  "precarious",
  "infection",
  "ruinous",
  "bolts",
  "arithmetic",
  "considerate",
  "lark",
  "ethics",
  "conventions",
  "stumbling",
  "pitcher",
  "slips",
  "seine",
  "officially",
  "danube",
  "annoy",
  "glide",
  "impunity",
  "amends",
  "sol",
  "conveying",
  "abandonment",
  "mane",
  "tinge",
  "brim",
  "forenoon",
  "seventy-five",
  "sparkle",
  "syllables",
  "shrug",
  "enchantment",
  "franz",
  "trait",
  "bribe",
  "composer",
  "preparatory",
  "audacious",
  "outskirts",
  "soiled",
  "fiddle",
  "football",
  "isaiah",
  "partnership",
  "continuation",
  "pioneer",
  "vest",
  "bass",
  "derby",
  "quarry",
  "rigging",
  "dizzy",
  "abnormal",
  "omission",
  "idolatry",
  "sequence",
  "squeeze",
  "cabbage",
  "canopy",
  "athletic",
  "shirley",
  "drunkenness",
  "intrusion",
  "'cause",
  "assign",
  "tackle",
  "dreamt",
  "sceptre",
  "exacting",
  "parched",
  "eddy",
  "percentage",
  "twinkle",
  "curb",
  "sandstone",
  "invaluable",
  "fathom",
  "preferable",
  "adelaide",
  "advertising",
  "scraps",
  "lever",
  "muster",
  "cavity",
  "barbarian",
  "sleepless",
  "fried",
  "abstraction",
  "forefinger",
  "spade",
  "erection",
  "scorned",
  "pail",
  "withdrawal",
  "senator",
  "mortgage",
  "ancestral",
  "succour",
  "ma",
  "forbearance",
  "repress",
  "spouse",
  "valid",
  "witchcraft",
  "workmanship",
  "legacy",
  "proximity",
  "bombay",
  "paula",
  "incorporated",
  "muzzle",
  "reuben",
  "clusters",
  "valve",
  "compelling",
  "dissipated",
  "flickering",
  "guinea",
  "sup",
  "tarry",
  "derision",
  "vehicles",
  "accommodate",
  "glossy",
  "iris",
  "relic",
  "ant",
  "heath",
  "bug",
  "vocal",
  "downfall",
  "construct",
  "undue",
  "vapor",
  "bat",
  "whimsical",
  "contradictory",
  "unlocked",
  "foretold",
  "automatic",
  "explicit",
  "indolent",
  "mates",
  "artful",
  "downcast",
  "well-being",
  "winston",
  "ordinances",
  "catharine",
  "effectively",
  "missions",
  "stalk",
  "indistinct",
  "pregnant",
  "reddish",
  "coveted",
  "fret",
  "peeping",
  "buck",
  "sumptuous",
  "indefinitely",
  "reliance",
  "panama",
  "cocked",
  "dad",
  "everyday",
  "intoxication",
  "aghast",
  "subterranean",
  "turmoil",
  "forfeit",
  "chasm",
  "inspect",
  "perverse",
  "precipitate",
  "dover",
  "ambush",
  "evermore",
  "blot",
  "nook",
  "verdure",
  "parapet",
  "jake",
  "cessation",
  "ankle",
  "classification",
  "fervently",
  "oddly",
  "haul",
  "saxony",
  "embarrassing",
  "hairy",
  "northwest",
  "disabled",
  "laurel",
  "preston",
  "arrogant",
  "hurts",
  "demonstrations",
  "splash",
  "curl",
  "livelihood",
  "wary",
  "scattering",
  "brace",
  "converts",
  "detestable",
  "abandoning",
  "somerset",
  "weakly",
  "clothe",
  "gem",
  "tremor",
  "surveying",
  "variable",
  "anniversary",
  "thirty-two",
  "wrap",
  "curly",
  "diversity",
  "prestige",
  "desertion",
  "freezing",
  "heedless",
  "sentry",
  "believer",
  "ram",
  "rowing",
  "negligence",
  "self-",
  "sulphur",
  "discrimination",
  "cooling",
  "millionaire",
  "flowering",
  "meridian",
  "wins",
  "awed",
  "beastly",
  "nuisance",
  "abstain",
  "continental",
  "stanza",
  "target",
  "unwonted",
  "whit",
  "jason",
  "stall",
  "sham",
  "dictate",
  "empress",
  "gout",
  "jobs",
  "manure",
  "nigel",
  "sidewalk",
  "sate",
  "grievance",
  "axes",
  "bony",
  "invest",
  "birmingham",
  "ebb",
  "rabble",
  "restlessness",
  "cruise",
  "rally",
  "rumor",
  "hysterical",
  "girlish",
  "actively",
  "shortest",
  "marseilles",
  "cheque",
  "disregarded",
  "retort",
  "rocking",
  "emerge",
  "perch",
  "flask",
  "ka",
  "countryman",
  "lonesome",
  "manned",
  "unarmed",
  "wast",
  "frog",
  "twenty-eight",
  "unscrupulous",
  "yarn",
  "victuals",
  "outrageous",
  "appropriation",
  "foolishness",
  "quickness",
  "adversity",
  "parma",
  "diseased",
  "iliad",
  "salutary",
  "smelt",
  "territorial",
  "hurricane",
  "irons",
  "canyon",
  "jeremiah",
  "brooklyn",
  "indulging",
  "vapour",
  "disobedience",
  "atrocious",
  "leaps",
  "tapestry",
  "provocation",
  "twenty-six",
  "impotent",
  "smite",
  "acquitted",
  "os",
  "tumultuous",
  "barge",
  "palpable",
  "apprentice",
  "lances",
  "compartment",
  "godly",
  "sarcastic",
  "therefrom",
  "specifically",
  "uniformity",
  "emerging",
  "atonement",
  "whereabouts",
  "davy",
  "framework",
  "sponge",
  "mountainous",
  "annoying",
  "cot",
  "squirrel",
  "wand",
  "grind",
  "bang",
  "unreal",
  "blacksmith",
  "injunction",
  "scarcity",
  "withhold",
  "outright",
  "bavaria",
  "cement",
  "growl",
  "aggregate",
  "fraction",
  "exaltation",
  "inexorable",
  "jug",
  "purer",
  "sap",
  "illegal",
  "sister-in-law",
  "presses",
  "stealthily",
  "dissolve",
  "volcano",
  "hungarian",
  "equilibrium",
  "obstinately",
  "sullenly",
  "assassination",
  "commissions",
  "respectability",
  "bases",
  "maxwell",
  "resounded",
  "closest",
  "embroidery",
  "gunpowder",
  "reproof",
  "yale",
  "combining",
  "weaving",
  "earnings",
  "hamburg",
  "indoors",
  "manufacturers",
  "pitiless",
  "scarf",
  "picnic",
  "misled",
  "pompous",
  "brian",
  "respite",
  "exploit",
  "tracing",
  "geological",
  "passport",
  "confines",
  "dishonour",
  "executioner",
  "township",
  "vacancy",
  "acquiescence",
  "cornwall",
  "crumbling",
  "three-quarters",
  "exploration",
  "needy",
  "stationary",
  "disconcerted",
  "wanderer",
  "beaver",
  "lookout",
  "onion",
  "depicted",
  "boisterous",
  "couples",
  "speakers",
  "woollen",
  "lightness",
  "bitten",
  "aux",
  "toleration",
  "lucia",
  "scar",
  "bohemian",
  "vested",
  "affinity",
  "carlo",
  "sous",
  "penitent",
  "simpson",
  "abiding",
  "ca",
  "immoral",
  "dishonest",
  "yawning",
  "mustache",
  "supplement",
  "whirlwind",
  "clash",
  "terence",
  "lamentable",
  "bennett",
  "farthing",
  "speck",
  "biscuit",
  "appellation",
  "gdp",
  "reserves",
  "uncouth",
  "birch",
  "armchair",
  "judy",
  "greasy",
  "leaden",
  "dough",
  "lining",
  "cleverness",
  "ascetic",
  "clutch",
  "krishna",
  "embark",
  "quotations",
  "friendliness",
  "liberally",
  "trance",
  "untrue",
  "rejection",
  "grating",
  "hanover",
  "inexperienced",
  "mon",
  "wintry",
  "stalwart",
  "meats",
  "stamping",
  "variance",
  "apiece",
  "firmament",
  "absorption",
  "apprehensive",
  "terminate",
  "wilful",
  "conveniently",
  "'n'",
  "cleanliness",
  "collective",
  "angela",
  "filth",
  "philippines",
  "timely",
  "herein",
  "ignoble",
  "canton",
  "lamentations",
  "moslem",
  "ware",
  "adjective",
  "glen",
  "invade",
  "livid",
  "buggy",
  "prolong",
  "weaken",
  "folio",
  "dismissal",
  "quay",
  "enchanting",
  "heave",
  "purified",
  "syrian",
  "significantly",
  "experimental",
  "film",
  "repressed",
  "cooperation",
  "sequel",
  "wench",
  "calves",
  "pence",
  "kindle",
  "southwest",
  "roam",
  "conrad",
  "distraction",
  "havoc",
  "lunatic",
  "soldiery",
  "tablet",
  "unwise",
  "assassin",
  "awkwardly",
  "verandah",
  "dejected",
  "publicity",
  "suspension",
  "throb",
  "relaxation",
  "ardently",
  "cove",
  "tan",
  "unhappiness",
  "expand",
  "stronghold",
  "laughingly",
  "corinth",
  "tumble",
  "colder",
  "forge",
  "covert",
  "twenty-seven",
  "imprudent",
  "lazily",
  "quotes",
  "impulsive",
  "degenerate",
  "underlying",
  "leafy",
  "mexicans",
  "chum",
  "sweeps",
  "abashed",
  "loathsome",
  "remnants",
  "darts",
  "indolence",
  "seneca",
  "affront",
  "fossil",
  "adhered",
  "atom",
  "constraint",
  "themes",
  "mechanics",
  "pauses",
  "childlike",
  "vigilant",
  "broth",
  "boar",
  "irritable",
  "epithet",
  "overseer",
  "aurora",
  "knox",
  "mire",
  "ineffectual",
  "sagacious",
  "incomparable",
  "triple",
  "vanilla",
  "initiated",
  "aids",
  "kathleen",
  "zest",
  "levity",
  "fastidious",
  "pyramid",
  "cycle",
  "nap",
  "northeast",
  "unlawful",
  "crater",
  "hamlet",
  "shrub",
  "births",
  "paw",
  "boom",
  "ladies'",
  "dint",
  "fervour",
  "reproduce",
  "prominence",
  "abated",
  "aerial",
  "forbes",
  "cloister",
  "traverse",
  "cutter",
  "forthcoming",
  "shyness",
  "spotless",
  "boasting",
  "congress",
  "overgrown",
  "sanctified",
  "haven",
  "engraving",
  "equity",
  "euphrates",
  "eclipse",
  "visionary",
  "archives",
  "grape",
  "hindrance",
  "omnibus",
  "rocked",
  "implacable",
  "sweets",
  "workshop",
  "bayonet",
  "corresponds",
  "dennis",
  "lute",
  "decrease",
  "broom",
  "incur",
  "misgivings",
  "moderately",
  "grease",
  "antagonism",
  "plumage",
  "slander",
  "naming",
  "citizenship",
  "pronunciation",
  "judgement",
  "wearisome",
  "tangle",
  "matched",
  "angelic",
  "leant",
  "gibraltar",
  "sepulchre",
  "concentrate",
  "anchorage",
  "versed",
  "berkeley",
  "drivers",
  "clover",
  "pastime",
  "retains",
  "vineyard",
  "cyprus",
  "reverently",
  "d'ye",
  "spruce",
  "newcastle",
  "edict",
  "undo",
  "ferry",
  "panel",
  "repugnance",
  "impious",
  "relentless",
  "steaming",
  "mace",
  "pericles",
  "fictitious",
  "objectionable",
  "ulster",
  "ezra",
  "rudolph",
  "shameless",
  "anatomy",
  "dawning",
  "superman",
  "ruffian",
  "genteel",
  "preoccupied",
  "astronomy",
  "straightforward",
  "indefatigable",
  "maze",
  "descriptive",
  "prerogative",
  "des",
  "heather",
  "mar",
  "richardson",
  "rupture",
  "submissive",
  "breton",
  "faithless",
  "scholarship",
  "candour",
  "hazardous",
  "blockade",
  "nw",
  "deluge",
  "sickening",
  "outcry",
  "scold",
  "plutarch",
  "altitude",
  "turtle",
  "bide",
  "efficacy",
  "adviser",
  "cumulative",
  "pyramids",
  "rhodes",
  "stew",
  "herodotus",
  "commissioner",
  "malta",
  "actuated",
  "fibre",
  "joyously",
  "evan",
  "continuously",
  "cricket",
  "denote",
  "j",
  "pans",
  "recite",
  "unfavourable",
  "parable",
  "thrive",
  "pigeon",
  "extensively",
  "adaptation",
  "export",
  "peal",
  "incidentally",
  "offender",
  "dubious",
  "yawned",
  "ruthless",
  "trips",
  "disapproval",
  "greenwich",
  "operator",
  "courtier",
  "par",
  "shaved",
  "abolish",
  "whosoever",
  "adjust",
  "miscellaneous",
  "savoy",
  "unawares",
  "deceitful",
  "creates",
  "membership",
  "gauge",
  "terrestrial",
  "tolerate",
  "veterans",
  "kinsmen",
  "bard",
  "dane",
  "pike",
  "spartan",
  "badge",
  "hip",
  "vex",
  "adhere",
  "sans",
  "portland",
  "stimulate",
  "ado",
  "superseded",
  "sash",
  "formality",
  "triangle",
  "compulsory",
  "conflagration",
  "treasurer",
  "gust",
  "fabulous",
  "despotic",
  "authoritative",
  "hydrogen",
  "tearful",
  "abounding",
  "fragile",
  "excel",
  "spoilt",
  "bailiff",
  "laurels",
  "printer",
  "choke",
  "clustered",
  "monastic",
  "repel",
  "belongings",
  "credulity",
  "hapless",
  "unrest",
  "glimmering",
  "aspire",
  "contingent",
  "dowry",
  "chauffeur",
  "partiality",
  "chastity",
  "cologne",
  "papal",
  "vogue",
  "flowery",
  "chronic",
  "peremptory",
  "confessor",
  "eke",
  "grounded",
  "verbs",
  "abbot",
  "mahogany",
  "runaway",
  "cope",
  "dilemma",
  "slack",
  "forty-eight",
  "gaudy",
  "melodious",
  "contraction",
  "carlos",
  "gypsy",
  "prodigal",
  "momentarily",
  "tangible",
  "viceroy",
  "celia",
  "journalist",
  "ny",
  "bouquet",
  "symptom",
  "dangling",
  "bicycle",
  "homestead",
  "youngster",
  "compulsion",
  "sensuous",
  "sluggish",
  "infirmity",
  "festivities",
  "observant",
  "raven",
  "precedence",
  "shewn",
  "lure",
  "precept",
  "winters",
  "nave",
  "droll",
  "bewildering",
  "tattered",
  "provisional",
  "oz",
  "outlaw",
  "priceless",
  "linda",
  "chieftain",
  "melbourne",
  "tar",
  "astounded",
  "orion",
  "vindictive",
  "lamentation",
  "teams",
  "engineering",
  "spiral",
  "portsmouth",
  "wayside",
  "midway",
  "mecca",
  "meredith",
  "partisan",
  "undertone",
  "lull",
  "precipitous",
  "ursula",
  "hypocrite",
  "aperture",
  "stratagem",
  "expulsion",
  "commentary",
  "olden",
  "transmission",
  "gall",
  "refresh",
  "camera",
  "clamor",
  "intruder",
  "ripple",
  "apologize",
  "chuckle",
  "ugliness",
  "basement",
  "lyre",
  "pondering",
  "spire",
  "pounded",
  "tributary",
  "locomotive",
  "celebrity",
  "insurgents",
  "quid",
  "accosted",
  "ballot",
  "lick",
  "discovers",
  "venison",
  "accomplice",
  "hilt",
  "pedestal",
  "cant",
  "potential",
  "incompatible",
  "lisbon",
  "memoirs",
  "rheumatism",
  "magnanimity",
  "dancer",
  "balm",
  "uninteresting",
  "fervor",
  "eligible",
  "conceited",
  "migration",
  "kitten",
  "loop",
  "persistence",
  "tying",
  "slang",
  "distasteful",
  "laborer",
  "armstrong",
  "prosecute",
  "consuming",
  "licence",
  "lucas",
  "unfold",
  "tottering",
  "fir",
  "relinquish",
  "unavoidable",
  "repeal",
  "bye",
  "ego",
  "mercantile",
  "notably",
  "jet",
  "violate",
  "tennis",
  "addicted",
  "completing",
  "manor",
  "prelate",
  "kids",
  "windy",
  "liberated",
  "impertinence",
  "survival",
  "masonry",
  "demeanor",
  "forsooth",
  "agreeing",
  "carving",
  "asses",
  "boarding",
  "surrey",
  "tug",
  "penetration",
  "freeze",
  "matrimony",
  "vatican",
  "labyrinth",
  "triumphal",
  "outcast",
  "sha'n't",
  "weave",
  "dc",
  "deputation",
  "olivia",
  "auntie",
  "intact",
  "questionable",
  "inanimate",
  "incumbent",
  "tack",
  "terra",
  "apathy",
  "hatchet",
  "sophie",
  "daytime",
  "organize",
  "parsons",
  "artifice",
  "surpass",
  "masked",
  "presumably",
  "abbe",
  "drought",
  "saddled",
  "parrot",
  "brittany",
  "labourer",
  "collector",
  "convoy",
  "incidental",
  "jovial",
  "spine",
  "chord",
  "detroit",
  "bleed",
  "colin",
  "forgave",
  "dissipation",
  "echoing",
  "amos",
  "napkin",
  "importation",
  "fry",
  "dessert",
  "keel",
  "incredulous",
  "focus",
  "arc",
  "maximilian",
  "detection",
  "summed",
  "murphy",
  "nocturnal",
  "smash",
  "facilitate",
  "porcelain",
  "correctness",
  "lusty",
  "surly",
  "forgetful",
  "chaise",
  "um",
  "checking",
  "err",
  "arid",
  "attends",
  "frequency",
  "loom",
  "plume",
  "chagrin",
  "mouthful",
  "admittance",
  "wakes",
  "retinue",
  "hose",
  "overflow",
  "absently",
  "discredit",
  "stitch",
  "vie",
  "directory",
  "revolting",
  "loins",
  "macedonia",
  "andrea",
  "kenneth",
  "legion",
  "hogs",
  "sampson",
  "separates",
  "ascribe",
  "politic",
  "stab",
  "chop",
  "password",
  "rousing",
  "decorum",
  "inflammation",
  "stark",
  "unutterable",
  "vestibule",
  "regal",
  "watchman",
  "wesley",
  "advertised",
  "hemisphere",
  "loading",
  "heating",
  "abhorrence",
  "counsellor",
  "terry",
  "animosity",
  "darius",
  "depressing",
  "coup",
  "perforce",
  "dedication",
  "outwardly",
  "uncanny",
  "lebanon",
  "compassionate",
  "shroud",
  "cupid",
  "dogged",
  "moth",
  "katie",
  "thinker",
  "ravages",
  "fraught",
  "budget",
  "pours",
  "sloop",
  "rigorous",
  "strategy",
  "blissful",
  "uphold",
  "quartz",
  "benediction",
  "mormon",
  "chords",
  "belle",
  "civic",
  "halves",
  "accusing",
  "atone",
  "rodney",
  "atlas",
  "languor",
  "earthen",
  "expectant",
  "haughtily",
  "obnoxious",
  "twig",
  "bacchus",
  "paramount",
  "aiming",
  "flemish",
  "portal",
  "sable",
  "expiration",
  "well-bred",
  "consort",
  "hooked",
  "insert",
  "listless",
  "furtive",
  "pollen",
  "acetylene",
  "arizona",
  "meditate",
  "scissors",
  "reefs",
  "parsley",
  "signing",
  "nimble",
  "stag",
  "flexible",
  "accomplishing",
  "coronation",
  "slab",
  "voters",
  "inscrutable",
  "promenade",
  "qualification",
  "crucifix",
  "switch",
  "aspiration",
  "defile",
  "skillful",
  "windward",
  "theoretical",
  "towel",
  "abounds",
  "wrestling",
  "disorderly",
  "suspiciously",
  "oration",
  "decade",
  "kingly",
  "inflexible",
  "counterfeit",
  "multiple",
  "teutonic",
  "cripple",
  "healthful",
  "loaves",
  "bourgeois",
  "crystalline",
  "resting-place",
  "debates",
  "primeval",
  "dejection",
  "bandage",
  "penal",
  "tidy",
  "isis",
  "abstracted",
  "claire",
  "blasted",
  "perverted",
  "finn",
  "patrol",
  "feud",
  "hallowed",
  "testing",
  "atlanta",
  "convulsive",
  "crackling",
  "hack",
  "teaspoon",
  "hoc",
  "scraped",
  "glacier",
  "safeguard",
  "clap",
  "vagabond",
  "allowable",
  "emigration",
  "purport",
  "chaff",
  "ax",
  "di",
  "follower",
  "rapt",
  "babylonian",
  "maple",
  "completeness",
  "rake",
  "lurid",
  "priscilla",
  "moat",
  "portico",
  "upheld",
  "impaired",
  "thankfulness",
  "vanishing",
  "emptiness",
  "marrow",
  "suns",
  "halfway",
  "invariable",
  "tenure",
  "sheath",
  "memorandum",
  "absorb",
  "cone",
  "prediction",
  "pew",
  "planes",
  "educate",
  "retribution",
  "betimes",
  "halifax",
  "unbearable",
  "enquiry",
  "latch",
  "exeter",
  "red-hot",
  "symmetry",
  "untimely",
  "niggers",
  "domination",
  "bothered",
  "corral",
  "upside",
  "uneven",
  "xxx",
  "malay",
  "instrumental",
  "parental",
  "incoherent",
  "priestly",
  "sacrament",
  "chronicle",
  "participate",
  "cooler",
  "elevator",
  "manufacturer",
  "stealthy",
  "indomitable",
  "lateral",
  "minerva",
  "defendant",
  "nymph",
  "experts",
  "mosque",
  "postpone",
  "inter",
  "seizure",
  "ada",
  "natalie",
  "odysseus",
  "glade",
  "exhaust",
  "loathing",
  "penitence",
  "oblong",
  "saddles",
  "highways",
  "shipwreck",
  "sprinkle",
  "zion",
  "chess",
  "dispensed",
  "nucleus",
  "se",
  "disperse",
  "toll",
  "pitiable",
  "casket",
  "cherry",
  "enlightenment",
  "starboard",
  "poignant",
  "astounding",
  "christina",
  "supple",
  "consummation",
  "drunkard",
  "usages",
  "afoot",
  "vicissitudes",
  "mercenary",
  "metaphor",
  "naturalist",
  "munich",
  "swarthy",
  "widespread",
  "presumptuous",
  "stumble",
  "translator",
  "bluntly",
  "diminutive",
  "inferiority",
  "sioux",
  "evade",
  "madeline",
  "dunbar",
  "peach",
  "sonorous",
  "conjure",
  "truck",
  "sultry",
  "dogma",
  "chapman",
  "finery",
  "tow",
  "there'll",
  "debtor",
  "scalp",
  "surpassing",
  "terrifying",
  "signification",
  "diction",
  "sulky",
  "tradesmen",
  "mustard",
  "percent",
  "mite",
  "tyrannical",
  "unpopular",
  "gambler",
  "stupor",
  "joyce",
  "beetle",
  "grub",
  "impersonal",
  "sussex",
  "upturned",
  "aggravated",
  "noblemen",
  "solicitor",
  "penniless",
  "wireless",
  "enlighten",
  "incapacity",
  "quench",
  "infidel",
  "auction",
  "bunk",
  "bomb",
  "sieve",
  "advocated",
  "babes",
  "privy",
  "flattened",
  "routes",
  "mattress",
  "ditto",
  "apes",
  "critically",
  "heaviest",
  "workings",
  "tho",
  "appalled",
  "pies",
  "showy",
  "subsist",
  "blinking",
  "primrose",
  "cowper",
  "hips",
  "beau",
  "rust",
  "cubic",
  "prettier",
  "normans",
  "reservation",
  "juno",
  "nouns",
  "chuck",
  "ablest",
  "sw",
  "tawny",
  "sterile",
  "braced",
  "sew",
  "unprecedented",
  "chemist",
  "melissa",
  "lounge",
  "schoolboy",
  "unsteady",
  "oughtn't",
  "occupant",
  "turban",
  "fickle",
  "onset",
  "disciplined",
  "magnet",
  "romeo",
  "suck",
  "unearthly",
  "draughts",
  "bankrupt",
  "dive",
  "receptacle",
  "creator",
  "mohammedan",
  "adultery",
  "dispensation",
  "warming",
  "ranked",
  "strangeness",
  "carcass",
  "visitation",
  "egotism",
  "transit",
  "brushing",
  "fern",
  "motley",
  "clown",
  "madeira",
  "archibald",
  "concurrence",
  "surmise",
  "unfriendly",
  "wily",
  "delirious",
  "fergus",
  "husky",
  "enlist",
  "generated",
  "katharine",
  "lagoon",
  "islam",
  "precipitated",
  "marianne",
  "census",
  "embodiment",
  "explosive",
  "heretic",
  "sustenance",
  "denounce",
  "indictment",
  "pits",
  "extinguish",
  "boudoir",
  "tiptoe",
  "obstruction",
  "unhealthy",
  "cracking",
  "buzzing",
  "cole",
  "exalt",
  "sleek",
  "aback",
  "blasphemy",
  "pall",
  "weal",
  "rampart",
  "hazy",
  "loath",
  "pp",
  "stamps",
  "flax",
  "membrane",
  "satirical",
  "forego",
  "exceptionally",
  "syrup",
  "rejoin",
  "seasoned",
  "suspend",
  "elated",
  "marred",
  "discordant",
  "forecastle",
  "jock",
  "slap",
  "hoary",
  "relax",
  "wayward",
  "mania",
  "agility",
  "complacency",
  "courtship",
  "commodity",
  "revel",
  "footstep",
  "underwent",
  "fernando",
  "rend",
  "siberia",
  "appease",
  "lending",
  "gravy",
  "motherly",
  "sod",
  "consistently",
  "steadfastly",
  "trojan",
  "sewed",
  "continuity",
  "aeroplane",
  "implicitly",
  "reciprocal",
  "reel",
  "durham",
  "hughes",
  "feathered",
  "despondency",
  "foreground",
  "ingram",
  "shave",
  "enrich",
  "predominant",
  "perplexing",
  "prescription",
  "nightingale",
  "bubble",
  "halo",
  "lithe",
  "vassal",
  "brooded",
  "conversant",
  "commune",
  "forsook",
  "starch",
  "guitar",
  "dilapidated",
  "intrinsic",
  "eagles",
  "alluring",
  "blurred",
  "culprit",
  "bias",
  "expectancy",
  "unfavorable",
  "awkwardness",
  "aptitude",
  "bookseller",
  "ensue",
  "trespass",
  "impostor",
  "perishing",
  "frolic",
  "credulous",
  "ronald",
  "pulp",
  "studious",
  "teresa",
  "aiding",
  "favorably",
  "wilton",
  "diabolical",
  "levy",
  "mother-in-law",
  "shovel",
  "taint",
  "loft",
  "subtlety",
  "utilize",
  "vista",
  "hammock",
  "durable",
  "lineage",
  "evenly",
  "commendation",
  "hog",
  "zinc",
  "imperceptible",
  "shiny",
  "northumberland",
  "whichever",
  "finite",
  "ineffable",
  "prospective",
  "noteworthy",
  "tunic",
  "auxiliary",
  "policies",
  "sallow",
  "elm",
  "bridget",
  "posting",
  "ghent",
  "scramble",
  "whitehall",
  "academic",
  "forgery",
  "interchange",
  "swoon",
  "tyre",
  "presentiment",
  "ethereal",
  "sprightly",
  "hoof",
  "intrude",
  "packages",
  "consumer",
  "iceland",
  "inveterate",
  "rambling",
  "spat",
  "minstrel",
  "barbaric",
  "em",
  "lighten",
  "validity",
  "well-to-do",
  "prosaic",
  "dalton",
  "spontaneously",
  "cask",
  "foxes",
  "that'll",
  "whipping",
  "approximately",
  "abounded",
  "knitted",
  "medina",
  "sonnet",
  "attested",
  "congo",
  "petroleum",
  "soar",
  "bereft",
  "lodges",
  "mistook",
  "microscope",
  "sportsman",
  "tourists",
  "civilian",
  "funding",
  "strap",
  "metaphysics",
  "morrison",
  "discharging",
  "oyster",
  "magnetism",
  "bewitched",
  "symbolic",
  "adapt",
  "pantry",
  "condescend",
  "slit",
  "southampton",
  "claret",
  "adorable",
  "astonish",
  "trample",
  "dir",
  "fraternity",
  "repugnant",
  "admonition",
  "exodus",
  "animate",
  "cloudless",
  "inquest",
  "sleigh",
  "smoky",
  "dreamer",
  "nelly",
  "saturated",
  "advising",
  "likelihood",
  "buoyant",
  "magnanimous",
  "flapping",
  "subjective",
  "twofold",
  "ferment",
  "ancestry",
  "osiris",
  "reflects",
  "bolton",
  "impure",
  "nakedness",
  "elizabethan",
  "colt",
  "pronoun",
  "wrongly",
  "bubbles",
  "sucked",
  "immeasurable",
  "wizard",
  "broker",
  "inarticulate",
  "travers",
  "jagged",
  "bologna",
  "comp",
  "discourage",
  "yellowish",
  "adrift",
  "founding",
  "barter",
  "abner",
  "staple",
  "carnal",
  "right-hand",
  "abstinence",
  "saintly",
  "spice",
  "newcomer",
  "persuasive",
  "ain",
  "intoxicating",
  "zenith",
  "accompanies",
  "blend",
  "bail",
  "molten",
  "crescent",
  "pouch",
  "deacon",
  "sharpness",
  "dived",
  "infidelity",
  "infinity",
  "graphic",
  "gases",
  "incredulity",
  "reparation",
  "fig",
  "niche",
  "vulgarity",
  "disappoint",
  "partook",
  "detest",
  "carrier",
  "loth",
  "rap",
  "stocking",
  "tudor",
  "regent",
  "cholera",
  "needing",
  "baseness",
  "artless",
  "wroth",
  "advisers",
  "blouse",
  "defer",
  "designate",
  "thoroughfare",
  "shuffling",
  "exemplary",
  "projection",
  "angular",
  "liberation",
  "vibration",
  "midsummer",
  "oftentimes",
  "maize",
  "tease",
  "java",
  "recipe",
  "enclose",
  "franchise",
  "palate",
  "incongruous",
  "poise",
  "waltz",
  "dutchman",
  "enlargement",
  "magnificently",
  "proverbs",
  "scorching",
  "tropics",
  "tor",
  "buzz",
  "laudable",
  "ranging",
  "oblivious",
  "simultaneous",
  "astern",
  "joanna",
  "southeast",
  "tenacity",
  "mm",
  "patricia",
  "plow",
  "goths",
  "parley",
  "wither",
  "rotation",
  "rudder",
  "antipathy",
  "ottoman",
  "tradesman",
  "knob",
  "physiological",
  "unconsciousness",
  "gutter",
  "metre",
  "restriction",
  "sanguinary",
  "seville",
  "category",
  "faithfulness",
  "racial",
  "substitution",
  "crags",
  "fretted",
  "virginian",
  "comet",
  "irksome",
  "neptune",
  "innovation",
  "sleeper",
  "myriad",
  "vestige",
  "confront",
  "solidity",
  "backing",
  "ban",
  "famed",
  "inconsistency",
  "stinging",
  "absurdly",
  "medieval",
  "bugle",
  "chancellor",
  "fleming",
  "decorative",
  "arbitration",
  "undecided",
  "biographer",
  "patriarch",
  "thunderbolt",
  "unceasing",
  "propensity",
  "psalm",
  "derives",
  "favourably",
  "docile",
  "morocco",
  "prop",
  "clive",
  "constituting",
  "recoil",
  "snatching",
  "brighton",
  "jude",
  "lobby",
  "swan",
  "hurl",
  "indiscreet",
  "sparrow",
  "miser",
  "sundown",
  "incurable",
  "prelude",
  "wring",
  "compensate",
  "saucy",
  "repulse",
  "builder",
  "eruption",
  "glazed",
  "scroll",
  "charts",
  "helper",
  "mistrust",
  "cinnamon",
  "moody",
  "calumny",
  "bristling",
  "assail",
  "impassive",
  "plastic",
  "mechanic",
  "carol",
  "powell",
  "blight",
  "aggression",
  "footnote",
  "rebuilt",
  "suzanne",
  "budding",
  "buttoned",
  "casement",
  "norse",
  "adequately",
  "secession",
  "calvin",
  "tens",
  "adherence",
  "clemency",
  "hey",
  "propitious",
  "minnesota",
  "thwart",
  "measurement",
  "ratification",
  "ensign",
  "festive",
  "fullness",
  "inert",
  "pillage",
  "pretense",
  "soever",
  "vindicate",
  "woo",
  "compete",
  "orbit",
  "warehouse",
  "protective",
  "newfoundland",
  "academy",
  "burlesque",
  "webb",
  "desist",
  "meaningless",
  "exactness",
  "divan",
  "droop",
  "abe",
  "prescribe",
  "unerring",
  "hiss",
  "novice",
  "starlight",
  "cataract",
  "venomous",
  "divorced",
  "incarnation",
  "reconstruction",
  "steals",
  "thor",
  "dairy",
  "frugal",
  "proven",
  "beech",
  "golf",
  "knightly",
  "impetus",
  "consecration",
  "damnation",
  "organisms",
  "paralysis",
  "reservoir",
  "matter-of-fact",
  "contagion",
  "zero",
  "ferguson",
  "contagious",
  "hark",
  "shopping",
  "zip",
  "frantically",
  "vermin",
  "wards",
  "conical",
  "demolished",
  "depraved",
  "batter",
  "luxembourg",
  "pisa",
  "homeless",
  "implicit",
  "strategic",
  "trigger",
  "counterpart",
  "worn-out",
  "dramatist",
  "instantaneous",
  "responsive",
  "darrell",
  "dishonor",
  "annihilation",
  "ne",
  "profuse",
  "crab",
  "emulation",
  "benedict",
  "unforeseen",
  "wildness",
  "kelly",
  "mold",
  "rehearsal",
  "shunned",
  "unseemly",
  "chewing",
  "roadway",
  "fulfill",
  "wight",
  "chip",
  "where's",
  "impetuosity",
  "leeward",
  "oppress",
  "abhorred",
  "insistence",
  "borough",
  "yawn",
  "faulty",
  "ian",
  "inequality",
  "mole",
  "hag",
  "kine",
  "languidly",
  "recurring",
  "tallow",
  "precede",
  "shaping",
  "gen",
  "mid",
  "veracity",
  "nassau",
  "pottery",
  "sill",
  "jewelry",
  "dozens",
  "eunuch",
  "withering",
  "hug",
  "poisoning",
  "purposed",
  "waning",
  "brotherly",
  "physiognomy",
  "surge",
  "hitting",
  "query",
  "solicitous",
  "stile",
  "manoeuvre",
  "tourist",
  "miguel",
  "norwegian",
  "hop",
  "housewife",
  "prow",
  "rye",
  "beverage",
  "flickered",
  "mindful",
  "perennial",
  "recurrence",
  "casey",
  "lucid",
  "decease",
  "articulate",
  "cipher",
  "seth",
  "topmost",
  "tucker",
  "disobey",
  "bygone",
  "saucepan",
  "tolerant",
  "confidant",
  "re-",
  "unavailing",
  "undeniable",
  "amend",
  "ae",
  "wield",
  "embryo",
  "walnut",
  "contracting",
  "assassins",
  "astronomical",
  "lurked",
  "syracuse",
  "despicable",
  "entries",
  "tomatoes",
  "marbles",
  "cheerless",
  "profligate",
  "democrat",
  "eaves",
  "diagram",
  "thriving",
  "inlet",
  "shrewdness",
  "deduction",
  "crook",
  "intrepid",
  "juvenile",
  "sherry",
  "transvaal",
  "cider",
  "dd",
  "glassy",
  "overwhelm",
  "treble",
  "decomposition",
  "deposition",
  "overrun",
  "inlaid",
  "mobile",
  "predicament",
  "destroyer",
  "candor",
  "indecent",
  "chad",
  "elevate",
  "infirm",
  "irrational",
  "clocks",
  "incompetent",
  "bier",
  "miner",
  "outlying",
  "diocese",
  "shorn",
  "coiled",
  "furthermore",
  "bungalow",
  "expanding",
  "indicative",
  "unprotected",
  "voluptuous",
  "paradox",
  "crammed",
  "applaud",
  "cowboy",
  "apex",
  "concourse",
  "surgeons",
  "occult",
  "altering",
  "garland",
  "pore",
  "tempestuous",
  "allegory",
  "tic",
  "froze",
  "flakes",
  "lazarus",
  "collectively",
  "corporeal",
  "prophesy",
  "ponds",
  "transitory",
  "exaggerate",
  "squalid",
  "faultless",
  "stepmother",
  "davies",
  "horde",
  "would-be",
  "blonde",
  "euripides",
  "airship",
  "parsonage",
  "suffolk",
  "hating",
  "renunciation",
  "armenia",
  "meekness",
  "yeast",
  "exhortation",
  "pageant",
  "parishes",
  "stumps",
  "succor",
  "curt",
  "intercept",
  "cue",
  "infatuation",
  "stolid",
  "restitution",
  "concur",
  "runner",
  "unborn",
  "dormant",
  "jargon",
  "jeremy",
  "jasmine",
  "negotiate",
  "imputation",
  "bulgaria",
  "pleasurable",
  "abate",
  "chloe",
  "thereabouts",
  "premium",
  "reporting",
  "freemen",
  "plum",
  "burthen",
  "trio",
  "desultory",
  "graveyard",
  "inducement",
  "creditor",
  "gig",
  "regime",
  "old-time",
  "prick",
  "abomination",
  "glamour",
  "tolerance",
  "dandy",
  "flap",
  "option",
  "voluminous",
  "crusade",
  "affable",
  "epidemic",
  "technique",
  "patrician",
  "tumbler",
  "ebony",
  "grandchildren",
  "mishap",
  "puppy",
  "terminal",
  "graduate",
  "output",
  "bankruptcy",
  "accounting",
  "anterior",
  "colorless",
  "pane",
  "guile",
  "navigable",
  "idiotic",
  "impediment",
  "well-dressed",
  "antiquated",
  "irrigation",
  "jose",
  "froth",
  "lovable",
  "screwed",
  "fighter",
  "foreboding",
  "acutely",
  "centers",
  "trooper",
  "odyssey",
  "idaho",
  "goblet",
  "mint",
  "undertakings",
  "thud",
  "sicilian",
  "delia",
  "inactive",
  "cornish",
  "gaol",
  "mosquitoes",
  "capitalist",
  "designation",
  "shoal",
  "ajar",
  "elasticity",
  "geometry",
  "athwart",
  "orb",
  "furthest",
  "html",
  "doublet",
  "fowler",
  "meritorious",
  "assembling",
  "dialects",
  "locate",
  "shark",
  "tainted",
  "savour",
  "default",
  "context",
  "denunciation",
  "oblique",
  "classified",
  "cult",
  "untold",
  "doorstep",
  "insidious",
  "burly",
  "doggedly",
  "dissolute",
  "hatch",
  "brevity",
  "recruit",
  "bushel",
  "trash",
  "verdant",
  "denomination",
  "flicker",
  "clime",
  "persevere",
  "pungent",
  "acids",
  "cashier",
  "ibrahim",
  "tenement",
  "storage",
  "dominican",
  "angus",
  "birthplace",
  "hive",
  "punctual",
  "coalition",
  "ponder",
  "bedding",
  "mariner",
  "christie",
  "distract",
  "dont",
  "heredity",
  "laboriously",
  "endangered",
  "usher",
  "lancashire",
  "mal",
  "deafening",
  "flaw",
  "prague",
  "lengthy",
  "sensational",
  "concede",
  "forster",
  "armenian",
  "emaciated",
  "correcting",
  "broadcast",
  "depravity",
  "dial",
  "insatiable",
  "hopefully",
  "sociable",
  "jailer",
  "prevalence",
  "bout",
  "realism",
  "sprinkling",
  "stifle",
  "increasingly",
  "indemnity",
  "prematurely",
  "twine",
  "fatigues",
  "burglar",
  "delhi",
  "spiteful",
  "transform",
  "undesirable",
  "stagnant",
  "annexation",
  "executor",
  "lair",
  "watchfulness",
  "fated",
  "steeple",
  "crocodile",
  "imperfection",
  "ginger",
  "interposition",
  "marines",
  "grunt",
  "transgression",
  "answerable",
  "resides",
  "tarried",
  "tardy",
  "ails",
  "sammy",
  "kite",
  "venom",
  "bulky",
  "ambiguous",
  "cafe",
  "charger",
  "award",
  "ambulance",
  "discernment",
  "steamed",
  "avowal",
  "slammed",
  "cleanse",
  "aberdeen",
  "cleave",
  "samaria",
  "proverbial",
  "comparable",
  "credible",
  "veal",
  "disconsolate",
  "imagery",
  "unholy",
  "deformity",
  "humbug",
  "neapolitan",
  "confronting",
  "peevish",
  "despot",
  "label",
  "portentous",
  "triangular",
  "plebeian",
  "approving",
  "futility",
  "wallet",
  "vowel",
  "prefixed",
  "ecstatic",
  "grimace",
  "barricade",
  "caricature",
  "genoese",
  "hypocritical",
  "tuscany",
  "ungodly",
  "introduces",
  "scientist",
  "tenacious",
  "kinship",
  "bentley",
  "gut",
  "sanity",
  "counteract",
  "florid",
  "hellenic",
  "hoard",
  "equanimity",
  "irresolute",
  "belated",
  "insipid",
  "aromatic",
  "brahma",
  "prefect",
  "reticence",
  "capitulation",
  "seer",
  "newer",
  "realistic",
  "honeymoon",
  "reptile",
  "chips",
  "outdoor",
  "natal",
  "spleen",
  "interspersed",
  "radio",
  "saddened",
  "jubilee",
  "requisition",
  "twitching",
  "arsenal",
  "justin",
  "systematically",
  "politically",
  "armistice",
  "cite",
  "immorality",
  "residue",
  "staunch",
  "irrelevant",
  "noisily",
  "urgently",
  "greenish",
  "nickname",
  "shrewdly",
  "taper",
  "uncompromising",
  "wayne",
  "apace",
  "panorama",
  "seething",
  "saucer",
  "lustrous",
  "prays",
  "preside",
  "forage",
  "urges",
  "shoemaker",
  "ire",
  "sling",
  "tape",
  "bland",
  "westerly",
  "extricate",
  "mythical",
  "accommodated",
  "adjectives",
  "vizier",
  "illegitimate",
  "thrifty",
  "undaunted",
  "parasol",
  "perdition",
  "verify",
  "bean",
  "knoll",
  "nourish",
  "sneak",
  "bashful",
  "scribe",
  "interwoven",
  "oriental",
  "'twill",
  "legislator",
  "tribal",
  "informal",
  "granddaughter",
  "dissent",
  "valencia",
  "oral",
  "vagrant",
  "bog",
  "dregs",
  "electoral",
  "yo",
  "illiterate",
  "stupidly",
  "unruly",
  "curving",
  "disagreement",
  "backbone",
  "whales",
  "grocer",
  "speculate",
  "quieter",
  "comics",
  "indignity",
  "lilac",
  "waken",
  "bastard",
  "harangue",
  "pal",
  "unbecoming",
  "equator",
  "tinkling",
  "unnecessarily",
  "constructing",
  "steak",
  "meddling",
  "notoriety",
  "panther",
  "ocr",
  "unwell",
  "combustion",
  "mummy",
  "defender",
  "respiration",
  "alias",
  "allay",
  "dupe",
  "urn",
  "enthusiast",
  "lard",
  "tuft",
  "expel",
  "sheila",
  "transcendent",
  "cocoa",
  "chevalier",
  "hemp",
  "turin",
  "liege",
  "bracelet",
  "nothingness",
  "tonic",
  "jesse",
  "lucrative",
  "sacrilege",
  "pumps",
  "sphinx",
  "weakening",
  "giver",
  "broadside",
  "recur",
  "disdainful",
  "enamoured",
  "thirty-three",
  "blemish",
  "skip",
  "confidentially",
  "nitrogen",
  "belinda",
  "celery",
  "crag",
  "rumble",
  "begat",
  "observable",
  "mug",
  "wedge",
  "acuteness",
  "projectile",
  "astronomer",
  "hir",
  "amphitheatre",
  "pyrenees",
  "nods",
  "sobriety",
  "exemption",
  "peking",
  "razor",
  "afflict",
  "jonah",
  "portable",
  "wrapping",
  "scowl",
  "wounding",
  "pedigree",
  "psychic",
  "gauze",
  "noose",
  "ajax",
  "bulwark",
  "drudgery",
  "tacit",
  "crank",
  "fortify",
  "taketh",
  "brilliance",
  "cox",
  "fin",
  "passers-by",
  "blond",
  "mutter",
  "palatine",
  "berry",
  "disreputable",
  "invoke",
  "standstill",
  "immigration",
  "mimic",
  "legendary",
  "introductory",
  "cravat",
  "shorten",
  "scandinavian",
  "halter",
  "journalism",
  "woody",
  "analyze",
  "contrasting",
  "hoe",
  "surgery",
  "conservatory",
  "controls",
  "impoverished",
  "flagrant",
  "propaganda",
  "simile",
  "isabelle",
  "fireworks",
  "bradford",
  "shanty",
  "sine",
  "clang",
  "nicer",
  "pauper",
  "perpetuate",
  "volatile",
  "accumulate",
  "bruno",
  "oaken",
  "sardinia",
  "graven",
  "poop",
  "abdomen",
  "fawn",
  "sanskrit",
  "surmised",
  "dodge",
  "saturn",
  "refractory",
  "warsaw",
  "conciliate",
  "nutmeg",
  "pear",
  "paroxysm",
  "mantel",
  "immaterial",
  "quail",
  "abhor",
  "barometer",
  "implication",
  "famished",
  "mediation",
  "unrestrained",
  "formations",
  "pop",
  "assortment",
  "dexterous",
  "libel",
  "squaw",
  "undress",
  "deign",
  "incentive",
  "circumstantial",
  "armament",
  "reunion",
  "utrecht",
  "furrow",
  "quicken",
  "sixty-five",
  "atmospheric",
  "oceans",
  "wrench",
  "harmful",
  "clipped",
  "insignificance",
  "antecedent",
  "hermes",
  "relying",
  "fencing",
  "sot",
  "thrift",
  "uncontrollable",
  "variegated",
  "sled",
  "elegantly",
  "judaism",
  "blithe",
  "countryside",
  "limpid",
  "rhetorical",
  "degrade",
  "recipient",
  "impotence",
  "whiles",
  "indigenous",
  "rudimentary",
  "incorrect",
  "crete",
  "interpose",
  "complement",
  "immaculate",
  "lens",
  "philanthropy",
  "richards",
  "constituent",
  "ammonia",
  "cancer",
  "capacious",
  "hoist",
  "petted",
  "specious",
  "geology",
  "maddening",
  "purify",
  "seductive",
  "sliced",
  "admiringly",
  "amicable",
  "efficacious",
  "overhung",
  "pawn",
  "glorify",
  "spurious",
  "fete",
  "immunity",
  "stack",
  "discerning",
  "jumps",
  "macedonian",
  "greens",
  "lecturer",
  "perfidy",
  "sensibilities",
  "artificially",
  "covetous",
  "lombardy",
  "reminder",
  "villainy",
  "contingency",
  "opulent",
  "prolific",
  "sickened",
  "leak",
  "vindication",
  "carnage",
  "misunderstand",
  "nazareth",
  "spasm",
  "wigwam",
  "vibrating",
  "disc",
  "qualify",
  "shapely",
  "bluish",
  "unitarian",
  "inimitable",
  "wag",
  "portrayed",
  "widower",
  "condemning",
  "moths",
  "mushrooms",
  "distilled",
  "usurped",
  "grumble",
  "puny",
  "snatches",
  "callous",
  "disheartened",
  "wicket",
  "bewitching",
  "trend",
  "density",
  "dragons",
  "dynamite",
  "beacon",
  "cuckoo",
  "elliott",
  "induction",
  "elemental",
  "cleansing",
  "innermost",
  "chew",
  "complexity",
  "talkative",
  "withstood",
  "clamorous",
  "imbecile",
  "ignominious",
  "recitation",
  "sabre",
  "cadence",
  "caustic",
  "patriarchal",
  "alaric",
  "il",
  "permanence",
  "snorted",
  "testament",
  "beguile",
  "digits",
  "piers",
  "praiseworthy",
  "amazon",
  "corporate",
  "onslaught",
  "originate",
  "acquit",
  "marshy",
  "rind",
  "sufficiency",
  "tanks",
  "toad",
  "elk",
  "loosen",
  "retail",
  "rhythmic",
  "dale",
  "dishonesty",
  "ode",
  "pears",
  "shaven",
  "equitable",
  "fallacy",
  "mammals",
  "orthodoxy",
  "coroner",
  "grapple",
  "pranks",
  "foothold",
  "irreparable",
  "worshipping",
  "daughter-in-law",
  "chisel",
  "kim",
  "unstable",
  "compatible",
  "wrathful",
  "savior",
  "tinker",
  "sanitary",
  "rapturous",
  "bane",
  "phone",
  "bead",
  "nether",
  "physiology",
  "tiber",
  "benign",
  "camden",
  "oily",
  "capabilities",
  "platter",
  "nicest",
  "pooh",
  "rivulet",
  "intermittent",
  "mandate",
  "ply",
  "spartans",
  "decorous",
  "forked",
  "gangway",
  "postal",
  "beget",
  "ennui",
  "moi",
  "vacuum",
  "chilling",
  "cypress",
  "ripen",
  "dispel",
  "ravenna",
  "barrister",
  "duplicate",
  "lobster",
  "stockade",
  "aggrieved",
  "hades",
  "hitch",
  "inducing",
  "sedition",
  "piping",
  "grab",
  "ramble",
  "candidly",
  "convulsion",
  "danny",
  "gush",
  "flare",
  "amazingly",
  "bats",
  "dun",
  "mp",
  "bazaar",
  "booth",
  "dana",
  "madras",
  "boring",
  "incarnate",
  "antelope",
  "cosmopolitan",
  "ontario",
  "uninhabited",
  "agreements",
  "portfolio",
  "shove",
  "absolution",
  "darken",
  "crevice",
  "fragmentary",
  "freak",
  "matted",
  "seminary",
  "complication",
  "indisposition",
  "opaque",
  "sal",
  "grouse",
  "spectral",
  "intervene",
  "acquiesce",
  "bellows",
  "overnight",
  "polar",
  "birthright",
  "porridge",
  "subservient",
  "delegate",
  "slayer",
  "smack",
  "undergrowth",
  "easterly",
  "skirted",
  "'neath",
  "consecutive",
  "rectitude",
  "verona",
  "aboriginal",
  "byzantine",
  "volition",
  "discount",
  "above-mentioned",
  "scholastic",
  "flirt",
  "taxi",
  "imperceptibly",
  "diffuse",
  "trappings",
  "una",
  "ointment",
  "belligerent",
  "predict",
  "unaided",
  "alfonso",
  "conjugal",
  "hierarchy",
  "cavalcade",
  "immensity",
  "jade",
  "phoenician",
  "progeny",
  "startle",
  "revolve",
  "unconcerned",
  "vernacular",
  "exasperation",
  "racket",
  "irregularity",
  "relapse",
  "turret",
  "usurpation",
  "outlay",
  "contiguous",
  "optimism",
  "rom",
  "gallic",
  "resounding",
  "georgie",
  "arable",
  "portmanteau",
  "misleading",
  "nottingham",
  "plumb",
  "tasting",
  "definitions",
  "dauntless",
  "varnish",
  "negligent",
  "swans",
  "z",
  "clew",
  "hackers",
  "canes",
  "endanger",
  "unanimity",
  "acclamations",
  "pretension",
  "commendable",
  "godlike",
  "peel",
  "carve",
  "compunction",
  "expire",
  "fittest",
  "fleece",
  "plentifully",
  "scholarly",
  "taunt",
  "usurper",
  "vigil",
  "debris",
  "hover",
  "pro-",
  "fleshy",
  "sector",
  "travail",
  "ai",
  "oxide",
  "retrace",
  "gore",
  "surname",
  "singh",
  "copenhagen",
  "institute",
  "assailant",
  "cans",
  "complacent",
  "pensions",
  "aristocrat",
  "effeminate",
  "ish",
  "urgency",
  "emmanuel",
  "primal",
  "abusing",
  "scurvy",
  "self-defence",
  "dissuade",
  "symphony",
  "torpedo",
  "evergreen",
  "avow",
  "rudiments",
  "tanned",
  "snarl",
  "concord",
  "appreciative",
  "chancel",
  "multiplication",
  "leopard",
  "recount",
  "tribulation",
  "tunis",
  "enjoyable",
  "keenness",
  "raillery",
  "symbolism",
  "lizard",
  "morose",
  "detention",
  "blanched",
  "padua",
  "serfs",
  "vexatious",
  "candlestick",
  "diffidence",
  "garcia",
  "obeisance",
  "pad",
  "reflective",
  "remission",
  "fatherly",
  "methodical",
  "waterfall",
  "disappointing",
  "indisputable",
  "poke",
  "sheen",
  "atlantis",
  "stewed",
  "autobiography",
  "baroness",
  "algiers",
  "deter",
  "ezekiel",
  "lawfully",
  "negation",
  "boulder",
  "crumbled",
  "winner",
  "composite",
  "dishevelled",
  "dissimulation",
  "exuberant",
  "handiwork",
  "solutions",
  "terminating",
  "impropriety",
  "veto",
  "coke",
  "sward",
  "pendulum",
  "shutter",
  "prometheus",
  "scabbard",
  "brent",
  "importunate",
  "spilt",
  "adonis",
  "lunar",
  "slighted",
  "terrier",
  "vantage",
  "willy",
  "elude",
  "governmental",
  "immutable",
  "potash",
  "salient",
  "scum",
  "seashore",
  "d'you",
  "extraction",
  "hopped",
  "thorny",
  "blackguard",
  "drainage",
  "effusion",
  "partridge",
  "qua",
  "inflection",
  "tenets",
  "thumbs",
  "trump",
  "retaliation",
  "pinnacle",
  "conciliatory",
  "impact",
  "canvass",
  "'d",
  "squall",
  "girt",
  "irishmen",
  "proportionate",
  "bruise",
  "left-hand",
  "naive",
  "overcast",
  "diving",
  "heralds",
  "presidency",
  "fiber",
  "sip",
  "medley",
  "ostensibly",
  "persecute",
  "inmate",
  "tingling",
  "weeps",
  "daddy",
  "suburban",
  "adoring",
  "nautical",
  "omnipotent",
  "buyer",
  "annuity",
  "evasion",
  "man-of-war",
  "kerchief",
  "visual",
  "dissolving",
  "bespoke",
  "vivacious",
  "wang",
  "impartiality",
  "sideboard",
  "astride",
  "forty-two",
  "paddy",
  "huntsman",
  "monumental",
  "accumulating",
  "herbage",
  "musty",
  "greenland",
  "nee",
  "reddy",
  "havana",
  "plastered",
  "spar",
  "falcon",
  "parole",
  "carbonic",
  "bananas",
  "geraldine",
  "welcoming",
  "coating",
  "profusely",
  "capita",
  "colourless",
  "gallon",
  "thump",
  "bigotry",
  "prevention",
  "repudiated",
  "tomahawk",
  "lavender",
  "inoffensive",
  "claw",
  "mel",
  "pastry",
  "viands",
  "baghdad",
  "repulsion",
  "apothecary",
  "gent",
  "intellectually",
  "somber",
  "uncomfortably",
  "mosquito",
  "purification",
  "alicia",
  "fluent",
  "pebble",
  "licking",
  "plaintiff",
  "facile",
  "abodes",
  "fermentation",
  "fortification",
  "cocks",
  "deplore",
  "griffith",
  "prehistoric",
  "rejoinder",
  "feasible",
  "portly",
  "mislead",
  "canned",
  "innkeeper",
  "scarred",
  "undoing",
  "brittle",
  "eliminated",
  "prohibit",
  "canna",
  "performer",
  "splitting",
  "storehouse",
  "elusive",
  "nectar",
  "apologetic",
  "cabman",
  "ostrich",
  "world-wide",
  "peacock",
  "deviation",
  "explorer",
  "loathe",
  "arrears",
  "expiring",
  "all-powerful",
  "preferment",
  "tournament",
  "wrestle",
  "diadem",
  "pretentious",
  "thrush",
  "pennies",
  "ira",
  "rarity",
  "requirement",
  "disrespect",
  "ga",
  "minus",
  "wickedly",
  "damnable",
  "hurling",
  "thatch",
  "assiduous",
  "beetles",
  "flimsy",
  "notoriously",
  "baal",
  "symmetrical",
  "tapers",
  "advisor",
  "calcareous",
  "settler",
  "translating",
  "wilkinson",
  "mysticism",
  "grotto",
  "bo",
  "cub",
  "mosaic",
  "pascal",
  "plug",
  "shaving",
  "unfeeling",
  "untidy",
  "apostolic",
  "detriment",
  "trophy",
  "effigy",
  "stubbornly",
  "misconduct",
  "whine",
  "infectious",
  "lottery",
  "postage",
  "henceforward",
  "covet",
  "korea",
  "emphasize",
  "eyesight",
  "damask",
  "stratum",
  "ballast",
  "gripping",
  "exorbitant",
  "revert",
  "squat",
  "briton",
  "reinforcement",
  "antagonistic",
  "dung",
  "dunno",
  "inactivity",
  "confiscation",
  "delegation",
  "pants",
  "stagger",
  "condescending",
  "warp",
  "woolen",
  "aimless",
  "entrails",
  "firewood",
  "tigris",
  "indigo",
  "sapphire",
  "sheaf",
  "ascendancy",
  "confuse",
  "godfather",
  "rig",
  "tributaries",
  "festivity",
  "disapprobation",
  "gravitation",
  "demure",
  "memoir",
  "dedicate",
  "nourishing",
  "ripped",
  "tortuous",
  "gardening",
  "endowment",
  "pregnancy",
  "coinage",
  "dit",
  "tara",
  "foil",
  "surgical",
  "wrapper",
  "smallpox",
  "truthfulness",
  "preceptor",
  "threadbare",
  "authorize",
  "hurtful",
  "lighthouse",
  "-a",
  "corsica",
  "eulogy",
  "jot",
  "ably",
  "tilt",
  "digit",
  "doze",
  "lima",
  "nasal",
  "gruff",
  "leaven",
  "paolo",
  "ba",
  "balustrade",
  "castilian",
  "claudia",
  "perseus",
  "drawback",
  "lifelong",
  "carbonate",
  "decades",
  "grocery",
  "probabilities",
  "revulsion",
  "peerage",
  "trapper",
  "bladder",
  "communist",
  "hermitage",
  "hundredth",
  "clifton",
  "piston",
  "schooling",
  "stubble",
  "myrtle",
  "spokesman",
  "shingle",
  "amaze",
  "antidote",
  "noxious",
  "sloped",
  "recede",
  "antarctic",
  "enviable",
  "contrition",
  "centered",
  "cognizance",
  "dismount",
  "dating",
  "nearby",
  "poplar",
  "spoonful",
  "trevor",
  "rigour",
  "avignon",
  "constellation",
  "hansom",
  "upland",
  "dictator",
  "normally",
  "approvingly",
  "herring",
  "preoccupation",
  "satellite",
  "slipper",
  "ague",
  "slough",
  "obscene",
  "self-conscious",
  "confusing",
  "fraudulent",
  "inordinate",
  "lounged",
  "postman",
  "shack",
  "contra",
  "proportional",
  "brocade",
  "gratuitous",
  "inventive",
  "astute",
  "harem",
  "heartfelt",
  "laziness",
  "retarded",
  "consonant",
  "picket",
  "disagree",
  "equivocal",
  "frigid",
  "ordnance",
  "adduced",
  "bountiful",
  "fatality",
  "greg",
  "stilled",
  "cadet",
  "approximate",
  "consolidated",
  "font",
  "locket",
  "populations",
  "scythe",
  "stealth",
  "boris",
  "seaside",
  "sunbeam",
  "irritate",
  "saffron",
  "anvil",
  "aryan",
  "prima",
  "dowager",
  "orpheus",
  "silky",
  "betrayal",
  "erudition",
  "matthews",
  "deeps",
  "outstanding",
  "duchy",
  "autem",
  "homesick",
  "initiation",
  "fraternal",
  "manliness",
  "un-",
  "appreciable",
  "barefoot",
  "adhering",
  "crabs",
  "peradventure",
  "synagogue",
  "lank",
  "enumeration",
  "concise",
  "rama",
  "valise",
  "annihilate",
  "brazilian",
  "hovel",
  "sexton",
  "brock",
  "lustily",
  "archer",
  "dictation",
  "timorous",
  "dens",
  "guillotine",
  "thirty-four",
  "unemployed",
  "artery",
  "adroit",
  "precipitation",
  "bribery",
  "gully",
  "pearly",
  "terrify",
  "odin",
  "alison",
  "emigrant",
  "episcopal",
  "gloss",
  "unsuitable",
  "fervid",
  "accommodations",
  "dogmatic",
  "hobby",
  "motherhood",
  "tacitly",
  "bonnie",
  "diplomatist",
  "fatherland",
  "muhammad",
  "loitering",
  "lutheran",
  "mantua",
  "talker",
  "undivided",
  "devastation",
  "insertion",
  "augment",
  "dell",
  "grammatical",
  "philanthropic",
  "allegorical",
  "displease",
  "sloth",
  "numerical",
  "hubbub",
  "betake",
  "chastise",
  "cruiser",
  "dresser",
  "abstained",
  "appropriately",
  "criterion",
  "tenfold",
  "metrical",
  "newest",
  "wiry",
  "debauchery",
  "erratic",
  "forecast",
  "husbandry",
  "conducive",
  "moose",
  "bottomless",
  "stuffing",
  "knack",
  "encore",
  "tortoise",
  "disapprove",
  "bourgeoisie",
  "kennel",
  "compares",
  "clustering",
  "environs",
  "implement",
  "dais",
  "devising",
  "undisputed",
  "untried",
  "lucifer",
  "unfaithful",
  "chime",
  "exotic",
  "jeweller",
  "bulb",
  "lombard",
  "sever",
  "woeful",
  "popped",
  "'twould",
  "drab",
  "recruited",
  "supporter",
  "tu",
  "uk",
  "woolly",
  "couplet",
  "ostentatious",
  "paleness",
  "alexandra",
  "evaporation",
  "groove",
  "hove",
  "impeachment",
  "lyrical",
  "sr",
  "metres",
  "carbide",
  "erik",
  "intermission",
  "jaded",
  "almighty",
  "enhance",
  "fiendish",
  "ignominy",
  "trepidation",
  "embankment",
  "enumerate",
  "financier",
  "accuser",
  "edifying",
  "lotus",
  "slimy",
  "zealously",
  "alcove",
  "lettuce",
  "operative",
  "fusion",
  "puppet",
  "uncultivated",
  "concurred",
  "cosy",
  "handmaid",
  "ludwig",
  "poll",
  "rigor",
  "brine",
  "accountable",
  "enigma",
  "chloride",
  "magistracy",
  "ottawa",
  "talented",
  "perturbation",
  "wading",
  "jurisprudence",
  "menial",
  "shaky",
  "purgatory",
  "thaw",
  "bacteria",
  "hoop",
  "lemonade",
  "agonized",
  "caliph",
  "masquerade",
  "lattice",
  "sticky",
  "fay",
  "habitable",
  "theologian",
  "coined",
  "lashing",
  "component",
  "gondola",
  "physique",
  "pendant",
  "rolf",
  "thirty-seven",
  "biological",
  "adornment",
  "baden",
  "lethargy",
  "mama",
  "contraband",
  "interred",
  "invader",
  "transverse",
  "divination",
  "kernel",
  "oasis",
  "abbess",
  "peck",
  "tireless",
  "venezuela",
  "hale",
  "in-",
  "instigation",
  "impiety",
  "straighten",
  "unalterable",
  "mesopotamia",
  "villainous",
  "cession",
  "colonization",
  "decorate",
  "lodger",
  "petit",
  "affluence",
  "feign",
  "grit",
  "leech",
  "flit",
  "intuitive",
  "taciturn",
  "botany",
  "byte",
  "kneeled",
  "castor",
  "lawsuit",
  "stigma",
  "guido",
  "affirmation",
  "amanda",
  "confederation",
  "perjury",
  "yeoman",
  "sirrah",
  "carnival",
  "domesticated",
  "obsequious",
  "nativity",
  "sardonic",
  "afghanistan",
  "secretion",
  "simmer",
  "ethiopia",
  "explicitly",
  "amiability",
  "worships",
  "limiting",
  "presidential",
  "bump",
  "coincide",
  "congratulation",
  "duplicity",
  "plaid",
  "cartridge",
  "ballet",
  "prologue",
  "purge",
  "scan",
  "sorcery",
  "dorset",
  "resentful",
  "imperturbable",
  "narcissus",
  "sarcastically",
  "urine",
  "flirtation",
  "repentant",
  "socialism",
  "quarrelsome",
  "awning",
  "numb",
  "discontinued",
  "whomsoever",
  "woodwork",
  "pickle",
  "biographical",
  "brandenburg",
  "butcher's",
  "rife",
  "warily",
  "alec",
  "attest",
  "breezy",
  "entail",
  "thumping",
  "efface",
  "ravenous",
  "elective",
  "funnel",
  "jess",
  "wearer",
  "embody",
  "lurch",
  "metropolitan",
  "regina",
  "entitle",
  "hilarity",
  "moodily",
  "babble",
  "betting",
  "garlic",
  "gong",
  "simpleton",
  "technically",
  "copse",
  "lassie",
  "wrest",
  "derivation",
  "foggy",
  "quarto",
  "unfathomable",
  "elapse",
  "nowise",
  "dissimilar",
  "grande",
  "tuscan",
  "polity",
  "vishnu",
  "economics",
  "lyrics",
  "misguided",
  "untoward",
  "boils",
  "cosmic",
  "obstruct",
  "tipsy",
  "assiduously",
  "effie",
  "missus",
  "peat",
  "riley",
  "sharks",
  "strangle",
  "finland",
  "wavy",
  "chile",
  "renegade",
  "postscript",
  "leafless",
  "middle-class",
  "sleet",
  "incipient",
  "chichester",
  "cupidity",
  "inhospitable",
  "waver",
  "empirical",
  "insinuate",
  "thrashing",
  "deceptive",
  "mead",
  "aquatic",
  "buff",
  "eddies",
  "dominate",
  "loam",
  "propagation",
  "co-operate",
  "wove",
  "advertise",
  "librarian",
  "accredited",
  "telegraphic",
  "unconnected",
  "cropped",
  "diffusion",
  "insurmountable",
  "mystified",
  "overthrew",
  "prickly",
  "smoothness",
  "yew",
  "abortive",
  "bonfire",
  "soot",
  "tibet",
  "godmother",
  "graze",
  "butchers",
  "aphrodite",
  "agile",
  "uprising",
  "coax",
  "fife",
  "aglow",
  "avalanche",
  "connoisseur",
  "molest",
  "prim",
  "balkan",
  "refute",
  "intolerance",
  "manger",
  "toilette",
  "grieves",
  "kit",
  "practitioner",
  "interim",
  "effrontery",
  "rhone",
  "howls",
  "mitigate",
  "obdurate",
  "chide",
  "mettle",
  "tacked",
  "posterior",
  "ahmed",
  "loyally",
  "reggie",
  "soak",
  "stench",
  "umbrellas",
  "wasteful",
  "brabant",
  "tongs",
  "quilt",
  "pesos",
  "sedate",
  "competitor",
  "conservation",
  "hamper",
  "laundry",
  "valuation",
  "xenophon",
  "easel",
  "slime",
  "vastness",
  "billet",
  "celts",
  "godhead",
  "headway",
  "cud",
  "oversight",
  "boatswain",
  "probation",
  "reflex",
  "celerity",
  "edification",
  "semicircle",
  "unconstitutional",
  "warring",
  "idiom",
  "remuneration",
  "dower",
  "overture",
  "figurative",
  "seasoning",
  "challenging",
  "cuban",
  "nieces",
  "twenty-nine",
  "extermination",
  "fifty-five",
  "impute",
  "digestive",
  "heterogeneous",
  "thirty-eight",
  "burrow",
  "dazzle",
  "pacify",
  "characterize",
  "collateral",
  "neville",
  "wedlock",
  "prostitution",
  "adjutant",
  "inflated",
  "thrall",
  "facetious",
  "opportune",
  "psyche",
  "sensuality",
  "imparting",
  "mediocrity",
  "serbia",
  "pets",
  "scriptural",
  "infusion",
  "undefined",
  "barcelona",
  "stalking",
  "sallies",
  "short-lived",
  "avaricious",
  "gnarled",
  "grieving",
  "islet",
  "puzzles",
  "strawberry",
  "urban",
  "workhouse",
  "embarrass",
  "notebook",
  "transcendental",
  "custard",
  "oppressor",
  "ea",
  "proficiency",
  "vas",
  "delectable",
  "antiquarian",
  "pollution",
  "cinders",
  "piquant",
  "plaything",
  "tonnage",
  "ap",
  "seaweed",
  "amiably",
  "chemicals",
  "predatory",
  "prodigy",
  "scamp",
  "languish",
  "album",
  "batch",
  "headstrong",
  "perforated",
  "bavarian",
  "chops",
  "cones",
  "elongated",
  "locusts",
  "vintage",
  "dearth",
  "opulence",
  "self-evident",
  "ablaze",
  "baseball",
  "magnify",
  "cowed",
  "hardihood",
  "sulphuric",
  "sniff",
  "silesia",
  "spinal",
  "avidity",
  "dionysius",
  "levee",
  "temerity",
  "piracy",
  "poole",
  "fa",
  "mum",
  "archangel",
  "buffet",
  "participle",
  "influx",
  "murky",
  "toilsome",
  "insignia",
  "nicaragua",
  "jubilant",
  "leprosy",
  "pert",
  "principality",
  "self-possessed",
  "warped",
  "agonizing",
  "consecrate",
  "falter",
  "roundabout",
  "archaic",
  "inviolable",
  "lye",
  "reversion",
  "banter",
  "dryness",
  "garage",
  "entrust",
  "spout",
  "erroneously",
  "lumbering",
  "comer",
  "diagnosis",
  "lukewarm",
  "stimulant",
  "tiller",
  "crutch",
  "glint",
  "quill",
  "ecclesiastic",
  "tier",
  "elation",
  "recluse",
  "ostend",
  "awry",
  "charioteer",
  "coasting",
  "jeffrey",
  "creak",
  "extort",
  "registration",
  "sepulchral",
  "soluble",
  "zigzag",
  "fatherless",
  "frightening",
  "inconsiderate",
  "seaport",
  "blasphemous",
  "concave",
  "microscopic",
  "chiefest",
  "specialist",
  "vancouver",
  "yearn",
  "rouge",
  "inundation",
  "shortening",
  "victorian",
  "mulatto",
  "odium",
  "bathroom",
  "gamble",
  "spelt",
  "warden",
  "catechism",
  "excommunication",
  "phosphorus",
  "hellish",
  "reprove",
  "embedded",
  "exuberance",
  "integral",
  "tentative",
  "unattainable",
  "brooch",
  "detestation",
  "toronto",
  "alloy",
  "betide",
  "buckle",
  "interrogation",
  "paddling",
  "tropic",
  "worshipper",
  "beholds",
  "billiards",
  "humid",
  "structural",
  "torpor",
  "undeveloped",
  "mythological",
  "preamble",
  "alabaster",
  "jackal",
  "eliminate",
  "maniac",
  "medicinal",
  "pea",
  "andes",
  "appendix",
  "estranged",
  "falstaff",
  "gymnasium",
  "musk",
  "sylvan",
  "tithe",
  "'ve",
  "personnel",
  "intonation",
  "evince",
  "whirlpool",
  "vulture",
  "baleful",
  "chronological",
  "circulate",
  "hame",
  "manifesting",
  "niger",
  "vouchsafe",
  "glue",
  "retard",
  "talisman",
  "milky",
  "orbs",
  "crane",
  "perversion",
  "piedmont",
  "fevered",
  "officious",
  "andreas",
  "hops",
  "tyrol",
  "contractor",
  "notify",
  "irreconcilable",
  "usury",
  "impartially",
  "similitude",
  "fresher",
  "accessory",
  "cold-blooded",
  "contributor",
  "arousing",
  "inclusive",
  "narrator",
  "ballroom",
  "inaudible",
  "manifests",
  "seller",
  "drawbridge",
  "insufferable",
  "manhattan",
  "clumsily",
  "cod",
  "importunity",
  "schism",
  "weaver",
  "limitless",
  "thesis",
  "altercation",
  "overbearing",
  "baffle",
  "illicit",
  "harass",
  "incorrigible",
  "prosecutor",
  "ticking",
  "artisan",
  "brawny",
  "lisa",
  "unpaid",
  "cleanly",
  "discard",
  "measles",
  "compression",
  "explode",
  "pry",
  "spill",
  "swimmer",
  "culpable",
  "currants",
  "gratis",
  "ingredient",
  "rigged",
  "subside",
  "cherokee",
  "deficit",
  "one-sided",
  "businesses",
  "phillip",
  "notch",
  "ruse",
  "calvary",
  "disquiet",
  "heretical",
  "upsetting",
  "cobbler",
  "crackers",
  "worshiped",
  "threefold",
  "banana",
  "housing",
  "mischance",
  "antithesis",
  "digression",
  "insoluble",
  "rave",
  "ungracious",
  "evacuation",
  "generator",
  "chronology",
  "clyde",
  "disconcerting",
  "insuperable",
  "materialism",
  "photographic",
  "credence",
  "radically",
  "remorseless",
  "flea",
  "oligarchy",
  "bran",
  "turbid",
  "pantheon",
  "shred",
  "sinewy",
  "bravado",
  "earthenware",
  "fuse",
  "scientifically",
  "shallows",
  "undiscovered",
  "axiom",
  "footstool",
  "hellas",
  "fodder",
  "imitative",
  "precipitately",
  "succumb",
  "chink",
  "roller",
  "petulant",
  "strasburg",
  "inauguration",
  "bach",
  "seditious",
  "voiced",
  "bloodthirsty",
  "edible",
  "skim",
  "unction",
  "mathematician",
  "roomy",
  "chaotic",
  "quell",
  "rampant",
  "resound",
  "fallow",
  "fealty",
  "probity",
  "cylindrical",
  "arbor",
  "arcadia",
  "palatable",
  "declivity",
  "hallucination",
  "pest",
  "pique",
  "hight",
  "smashing",
  "vestry",
  "lurk",
  "asceticism",
  "balsam",
  "bedtime",
  "patrimony",
  "wicker",
  "invocation",
  "ventilation",
  "vertically",
  "equestrian",
  "hopping",
  "obligatory",
  "precocious",
  "xl",
  "ailing",
  "distended",
  "drip",
  "gushing",
  "valuables",
  "gable",
  "indiscriminate",
  "informant",
  "autograph",
  "rib",
  "blur",
  "invective",
  "tightening",
  "adept",
  "ceres",
  "stringent",
  "outpost",
  "atheist",
  "gayest",
  "glimmered",
  "intriguing",
  "nickel",
  "avoidance",
  "glacial",
  "lax",
  "originating",
  "babel",
  "germanic",
  "spindle",
  "phalanx",
  "pill",
  "reprobate",
  "wharves",
  "alf",
  "currently",
  "figuratively",
  "vitals",
  "afghan",
  "impair",
  "penitentiary",
  "exhilaration",
  "khaki",
  "aborigines",
  "accommodating",
  "gunther",
  "manna",
  "permissible",
  "media",
  "cruising",
  "pedantic",
  "platonic",
  "despondent",
  "laity",
  "reticent",
  "unwieldy",
  "exportation",
  "ps",
  "wreckage",
  "xerxes",
  "cartwright",
  "corpus",
  "decrepit",
  "hebrides",
  "menu",
  "voluble",
  "cudgel",
  "fracture",
  "gauntlet",
  "lewd",
  "mayn't",
  "intolerant",
  "unmindful",
  "pi",
  "exhort",
  "trifled",
  "bus",
  "bale",
  "turnpike",
  "anomalous",
  "coquette",
  "pewter",
  "querulous",
  "inefficient",
  "thrace",
  "transact",
  "whiff",
  "festal",
  "tome",
  "canary",
  "forum",
  "fruition",
  "salesman",
  "ana",
  "circuitous",
  "guild",
  "thirty-one",
  "momentum",
  "higgins",
  "hunts",
  "patter",
  "risky",
  "acceded",
  "carrion",
  "slant",
  "censor",
  "drilling",
  "hangman",
  "fie",
  "foretell",
  "verity",
  "nebuchadnezzar",
  "priestess",
  "tile",
  "brandishing",
  "deterioration",
  "hacker",
  "homogeneous",
  "missile",
  "sausage",
  "bookcase",
  "goa",
  "indebtedness",
  "manipulation",
  "rede",
  "rhinoceros",
  "adroitly",
  "missive",
  "scouting",
  "computation",
  "fran",
  "impede",
  "pliant",
  "producer",
  "sulkily",
  "monetary",
  "peterborough",
  "pith",
  "satellites",
  "swain",
  "tombstone",
  "ninety-nine",
  "tomato",
  "bivouac",
  "imp",
  "outsider",
  "pe",
  "abstruse",
  "depict",
  "inflation",
  "liberate",
  "marginal",
  "pip",
  "reinforce",
  "banging",
  "remonstrate",
  "snort",
  "anteroom",
  "burdensome",
  "licentiousness",
  "prefix",
  "bruges",
  "collects",
  "ducal",
  "fantasy",
  "muckle",
  "aroma",
  "peaked",
  "convex",
  "dormitory",
  "gulp",
  "jingle",
  "concierge",
  "deepen",
  "imposes",
  "propeller",
  "chef",
  "pertinent",
  "unkempt",
  "auto",
  "javelin",
  "stint",
  "undermine",
  "vagaries",
  "counters",
  "playmate",
  "pores",
  "ungenerous",
  "declamation",
  "tuck",
  "hun",
  "res",
  "socket",
  "un",
  "untruth",
  "acrid",
  "antechamber",
  "coherent",
  "parasite",
  "retract",
  "shannon",
  "crape",
  "dexterously",
  "holly",
  "assets",
  "crumble",
  "stuffy",
  "tincture",
  "unfounded",
  "wane",
  "outspoken",
  "sift",
  "frivolity",
  "shopkeeper",
  "thoroughness",
  "distraught",
  "kangaroo",
  "navigator",
  "tablespoon",
  "aflame",
  "crockery",
  "keyhole",
  "all-important",
  "frustrate",
  "predilection",
  "thereat",
  "assigns",
  "barring",
  "dullness",
  "fundamentally",
  "potassium",
  "lynn",
  "susanna",
  "fins",
  "parody",
  "strew",
  "supercilious",
  "gr",
  "retrieve",
  "wry",
  "buckskin",
  "intentional",
  "virtual",
  "algebra",
  "thicken",
  "topped",
  "brimstone",
  "fetching",
  "passer-by",
  "mammy",
  "reindeer",
  "saracen",
  "tinkle",
  "coercion",
  "survivor",
  "combines",
  "composers",
  "flux",
  "generic",
  "trinidad",
  "temperatures",
  "competitive",
  "improperly",
  "painstaking",
  "colloquy",
  "abyssinia",
  "alleviate",
  "impromptu",
  "mongol",
  "who'd",
  "zones",
  "constellations",
  "footpath",
  "hoops",
  "instantaneously",
  "quack",
  "dentist",
  "execrable",
  "lorenz",
  "entice",
  "gillian",
  "menagerie",
  "concepts",
  "fabled",
  "jewellery",
  "meed",
  "optical",
  "budge",
  "heinous",
  "oe",
  "belfast",
  "biology",
  "harps",
  "enact",
  "inkling",
  "outgrown",
  "unemployment",
  "personification",
  "tuition",
  "devon",
  "postmaster",
  "potency",
  "authorised",
  "lenient",
  "gelatine",
  "alcoholic",
  "perishable",
  "crib",
  "installation",
  "stoned",
  "ace",
  "amenable",
  "discriminate",
  "militant",
  "unchanging",
  "disarm",
  "bereavement",
  "canter",
  "quadrangle",
  "retrospect",
  "thoughtfulness",
  "alkali",
  "caterpillar",
  "devious",
  "impervious",
  "perth",
  "consolidation",
  "subaltern",
  "liquids",
  "sized",
  "spherical",
  "symbolical",
  "heighten",
  "laughable",
  "spence",
  "burner",
  "papyrus",
  "inflame",
  "crucial",
  "meteor",
  "delusive",
  "eskimo",
  "sealing",
  "abusive",
  "madagascar",
  "royalist",
  "snorting",
  "busts",
  "expansive",
  "fob",
  "assignment",
  "heidi",
  "labrador",
  "arbiter",
  "cam",
  "fabian",
  "ferrara",
  "rapacious",
  "stallion",
  "gist",
  "prostitute",
  "quota",
  "skating",
  "solo",
  "agitate",
  "benighted",
  "hic",
  "moonshine",
  "culminated",
  "disbelief",
  "ephemeral",
  "scuffle",
  "ungainly",
  "hie",
  "turpentine",
  "browser",
  "sis",
  "excavation",
  "prattle",
  "stipulation",
  "overhear",
  "slick",
  "swagger",
  "valueless",
  "larva",
  "singapore",
  "hemlock",
  "josh",
  "tins",
  "enormity",
  "freckled",
  "calcium",
  "gland",
  "commiseration",
  "genealogy",
  "rectangular",
  "truant",
  "firstborn",
  "inroads",
  "mightn't",
  "oatmeal",
  "buoyancy",
  "outlandish",
  "wreak",
  "ionian",
  "commemorate",
  "creamy",
  "imprint",
  "lamplight",
  "leah",
  "revere",
  "thickening",
  "historically",
  "fissure",
  "unremitting",
  "cassock",
  "defends",
  "jacobs",
  "sanctify",
  "ultimatum",
  "adhesion",
  "hearsay",
  "monty",
  "nuclear",
  "spinster",
  "titanic",
  "attica",
  "bequeath",
  "love-making",
  "capability",
  "estrangement",
  "hearse",
  "versus",
  "able-bodied",
  "dissipate",
  "hi",
  "venerated",
  "transmitting",
  "bianca",
  "elimination",
  "russet",
  "spectrum",
  "benignant",
  "anatomical",
  "intercede",
  "omnipotence",
  "taut",
  "agitating",
  "diluted",
  "perfunctory",
  "wat",
  "gar",
  "sodium",
  "urchin",
  "gretchen",
  "pollux",
  "relaxing",
  "virile",
  "associating",
  "defining",
  "bodice",
  "ee",
  "whoop",
  "hysteria",
  "jewess",
  "lucca",
  "surveillance",
  "advises",
  "illimitable",
  "ludlow",
  "unexplored",
  "harmonize",
  "shears",
  "vomiting",
  "accustom",
  "alluvial",
  "boulevard",
  "divest",
  "gens",
  "trustee",
  "bile",
  "hickory",
  "profanity",
  "accede",
  "changeable",
  "delphi",
  "extracting",
  "fibrous",
  "hobart",
  "philanthropist",
  "bandit",
  "caller",
  "ermine",
  "hurries",
  "pup",
  "watcher",
  "alton",
  "ordain",
  "versification",
  "haphazard",
  "rebuild",
  "ashley",
  "jeopardy",
  "outwards",
  "unsound",
  "craven",
  "hostage",
  "juicy",
  "eel",
  "hosea",
  "pivot",
  "inca",
  "effectiveness",
  "irreverent",
  "unyielding",
  "chandler",
  "convalescence",
  "defray",
  "overturn",
  "pedantry",
  "weymouth",
  "cannonade",
  "insinuation",
  "jeroboam",
  "loops",
  "alex",
  "coll",
  "convalescent",
  "cordova",
  "expound",
  "forerunner",
  "handbook",
  "panegyric",
  "therefor",
  "roofed",
  "abridged",
  "mirage",
  "nip",
  "peruse",
  "apoplexy",
  "botanical",
  "obtainable",
  "specialized",
  "vulnerable",
  "athlete",
  "buckler",
  "grope",
  "preposition",
  "stripe",
  "kerry",
  "namesake",
  "ravens",
  "gourd",
  "rove",
  "wrinkle",
  "anomaly",
  "harlot",
  "dispersion",
  "ejaculation",
  "otter",
  "plaza",
  "transparency",
  "accelerated",
  "besiege",
  "mohawk",
  "begone",
  "harmed",
  "inborn",
  "redder",
  "descartes",
  "facade",
  "greenhouse",
  "pluto",
  "predominance",
  "boxing",
  "elector",
  "felony",
  "hinting",
  "lewes",
  "soliloquy",
  "amnesty",
  "conspire",
  "nu",
  "comprise",
  "dictum",
  "ostensible",
  "seam",
  "clip",
  "colombia",
  "hypothetical",
  "scoff",
  "enamel",
  "inflammable",
  "transgressed",
  "wired",
  "hap",
  "leper",
  "pocketbook",
  "unchecked",
  "windmill",
  "deft",
  "incongruity",
  "ledger",
  "rehearse",
  "strictness",
  "swede",
  "acquittal",
  "distrustful",
  "savoury",
  "seaboard",
  "unlock",
  "diffident",
  "levant",
  "prototype",
  "sa",
  "spike",
  "supra",
  "lavishly",
  "archipelago",
  "laymen",
  "rosary",
  "aground",
  "dwelling-place",
  "fount",
  "inequalities",
  "insulated",
  "filing",
  "observatory",
  "zulu",
  "ashen",
  "nominative",
  "assigning",
  "trickery",
  "libya",
  "veda",
  "honeysuckle",
  "wick",
  "broadest",
  "complicity",
  "singularity",
  "vouch",
  "intangible",
  "priority",
  "seduce",
  "replete",
  "deserter",
  "fiddler",
  "offset",
  "redoubtable",
  "stretcher",
  "'un",
  "refutation",
  "unbridled",
  "ya",
  "admixture",
  "cascade",
  "docility",
  "hew",
  "tasteful",
  "vanguard",
  "premier",
  "remoteness",
  "warder",
  "stefan",
  "mandy",
  "frieze",
  "nutrition",
  "protoplasm",
  "quartermaster",
  "restrict",
  "tick",
  "bishopric",
  "dispirited",
  "gibbet",
  "pedestrian",
  "swerve",
  "abdication",
  "jumble",
  "lameness",
  "landmark",
  "supersede",
  "axle",
  "hasan",
  "reputable",
  "swoop",
  "vat",
  "furtherance",
  "mendicant",
  "superlative",
  "judiciary",
  "reappearance",
  "rape",
  "atheism",
  "ariel",
  "franc",
  "stockholm",
  "deferential",
  "abstractions",
  "doughty",
  "monitor",
  "rip",
  "womankind",
  "repudiate",
  "abstractedly",
  "bi",
  "condensation",
  "greyhound",
  "loser",
  "statuary",
  "allege",
  "junk",
  "luster",
  "torpid",
  "unexplained",
  "woodlands",
  "viscount",
  "extortion",
  "grandpa",
  "terminus",
  "constituency",
  "detecting",
  "husbandman",
  "tsp",
  "grouping",
  "uncontrolled",
  "paraguay",
  "severn",
  "spaniel",
  "aeschylus",
  "befriend",
  "dissemble",
  "fresco",
  "lar",
  "marcel",
  "null",
  "immature",
  "reactionary",
  "sweeten",
  "thessaly",
  "blockhead",
  "conditional",
  "emulate",
  "theoretically",
  "toothache",
  "turnip",
  "coxcomb",
  "cultural",
  "unaltered",
  "upheaval",
  "aw",
  "blizzard",
  "goldsmith",
  "palisades",
  "retention",
  "stupefaction",
  "vermilion",
  "braces",
  "sophistry",
  "technology",
  "marketing",
  "sorcerer",
  "plucky",
  "pun",
  "transgress",
  "vagueness",
  "horus",
  "sickle",
  "muff",
  "virulent",
  "gunner",
  "sawdust",
  "sim",
  "temps",
  "typewriter",
  "adjournment",
  "gunwale",
  "sinning",
  "vibrate",
  "defines",
  "necktie",
  "warm-hearted",
  "bloodshot",
  "dyke",
  "pallet",
  "propagate",
  "phial",
  "probe",
  "puppies",
  "nag",
  "sappho",
  "sprig",
  "tillage",
  "twos",
  "erst",
  "quarterly",
  "unravel",
  "drowsiness",
  "markings",
  "sacrilegious",
  "mussulman",
  "reorganization",
  "malevolent",
  "tripoli",
  "vernal",
  "inimical",
  "metamorphosis",
  "open-mouthed",
  "scandals",
  "sumatra",
  "untenable",
  "debauch",
  "endow",
  "circumcision",
  "economically",
  "celibacy",
  "drummer",
  "gender",
  "demeter",
  "emissary",
  "administrator",
  "immobility",
  "petite",
  "presidents",
  "tickle",
  "barque",
  "meager",
  "cancelled",
  "foreword",
  "abruptness",
  "almond",
  "appendage",
  "bullying",
  "cleaner",
  "rita",
  "squeak",
  "botanist",
  "nausea",
  "seventy-two",
  "yule",
  "matting",
  "preferences",
  "shirk",
  "yolk",
  "wend",
  "devotedly",
  "felon",
  "intestine",
  "characteristically",
  "odorous",
  "astrology",
  "caribbean",
  "pontiff",
  "portray",
  "viking",
  "treasonable",
  "xavier",
  "mockingly",
  "mediator",
  "platinum",
  "spades",
  "bedclothes",
  "grandchild",
  "leer",
  "luscious",
  "blues",
  "coldest",
  "currant",
  "quietude",
  "th",
  "tidal",
  "eddie",
  "incandescent",
  "insurgent",
  "posthumous",
  "openness",
  "pianoforte",
  "dual",
  "lassitude",
  "adores",
  "didactic",
  "erin",
  "unobtrusive",
  "aggravate",
  "penury",
  "questioner",
  "burgher",
  "coy",
  "layman",
  "morass",
  "reclaim",
  "reminiscent",
  "eye-witness",
  "inferno",
  "lawlessness",
  "muslim",
  "inserting",
  "periodically",
  "pickled",
  "restive",
  "synthesis",
  "ulterior",
  "bloated",
  "darn",
  "girth",
  "knell",
  "mulberry",
  "propitiate",
  "souvenir",
  "taps",
  "undeserved",
  "amassed",
  "burgomaster",
  "vis",
  "abides",
  "clammy",
  "con-",
  "flippant",
  "gainsay",
  "specialty",
  "townspeople",
  "abeyance",
  "hawthorn",
  "nude",
  "universality",
  "interment",
  "animating",
  "aquiline",
  "subsidiary",
  "laddie",
  "liveliness",
  "disaffected",
  "potentate",
  "mart",
  "phaeton",
  "polygamy",
  "unskilled",
  "cossack",
  "extravagantly",
  "husk",
  "analogies",
  "vulcan",
  "incognito",
  "whore",
  "bellow",
  "bizarre",
  "horny",
  "lung",
  "prithee",
  "communal",
  "dross",
  "passively",
  "puerile",
  "uprightness",
  "adele",
  "dram",
  "intrepidity",
  "lackey",
  "disjointed",
  "repartee",
  "commentaries",
  "conducts",
  "culinary",
  "grooves",
  "rheumatic",
  "scouring",
  "adulation",
  "pheasant",
  "graft",
  "municipality",
  "applicant",
  "linguistic",
  "undignified",
  "contrite",
  "degeneration",
  "resin",
  "stinking",
  "tag",
  "typhoid",
  "pyre",
  "shackles",
  "super",
  "forty-four",
  "marlowe",
  "christening",
  "gloried",
  "massy",
  "illogical",
  "malt",
  "relay",
  "epitome",
  "fallacious",
  "trolley",
  "seafaring",
  "astral",
  "collaboration",
  "immoderate",
  "skylight",
  "unsympathetic",
  "alienation",
  "flooring",
  "humorously",
  "dido",
  "mushroom",
  "aide",
  "exploitation",
  "keg",
  "manifesto",
  "obliterate",
  "puissant",
  "repellent",
  "tatters",
  "allure",
  "endearing",
  "paddock",
  "rebuff",
  "locally",
  "poppy",
  "slavish",
  "incite",
  "knocker",
  "upshot",
  "'re",
  "cistern",
  "depreciation",
  "hypotheses",
  "io",
  "gingerly",
  "lioness",
  "reprimand",
  "sahara",
  "weighted",
  "belied",
  "gills",
  "indelible",
  "malaria",
  "devastating",
  "funereal",
  "inertia",
  "stud",
  "alertness",
  "delineation",
  "gasoline",
  "peddler",
  "caucasus",
  "forte",
  "gusto",
  "jaunty",
  "pumpkin",
  "auctioneer",
  "englishwoman",
  "grog",
  "lengthen",
  "pate",
  "storing",
  "zurich",
  "gruesome",
  "kidney",
  "badness",
  "duet",
  "unconcern",
  "chills",
  "factious",
  "flabby",
  "invidious",
  "jena",
  "mercedes",
  "overlaid",
  "possessive",
  "canonical",
  "cognition",
  "culmination",
  "egoism",
  "garrulous",
  "rueful",
  "unattended",
  "uplift",
  "loot",
  "quasi",
  "preventive",
  "scion",
  "thunderstorm",
  "phenomenal",
  "unconditional",
  "clod",
  "deuteronomy",
  "cactus",
  "siena",
  "spectacular",
  "assessment",
  "genie",
  "quaking",
  "rift",
  "tum",
  "dynamic",
  "bairn",
  "barrow",
  "clandestine",
  "guiana",
  "isthmus",
  "revise",
  "titled",
  "atkins",
  "overworked",
  "suffocation",
  "thrash",
  "annex",
  "breakdown",
  "mediocre",
  "ruffle",
  "ryan",
  "tiring",
  "zola",
  "expence",
  "imprison",
  "absent-minded",
  "dole",
  "fifty-two",
  "middlesex",
  "simplified",
  "beaux",
  "tinsel",
  "abolitionists",
  "arsenic",
  "acacia",
  "cellular",
  "campus",
  "misconception",
  "behest",
  "airing",
  "canine",
  "serial",
  "vortex",
  "ween",
  "perplex",
  "asparagus",
  "trite",
  "canteen",
  "ooze",
  "aden",
  "adjourn",
  "conditioned",
  "fluently",
  "viper",
  "abolishing",
  "commentator",
  "sp",
  "unopened",
  "kurt",
  "legate",
  "lincolnshire",
  "producers",
  "snail",
  "hawaiian",
  "vessel's",
  "cinderella",
  "predicate",
  "undertaker",
  "mundane",
  "godless",
  "mo",
  "sprite",
  "algeria",
  "obviate",
  "siren",
  "vedic",
  "vented",
  "jester",
  "gleefully",
  "sectarian",
  "comedian",
  "confluence",
  "dissertation",
  "infinitesimal",
  "kong",
  "plush",
  "statistical",
  "decipher",
  "inadvertently",
  "zanzibar",
  "lynx",
  "pittance",
  "playground",
  "promiscuous",
  "sapling",
  "spirituality",
  "subject-matter",
  "cuss",
  "elaboration",
  "facial",
  "formulate",
  "upstart",
  "insecure",
  "sandwich",
  "stripling",
  "subterfuge",
  "thyme",
  "abigail",
  "buoy",
  "regenerate",
  "overpower",
  "steerage",
  "crested",
  "potion",
  "allison",
  "clove",
  "exterminate",
  "pollyanna",
  "porous",
  "anthem",
  "flaxen",
  "mourner",
  "prep",
  "cuff",
  "fm",
  "grandma",
  "grasshopper",
  "stampede",
  "unfeigned",
  "roost",
  "spurn",
  "stimulation",
  "censorship",
  "parity",
  "ornamentation",
  "bleached",
  "narrate",
  "unabated",
  "blink",
  "sikkim",
  "there'd",
  "delude",
  "equip",
  "nitrate",
  "organist",
  "underhand",
  "councillor",
  "threshing",
  "assimilate",
  "home-made",
  "hybrid",
  "infantile",
  "insubordination",
  "joey",
  "nominate",
  "roguish",
  "dos",
  "equation",
  "pigment",
  "queens",
  "sahib",
  "samaritan",
  "sidon",
  "tinder",
  "cloven",
  "scour",
  "thirtieth",
  "commenting",
  "gala",
  "rill",
  "segment",
  "sharpen",
  "socialist",
  "vanquish",
  "gull",
  "robs",
  "antiquary",
  "broods",
  "cancel",
  "drastic",
  "etymology",
  "determinate",
  "cherub",
  "filter",
  "meter",
  "zulus",
  "gnaw",
  "trickle",
  "etruscan",
  "brigand",
  "colonnade",
  "fender",
  "liabilities",
  "mince",
  "hostelry",
  "welch",
  "tumults",
  "hump",
  "libertine",
  "sensed",
  "copiously",
  "decadence",
  "subdivision",
  "thoroughbred",
  "accentuated",
  "albania",
  "dampness",
  "sporadic",
  "tut",
  "widen",
  "damaging",
  "deduce",
  "illuminate",
  "hurrah",
  "meuse",
  "braids",
  "burma",
  "egress",
  "endurable",
  "floral",
  "thirty-nine",
  "beck",
  "diaphragm",
  "disintegration",
  "tablecloth",
  "chalice",
  "extraneous",
  "proficient",
  "astrologer",
  "cheyenne",
  "depress",
  "gag",
  "mister",
  "disrespectful",
  "paganism",
  "richie",
  "uncover",
  "corsican",
  "dirge",
  "reconstruct",
  "umpire",
  "humans",
  "surmount",
  "amicably",
  "atomic",
  "commemoration",
  "controversial",
  "pianist",
  "apples",
  "genii",
  "marvin",
  "nunnery",
  "wetting",
  "sophisticated",
  "curvature",
  "infuse",
  "deranged",
  "emit",
  "engrossing",
  "queenly",
  "sewn",
  "alligator",
  "kerosene",
  "twitch",
  "barrack",
  "assimilation",
  "bets",
  "superfluity",
  "uplifting",
  "widowhood",
  "bedouin",
  "tart",
  "forceful",
  "forty-three",
  "leash",
  "ss",
  "absolved",
  "alderman",
  "drone",
  "locomotion",
  "muddle",
  "palisade",
  "proffer",
  "talmud",
  "electrified",
  "inappropriate",
  "sediment",
  "snub",
  "mandarin",
  "preaches",
  "thistle",
  "completes",
  "mongrel",
  "crumb",
  "gird",
  "unconventional",
  "variant",
  "wisp",
  "articulation",
  "tawdry",
  "deathbed",
  "eros",
  "mirthful",
  "offing",
  "cerebral",
  "footfall",
  "shrapnel",
  "distillation",
  "georgian",
  "specify",
  "unsightly",
  "galen",
  "adherent",
  "chubby",
  "dislodge",
  "espouse",
  "itinerant",
  "planetary",
  "sorrel",
  "tibetan",
  "disparity",
  "jockey",
  "stubbornness",
  "translucent",
  "accrue",
  "adobe",
  "flagship",
  "savor",
  "welled",
  "confessional",
  "criticize",
  "dependencies",
  "plurality",
  "remit",
  "rooster",
  "nomenclature",
  "resonant",
  "waterproof",
  "passable",
  "afire",
  "boomed",
  "discrepancy",
  "orifice",
  "boredom",
  "cooperate",
  "accuses",
  "conclave",
  "impurity",
  "pneumonia",
  "synod",
  "forearm",
  "ironic",
  "ketch",
  "stacked",
  "unattractive",
  "usurp",
  "cross-examination",
  "knotty",
  "monologue",
  "situate",
  "trackless",
  "mammoth",
  "britannia",
  "choral",
  "fang",
  "ob",
  "conscription",
  "dusting",
  "overseas",
  "swirling",
  "mashed",
  "noontide",
  "timed",
  "townships",
  "fauna",
  "flurry",
  "orthography",
  "preclude",
  "upbraid",
  "blackbird",
  "mica",
  "analyse",
  "competing",
  "wayfarer",
  "elixir",
  "vega",
  "chandelier",
  "evasive",
  "gruel",
  "insincere",
  "instrumentality",
  "loin",
  "sewer",
  "great-grandfather",
  "handicapped",
  "snore",
  "unapproachable",
  "unvarying",
  "cathay",
  "profligacy",
  "rainfall",
  "squalor",
  "undisciplined",
  "abatement",
  "bellies",
  "geologist",
  "melodrama",
  "sprout",
  "curtsey",
  "retrograde",
  "vill",
  "aircraft",
  "intersection",
  "dionysus",
  "premeditated",
  "brownish",
  "cannibal",
  "feint",
  "trimmings",
  "captor",
  "czech",
  "gorilla",
  "malacca",
  "ordination",
  "pertinacity",
  "ratify",
  "spicy",
  "outlive",
  "preternatural",
  "entirety",
  "deadened",
  "dis-",
  "pumped",
  "twenty-first",
  "iniquitous",
  "swims",
  "waft",
  "abby",
  "argentine",
  "certify",
  "cynic",
  "flexibility",
  "insincerity",
  "monica",
  "paraphrase",
  "solidarity",
  "surreptitiously",
  "watchword",
  "enliven",
  "garfield",
  "consulate",
  "scrawled",
  "tasteless",
  "contemporaneous",
  "gash",
  "reprehensible",
  "guernsey",
  "undid",
  "avenger",
  "reproductive",
  "banjo",
  "comeliness",
  "fluffy",
  "reilly",
  "rocket",
  "tractable",
  "absolve",
  "hinge",
  "adverb",
  "berkshire",
  "brutish",
  "dummy",
  "portraiture",
  "crypt",
  "italics",
  "ornate",
  "subjecting",
  "inorganic",
  "jacky",
  "longitudinal",
  "stagnation",
  "presage",
  "pretender",
  "brawl",
  "hussy",
  "kraal",
  "assassinate",
  "israelite",
  "phonograph",
  "brew",
  "dividend",
  "revisit",
  "bibliography",
  "craze",
  "frenchwoman",
  "homicide",
  "lucknow",
  "oratorical",
  "abdullah",
  "disinclination",
  "gild",
  "porphyry",
  "tuneful",
  "consumes",
  "informer",
  "cassandra",
  "obtuse",
  "samoa",
  "skate",
  "versatile",
  "bermuda",
  "unassuming",
  "underworld",
  "dorchester",
  "fussy",
  "locker",
  "puddle",
  "shire",
  "unbound",
  "hacking",
  "eileen",
  "instability",
  "paraphernalia",
  "garnish",
  "journeyman",
  "recognizable",
  "syndicate",
  "divulge",
  "enquiring",
  "hulk",
  "nutriment",
  "sinuous",
  "croak",
  "embarkation",
  "honduras",
  "vandals",
  "auburn",
  "satchel",
  "serf",
  "waxing",
  "sou",
  "apocryphal",
  "bedlam",
  "deprivation",
  "forestall",
  "heifer",
  "earldom",
  "fillet",
  "foregone",
  "voiceless",
  "crouch",
  "vengeful",
  "drawl",
  "heinz",
  "montenegro",
  "alienate",
  "cramp",
  "malign",
  "pinkerton",
  "salve",
  "stenographer",
  "motherless",
  "exponent",
  "bewail",
  "generate",
  "malevolence",
  "unbidden",
  "dorsal",
  "dank",
  "homespun",
  "partaken",
  "recumbent",
  "abominably",
  "burglary",
  "commensurate",
  "jessica",
  "mop",
  "putrid",
  "tuning",
  "virginity",
  "wasp",
  "hustle",
  "infinitive",
  "mauritius",
  "thong",
  "wiltshire",
  "airily",
  "approximation",
  "bounteous",
  "snout",
  "suave",
  "reconsider",
  "artificers",
  "disability",
  "disposes",
  "pentecost",
  "romanticism",
  "translators",
  "doo",
  "misshapen",
  "morale",
  "optimistic",
  "reciprocity",
  "caribou",
  "reek",
  "vicarage",
  "wrongfully",
  "ag",
  "circumspect",
  "dictatorship",
  "nightcap",
  "anthea",
  "inalienable",
  "musa",
  "nauseous",
  "bret",
  "gradation",
  "sc",
  "thereunto",
  "venal",
  "abhorrent",
  "acclamation",
  "jeer",
  "championship",
  "forty-seven",
  "savory",
  "chimerical",
  "scaffolding",
  "trieste",
  "albion",
  "classify",
  "gorse",
  "twenty-fifth",
  "unequivocal",
  "cursory",
  "ditty",
  "emanuel",
  "oneness",
  "lasso",
  "assuage",
  "flutes",
  "dreads",
  "caracalla",
  "expiate",
  "obsession",
  "rifled",
  "breastplate",
  "duval",
  "giggling",
  "goad",
  "postponement",
  "unproductive",
  "etruria",
  "ogre",
  "palermo",
  "ravage",
  "berne",
  "brusque",
  "conjuring",
  "noisome",
  "sameness",
  "cumbrous",
  "reprieve",
  "admonish",
  "inflammatory",
  "intrusive",
  "shorthand",
  "allotment",
  "anoint",
  "legitimately",
  "rationally",
  "eu",
  "puberty",
  "punjab",
  "trice",
  "sacerdotal",
  "teas",
  "convivial",
  "craggy",
  "pent-up",
  "romany",
  "alder",
  "moisten",
  "violinist",
  "atrocity",
  "conduce",
  "dee",
  "disproportionate",
  "macaroni",
  "parochial",
  "curriculum",
  "emigrate",
  "forty-six",
  "janitor",
  "rancour",
  "spontaneity",
  "wince",
  "enigmatical",
  "outdoors",
  "splinter",
  "apathetic",
  "experimenting",
  "react",
  "script",
  "repine",
  "well-worn",
  "boarder",
  "carbine",
  "miscreant",
  "profaned",
  "stacy",
  "good-for-nothing",
  "irascible",
  "pervade",
  "sarcophagus",
  "appealingly",
  "augury",
  "pelt",
  "blackmail",
  "pomegranate",
  "pounce",
  "torrid",
  "pant",
  "placard",
  "erotic",
  "concussion",
  "converging",
  "fireman",
  "flinch",
  "loki",
  "provost",
  "seduction",
  "bonus",
  "punctilious",
  "screech",
  "manchu",
  "wetted",
  "martian",
  "examines",
  "prate",
  "speculator",
  "a-",
  "fifty-six",
  "photographer",
  "privateer",
  "tepid",
  "buxom",
  "fetter",
  "fornication",
  "cupola",
  "humanitarian",
  "pointer",
  "asset",
  "evacuate",
  "sith",
  "opal",
  "leggings",
  "sedentary",
  "supplant",
  "texan",
  "collation",
  "corpulent",
  "feudalism",
  "bulgarian",
  "excise",
  "generating",
  "materialistic",
  "palsy",
  "stingy",
  "variability",
  "butte",
  "swish",
  "typing",
  "pedant",
  "ser",
  "labels",
  "premonition",
  "regency",
  "descry",
  "nome",
  "curry",
  "delta",
  "digital",
  "billiard",
  "lugger",
  "quorum",
  "thieving",
  "urns",
  "graduation",
  "illusory",
  "refraction",
  "second-rate",
  "unpacked",
  "brett",
  "disengage",
  "idealist",
  "mammon",
  "mort",
  "wherewithal",
  "deviate",
  "inculcate",
  "pentateuch",
  "colloquial",
  "mouthpiece",
  "credits",
  "dastardly",
  "detrimental",
  "inductive",
  "ambiguity",
  "bitch",
  "brackish",
  "confounding",
  "itch",
  "fawning",
  "insular",
  "obsequies",
  "phlegmatic",
  "trans",
  "disks",
  "neuter",
  "wheresoever",
  "bestial",
  "billow",
  "filament",
  "weld",
  "covertly",
  "quicksilver",
  "serpentine",
  "stabbing",
  "calibre",
  "old-world",
  "cheshire",
  "eyelid",
  "laconic",
  "queensland",
  "redolent",
  "ethiopian",
  "handicap",
  "palette",
  "relent",
  "dispersing",
  "indivisible",
  "jolt",
  "superficially",
  "embryonic",
  "plowing",
  "alchemy",
  "demur",
  "highlander",
  "stylish",
  "windlass",
  "adamant",
  "diagonal",
  "remorseful",
  "compiler",
  "lugubrious",
  "proletariat",
  "twang",
  "photography",
  "sharon",
  "wally",
  "boxed",
  "brigadier",
  "crucible",
  "heracles",
  "spellbound",
  "slothful",
  "subconscious",
  "tactful",
  "terse",
  "eyebrow",
  "indubitable",
  "nil",
  "shanghai",
  "incorporation",
  "shortage",
  "sneeze",
  "troupe",
  "usefully",
  "ven",
  "beryl",
  "cartilage",
  "gape",
  "archery",
  "chancery",
  "indigent",
  "indus",
  "ores",
  "watt",
  "passim",
  "tingle",
  "spurt",
  "stave",
  "crossly",
  "earshot",
  "fez",
  "melodramatic",
  "ailment",
  "biblical",
  "condolence",
  "dime",
  "displacement",
  "turquoise",
  "accords",
  "messina",
  "comprehensible",
  "eighty-five",
  "goblin",
  "hilarious",
  "loftiness",
  "reg",
  "roan",
  "targets",
  "transcript",
  "fearsome",
  "giggle",
  "herculean",
  "baptize",
  "domineering",
  "mistletoe",
  "outlawed",
  "nebulous",
  "beholden",
  "criticized",
  "deafness",
  "occupancy",
  "winsome",
  "augmentation",
  "shingles",
  "sonny",
  "thankless",
  "clink",
  "connexions",
  "evasively",
  "fief",
  "hygiene",
  "presentable",
  "jib",
  "scarecrow",
  "bastion",
  "fungus",
  "johannes",
  "steadfastness",
  "taboo",
  "wording",
  "canto",
  "hinduism",
  "holler",
  "lathe",
  "overalls",
  "an't",
  "archduke",
  "jetty",
  "mastiff",
  "refugee",
  "shuttle",
  "twinge",
  "vespers",
  "interlude",
  "kinswoman",
  "protein",
  "quinine",
  "vibrant",
  "artemis",
  "estuary",
  "passover",
  "who'll",
  "chi",
  "dilate",
  "dump",
  "fortuitous",
  "gaseous",
  "lading",
  "nonchalance",
  "advocacy",
  "abed",
  "middling",
  "mucous",
  "outdone",
  "rebound",
  "tally",
  "vaudeville",
  "loco",
  "smithy",
  "films",
  "loiter",
  "mater",
  "necessitate",
  "cohesion",
  "cauldron",
  "centurion",
  "crestfallen",
  "shipment",
  "swamped",
  "tahiti",
  "ups",
  "holier",
  "housework",
  "refectory",
  "brownie",
  "gossamer",
  "philemon",
  "skeptical",
  "macedonians",
  "self-satisfied",
  "aggrandizement",
  "baptismal",
  "bellingham",
  "emoluments",
  "esprit",
  "evolve",
  "execration",
  "firemen",
  "intimidate",
  "refine",
  "untie",
  "cos",
  "razaqi",
  "scrip",
  "disown",
  "disprove",
  "mach",
  "ruts",
  "ambuscade",
  "mausoleum",
  "misuse",
  "mongolia",
  "semicircular",
  "sentient",
  "unscathed",
  "vomit",
  "actuality",
  "analytical",
  "disclaimed",
  "demise",
  "gene",
  "silhouette",
  "fifty-four",
  "quizzical",
  "cob",
  "combustible",
  "cracker",
  "craftsmen",
  "freshman",
  "gaoler",
  "liberia",
  "lullaby",
  "diplomat",
  "elicit",
  "nehemiah",
  "proxy",
  "rear-guard",
  "badger",
  "crochet",
  "hauteur",
  "operatic",
  "phoenicia",
  "unaccompanied",
  "winnipeg",
  "crackle",
  "definitive",
  "delinquent",
  "facsimile",
  "salvador",
  "deceiver",
  "initiate",
  "merge",
  "thunderstruck",
  "affluent",
  "furlough",
  "maw",
  "venial",
  "piper",
  "reversal",
  "squander",
  "zeeland",
  "abduction",
  "businesslike",
  "cavernous",
  "divergent",
  "elf",
  "felicitous",
  "handcuffs",
  "manoeuvring",
  "margarita",
  "resists",
  "transference",
  "debility",
  "origins",
  "punic",
  "succulent",
  "buttonhole",
  "milliner",
  "nape",
  "titan",
  "advocating",
  "critter",
  "promoter",
  "tableau",
  "wile",
  "withers",
  "decoy",
  "disagreed",
  "fella",
  "nanny",
  "accoutrements",
  "coyote",
  "pathological",
  "wrangle",
  "encamp",
  "huntington",
  "mallet",
  "sceptic",
  "seeker",
  "shatter",
  "ablutions",
  "negligible",
  "yemen",
  "administrators",
  "magnesia",
  "ruff",
  "granary",
  "iced",
  "illustrator",
  "pell-mell",
  "aver",
  "eth",
  "michaelmas",
  "scaly",
  "underfoot",
  "brat",
  "riven",
  "thimble",
  "downtown",
  "heron",
  "carp",
  "interdict",
  "jog",
  "utilitarian",
  "inhale",
  "signet",
  "jc",
  "johannesburg",
  "rectify",
  "surplice",
  "beleaguered",
  "confidante",
  "sociology",
  "sorted",
  "tit",
  "untamed",
  "cozen",
  "defunct",
  "gents",
  "largeness",
  "towing",
  "como",
  "crucifixion",
  "imf",
  "incorporate",
  "pulley",
  "rump",
  "sid",
  "bracken",
  "mailing",
  "skinny",
  "squash",
  "absorbs",
  "derrick",
  "neal",
  "octave",
  "voter",
  "guatemala",
  "intrust",
  "perusing",
  "teens",
  "voracious",
  "cad",
  "cordon",
  "elopement",
  "federation",
  "plaint",
  "pus",
  "unbending",
  "urbanity",
  "mobility",
  "monsoon",
  "sixty-four",
  "clipping",
  "sparse",
  "trumpery",
  "goth",
  "tighten",
  "armful",
  "trapping",
  "aspen",
  "fisher",
  "gymnastic",
  "half-brother",
  "midwife",
  "oracular",
  "scoop",
  "spongy",
  "alibi",
  "apache",
  "autocratic",
  "honolulu",
  "unload",
  "aggregation",
  "groceries",
  "chirp",
  "eater",
  "snipe",
  "substantive",
  "almanac",
  "dignitary",
  "habitat",
  "regional",
  "pasty",
  "squint",
  "navigate",
  "scrawl",
  "alum",
  "bergen",
  "cornet",
  "uphill",
  "clamber",
  "portent",
  "stow",
  "backwoods",
  "evoke",
  "exigency",
  "groundwork",
  "macon",
  "sinew",
  "stepfather",
  "buffeted",
  "scenic",
  "silurian",
  "arrant",
  "be-",
  "dilute",
  "doer",
  "nurture",
  "ranger",
  "simulated",
  "tripod",
  "myrrh",
  "glum",
  "goodbye",
  "partakes",
  "potter",
  "suet",
  "dragoon",
  "expostulation",
  "woof",
  "adown",
  "provisionally",
  "retrospective",
  "sooty",
  "blister",
  "ensemble",
  "mote",
  "tertiary",
  "tornado",
  "unfettered",
  "agrarian",
  "demolish",
  "doric",
  "harrow",
  "inversion",
  "parasitic",
  "embargo",
  "pervert",
  "writs",
  "closeted",
  "fiftieth",
  "acceptation",
  "cyclone",
  "dawns",
  "leinster",
  "tormentor",
  "tv",
  "cowl",
  "poseidon",
  "undefiled",
  "crier",
  "saliva",
  "congestion",
  "cube",
  "sawing",
  "syntax",
  "frosted",
  "heart-rending",
  "insecurity",
  "playwright",
  "thracian",
  "detract",
  "truculent",
  "turbulence",
  "downpour",
  "kenny",
  "locust",
  "mas",
  "abandons",
  "annul",
  "dimple",
  "finesse",
  "glean",
  "incendiary",
  "productivity",
  "gi",
  "hash",
  "horseshoe",
  "brunette",
  "distortion",
  "inexpensive",
  "liner",
  "namur",
  "writhe",
  "amelioration",
  "arcadian",
  "carrot",
  "regimen",
  "slam",
  "vitiated",
  "stanford",
  "tactical",
  "graceless",
  "maudlin",
  "narcotic",
  "wormwood",
  "bowling",
  "sac",
  "sulphurous",
  "adage",
  "overt",
  "relevant",
  "sycamore",
  "cleaving",
  "memento",
  "senegal",
  "whirring",
  "concentric",
  "entrap",
  "melon",
  "munificent",
  "accented",
  "peanuts",
  "flog",
  "humdrum",
  "mapped",
  "outing",
  "relentlessly",
  "stimuli",
  "guerdon",
  "escapade",
  "gaza",
  "competency",
  "jul",
  "madder",
  "parsimony",
  "fermented",
  "functional",
  "porcupine",
  "indeterminate",
  "versatility",
  "adjunct",
  "albanian",
  "coffer",
  "gill",
  "entangle",
  "molecular",
  "rattlesnake",
  "barnaby",
  "errant",
  "testimonial",
  "demagogue",
  "irwin",
  "pommel",
  "slav",
  "usa",
  "combated",
  "domicile",
  "eastwards",
  "harlem",
  "cacique",
  "craters",
  "iceberg",
  "leaked",
  "agate",
  "aloofness",
  "bottled",
  "construe",
  "craftsman",
  "juniper",
  "pestilent",
  "poodle",
  "demarcation",
  "millet",
  "precursor",
  "teller",
  "alternation",
  "argumentative",
  "consumptive",
  "dependency",
  "displace",
  "encroachment",
  "humiliate",
  "leave-taking",
  "abbreviated",
  "athena",
  "conglomerate",
  "harpoon",
  "point-blank",
  "bosnia",
  "mitre",
  "octavo",
  "tattoo",
  "tram",
  "emanation",
  "whack",
  "resultant",
  "larboard",
  "autonomy",
  "bodyguard",
  "opus",
  "textile",
  "ultra",
  "blubber",
  "phosphorescent",
  "settee",
  "accountant",
  "affray",
  "arcade",
  "indelicate",
  "dauphin",
  "fetid",
  "uncivilized",
  "forthright",
  "stink",
  "taxicab",
  "anent",
  "bilious",
  "broken-down",
  "cucumber",
  "platoon",
  "avon",
  "disheartening",
  "hackneyed",
  "paragon",
  "differentiation",
  "mutilation",
  "swirl",
  "baton",
  "ewe",
  "mackerel",
  "chafe",
  "progenitor",
  "retorts",
  "ducking",
  "frontal",
  "nitric",
  "loquacious",
  "norma",
  "topography",
  "multifarious",
  "shepherdess",
  "volga",
  "availability",
  "colds",
  "props",
  "three-cornered",
  "bison",
  "fiat",
  "gluttony",
  "unabashed",
  "undergraduate",
  "vellum",
  "ascension",
  "bluster",
  "circumcised",
  "marc",
  "stipend",
  "orgy",
  "repudiation",
  "smuggler",
  "apostasy",
  "auditory",
  "graph",
  "skepticism",
  "solvent",
  "worldliness",
  "jasper",
  "jd",
  "latium",
  "loophole",
  "phosphate",
  "rime",
  "sie",
  "abbots",
  "enlistment",
  "fascinate",
  "nomadic",
  "yeh",
  "adolescence",
  "immersion",
  "larvae",
  "primordial",
  "wills",
  "argentina",
  "fungi",
  "mash",
  "showman",
  "sortie",
  "impel",
  "patchwork",
  "petrograd",
  "cute",
  "lief",
  "obtrusive",
  "piecemeal",
  "rapping",
  "abdominal",
  "clods",
  "kindergarten",
  "scorpion",
  "tattooed",
  "diploma",
  "disputation",
  "householder",
  "mover",
  "ner",
  "stiffen",
  "ticklish",
  "vaunted",
  "est",
  "inkstand",
  "rick",
  "smear",
  "woodpecker",
  "aberration",
  "baying",
  "exactitude",
  "lunacy",
  "pueblo",
  "strut",
  "waive",
  "wallis",
  "churchman",
  "scuttle",
  "talkers",
  "doubles",
  "elucidation",
  "literacy",
  "parry",
  "waitress",
  "concubine",
  "fume",
  "oxidation",
  "pavia",
  "raspberry",
  "certitude",
  "hippopotamus",
  "beadle",
  "derbyshire",
  "dynamo",
  "self-reliant",
  "espionage",
  "penknife",
  "spouting",
  "taurus",
  "tedium",
  "clog",
  "envelop",
  "ferret",
  "gavin",
  "primer",
  "luminary",
  "nondescript",
  "chamois",
  "furze",
  "macedon",
  "spree",
  "synthetic",
  "weasel",
  "aa",
  "abyssinian",
  "acropolis",
  "cropping",
  "damped",
  "trainer",
  "alkaline",
  "magpie",
  "brewed",
  "conserve",
  "homo",
  "keynote",
  "sec",
  "transept",
  "fabrication",
  "fatty",
  "garbage",
  "humidity",
  "photo",
  "topsy-turvy",
  "gazelle",
  "gory",
  "holocaust",
  "lag",
  "maya",
  "tyrolese",
  "beckon",
  "careworn",
  "unpretending",
  "galleon",
  "lama",
  "guys",
  "votive",
  "autocrat",
  "buffoon",
  "dysentery",
  "frontispiece",
  "lawgiver",
  "mesa",
  "decoction",
  "dweller",
  "overdone",
  "rating",
  "abdul",
  "acumen",
  "broil",
  "churlish",
  "nothings",
  "azores",
  "eradicate",
  "jauntily",
  "suffix",
  "boor",
  "passageway",
  "scow",
  "suavity",
  "textbook",
  "transmitter",
  "contumely",
  "counterbalance",
  "nefarious",
  "friesland",
  "jh",
  "spoonfuls",
  "escutcheon",
  "harried",
  "intractable",
  "nostril",
  "apostate",
  "deride",
  "profanation",
  "aqueduct",
  "derogatory",
  "indianapolis",
  "cabal",
  "egotistical",
  "fatuous",
  "flinching",
  "gymnastics",
  "thoughtlessness",
  "chipped",
  "hectic",
  "subscriber",
  "tyrone",
  "basque",
  "causal",
  "corroboration",
  "journalistic",
  "lire",
  "eerie",
  "gripe",
  "khartoum",
  "onerous",
  "consolidate",
  "fen",
  "limply",
  "throttle",
  "wold",
  "bevy",
  "fake",
  "obloquy",
  "prism",
  "ridley",
  "adder",
  "lagging",
  "prig",
  "verbatim",
  "afterthought",
  "equatorial",
  "flatterer",
  "hypnotic",
  "non-commissioned",
  "sonata",
  "verification",
  "toothless",
  "mem",
  "stucco",
  "calamitous",
  "spawn",
  "swindler",
  "toga",
  "wheelbarrow",
  "busted",
  "derek",
  "ge",
  "glisten",
  "pout",
  "breech",
  "depreciate",
  "libyan",
  "yuan",
  "cavil",
  "dialectic",
  "elysium",
  "lateness",
  "pegasus",
  "present-day",
  "flighty",
  "manse",
  "overran",
  "vial",
  "capsule",
  "hesse",
  "participating",
  "stork",
  "bowsprit",
  "slave-girl",
  "han",
  "how's",
  "sen",
  "andalusia",
  "belgrade",
  "constrain",
  "economist",
  "papacy",
  "torah",
  "canning",
  "dunce",
  "niggardly",
  "strident",
  "undersigned",
  "waylaid",
  "finale",
  "tartar",
  "jocular",
  "whimper",
  "provocative",
  "skunk",
  "umbrage",
  "negress",
  "autocracy",
  "belie",
  "comma",
  "palatial",
  "saline",
  "slavic",
  "idyllic",
  "southwark",
  "trollope",
  "kabul",
  "resourceful",
  "swindle",
  "ts",
  "aspirant",
  "athletics",
  "fatten",
  "inconsolable",
  "pessimistic",
  "retainer",
  "abnormally",
  "blacken",
  "erica",
  "miserly",
  "mush",
  "tacks",
  "wriggle",
  "blare",
  "animates",
  "corse",
  "hoot",
  "perishes",
  "plait",
  "welkin",
  "scandinavia",
  "sicken",
  "mow",
  "unwashed",
  "vita",
  "lisp",
  "nepal",
  "o'reilly",
  "cookies",
  "forty-nine",
  "hoar",
  "iodine",
  "maltese",
  "skills",
  "existent",
  "irremediable",
  "unctuous",
  "depose",
  "legation",
  "selene",
  "squeal",
  "tulip",
  "micah",
  "asphalt",
  "bulldog",
  "filipino",
  "infect",
  "spiced",
  "aggressor",
  "incisive",
  "premise",
  "quondam",
  "stoical",
  "stunt",
  "assorted",
  "bumper",
  "downhill",
  "gage",
  "life-time",
  "looped",
  "miscarriage",
  "elocution",
  "saga",
  "chivalric",
  "defraud",
  "beavers",
  "janus",
  "tweed",
  "vesta",
  "affidavit",
  "apropos",
  "bolster",
  "pod",
  "soulless",
  "adverbs",
  "saunter",
  "undercurrent",
  "baptised",
  "coherence",
  "demented",
  "rhubarb",
  "vicarious",
  "chattel",
  "fane",
  "irreligious",
  "zeke",
  "consign",
  "designer",
  "firstly",
  "rivet",
  "strapping",
  "congregate",
  "protege",
  "cheapside",
  "laudanum",
  "laundress",
  "caucus",
  "chick",
  "colic",
  "coterie",
  "esquire",
  "holster",
  "iran",
  "paraffin",
  "rancor",
  "secrete",
  "unix",
  "bragging",
  "cuirass",
  "dune",
  "enigmatic",
  "incantation",
  "quiescent",
  "sirup",
  "abasement",
  "andover",
  "antigua",
  "bowled",
  "carnivorous",
  "donor",
  "manganese",
  "convocation",
  "formulae",
  "tel",
  "grandparents",
  "leaky",
  "thunderbolts",
  "victual",
  "apotheosis",
  "embellish",
  "psychologist",
  "spinach",
  "chlorine",
  "tarpaulin",
  "damper",
  "intensive",
  "operatives",
  "patronize",
  "purposeless",
  "racy",
  "tankard",
  "thetis",
  "transylvania",
  "uproarious",
  "demolition",
  "paramour",
  "whitewash",
  "oddity",
  "stratified",
  "assay",
  "hankering",
  "abbreviation",
  "academies",
  "brit",
  "chaplet",
  "emblazoned",
  "tirade",
  "diametrically",
  "synonym",
  "twenty-third",
  "visor",
  "waif",
  "cogent",
  "mitigation",
  "self-defense",
  "syllogism",
  "tarts",
  "absolutism",
  "apprise",
  "entities",
  "sullied",
  "app",
  "loon",
  "blindfold",
  "cronies",
  "dote",
  "ironing",
  "affably",
  "anathema",
  "croquet",
  "debut",
  "keyboard",
  "marmalade",
  "non-existent",
  "poniard",
  "tickling",
  "trenchant",
  "well-fed",
  "amethyst",
  "rabid",
  "totter",
  "od",
  "radiate",
  "sixty-two",
  "shotgun",
  "dutifully",
  "ec",
  "encircle",
  "pliable",
  "pristine",
  "superannuated",
  "telegraphy",
  "thousandth",
  "expeditious",
  "superstructure",
  "indoor",
  "intuitively",
  "revoke",
  "rusted",
  "whitening",
  "brigantine",
  "bigot",
  "drizzle",
  "fop",
  "miami",
  "slouch",
  "emancipate",
  "jig",
  "malachi",
  "parlance",
  "unchallenged",
  "de-",
  "derelict",
  "tittle",
  "unreliable",
  "cognizant",
  "deg",
  "diver",
  "hydraulic",
  "undeceive",
  "fahrenheit",
  "tiara",
  "acorn",
  "endearment",
  "juxtaposition",
  "mesh",
  "unsaid",
  "amen",
  "dizziness",
  "elite",
  "hearths",
  "knee-deep",
  "seamanship",
  "weakling",
  "bygones",
  "conformation",
  "cubit",
  "liaison",
  "putty",
  "ribald",
  "abridgment",
  "amplitude",
  "gon",
  "yen",
  "dimension",
  "infest",
  "usurer",
  "appurtenances",
  "bolivia",
  "congenital",
  "cram",
  "parenthesis",
  "roseate",
  "rugby",
  "concurrent",
  "dilatory",
  "plaudits",
  "abscess",
  "aggravation",
  "smock",
  "unalloyed",
  "genealogical",
  "immobile",
  "rebus",
  "slush",
  "stoicism",
  "vociferous",
  "bible",
  "eulogium",
  "harboured",
  "outrun",
  "prescience",
  "unwisely",
  "chequered",
  "tryst",
  "inexorably",
  "samos",
  "ww",
  "abjure",
  "adolph",
  "bremen",
  "causation",
  "cm",
  "encroach",
  "flagon",
  "ulcer",
  "uterus",
  "admissible",
  "combatant",
  "distaff",
  "dyspepsia",
  "gnat",
  "corroborate",
  "homesickness",
  "mid-air",
  "pied",
  "poetess",
  "vodka",
  "whaling",
  "catalogues",
  "celt",
  "jointed",
  "epirus",
  "inflected",
  "lucerne",
  "nibble",
  "purl",
  "dab",
  "derisively",
  "inception",
  "jerky",
  "obelisk",
  "cleavage",
  "nonsensical",
  "roe",
  "yachts",
  "convertible",
  "disparage",
  "excruciating",
  "pave",
  "transcend",
  "caper",
  "capuchin",
  "quantum",
  "fuming",
  "idiocy",
  "pater",
  "ticked",
  "agone",
  "braggart",
  "lice",
  "maneuver",
  "objecting",
  "youse",
  "collie",
  "fy",
  "greenery",
  "mia",
  "officiating",
  "patois",
  "ailed",
  "breaker",
  "deflected",
  "guts",
  "incision",
  "mither",
  "poster",
  "accelerate",
  "churn",
  "intensify",
  "monotone",
  "nb",
  "warwickshire",
  "wean",
  "abortion",
  "sweater",
  "acquirement",
  "allie",
  "bouncing",
  "disembodied",
  "evolutionary",
  "hesitancy",
  "ionic",
  "kith",
  "notation",
  "tubular",
  "typically",
  "abstaining",
  "contamination",
  "esperanto",
  "hymen",
  "retina",
  "rockies",
  "bounce",
  "dwindle",
  "enunciation",
  "hd",
  "numbness",
  "absences",
  "fifty-three",
  "lichen",
  "penguin",
  "tish",
  "aqueous",
  "examiner",
  "fiji",
  "limousine",
  "riddled",
  "asian",
  "creeper",
  "glorification",
  "mermaid",
  "pox",
  "seattle",
  "vampire",
  "anointing",
  "commitment",
  "cornfield",
  "saber",
  "unimpeachable",
  "mongolian",
  "blaspheme",
  "glutton",
  "militarism",
  "coastal",
  "laps",
  "liturgy",
  "plover",
  "pyramidal",
  "randy",
  "unbelievable",
  "high-pitched",
  "ismail",
  "pres",
  "romp",
  "surfeit",
  "calabria",
  "cretaceous",
  "patio",
  "queue",
  "amaryllis",
  "articulated",
  "ashy",
  "brewer",
  "interstate",
  "cortege",
  "driveway",
  "martinique",
  "oblation",
  "bravo",
  "communism",
  "hilltop",
  "intimidation",
  "iridescent",
  "lascivious",
  "ovum",
  "shinto",
  "armature",
  "calvinist",
  "kaffir",
  "padlock",
  "seventy-four",
  "plantains",
  "shambles",
  "gambia",
  "sacristan",
  "feline",
  "puddles",
  "salvage",
  "san",
  "trespassing",
  "bracket",
  "calyx",
  "ill-omened",
  "jocund",
  "amenities",
  "ladle",
  "lea",
  "peeps",
  "dictatorial",
  "dissection",
  "drinker",
  "elucidate",
  "intermediary",
  "angler",
  "animus",
  "glut",
  "what'll",
  "yelp",
  "angelina",
  "epilogue",
  "livestock",
  "disruption",
  "forty-one",
  "himalayas",
  "tuberculosis",
  "unleavened",
  "up-to-date",
  "corks",
  "law-abiding",
  "requital",
  "spa",
  "staffordshire",
  "anarchist",
  "fertilizer",
  "rem",
  "totality",
  "domino",
  "elegy",
  "ex-",
  "inverse",
  "lamentably",
  "provender",
  "wren",
  "deprecate",
  "neigh",
  "sacristy",
  "disorganized",
  "magnate",
  "prowl",
  "unlettered",
  "coupe",
  "icelandic",
  "varlet",
  "accost",
  "diurnal",
  "evaporate",
  "palliate",
  "encyclopedia",
  "europa",
  "storey",
  "exasperate",
  "hydrochloric",
  "tether",
  "aviation",
  "collusion",
  "correlation",
  "redundant",
  "sunless",
  "hygienic",
  "cache",
  "erudite",
  "extirpate",
  "freehold",
  "orchestral",
  "prank",
  "purplish",
  "squatter",
  "libels",
  "migratory",
  "brogue",
  "compute",
  "ethnic",
  "handicraft",
  "mick",
  "scorch",
  "anthology",
  "gastric",
  "jura",
  "sixty-six",
  "admiralty",
  "collegiate",
  "nonce",
  "pare",
  "tress",
  "epilepsy",
  "factitious",
  "kashmir",
  "linear",
  "maltreated",
  "masque",
  "riverside",
  "twenty-fourth",
  "benefice",
  "tot",
  "rood",
  "slur",
  "retaliate",
  "shear",
  "corolla",
  "enamored",
  "frankincense",
  "reedy",
  "beatitude",
  "broach",
  "floe",
  "philology",
  "staccato",
  "unauthorized",
  "bleaching",
  "counterpoise",
  "abdicated",
  "compress",
  "dapper",
  "egregious",
  "foremast",
  "amalgamation",
  "antimony",
  "profundity",
  "atop",
  "marital",
  "pertain",
  "slash",
  "tumor",
  "unripe",
  "imprecation",
  "snowstorm",
  "spalding",
  "specifications",
  "blots",
  "checkered",
  "encompass",
  "sambo",
  "gad",
  "hydra",
  "it'd",
  "miry",
  "optimist",
  "repository",
  "seedy",
  "erosion",
  "turnkey",
  "devolve",
  "idealized",
  "mete",
  "plantain",
  "tandem",
  "campania",
  "kegs",
  "mains",
  "serenade",
  "trellis",
  "cumbersome",
  "espy",
  "laconically",
  "movies",
  "sixty-three",
  "alpha",
  "condense",
  "outermost",
  "serbian",
  "smoker",
  "stuttgart",
  "indubitably",
  "jerkin",
  "tenaciously",
  "tricky",
  "aggressively",
  "esoteric",
  "pineapple",
  "sententious",
  "tigress",
  "disparaging",
  "ergo",
  "fulsome",
  "za",
  "zeb",
  "far-fetched",
  "mustang",
  "navel",
  "tempo",
  "vaunt",
  "beeves",
  "immune",
  "winnings",
  "bilateral",
  "colombo",
  "corduroy",
  "woodman",
  "com-",
  "coop",
  "encumbrance",
  "geranium",
  "irate",
  "gladiator",
  "thereabout",
  "vapid",
  "compost",
  "enacting",
  "faraday",
  "flinty",
  "pests",
  "pomerania",
  "trousseau",
  "battleship",
  "candelabra",
  "cocktail",
  "globular",
  "gotta",
  "mephistopheles",
  "rc",
  "reverting",
  "wallow",
  "amidships",
  "cockney",
  "hw",
  "recorder",
  "twitter",
  "venereal",
  "bated",
  "overcrowded",
  "endorsement",
  "jugs",
  "learner",
  "polo",
  "sanscrit",
  "sunder",
  "ce",
  "cobweb",
  "dike",
  "drier",
  "fickleness",
  "twenty-second",
  "aquila",
  "hunch",
  "announcements",
  "apostrophe",
  "characterization",
  "clarity",
  "ladylike",
  "miocene",
  "trumpeter",
  "affix",
  "babyhood",
  "mauve",
  "panacea",
  "pithy",
  "tumultuously",
  "uh",
  "baseless",
  "beautify",
  "casing",
  "daft",
  "foolhardy",
  "lanky",
  "subversive",
  "thane",
  "fewest",
  "froward",
  "grandiose",
  "inextricable",
  "metaphorical",
  "millinery",
  "molecule",
  "centaur",
  "disrepute",
  "heraldic",
  "roma",
  "chary",
  "imitator",
  "pincers",
  "choleric",
  "configuration",
  "foray",
  "foundry",
  "inconspicuous",
  "nutter",
  "undervalue",
  "automaton",
  "dappled",
  "dugout",
  "overweening",
  "agitator",
  "bowman",
  "breastwork",
  "bum",
  "fu",
  "hottentot",
  "libation",
  "soto",
  "uganda",
  "amputation",
  "choler",
  "jun",
  "whooping",
  "chas",
  "cop",
  "georgetown",
  "interaction",
  "masthead",
  "paternity",
  "stentorian",
  "influenza",
  "putrefaction",
  "recondite",
  "bramble",
  "fetish",
  "kidnapping",
  "slavonic",
  "caracas",
  "clockwork",
  "corollary",
  "discrepancies",
  "fusillade",
  "maori",
  "quantitative",
  "circlet",
  "modena",
  "dirk",
  "emanate",
  "gloaming",
  "introspection",
  "mislaid",
  "offhand",
  "dray",
  "tassel",
  "britannica",
  "garish",
  "orient",
  "vitriol",
  "abdicate",
  "denise",
  "fils",
  "aztec",
  "debonair",
  "typhus",
  "annunciation",
  "interlocutor",
  "lars",
  "narcissist",
  "omnipresent",
  "skein",
  "gratuity",
  "grenada",
  "obadiah",
  "pali",
  "pedagogue",
  "snob",
  "valparaiso",
  "chine",
  "disillusion",
  "outdo",
  "sperm",
  "tanker",
  "wanda",
  "clam",
  "conduit",
  "idioms",
  "scullery",
  "climatic",
  "filly",
  "scathing",
  "selfishly",
  "brazier",
  "brewery",
  "cashmere",
  "pulmonary",
  "squabble",
  "bolting",
  "bot",
  "bray",
  "embrasure",
  "glib",
  "kilt",
  "rant",
  "deprecation",
  "disquisition",
  "scamper",
  "citron",
  "inane",
  "shrew",
  "spans",
  "virtuoso",
  "curbed",
  "flawless",
  "hoarding",
  "improvident",
  "simplify",
  "switches",
  "whet",
  "infringe",
  "endorse",
  "genre",
  "gypsum",
  "petal",
  "remiss",
  "chippewa",
  "non-",
  "vin",
  "abridge",
  "punt",
  "wordy",
  "bestir",
  "credibility",
  "flounder",
  "haired",
  "heraldry",
  "dent",
  "dickie",
  "focused",
  "outweigh",
  "cranium",
  "dope",
  "durability",
  "forger",
  "illiberal",
  "sudan",
  "acclaim",
  "dorado",
  "garrett",
  "gloating",
  "pessimist",
  "subversion",
  "taciturnity",
  "beguiling",
  "durance",
  "lunge",
  "scurrilous",
  "womanish",
  "canvassing",
  "engross",
  "isolate",
  "nc",
  "pulsation",
  "rut",
  "uno",
  "vaulting",
  "coasted",
  "flue",
  "indigence",
  "kennels",
  "truss",
  "bunting",
  "lac",
  "deflection",
  "haiti",
  "subvert",
  "totem",
  "captivate",
  "aviator",
  "unofficial",
  "acme",
  "flustered",
  "forsworn",
  "greatcoat",
  "impeach",
  "injection",
  "latticed",
  "margot",
  "protectorate",
  "sated",
  "benny",
  "canny",
  "palaver",
  "albumen",
  "hives",
  "ill-advised",
  "sixty-eight",
  "avant",
  "bel",
  "co-operative",
  "flout",
  "labeled",
  "longevity",
  "lusitania",
  "cauliflower",
  "coerce",
  "ethan",
  "hogshead",
  "networks",
  "styx",
  "cinder",
  "evangelist",
  "inaccuracy",
  "lamely",
  "lucre",
  "artificer",
  "effeminacy",
  "harpsichord",
  "legitimacy",
  "navigating",
  "regrettable",
  "scribble",
  "shin",
  "woodsman",
  "adventitious",
  "elliptical",
  "emolument",
  "monaco",
  "quintessence",
  "sandal",
  "sock",
  "besotted",
  "chunk",
  "demi",
  "fecundity",
  "gangrene",
  "tenable",
  "anachronism",
  "dw",
  "garter",
  "karen",
  "organise",
  "syphilis",
  "dalliance",
  "excitation",
  "incursion",
  "servitor",
  "television",
  "unafraid",
  "daunt",
  "huddle",
  "liqueur",
  "wizened",
  "impersonation",
  "snowdon",
  "spiritualism",
  "freshmen",
  "intertwined",
  "nascent",
  "untrustworthy",
  "uruguay",
  "clinch",
  "decrepitude",
  "detraction",
  "cereal",
  "liken",
  "captious",
  "advisability",
  "bethany",
  "container",
  "movie",
  "pointers",
  "secretive",
  "digs",
  "fortieth",
  "glaze",
  "mai",
  "sinecure",
  "cb",
  "formative",
  "lees",
  "malefactor",
  "petting",
  "shropshire",
  "variants",
  "zoology",
  "coupling",
  "fido",
  "incubus",
  "quito",
  "weedy",
  "abelard",
  "centralization",
  "cree",
  "hera",
  "lint",
  "lithuania",
  "pact",
  "shifty",
  "unprovoked",
  "aura",
  "bate",
  "fatalism",
  "documentary",
  "heartache",
  "unintentional",
  "bight",
  "peleus",
  "seducer",
  "emporium",
  "larceny",
  "chimera",
  "convinces",
  "hebe",
  "armory",
  "charlatan",
  "concomitant",
  "dropsy",
  "landward",
  "martians",
  "migrate",
  "snaps",
  "voluptuousness",
  "wort",
  "contralto",
  "hobble",
  "panoply",
  "puissance",
  "barnet",
  "cosmos",
  "crosswise",
  "hyena",
  "magisterial",
  "rutland",
  "asthma",
  "badinage",
  "burmese",
  "catacombs",
  "cherubim",
  "granny",
  "pollute",
  "quietest",
  "terminology",
  "whelp",
  "zoological",
  "blent",
  "coincident",
  "cranny",
  "effete",
  "engender",
  "inopportune",
  "jogging",
  "lewdness",
  "minion",
  "minx",
  "nixon",
  "ope",
  "seneschal",
  "uncut",
  "coon",
  "overloaded",
  "trinket",
  "auckland",
  "carinthia",
  "forefront",
  "gregarious",
  "gunshot",
  "promulgation",
  "reinstate",
  "cede",
  "components",
  "hiv",
  "innocuous",
  "lifelike",
  "mercurial",
  "citation",
  "hedgehog",
  "perugia",
  "sunderland",
  "transmutation",
  "buckwheat",
  "deaden",
  "diverge",
  "nitrogenous",
  "phonetic",
  "starred",
  "tanner",
  "winder",
  "blackboard",
  "breakwater",
  "lymph",
  "transmigration",
  "berber",
  "bogus",
  "circumvent",
  "noticeably",
  "snowball",
  "bald-headed",
  "electorate",
  "pandemonium",
  "penis",
  "tasmania",
  "unblemished",
  "worthiness",
  "erase",
  "mediate",
  "puns",
  "tyrannous",
  "augur",
  "booby",
  "branding",
  "gamut",
  "roumania",
  "travesty",
  "welding",
  "funk",
  "hertfordshire",
  "ie",
  "jiffy",
  "moiety",
  "muck",
  "nestle",
  "phrygian",
  "titular",
  "trowel",
  "angola",
  "capitalism",
  "grenadier",
  "ingress",
  "malthus",
  "postmark",
  "veldt",
  "vicenza",
  "academical",
  "admittedly",
  "capitol",
  "forestry",
  "insolvent",
  "lite",
  "loafer",
  "profitless",
  "propound",
  "aluminum",
  "erstwhile",
  "hosiery",
  "intersect",
  "lout",
  "minuet",
  "phlegm",
  "ski",
  "yawl",
  "zo",
  "abler",
  "correlative",
  "irruption",
  "melee",
  "weeding",
  "whaler",
  "alfalfa",
  "baize",
  "clearance",
  "ranking",
  "scald",
  "senile",
  "tang",
  "urania",
  "arian",
  "demoralization",
  "flagstaff",
  "gracefulness",
  "nevermore",
  "allegation",
  "confiscate",
  "counselor",
  "outwit",
  "quartet",
  "vise",
  "whisk",
  "balk",
  "omelet",
  "prune",
  "wainscot",
  "adverted",
  "auditorium",
  "denouement",
  "desecration",
  "ninety-five",
  "pagoda",
  "selective",
  "facilitating",
  "grafting",
  "hater",
  "impost",
  "korean",
  "ufo",
  "unpretentious",
  "demesne",
  "gibberish",
  "interrogate",
  "oscillation",
  "pertinacious",
  "recline",
  "yeomanry",
  "brescia",
  "carouse",
  "ingrained",
  "jestingly",
  "touchstone",
  "flake",
  "hoax",
  "mario",
  "navajo",
  "theoretic",
  "caption",
  "lv",
  "mir",
  "static",
  "vietnam",
  "wa",
  "zechariah",
  "cranks",
  "omniscient",
  "awe-inspiring",
  "rocker",
  "slum",
  "accomplishes",
  "cadaverous",
  "converge",
  "ovation",
  "adhesive",
  "caparisoned",
  "fad",
  "hearthstone",
  "incautious",
  "paunch",
  "sop",
  "tendon",
  "wampum",
  "alphabetical",
  "bandy",
  "exalts",
  "horoscope",
  "tokyo",
  "torpedoes",
  "abbeys",
  "cockade",
  "inquisitor",
  "joker",
  "loch",
  "puss",
  "pugnacious",
  "witless",
  "armoury",
  "fem",
  "malediction",
  "ostler",
  "problematical",
  "purging",
  "seedling",
  "global",
  "eject",
  "pennant",
  "puma",
  "workroom",
  "baboon",
  "childbirth",
  "economize",
  "scrimmage",
  "unshaven",
  "abhors",
  "bookkeeper",
  "contemn",
  "geordie",
  "mother-of-pearl",
  "satiric",
  "acknowledgement",
  "chaldean",
  "emblematic",
  "seacoast",
  "swooping",
  "trumps",
  "welling",
  "casualty",
  "leniency",
  "mountebank",
  "schoolgirl",
  "grime",
  "ok",
  "predicated",
  "sucker",
  "awe-struck",
  "beet",
  "cate",
  "expatiate",
  "immodest",
  "leviticus",
  "pragmatic",
  "sonya",
  "trudge",
  "innings",
  "pathology",
  "referee",
  "viewpoint",
  "-on",
  "democritus",
  "titter",
  "adduce",
  "equinoctial",
  "inclusion",
  "medusa",
  "quicksand",
  "qv",
  "riband",
  "croup",
  "demoniacal",
  "disfigure",
  "jap",
  "monosyllable",
  "slanderous",
  "amphibious",
  "basilica",
  "fifty-seven",
  "goggles",
  "ibm",
  "jocose",
  "smug",
  "staffs",
  "capitulate",
  "caucasian",
  "dukedom",
  "plagiarism",
  "quick-witted",
  "beneficiary",
  "depleted",
  "ell",
  "footprint",
  "north-western",
  "opprobrious",
  "sighting",
  "tacking",
  "viennese",
  "differential",
  "stitching",
  "winded",
  "farcical",
  "fifty-eight",
  "infraction",
  "manslaughter",
  "nazarene",
  "peroration",
  "south-eastern",
  "usenet",
  "barony",
  "bearable",
  "doggerel",
  "emetic",
  "gary",
  "locksmith",
  "pease",
  "shale",
  "somali",
  "exhale",
  "mating",
  "procedures",
  "seventy-three",
  "monopolize",
  "muslims",
  "sixty-seven",
  "helpfulness",
  "neutralize",
  "origination",
  "tussle",
  "dilettante",
  "halcyon",
  "nj",
  "upholstered",
  "watershed",
  "harbinger",
  "larynx",
  "tangent",
  "blazoned",
  "discursive",
  "haystack",
  "mural",
  "saltpetre",
  "expostulate",
  "flail",
  "nettle",
  "blackberry",
  "bystander",
  "carboniferous",
  "domesticity",
  "js",
  "scudding",
  "stilts",
  "altruistic",
  "fatima",
  "baste",
  "confounds",
  "elfin",
  "over-",
  "self-made",
  "urbane",
  "acrimony",
  "antipodes",
  "fixture",
  "limbo",
  "molding",
  "corrosive",
  "kiln",
  "lobe",
  "bewilder",
  "canister",
  "duct",
  "extenuation",
  "makeshift",
  "azalea",
  "dally",
  "epileptic",
  "masonic",
  "odoriferous",
  "algonquin",
  "expedite",
  "alpine",
  "banns",
  "boeotia",
  "debase",
  "ocular",
  "palanquin",
  "aqua",
  "dragoman",
  "hereupon",
  "hostler",
  "insides",
  "lustful",
  "octagonal",
  "buttermilk",
  "medallion",
  "warble",
  "dolphin",
  "forelock",
  "killer",
  "muffler",
  "abjured",
  "amulet",
  "inverness",
  "hu",
  "install",
  "liberating",
  "nutshell",
  "resonance",
  "schoolfellow",
  "traditionally",
  "dissemination",
  "exalting",
  "meteoric",
  "releases",
  "statuesque",
  "whitsuntide",
  "batman",
  "bulge",
  "cognac",
  "ellipse",
  "foal",
  "foremen",
  "omelette",
  "pantheism",
  "classroom",
  "decadent",
  "fader",
  "im-",
  "overrated",
  "tenet",
  "crux",
  "discs",
  "dumfounded",
  "effervescence",
  "procrastination",
  "smuggle",
  "stationery",
  "broadsword",
  "eighty-four",
  "imbibe",
  "mammal",
  "nh",
  "pawnbroker",
  "varuna",
  "ioc",
  "mined",
  "monogram",
  "opiate",
  "plash",
  "priory",
  "unequivocally",
  "dominoes",
  "marketplace",
  "pistil",
  "potentially",
  "scrutinize",
  "slake",
  "tutelage",
  "consanguinity",
  "ecuador",
  "garnered",
  "north-eastern",
  "persona",
  "swineherd",
  "transitional",
  "tusk",
  "declension",
  "etching",
  "remittance",
  "sucks",
  "tamper",
  "devonian",
  "esthetic",
  "mozambique",
  "quibble",
  "suckling",
  "compensating",
  "fiddling",
  "lacquer",
  "leathery",
  "rn",
  "wooer",
  "lapland",
  "lather",
  "thorax",
  "windpipe",
  "bloodhound",
  "conjunctions",
  "defensible",
  "jaffa",
  "laud",
  "propagating",
  "ventral",
  "walrus",
  "oncoming",
  "protestation",
  "protocol",
  "seventy-six",
  "caretaker",
  "impolite",
  "traditionary",
  "whey",
  "curtail",
  "hinged",
  "indicator",
  "lambent",
  "saturnine",
  "unmarked",
  "hawser",
  "milieu",
  "slink",
  "alimentary",
  "dioxide",
  "forswear",
  "horsehair",
  "impaled",
  "liz",
  "marksman",
  "rumania",
  "soothsayer",
  "calculus",
  "colon",
  "gram",
  "pap",
  "petrol",
  "polynesia",
  "tatiana",
  "unrequited",
  "ablution",
  "cataclysm",
  "crucify",
  "prosperously",
  "troubadour",
  "zephyr",
  "-oid",
  "bric-a-brac",
  "itu",
  "rotating",
  "bureaucracy",
  "consistence",
  "corkscrew",
  "dimmer",
  "distort",
  "midwinter",
  "nomad",
  "requiem",
  "vaporous",
  "whirr",
  "amorphous",
  "gibe",
  "hoover",
  "raucous",
  "browse",
  "ganymede",
  "nonplussed",
  "redound",
  "voltaic",
  "autobiographical",
  "icao",
  "overhaul",
  "postulate",
  "qualm",
  "unpremeditated",
  "acquaintanceship",
  "bedraggled",
  "dumbfounded",
  "histrionic",
  "sty",
  "devotedness",
  "galaxy",
  "liberalism",
  "tambourine",
  "uptown",
  "wrestler",
  "capsized",
  "disastrously",
  "frothy",
  "mango",
  "purr",
  "rotary",
  "sully",
  "basal",
  "chen",
  "clinical",
  "divisible",
  "migrant",
  "piedmontese",
  "squeamish",
  "storied",
  "adolf",
  "anglia",
  "carnation",
  "dervish",
  "foresail",
  "obtrude",
  "preservative",
  "rearguard",
  "remedial",
  "tantamount",
  "topsail",
  "trill",
  "adolescent",
  "dal",
  "testator",
  "bicycles",
  "extirpation",
  "outhouse",
  "ova",
  "succinct",
  "charon",
  "formosa",
  "good-fellowship",
  "marksmen",
  "swum",
  "thyroid",
  "antiseptic",
  "dogmatism",
  "incontrovertible",
  "virility",
  "decimal",
  "knead",
  "surreptitious",
  "fishy",
  "hard-boiled",
  "knuckle",
  "radium",
  "titania",
  "ukraine",
  "bawl",
  "bombast",
  "frankfurt",
  "jp",
  "lintel",
  "misrule",
  "portcullis",
  "vindictiveness",
  "agonised",
  "bituminous",
  "dominica",
  "townsman",
  "wafer",
  "welter",
  "aunty",
  "optics",
  "persephone",
  "lethargic",
  "nonchalant",
  "tarnish",
  "blatant",
  "crossroads",
  "regulus",
  "siddhartha",
  "washstand",
  "complementary",
  "fattening",
  "hindostan",
  "sikh",
  "codicil",
  "dignify",
  "falsetto",
  "quilted",
  "voyager",
  "lil",
  "recalcitrant",
  "abating",
  "accruing",
  "barb",
  "commercially",
  "equinox",
  "mumble",
  "rhapsody",
  "touchy",
  "meme",
  "nebula",
  "undeserving",
  "betrayer",
  "dislocation",
  "goody",
  "outstrip",
  "abstemious",
  "arras",
  "dudgeon",
  "loudness",
  "newborn",
  "pellucid",
  "rarefied",
  "staggers",
  "quaff",
  "rimini",
  "rosemary",
  "sark",
  "airplane",
  "astringent",
  "beaker",
  "fastness",
  "imperialism",
  "libretto",
  "omniscience",
  "sanitation",
  "smoldering",
  "weir",
  "wolfish",
  "deleterious",
  "essayist",
  "lingo",
  "losers",
  "lug",
  "paulo",
  "unformed",
  "copyist",
  "crate",
  "lunged",
  "optic",
  "scimitar",
  "well-founded",
  "curd",
  "prolix",
  "salzburg",
  "trinity",
  "confronts",
  "dingle",
  "disband",
  "elegiac",
  "foolscap",
  "giuseppe",
  "hodge",
  "reaper",
  "robbie",
  "rosebud",
  "substratum",
  "bri",
  "cannibalism",
  "illegally",
  "jostle",
  "murderess",
  "realist",
  "swag",
  "usable",
  "windfall",
  "'til",
  "cringe",
  "ecclesiastes",
  "joust",
  "manitoba",
  "pedal",
  "tiberias",
  "unification",
  "wmo",
  "circa",
  "conjuncture",
  "houseless",
  "inscribe",
  "interrogatory",
  "peppermint",
  "pussy",
  "sedative",
  "sewage",
  "diphtheria",
  "mu",
  "subheading",
  "greener",
  "barbados",
  "contradistinction",
  "icing",
  "offal",
  "phosphoric",
  "bestowal",
  "bleat",
  "clayey",
  "inaugurate",
  "leaking",
  "borrower",
  "crusty",
  "debatable",
  "hatter",
  "sponsor",
  "unbalanced",
  "defilement",
  "experimentally",
  "flashlight",
  "iso",
  "phoenix",
  "accrued",
  "awesome",
  "mangrove",
  "prefecture",
  "twenty-sixth",
  "ail",
  "climber",
  "grandee",
  "magnum",
  "mahdi",
  "ochre",
  "ridiculing",
  "supernumerary",
  "vertebrate",
  "bowler",
  "mangy",
  "matins",
  "modulation",
  "officiate",
  "paralyze",
  "provencal",
  "sleight",
  "vaccination",
  "ancona",
  "modicum",
  "unrelated",
  "bun",
  "mildew",
  "plausibly",
  "pseudonym",
  "refrigerator",
  "suitcase",
  "discourteous",
  "jaunt",
  "wraith",
  "brawn",
  "fustian",
  "glowered",
  "neuralgia",
  "sprouted",
  "whir",
  "abased",
  "adamantine",
  "aides",
  "allurement",
  "inoculation",
  "jurist",
  "who've",
  "elate",
  "enervated",
  "iraq",
  "satyr",
  "sluice",
  "viscera",
  "abetted",
  "bauble",
  "conversely",
  "iota",
  "modifies",
  "perspicuity",
  "swap",
  "adventuress",
  "chaldea",
  "disable",
  "stub",
  "houseboat",
  "optional",
  "slut",
  "iteration",
  "monotheism",
  "quandary",
  "tableaux",
  "tun",
  "abrogated",
  "astuteness",
  "baldness",
  "fere",
  "harmonic",
  "magnanimously",
  "slighting",
  "subjugate",
  "ventricle",
  "cull",
  "loquacity",
  "peine",
  "tradespeople",
  "worcestershire",
  "blue-black",
  "clairvoyance",
  "combative",
  "dulcet",
  "fairy-tale",
  "pansies",
  "pontoon",
  "presbytery",
  "casuistry",
  "chunks",
  "discretionary",
  "heady",
  "insomnia",
  "safe-conduct",
  "apulia",
  "n'",
  "rutledge",
  "sedge",
  "vans",
  "wen",
  "encumber",
  "glinting",
  "gloat",
  "infra",
  "matrix",
  "portrayal",
  "pre",
  "vertigo",
  "wc",
  "advert",
  "alchemists",
  "aphorism",
  "archaeological",
  "borax",
  "compendium",
  "cultivates",
  "daze",
  "haw",
  "nozzle",
  "pecking",
  "perpetrator",
  "stoic",
  "tripe",
  "triste",
  "curtsy",
  "dredge",
  "left-handed",
  "ostracism",
  "warship",
  "attestation",
  "capstan",
  "eocene",
  "hello",
  "idiosyncrasy",
  "unacceptable",
  "campfire",
  "ilo",
  "loveless",
  "massage",
  "smarter",
  "stun",
  "whiten",
  "epistolary",
  "feeder",
  "imperil",
  "incidence",
  "outgoing",
  "polytheism",
  "spry",
  "orchid",
  "topple",
  "bahia",
  "coppice",
  "foamy",
  "sago",
  "subjunctive",
  "crayon",
  "magyar",
  "measurable",
  "rubicon",
  "scapegoat",
  "specification",
  "delineate",
  "linden",
  "oc",
  "parsimonious",
  "prospector",
  "veneer",
  "deep-rooted",
  "fidget",
  "gabble",
  "hypnotized",
  "sensory",
  "av",
  "chrysalis",
  "cog",
  "hyacinth",
  "lethe",
  "overshadow",
  "roped",
  "teacup",
  "baggy",
  "coeval",
  "consensus",
  "duo",
  "ile",
  "jackass",
  "lancet",
  "veterinary",
  "blends",
  "niggard",
  "opprobrium",
  "pusillanimous",
  "cocoon",
  "concupiscence",
  "frisky",
  "misdemeanor",
  "passer",
  "quaver",
  "stumped",
  "unbiased",
  "venerate",
  "domestication",
  "fag",
  "interpolation",
  "marche",
  "vixen",
  "brats",
  "leaflet",
  "literati",
  "magically",
  "pc",
  "rosette",
  "boding",
  "drachm",
  "editorials",
  "paired",
  "vacillation",
  "apse",
  "codfish",
  "contentious",
  "incompleteness",
  "leaks",
  "leguminous",
  "nugget",
  "seraglio",
  "supervise",
  "bootless",
  "sadden",
  "salubrious",
  "aesthetics",
  "bengali",
  "breviary",
  "crevasse",
  "lath",
  "linguist",
  "menstruation",
  "wainwright",
  "circumlocution",
  "scheduled",
  "antediluvian",
  "argent",
  "mickle",
  "morphine",
  "underlie",
  "cartoon",
  "colonist",
  "corfu",
  "pere",
  "scrubs",
  "tine",
  "tureen",
  "uranus",
  "dory",
  "humanities",
  "ideally",
  "rosewood",
  "transplant",
  "tutelary",
  "veined",
  "absinthe",
  "apricot",
  "chic",
  "crescendo",
  "desperado",
  "florin",
  "governance",
  "granular",
  "incest",
  "aluminium",
  "backsliding",
  "carver",
  "cobra",
  "cognate",
  "overtakes",
  "south-western",
  "topaz",
  "transversely",
  "fifty-one",
  "lender",
  "trends",
  "althea",
  "continence",
  "effusive",
  "madhouse",
  "ns",
  "spittle",
  "arran",
  "bugbear",
  "delos",
  "forensic",
  "gran",
  "nominee",
  "tights",
  "treacle",
  "whitby",
  "youthfulness",
  "correlated",
  "ding",
  "dynastic",
  "shrimp",
  "tannin",
  "vestal",
  "apoplectic",
  "cameo",
  "coconut",
  "eighty-two",
  "jubilation",
  "studios",
  "walloon",
  "cuckold",
  "organizer",
  "procures",
  "recognisable",
  "tricolor",
  "unpropitious",
  "woodcock",
  "zodiac",
  "bakery",
  "clairvoyant",
  "ep",
  "heirloom",
  "herbaceous",
  "homily",
  "nostrum",
  "anthropology",
  "lothario",
  "lush",
  "two-edged",
  "inauspicious",
  "oxfordshire",
  "steppe",
  "stilted",
  "tasty",
  "vane",
  "wart",
  "askew",
  "portend",
  "septuagint",
  "yr",
  "firebrand",
  "healer",
  "programming",
  "quagmire",
  "tongue-tied",
  "flippancy",
  "fluctuation",
  "introspective",
  "aureole",
  "igneous",
  "scraggy",
  "shrivel",
  "simulate",
  "abolitionist",
  "absented",
  "burrows",
  "chit",
  "demean",
  "mignonette",
  "shoemakers",
  "time-honored",
  "amanuensis",
  "deadlock",
  "reprisal",
  "rotunda",
  "slug",
  "warbler",
  "landau",
  "onyx",
  "wrack",
  "exemplar",
  "gaff",
  "gloucestershire",
  "griffiths",
  "milling",
  "overdue",
  "proximate",
  "throwed",
  "complicate",
  "durban",
  "gleeful",
  "solstice",
  "briar",
  "forceps",
  "hittite",
  "languorous",
  "bole",
  "corset",
  "dub",
  "leonine",
  "mentor",
  "petiole",
  "secede",
  "sedan",
  "transcending",
  "transitive",
  "typewritten",
  "unforgettable",
  "buzzard",
  "departures",
  "tardiness",
  "unmerciful",
  "awfulness",
  "functioning",
  "intermittently",
  "londoner",
  "recapitulate",
  "appertain",
  "prefatory",
  "bartender",
  "flaunt",
  "jennifer",
  "knickerbockers",
  "lariat",
  "slot",
  "uninformed",
  "assimilating",
  "cower",
  "crystallization",
  "exhalation",
  "fakir",
  "fib",
  "glossary",
  "ingratiate",
  "muss",
  "pakistan",
  "palpitation",
  "sulphide",
  "unfashionable",
  "unlawfully",
  "dinghy",
  "fend",
  "rowdy",
  "shank",
  "solder",
  "transatlantic",
  "unicorn",
  "altruism",
  "blockhouse",
  "draper",
  "ephesians",
  "hypnotism",
  "orally",
  "rectum",
  "redden",
  "smirk",
  "synopsis",
  "carmine",
  "samurai",
  "acclaimed",
  "chute",
  "honeycomb",
  "rewritten",
  "unicameral",
  "analytic",
  "candied",
  "crispin",
  "deliberative",
  "disavow",
  "feldspar",
  "humped",
  "largesse",
  "perambulator",
  "sluggard",
  "adulterous",
  "catalonia",
  "composes",
  "eschew",
  "perspicacity",
  "sturgeon",
  "subsides",
  "tyson",
  "waylay",
  "bludgeon",
  "coerced",
  "convene",
  "debasement",
  "smelting",
  "therewithal",
  "twirl",
  "andromeda",
  "pickaxe",
  "uninterested",
  "unwound",
  "brier",
  "coolie",
  "kimono",
  "scab",
  "vim",
  "acrimonious",
  "appraised",
  "delectation",
  "engrave",
  "heliotrope",
  "rook",
  "upholstery",
  "contiguity",
  "manipulate",
  "nudity",
  "pleiades",
  "propitiatory",
  "rotund",
  "sepulture",
  "ares",
  "authorization",
  "bruit",
  "cabaret",
  "callow",
  "foible",
  "purveyor",
  "vail",
  "vegetarian",
  "agape",
  "cremona",
  "crunch",
  "jeweler",
  "premeditation",
  "seventy-eight",
  "suzerainty",
  "unmanned",
  "arterial",
  "bah",
  "compatriot",
  "crowbar",
  "esdras",
  "larch",
  "laggard",
  "maligned",
  "onlooker",
  "oratorio",
  "porpoise",
  "reich",
  "cashed",
  "coiffure",
  "coitus",
  "protuberance",
  "quadrant",
  "bronchitis",
  "cacao",
  "croatia",
  "invisibly",
  "norm",
  "reiterate",
  "riga",
  "sunflower",
  "ft",
  "hock",
  "lop",
  "louse",
  "mantilla",
  "pendulous",
  "pug",
  "sitter",
  "truism",
  "amalgamated",
  "paucity",
  "creased",
  "facetiously",
  "laplace",
  "torso",
  "giraffe",
  "subway",
  "vaunting",
  "angelus",
  "appropriateness",
  "epidemics",
  "imo",
  "acetic",
  "anglo-indian",
  "brothel",
  "cuisine",
  "curative",
  "trident",
  "ambergris",
  "lode",
  "respiratory",
  "rocco",
  "amass",
  "bewitch",
  "chatty",
  "diaphanous",
  "mit",
  "romania",
  "simulation",
  "akimbo",
  "butch",
  "diable",
  "pshaw",
  "cambrian",
  "syringe",
  "tee",
  "valerian",
  "agonising",
  "katrina",
  "rancid",
  "sophist",
  "arbitrator",
  "masturbation",
  "mathematically",
  "palmy",
  "recast",
  "seasick",
  "stephanie",
  "americas",
  "characterise",
  "godson",
  "phantasy",
  "prosy",
  "tardily",
  "agnostic",
  "distil",
  "reynard",
  "-s",
  "bern",
  "betaken",
  "disconcert",
  "jet-black",
  "obituary",
  "pestle",
  "pickpocket",
  "pigtail",
  "python",
  "ravenously",
  "uncritical",
  "aria",
  "backgammon",
  "dour",
  "duality",
  "educator",
  "mutation",
  "oman",
  "shad",
  "underwear",
  "vagina",
  "eighty-seven",
  "ion",
  "spoor",
  "vituperation",
  "-logy",
  "gesticulation",
  "minutiae",
  "time-honoured",
  "zebra",
  "caitiff",
  "extradition",
  "hard-headed",
  "hundredweight",
  "intermixture",
  "meddlesome",
  "oriole",
  "tourism",
  "all-embracing",
  "denudation",
  "hallow",
  "hessian",
  "hussar",
  "landlocked",
  "ringleader",
  "tabooed",
  "tapioca",
  "aliment",
  "gib",
  "man-at-arms",
  "somersault",
  "weathercock",
  "begrudge",
  "bruising",
  "darlington",
  "eighty-three",
  "eucalyptus",
  "gashed",
  "inelegant",
  "ravish",
  "sear",
  "siliceous",
  "befit",
  "incorporeal",
  "judicature",
  "leakage",
  "leicestershire",
  "seraphic",
  "teamster",
  "temperamental",
  "wildfire",
  "zeppelin",
  "hub",
  "ilk",
  "modem",
  "ofries",
  "sardinian",
  "smudge",
  "specter",
  "aberrations",
  "aphorisms",
  "clout",
  "importune",
  "misanthropy",
  "scud",
  "separable",
  "averil",
  "boa",
  "corvette",
  "jowl",
  "lean-to",
  "twaddle",
  "wrongdoing",
  "acceleration",
  "vats",
  "canticles",
  "dolt",
  "factotum",
  "incubation",
  "malleable",
  "percussion",
  "achieves",
  "consults",
  "deadening",
  "stipulate",
  "unconvinced",
  "differentiate",
  "faro",
  "inquisitiveness",
  "madcap",
  "transgressor",
  "vicissitude",
  "whiz",
  "comport",
  "eighty-six",
  "fumble",
  "muffin",
  "procreation",
  "rajah",
  "retracted",
  "spaulding",
  "tempering",
  "tenderfoot",
  "ws",
  "abnegation",
  "augustinian",
  "bombastic",
  "cajole",
  "chaparral",
  "declination",
  "falsify",
  "flaccid",
  "seasonal",
  "unveil",
  "obscenity",
  "quince",
  "tepee",
  "trigonometry",
  "bulkhead",
  "interjection",
  "pennon",
  "ref",
  "reopen",
  "triton",
  "argo",
  "dipper",
  "doug",
  "encomium",
  "gauzy",
  "nowt",
  "pico",
  "quartette",
  "recapitulation",
  "upbringing",
  "abysmal",
  "fractional",
  "galore",
  "open-hearted",
  "pinafore",
  "prompter",
  "protestant",
  "puncture",
  "barmaid",
  "emission",
  "fiasco",
  "go-between",
  "inquisitively",
  "lige",
  "mingo",
  "bayou",
  "impecunious",
  "tendril",
  "tiffany",
  "gnu",
  "kidnap",
  "litany",
  "mandolin",
  "mc",
  "villager",
  "wheaten",
  "bridesmaid",
  "denizen",
  "esplanade",
  "generative",
  "lapel",
  "moccasin",
  "mucus",
  "overlap",
  "primate",
  "sesame",
  "twenty-eighth",
  "-form",
  "blazon",
  "bunsen",
  "burdett",
  "castaway",
  "catarrh",
  "coma",
  "ignoramus",
  "jaguar",
  "northamptonshire",
  "pers",
  "plod",
  "proboscis",
  "terra-cotta",
  "buccaneer",
  "draughtsman",
  "instigator",
  "mauritania",
  "mown",
  "peacemaker",
  "radial",
  "zee",
  "americanism",
  "brainless",
  "bras",
  "czechs",
  "roulette",
  "tragedian",
  "assam",
  "broaden",
  "tags",
  "cops",
  "finder",
  "handmaiden",
  "marge",
  "steven",
  "unco",
  "wishful",
  "abase",
  "ahoy",
  "beatific",
  "breeder",
  "crease",
  "fertilisation",
  "huh",
  "invert",
  "nipple",
  "synonyms",
  "yokohama",
  "agog",
  "atrophy",
  "bulbous",
  "chan",
  "classmate",
  "dearborn",
  "galvanometer",
  "heyday",
  "penmanship",
  "pitchfork",
  "prudish",
  "vacate",
  "vendor",
  "arson",
  "bombard",
  "doff",
  "germination",
  "intoxicate",
  "purblind",
  "supernal",
  "twenty-seventh",
  "yearling",
  "allot",
  "baiting",
  "bookish",
  "carbolic",
  "itinerary",
  "scapegrace",
  "supervisor",
  "almoner",
  "boorish",
  "microwave",
  "oust",
  "pyjamas",
  "residuum",
  "restorer",
  "tarn",
  "vistula",
  "'fraid",
  "audit",
  "canticle",
  "errol",
  "hairdresser",
  "indonesia",
  "laureate",
  "ramshackle",
  "statuette",
  "append",
  "crony",
  "deduct",
  "mesquite",
  "tocsin",
  "toothed",
  "yank",
  "abstention",
  "awestruck",
  "electrode",
  "flier",
  "gander",
  "marl",
  "silica",
  "unencumbered",
  "hoes",
  "nagasaki",
  "olfactory",
  "plenary",
  "samoan",
  "underrate",
  "genitive",
  "illiteracy",
  "jacobus",
  "mutable",
  "suffocate",
  "tartarus",
  "vom",
  "damps",
  "folklore",
  "gaslight",
  "hiatus",
  "machinist",
  "milestone",
  "ninety-two",
  "nullify",
  "overdo",
  "perceptive",
  "capillary",
  "nationalism",
  "warranty",
  "alumina",
  "casque",
  "frees",
  "hopper",
  "cowslip",
  "deciduous",
  "diabolic",
  "fertilizing",
  "filthiness",
  "fondle",
  "iambic",
  "num",
  "parvenu",
  "rancorous",
  "clandestinely",
  "double-barrelled",
  "gongs",
  "half-moon",
  "hike",
  "ltd",
  "physicist",
  "trestle",
  "viscid",
  "barrage",
  "casino",
  "improvise",
  "plumber",
  "routing",
  "speciality",
  "accoutred",
  "amatory",
  "blanch",
  "furlong",
  "incarceration",
  "popish",
  "pre-",
  "unadulterated",
  "unflagging",
  "vascular",
  "accumulates",
  "alsatian",
  "bemoan",
  "cherubs",
  "mayonnaise",
  "pitfall",
  "recrimination",
  "rubble",
  "scape",
  "strumpet",
  "topping",
  "unconcealed",
  "aniline",
  "constipation",
  "elope",
  "ensnare",
  "tulle",
  "condoned",
  "grinder",
  "linseed",
  "three-quarter",
  "charwoman",
  "diablo",
  "epidermis",
  "locus",
  "rhea",
  "seraph",
  "benin",
  "buttocks",
  "calabash",
  "chios",
  "dandelion",
  "enrichment",
  "ewer",
  "kat",
  "objectively",
  "pard",
  "priced",
  "suzerain",
  "theocracy",
  "transfiguration",
  "alto",
  "colossus",
  "disembark",
  "entree",
  "gelatinous",
  "hostel",
  "ccc",
  "controller",
  "conventual",
  "demerit",
  "drover",
  "dude",
  "eclat",
  "flop",
  "mew",
  "moira",
  "nudge",
  "rebirth",
  "serb",
  "sofia",
  "arroyo",
  "clematis",
  "conscripts",
  "dannie",
  "life-size",
  "ovary",
  "swart",
  "blunderbuss",
  "disinherit",
  "maidenhead",
  "rawhide",
  "braxton",
  "concerto",
  "primacy",
  "recession",
  "satrap",
  "taffrail",
  "terrorism",
  "bosh",
  "conscript",
  "dangle",
  "disgorge",
  "fallible",
  "heterodox",
  "belittle",
  "budapest",
  "milkman",
  "autonomous",
  "commuted",
  "condone",
  "frankenstein",
  "mileage",
  "moraine",
  "underrated",
  "asbestos",
  "bevis",
  "broomstick",
  "celibate",
  "digger",
  "insulation",
  "liberals",
  "ninety-six",
  "pasha",
  "stellar",
  "tat",
  "dagon",
  "freud",
  "satiate",
  "waterman",
  "all-round",
  "baritone",
  "cc",
  "nigeria",
  "ur",
  "verger",
  "digressions",
  "emendation",
  "groin",
  "lumpy",
  "probate",
  "ammonium",
  "bigamy",
  "connective",
  "looting",
  "malayan",
  "roth",
  "sextant",
  "bitumen",
  "bostonian",
  "copyrighted",
  "cramps",
  "exemplify",
  "major-domo",
  "piebald",
  "pyrites",
  "debater",
  "dietary",
  "ichabod",
  "motif",
  "ramrod",
  "rummage",
  "slogan",
  "accessions",
  "accordant",
  "anodyne",
  "batting",
  "leprous",
  "lexicon",
  "long-winded",
  "malaysia",
  "nubia",
  "cartel",
  "fetus",
  "integration",
  "linnet",
  "purposeful",
  "abaft",
  "appliance",
  "burman",
  "lynching",
  "so-and-so",
  "southernmost",
  "treadmill",
  "cameras",
  "dp",
  "dualism",
  "sealskin",
  "stewardess",
  "wuss",
  "effulgent",
  "hexameter",
  "kaleidoscope",
  "ar",
  "jaundice",
  "recant",
  "repertory",
  "sedimentary",
  "shakespearean",
  "slipshod",
  "undeviating",
  "conch",
  "corked",
  "exordium",
  "faggot",
  "fatherhood",
  "magenta",
  "minimize",
  "overtime",
  "residential",
  "topeka",
  "woodcut",
  "adorer",
  "deface",
  "grannie",
  "nite",
  "paprika",
  "prolixity",
  "twenty-ninth",
  "wheedle",
  "bahamas",
  "capriciously",
  "en-",
  "guano",
  "interloper",
  "phosphorescence",
  "seventy-seven",
  "absentee",
  "acidity",
  "andros",
  "concertina",
  "helter-skelter",
  "morphia",
  "unsociable",
  "wildcat",
  "fertilized",
  "golly",
  "indemnification",
  "magnolia",
  "numeral",
  "quire",
  "reciprocate",
  "salty",
  "ambrosia",
  "cuneiform",
  "indite",
  "pander",
  "pelvis",
  "seance",
  "specifying",
  "third-rate",
  "atrium",
  "cattleman",
  "coo",
  "invoice",
  "offshoot",
  "yugoslavia",
  "dissimilarity",
  "technological",
  "tobago",
  "witticism",
  "afflicts",
  "allspice",
  "contrariwise",
  "emotionally",
  "headgear",
  "infanticide",
  "polemical",
  "propulsion",
  "ave",
  "feasibility",
  "ignition",
  "sublimate",
  "swivel",
  "eighty-eight",
  "override",
  "pajamas",
  "presuppose",
  "stepdaughter",
  "unhindered",
  "candidacy",
  "duffer",
  "idiomatic",
  "joyance",
  "propel",
  "sawn",
  "scurry",
  "sloppy",
  "hyperbole",
  "lesions",
  "mink",
  "nimbus",
  "pelf",
  "truncheon",
  "buffer",
  "chromatic",
  "joiner",
  "abjectly",
  "ao",
  "cabriolet",
  "crossbow",
  "da",
  "fudge",
  "lien",
  "reborn",
  "beehive",
  "coalesce",
  "insidiously",
  "press-gang",
  "reunite",
  "sunstroke",
  "abbreviations",
  "cd",
  "desideratum",
  "engulf",
  "howitzer",
  "jt",
  "leavings",
  "median",
  "regalia",
  "saudi",
  "starling",
  "apposite",
  "excrement",
  "geographically",
  "kilometers",
  "priestcraft",
  "tagalog",
  "theorist",
  "americana",
  "frustration",
  "gp",
  "sawmill",
  "voicing",
  "aquarium",
  "boxer",
  "cryptic",
  "dowdy",
  "grill",
  "lotion",
  "palliation",
  "pcb",
  "traction",
  "whiting",
  "bromide",
  "freshet",
  "grovel",
  "harlequin",
  "jewry",
  "megaphone",
  "parallelogram",
  "plummet",
  "sublunary",
  "typographical",
  "ussr"
]

});
require.register("drake/index.js", function(exports, require, module){
// Generated by CoffeeScript 1.6.3
(function() {
  var Backbone, Collections, Config, JSON, Models, NProgress, Passwordgen, Templates, Views, el, enter, escape, reactive, sjcl, uid, _, _i, _len, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  require("jquery");

  JSON = require("json");

  _ = require("underscore");

  Backbone = require("backbone");

  NProgress = require("nprogress");

  sjcl = require("sjcl");

  uid = require("uid");

  reactive = require("reactive");

  enter = require("on-enter");

  escape = require("on-escape");

  Passwordgen = require("passwordgen");

  Config = {
    clientId: "671657367079.apps.googleusercontent.com"
  };

  reactive.subscribe(function(obj, prop, fn) {
    return obj.on("change:" + prop, fn);
  });

  reactive.set(function(obj, prop) {
    return obj.set(prop);
  });

  reactive.get(function(obj, prop) {
    return obj.get(prop);
  });

  reactive.bind("data-text", function(el, name) {
    var obj;
    obj = this.obj;
    el.innerText = obj.get(name);
    return el.onblur = function() {
      return obj.set(name, el.innerText);
    };
  });

  reactive.bind("data-value", function(el, name) {
    var obj;
    obj = this.obj;
    el.value = obj.get(name);
    return el.onchange = function() {
      return obj.set(name, el.value);
    };
  });

  reactive.bind("data-checked", function(el, name) {
    var obj;
    obj = this.obj;
    el.checked = Boolean(obj.get(name));
    return el.onchange = function() {
      return obj.set(name, el.checked);
    };
  });

  Templates = {
    entry: document.querySelector(".entry")
  };

  _ref = _(Templates).values();
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    el = _ref[_i];
    el.remove();
  }

  Models = {};

  Collections = {};

  Views = {};

  Models.Entry = (function(_super) {
    __extends(Entry, _super);

    function Entry() {
      _ref1 = Entry.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    return Entry;

  })(Backbone.Model);

  Collections.Entries = (function(_super) {
    __extends(Entries, _super);

    function Entries() {
      _ref2 = Entries.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    Entries.prototype.model = Models.Entry;

    return Entries;

  })(Backbone.Collection);

  Models.GenPassSettings = (function(_super) {
    __extends(GenPassSettings, _super);

    function GenPassSettings() {
      _ref3 = GenPassSettings.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    GenPassSettings.prototype.defaults = {
      type: "chars",
      length: 30,
      numbers: true,
      letters: true,
      symbols: false
    };

    return GenPassSettings;

  })(Backbone.Model);

  Models.Chest = (function(_super) {
    __extends(Chest, _super);

    function Chest() {
      this.update = __bind(this.update, this);
      this.open = __bind(this.open, this);
      _ref4 = Chest.__super__.constructor.apply(this, arguments);
      return _ref4;
    }

    Chest.prototype.open = function(password) {
      var entries;
      this.set("password", password);
      try {
        entries = sjcl.decrypt(password, this.get("ciphertext"));
      } catch (_error) {
        return false;
      }
      this.entries.reset(JSON.parse(entries));
      return true;
    };

    Chest.prototype.update = function() {
      var data;
      data = JSON.stringify(this.entries.toJSON());
      this.set("ciphertext", sjcl.encrypt(this.get("password"), data));
      return this;
    };

    return Chest;

  })(Backbone.Model);

  Views.Entry = (function(_super) {
    __extends(Entry, _super);

    function Entry() {
      this["delete"] = __bind(this["delete"], this);
      this.trash = __bind(this.trash, this);
      this.hidePasword = __bind(this.hidePasword, this);
      this.showPassword = __bind(this.showPassword, this);
      _ref5 = Entry.__super__.constructor.apply(this, arguments);
      return _ref5;
    }

    Entry.prototype.events = {
      "focus .password": "showPassword",
      "blur .password": "hidePasword",
      "click a.trash": "trash",
      "click a.delete": "delete"
    };

    Entry.prototype.showPassword = function() {
      this.$(".password").attr("type", "text");
      return this;
    };

    Entry.prototype.hidePasword = function() {
      this.$(".password").attr("type", "password");
      return this;
    };

    Entry.prototype.trash = function(e) {
      e.preventDefault();
      this.model.set("trashed", true);
      this.remove();
      return this;
    };

    Entry.prototype["delete"] = function(e) {
      e.preventDefault();
      if (confirm("Are you sure you want to permanently delete this entry?")) {
        this.model.collection.remove(this.model);
        this.remove();
      }
      return this;
    };

    return Entry;

  })(Backbone.View);

  Views.GenPass = (function(_super) {
    __extends(GenPass, _super);

    function GenPass() {
      this.toggleSettings = __bind(this.toggleSettings, this);
      this.output = __bind(this.output, this);
      this.generate = __bind(this.generate, this);
      this.initialize = __bind(this.initialize, this);
      _ref6 = GenPass.__super__.constructor.apply(this, arguments);
      return _ref6;
    }

    GenPass.prototype.el = ".genpass";

    GenPass.prototype.events = {
      "click button": "output",
      "click .icon-settings": "toggleSettings"
    };

    GenPass.prototype.initialize = function() {
      this.gen = new Passwordgen();
      reactive(this.el, this.model);
      return this;
    };

    GenPass.prototype.generate = function() {
      var res, type;
      type = this.model.get("type");
      return res = this.gen[type](this.model.get("length"), {
        numbers: this.model.get("numbers"),
        letters: this.model.get("letters"),
        symbols: this.model.get("symbols")
      });
    };

    GenPass.prototype.output = function() {
      this.$(".output").text(this.generate());
      return this;
    };

    GenPass.prototype.toggleSettings = function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.$(".settings").toggle();
      return this;
    };

    return GenPass;

  })(Backbone.View);

  Views.App = (function(_super) {
    __extends(App, _super);

    function App() {
      this.updateChestMetadata = __bind(this.updateChestMetadata, this);
      this.sync = __bind(this.sync, this);
      this.setNeedSync = __bind(this.setNeedSync, this);
      this.toggleSync = __bind(this.toggleSync, this);
      this.newEntry = __bind(this.newEntry, this);
      this.filterEntries = __bind(this.filterEntries, this);
      this.renderEntries = __bind(this.renderEntries, this);
      this.renderEntry = __bind(this.renderEntry, this);
      this.open = __bind(this.open, this);
      this.setChestContent = __bind(this.setChestContent, this);
      this.downloadChest = __bind(this.downloadChest, this);
      this.setChestMetadata = __bind(this.setChestMetadata, this);
      this.getChestMetadata = __bind(this.getChestMetadata, this);
      this.pickerCb = __bind(this.pickerCb, this);
      this.pick = __bind(this.pick, this);
      this.newChest = __bind(this.newChest, this);
      this.getChestReq = __bind(this.getChestReq, this);
      this.showLoggedIn = __bind(this.showLoggedIn, this);
      this.checkAuth = __bind(this.checkAuth, this);
      this.auth = __bind(this.auth, this);
      this.buildPicker = __bind(this.buildPicker, this);
      this.loadPicker = __bind(this.loadPicker, this);
      this.loadDrive = __bind(this.loadDrive, this);
      this.load = __bind(this.load, this);
      this.toggleFilterHelp = __bind(this.toggleFilterHelp, this);
      this.showEntries = __bind(this.showEntries, this);
      this.hideOpen = __bind(this.hideOpen, this);
      this.showOpen = __bind(this.showOpen, this);
      this.hideNew = __bind(this.hideNew, this);
      this.showNew = __bind(this.showNew, this);
      this.hideLoad = __bind(this.hideLoad, this);
      this.showLoad = __bind(this.showLoad, this);
      this.hideAuth = __bind(this.hideAuth, this);
      this.showAuth = __bind(this.showAuth, this);
      this.setupPlugins = __bind(this.setupPlugins, this);
      this.error = __bind(this.error, this);
      this.initialize = __bind(this.initialize, this);
      _ref7 = App.__super__.constructor.apply(this, arguments);
      return _ref7;
    }

    App.prototype.el = ".app";

    App.prototype.events = {
      "click .auth button": function() {
        return this.auth(false, this.checkAuth);
      },
      "click .load .new": function() {
        this.hideLoad();
        return this.showNew();
      },
      "click .new .ok": function() {
        var name, password;
        name = this.$(".new .name").val().trim();
        password = this.$(".new .password").val();
        if (!(name && password)) {
          return;
        }
        this.hideNew();
        return this.newChest(name, password);
      },
      "click .new .cancel": function() {
        this.hideNew();
        return this.showLoad();
      },
      "click .load .pick": "pick",
      "click .open button": "open",
      "keyup .filter input": "filterEntries",
      "blur .filter input": "filterEntries",
      "change .filter input": "filterEntries",
      "click .filter .help": "toggleFilterHelp",
      "click .filter-help": "toggleFilterHelp",
      "click .new-entry": "newEntry",
      "click .sync": "sync"
    };

    App.prototype.initialize = function() {
      this.chest = new Models.Chest({
        status: "synced"
      });
      this.chest.on("change:status", this.toggleSync);
      this.chest.entries = new Collections.Entries();
      this.chest.entries.on("add", this.renderEntry).on("remove", this.removeEntry).on("remove", this.setNeedSync).on("reset", this.renderEntries).on("change", this.setNeedSync);
      this.genPass = new Views.GenPass({
        model: new Models.GenPassSettings()
      });
      this.setupPlugins();
      return this;
    };

    App.prototype.error = function(message) {
      var $error;
      $error = this.$(".error");
      if (this.errTimeout) {
        clearTimeout(this.errTimeout);
      }
      if (message != null) {
        $error.show().find("span").text(message);
        return this.errTimeout = setTimeout(function() {
          return $error.hide();
        }, 3000);
      } else {
        return $error.hide();
      }
    };

    App.prototype.setupPlugins = function() {
      NProgress.configure({
        showSpinner: false
      });
      $(document).ajaxStart(function() {
        return NProgress.start();
      }).ajaxStop(function() {
        return NProgress.done();
      });
      return this;
    };

    App.prototype.showAuth = function() {
      this.$(".auth.section").show();
      return this;
    };

    App.prototype.hideAuth = function() {
      this.$(".auth.section").hide();
      return this;
    };

    App.prototype.showLoad = function() {
      this.$(".load.section").show();
      return this;
    };

    App.prototype.hideLoad = function() {
      this.$(".load.section").hide();
      return this;
    };

    App.prototype.showNew = function() {
      enter(_.bind(function() {
        return this.$(".new .ok").trigger("click");
      }, this));
      escape(_.bind(function() {
        return this.$(".new .cancel").trigger("click");
      }, this));
      this.$(".new.section").show().find(".name").focus();
      return this;
    };

    App.prototype.hideNew = function() {
      enter.unbind();
      escape.unbind();
      this.$(".new.section").hide();
      return this;
    };

    App.prototype.showOpen = function() {
      enter(_.bind(function() {
        return this.$(".open button").trigger("click");
      }, this));
      this.$(".open.section").show().find(".password").focus();
      return this;
    };

    App.prototype.hideOpen = function() {
      enter.unbind();
      this.$(".open.section").hide();
      return this;
    };

    App.prototype.showEntries = function() {
      this.$(".entries").show();
      return this;
    };

    App.prototype.toggleFilterHelp = function(e) {
      e.preventDefault();
      $(".filter-help").toggle();
      return this;
    };

    App.prototype.load = function() {
      NProgress.start();
      gapi.load("auth,client", this.loadDrive);
      return this;
    };

    App.prototype.loadDrive = function() {
      gapi.client.load("drive", "v2", this.loadPicker);
      return this;
    };

    App.prototype.loadPicker = function(cb) {
      google.load("picker", "1", {
        callback: this.buildPicker
      });
      return this;
    };

    App.prototype.buildPicker = function() {
      NProgress.done();
      this.picker = new google.picker.PickerBuilder().addView(google.picker.ViewId.DOCS).setCallback(this.pickerCb).build();
      this.auth(true, this.checkAuth);
      return this;
    };

    App.prototype.auth = function(immediate, cb) {
      var config;
      config = {
        client_id: Config.clientId,
        scope: ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/drive"],
        display: "popup"
      };
      if (immediate) {
        config.immediate = immediate;
      } else {
        config.prompt = "select_account";
      }
      gapi.auth.authorize(config, cb);
      return this;
    };

    App.prototype.checkAuth = function(token) {
      var req;
      if (token && !token.error) {
        req = gapi.client.request({
          path: "/oauth2/v1/userinfo",
          method: "GET"
        });
        req.execute(this.showLoggedIn);
        this.hideAuth();
        this.showLoad();
      } else {
        this.showAuth();
      }
      return this;
    };

    App.prototype.showLoggedIn = function(user) {
      this.$(".logged-in").show().find(".email").text(user.email);
      return this;
    };

    App.prototype.multipartBody = function(boundary, metadata, contentType, data) {
      return "--" + boundary + "\nContent-Type: application/json\n\n" + (JSON.stringify(metadata)) + "\n--" + boundary + "\nContent-Type: " + contentType + "\nContent-Transfer-Encoding: base64\n\n" + (btoa(data)) + "\n--" + boundary + "--";
    };

    App.prototype.getChestReq = function(method) {
      var boundary, contentType, metadata, path;
      path = "/upload/drive/v2/files";
      if (method === "PUT") {
        path += "/" + (this.chest.get("id"));
      }
      boundary = uid();
      contentType = "application/json";
      metadata = {
        title: this.chest.get("title"),
        mimeType: contentType
      };
      return gapi.client.request({
        path: path,
        method: method,
        params: {
          uploadType: "multipart"
        },
        headers: {
          "Content-Type": "multipart/mixed; boundary=" + boundary
        },
        body: this.multipartBody(boundary, metadata, contentType, this.chest.get("ciphertext"))
      });
    };

    App.prototype.newChest = function(name, password) {
      var req;
      NProgress.start();
      this.chest.entries.reset([
        {
          id: uid(20),
          title: "Example",
          url: "http://example.com",
          username: "username",
          password: "password"
        }
      ], {
        silent: true
      });
      this.chest.set({
        title: "" + name + ".chest",
        password: password
      }).update();
      req = this.getChestReq("POST");
      req.execute(this.setChestMetadata);
      return this;
    };

    App.prototype.pick = function() {
      this.picker.setVisible(true);
      return this;
    };

    App.prototype.pickerCb = function(data) {
      var fileId;
      switch (data[google.picker.Response.ACTION]) {
        case google.picker.Action.PICKED:
          fileId = data[google.picker.Response.DOCUMENTS][0].id;
          this.getChestMetadata(fileId);
      }
      return this;
    };

    App.prototype.getChestMetadata = function(fileId) {
      var req;
      NProgress.start();
      req = gapi.client.drive.files.get({
        fileId: fileId
      });
      req.execute(this.setChestMetadata);
      return this;
    };

    App.prototype.setChestMetadata = function(metadata) {
      this.chest.set(metadata);
      this.downloadChest();
      return this;
    };

    App.prototype.downloadChest = function() {
      $.ajax({
        url: this.chest.get("downloadUrl"),
        type: "get",
        headers: {
          "Authorization": "Bearer " + (gapi.auth.getToken().access_token)
        }
      }).done(this.setChestContent).fail(function() {
        return this.error("Failed to download chest");
      });
      return this;
    };

    App.prototype.setChestContent = function(resp) {
      NProgress.done();
      this.chest.set("ciphertext", JSON.stringify(resp));
      this.hideLoad();
      this.showOpen();
      return this;
    };

    App.prototype.open = function() {
      var password;
      this.error();
      password = this.$(".open .password").val();
      if (this.chest.open(password)) {
        this.hideOpen();
        this.showEntries();
      } else {
        this.error("Failed to open chest");
      }
      return this;
    };

    App.prototype.renderEntry = function(entry) {
      var filter;
      if (this.filterProp !== "trashed" && entry.get("trashed")) {
        return;
      }
      if (this.filterProp && entry.has(this.filterProp)) {
        if (this.filterProp === "trashed") {
          if (!entry.get("trashed")) {
            return;
          }
        } else {
          filter = new RegExp(this.filter.source.substring(this.filterProp.length + 1), "i");
          if (!filter.test(entry.get(this.filterProp))) {
            return;
          }
        }
      } else {
        if (this.filter && !this.filter.test(entry.get("title"))) {
          return;
        }
      }
      this.$(".entries > ul").append(new Views.Entry({
        model: entry,
        el: reactive(Templates.entry.cloneNode(true), entry).el
      }).$el);
      return this;
    };

    App.prototype.renderEntries = function(entries) {
      this.$(".entries > ul").empty();
      entries.each(this.renderEntry);
      return this;
    };

    App.prototype.filterEntries = function() {
      var filterVal;
      filterVal = this.$(".filter input").val().trim();
      if (filterVal.lastIndexOf(":") > 0) {
        this.filterProp = filterVal.split(":")[0];
      } else {
        this.filterProp = null;
      }
      this.filter = new RegExp(filterVal, "i");
      this.renderEntries(this.chest.entries);
      return this;
    };

    App.prototype.newEntry = function() {
      var entry, id;
      this.chest.set("status", "needSync");
      while (true) {
        id = uid(20);
        if (!this.chest.entries.get(id)) {
          break;
        }
      }
      entry = new Models.Entry({
        id: id,
        title: "New Entry",
        username: "",
        password: this.genPass.generate(),
        url: "http://"
      });
      this.chest.entries.add(entry);
      return this;
    };

    App.prototype.toggleSync = function() {
      var status;
      status = this.chest.get("status");
      this.$(".sync").prop("disabled", status !== "needSync").find("span").text((function() {
        switch (status) {
          case "needSync":
            return "Sync";
          case "syncing":
            return "Syncing";
          case "synced":
            return "Synced";
        }
      })());
      return this;
    };

    App.prototype.setNeedSync = function() {
      this.chest.set("status", "needSync");
      return this;
    };

    App.prototype.sync = function() {
      var req;
      NProgress.start();
      this.chest.set("status", "syncing").update();
      req = this.getChestReq("PUT");
      req.execute(this.updateChestMetadata);
      return this;
    };

    App.prototype.updateChestMetadata = function(metadata) {
      NProgress.done();
      this.chest.set(metadata);
      this.chest.set("status", "synced");
      return this;
    };

    return App;

  })(Backbone.View);

  module.exports = new Views.App();

}).call(this);

});



















require.alias("component-json-fallback/index.js", "drake/deps/json-fallback/index.js");
require.alias("component-json-fallback/index.js", "json-fallback/index.js");

require.alias("component-json/index.js", "drake/deps/json/index.js");
require.alias("component-json/index.js", "json/index.js");

require.alias("components-jquery/jquery.js", "drake/deps/jquery/jquery.js");
require.alias("components-jquery/jquery.js", "drake/deps/jquery/index.js");
require.alias("components-jquery/jquery.js", "jquery/index.js");
require.alias("components-jquery/jquery.js", "components-jquery/index.js");
require.alias("components-underscore/underscore.js", "drake/deps/underscore/underscore.js");
require.alias("components-underscore/underscore.js", "drake/deps/underscore/index.js");
require.alias("components-underscore/underscore.js", "underscore/index.js");
require.alias("components-underscore/underscore.js", "components-underscore/index.js");
require.alias("components-backbone/backbone.js", "drake/deps/backbone/backbone.js");
require.alias("components-backbone/backbone.js", "drake/deps/backbone/index.js");
require.alias("components-backbone/backbone.js", "backbone/index.js");
require.alias("components-jquery/jquery.js", "components-backbone/deps/jquery/jquery.js");
require.alias("components-jquery/jquery.js", "components-backbone/deps/jquery/index.js");
require.alias("components-jquery/jquery.js", "components-jquery/index.js");
require.alias("components-underscore/underscore.js", "components-backbone/deps/underscore/underscore.js");
require.alias("components-underscore/underscore.js", "components-backbone/deps/underscore/index.js");
require.alias("components-underscore/underscore.js", "components-underscore/index.js");
require.alias("components-backbone/backbone.js", "components-backbone/index.js");
require.alias("rstacruz-nprogress/nprogress.js", "drake/deps/nprogress/nprogress.js");
require.alias("rstacruz-nprogress/nprogress.js", "drake/deps/nprogress/index.js");
require.alias("rstacruz-nprogress/nprogress.js", "nprogress/index.js");
require.alias("component-jQuery/index.js", "rstacruz-nprogress/deps/jquery/index.js");

require.alias("rstacruz-nprogress/nprogress.js", "rstacruz-nprogress/index.js");
require.alias("marksteve-sjcl/sjcl.js", "drake/deps/sjcl/sjcl.js");
require.alias("marksteve-sjcl/sjcl.js", "drake/deps/sjcl/index.js");
require.alias("marksteve-sjcl/sjcl.js", "sjcl/index.js");
require.alias("marksteve-sjcl/sjcl.js", "marksteve-sjcl/index.js");
require.alias("matthewmueller-uid/index.js", "drake/deps/uid/index.js");
require.alias("matthewmueller-uid/index.js", "uid/index.js");

require.alias("component-reactive/lib/index.js", "drake/deps/reactive/lib/index.js");
require.alias("component-reactive/lib/utils.js", "drake/deps/reactive/lib/utils.js");
require.alias("component-reactive/lib/text-binding.js", "drake/deps/reactive/lib/text-binding.js");
require.alias("component-reactive/lib/attr-binding.js", "drake/deps/reactive/lib/attr-binding.js");
require.alias("component-reactive/lib/binding.js", "drake/deps/reactive/lib/binding.js");
require.alias("component-reactive/lib/bindings.js", "drake/deps/reactive/lib/bindings.js");
require.alias("component-reactive/lib/adapter.js", "drake/deps/reactive/lib/adapter.js");
require.alias("component-reactive/lib/index.js", "drake/deps/reactive/index.js");
require.alias("component-reactive/lib/index.js", "reactive/index.js");
require.alias("component-format-parser/index.js", "component-reactive/deps/format-parser/index.js");

require.alias("component-props/index.js", "component-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-reactive/deps/props/index.js");
require.alias("component-props/index.js", "component-props/index.js");
require.alias("visionmedia-debug/index.js", "component-reactive/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "component-reactive/deps/debug/debug.js");

require.alias("component-event/index.js", "component-reactive/deps/event/index.js");

require.alias("component-classes/index.js", "component-reactive/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-query/index.js", "component-reactive/deps/query/index.js");

require.alias("component-reactive/lib/index.js", "component-reactive/index.js");
require.alias("segmentio-on-enter/index.js", "drake/deps/on-enter/index.js");
require.alias("segmentio-on-enter/index.js", "on-enter/index.js");
require.alias("component-event/index.js", "segmentio-on-enter/deps/event/index.js");

require.alias("component-indexof/index.js", "segmentio-on-enter/deps/indexof/index.js");

require.alias("segmentio-on-escape/index.js", "drake/deps/on-escape/index.js");
require.alias("segmentio-on-escape/index.js", "on-escape/index.js");
require.alias("component-event/index.js", "segmentio-on-escape/deps/event/index.js");

require.alias("component-indexof/index.js", "segmentio-on-escape/deps/indexof/index.js");

require.alias("rstacruz-passwordgen.js/lib/index.js", "drake/deps/passwordgen/lib/index.js");
require.alias("rstacruz-passwordgen.js/lib/words.js", "drake/deps/passwordgen/lib/words.js");
require.alias("rstacruz-passwordgen.js/lib/index.js", "drake/deps/passwordgen/index.js");
require.alias("rstacruz-passwordgen.js/lib/index.js", "passwordgen/index.js");
require.alias("rstacruz-passwordgen.js/lib/index.js", "rstacruz-passwordgen.js/index.js");