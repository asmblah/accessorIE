/*
 *  accessorIE - JavaScript accessors for IE
 *  (c) 2012 https://github.com/asmblah/accessorIE
 *
 *  This file is part of accessorIE.
 *
 *  accessorIE is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  accessorIE is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with accessorIE.  If not, see <http://www.gnu.org/licenses/>.
 */

(function () {
    "use strict";

    var hasOwnProperty = {}.hasOwnProperty,
        toString = {}.toString,
        noStringIndex = "a"[0] !== "a",
        global = new [Function][0]("return this;")(),
        Object = global.Object,
        Array = global.Array,
        document = global.document,
        sandbox = null,
        objects = [],
        needsAccessorShim = !!global.execScript,
        namespacePath = null,
        namespaceName = "accessorIE",
        transportName = "__transport__",
        info = {
            array: {
                names: [],
                lookup: {}
            }
        },
        hostPropertyNames = [
            "nextSibling", "childNodes", "canHaveHTML", "recordNumber", "previousSibling", "nodeName",
            "currentStyle", "clientHeight", "style", "nodeType", "scopeName", "offsetWidth", "filters",
            "isContentEditable", "scrollHeight", "lastChild", "canHaveChildren", "isMultiLine",
            "offsetTop", "parentNode", "tagName", "behaviorUrns", "parentTextEdit", "ownerDocument",
            "offsetParent", "parentElement", "children", "readyState", "document", "firstChild",
            "sourceIndex", "isTextEdit", "isDisabled", "runtimeStyle", "scrollWidth", "attributes",
            "offsetHeight", "clientTop", "clientWidth", "tagUrn", "clientLeft", "all", "offsetLeft"
        ];

    each(document.getElementsByTagName("script"), function () {
        var path = this.src,
            parts;

        if (/accessorIE\.js$/.test(path)) {
            parts = path.split("/");
            parts.splice(parts.length - 2, 2, "components", "accessorIE.htc");
            namespacePath = parts.join("/");

            return false;
        }
    });

    if (namespacePath === null) {
        throw new Error("accessorIE script not found for path extraction");
    }

    each([
        "shift", "sort", "concat", "filter",
        "map", "join", "toString", "push",
        "reduceRight", "toLocaleString", "constructor", "forEach",
        "lastIndexOf", "some", "slice", "every",
        "reverse", "indexOf", "unshift",
        "reduce", "pop", "splice"
    ], function (name) {
        if (Array.prototype.hasOwnProperty(name)) {
            info.array.names.push(name);
            info.array.lookup[name] = true;
        }
    });

    if (!global.console) {
        global.console = {
            error: function () {},
            log: function () {}
        };
    }

    if (!Array.isArray) {
        Array.isArray = function (obj) {
            return toString.call(obj) === "[object Array]";
        };
    }

    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function (callback, thisObj) {
            var index,
                length = this.length;

            thisObj = thisObj || this;

            for (index = 0; index < length; index += 1) {
                callback.call(thisObj, this[index], index, this);
            }
        };
    }

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (value) {
            var index,
                length = this.length;

            for (index = 0; index < length; index += 1) {
                if (this[index] === value) {
                    return index;
                }
            }

            return -1;
        };
    }

    // ES5 15.4.4.19
    // http://es5.github.com/#x15.4.4.19
    // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
    if (!Array.prototype.map) {
        Array.prototype.map = function map(callback, thisArg) {
            var self = toObject(this),
                length = self.length >>> 0,
                result = Array(length),
                index;

            // If no callback function or if callback is not a callable function
            if (toString.call(callback) !== "[object Function]") {
                throw new TypeError(callback + " is not a function");
            }

            for (index = 0; index < length; index += 1) {
                if (index in self) {
                    result[index] = callback.call(thisArg, self[index], index, self);
                }
            }

            return result;
        };
    }

    if (!Object.keys) {
        Object.keys = function (obj) {
            var keys = [];

            for (key in obj) {
                keys.push(key);
            }

            return keys;
        };
    }

    if (!global.TypeError) {
        (function () {
            function TypeError(msg) {
                Error.call(msg);
            }
            TypeError.prototype = Object.create(Error.prototype);
            global.TypeError = TypeError;
        }());
    }

    if (!Object.create) {
        Object.create = function (extend) {
            function Fn() {}
            Fn.prototype = extend;
            return new Fn();
        };

        if (needsAccessorShim) {
            setupComponent();

            Object.defineProperty = function (obj, name, descriptor) {
                if (typeof descriptor !== "object" || descriptor === null) {
                    throw new TypeError("Property description must be an object: " + descriptor);
                }

                if (obj[transportName]) {
                    obj[transportName].defineProperty(name, descriptor);
                } else {
                    if (!hasOwnProperty.call(descriptor, "value")) {
                        throw new Error("Object.defineProperty() :: Only data descriptors supported on JScript objects");
                    }

                    obj[name] = descriptor.value;
                }

                return obj;
            };

            Object.defineProperties = function (obj, descriptors) {
                each(descriptors, function (descriptor, name) {
                    Object.defineProperty(obj, name, descriptor);
                }, { keys: true });

                return obj;
            };

            Object.getOwnPropertyDescriptor = function (obj, name) {
                if (obj[transportName]) {
                    return obj[transportName].getOwnPropertyDescriptor(name);
                }

                return {
                    configurable: true,
                    enumerable: true,
                    value: obj[name],
                    writable: true
                };
            };

            Object.getOwnPropertyNames = function (obj) {
                var name,
                    names,
                    lookup;

                if (typeof obj !== "object") {
                    throw new TypeError("Object.getOwnPropertyNames called on non-object");
                }

                if (obj === Array.prototype) {
                    names = info.array.names.slice();
                    lookup = Object.create(info.array.lookup);
                } else {
                    names = [];
                    lookup = {};
                }

                for (name in obj) {
                    if (hasOwnProperty.call(obj, name) && !lookup[name]) {
                        names.push(name);
                        lookup[name] = true;
                    }
                }

                if (obj[transportName]) {
                    names = names.concat(obj[transportName].getOwnPropertyNames(lookup));
                }

                return names;
            };

            Object.create = (function (parent) {
                return function (extend, propertyDescriptors) {
                    var obj;

                    if (extend === null || extend === Array.prototype) {
                        obj = createObject();

                        if (extend) {
                            obj.__proto__ = extend;
                        }

                        if (propertyDescriptors) {
                            Object.defineProperties(obj, propertyDescriptors);
                        }

                        return obj;
                    }

                    if (propertyDescriptors) {
                        throw new Error("Shim can only work for IE when extending null");
                    }

                    return parent(extend);
                }
            }(Object.create));
        }
    }

    // ES5 9.9
    // http://es5.github.com/#x9.9
    function toObject(obj) {
        if (obj === null || typeof obj === "undefined") {
            throw new TypeError("can't convert " + obj + " to object");
        }

        // If the implementation doesn't support by-index access of string characters (ex. IE < 9),
        // split the string
        if (noStringIndex && typeof obj === "string" && obj) {
            return obj.split("");
        }

        return Object(obj);
    }

    function each(object, callback, options) {
        var key,
            len;

        options = options || {};

        if (!object) {
            return;
        }

        if (typeof object.length !== "undefined" && !options.keys) {
            for (key = 0, len = object.length; key < len; key += 1) {
                if (callback.call(object[key], object[key], key) === false) {
                    break;
                }
            }
        } else {
            for (key in object) {
                if (object.hasOwnProperty(key)) {
                    if (callback.call(object[key], object[key], key) === false) {
                        break;
                    }
                }
            }
        }
        return object;
    }

    function setupComponent() {
        sandbox = new global.ActiveXObject("htmlfile");

        sandbox.open();
        sandbox.write(
            "<head>" +
                "<?import namespace='" + namespaceName + "' />" +
                "<script>document.namespaces['" + namespaceName + "'].doImport('" + namespacePath + "');</script>" +
            "</head><body></body>"
        );
        sandbox.close();

        function cleanUp() {
            global.detachEvent("onbeforeunload", cleanUp);

            /*each(objects, function (object) {
                each(hostPropertyNames, function (name) {
                    object[transportName].deleteProperty(name);
                });
                //sandbox.body.removeChild(object);
            });*/
            objects.length = 0;
            sandbox = null;
            CollectGarbage();
        }

        global.attachEvent("onunload", cleanUp);
    }

    function createObject() {
        var obj = sandbox.createElement(namespaceName + ":object"),
            transport;

        sandbox.body.appendChild(obj);
        //sandbox.body.removeChild(obj); // Might cause problems...

        objects.push(obj);

        transport = obj[transportName];

        if (!transport) {
            throw new Error("accessorIE shim .htc missing or served with wrong MIME type");
        }

        each(hostPropertyNames, function (name) {
            Object.defineProperty(obj, name, {
                value: undefined
            });
        });

        return transport.init(global);
    }
}());
