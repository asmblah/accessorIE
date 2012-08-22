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

    var global = new [Function][0]("return this;")(),
        needsAccessorShim = !!global.execScript,
        globalTransportKey = "AccessorZ__",
        globalTransport,
        nextIndex = 0,
        allPropertyDescriptors = {};

    if (!Object.create) {
        Object.create = function (extend) {
            function Fn() {}
            Fn.prototype = extend;
            return new Fn();
        };

        if (needsAccessorShim) {
            setupTransport();

            Object.create = (function (parent) {
                return function (extend, propertyDescriptors) {
                    if (propertyDescriptors) {
                        if (extend !== Object.prototype) {
                            throw new Error("Shim can only work for IE when extending Object.prototype");
                        }

                        return createObject(propertyDescriptors);
                    }

                    return parent(extend);
                }
            }(Object.create));
        }
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

    function setupTransport() {
        globalTransport = {
            lastObject: null,

            get: function (objectName, propertyName) {
                var propertyDescriptor = allPropertyDescriptors[objectName][propertyName];

                if (propertyDescriptor.hasOwnProperty("value")) {
                    return propertyDescriptor.value;
                } else {
                    return propertyDescriptor.get();
                }
            },

            set: function (objectName, propertyName, value) {
                var propertyDescriptor = allPropertyDescriptors[objectName][propertyName];

                if (propertyDescriptor.hasOwnProperty("value")) {
                    propertyDescriptor.value = value;
                } else {
                    propertyDescriptor.set(value);
                }
            }
        };

        global[globalTransportKey] = globalTransport;
    }

    function execVBScript(code) {
        global.execScript(code, "VBScript");
    }

    function buildAccessors(objectName, propertyName) {
        function buildCallback(type, value) {
            return "window." + globalTransportKey + "." + type + (value ? " " : "(") + "\"" + objectName + "\", \"" + propertyName + "\"" + (value ? ", " + value : "") + (value ? "" : ")");
        }

        // TODO: Simple properties don't need accessors
        return (
            "Public Property Get " + propertyName + "()\n" + propertyName + " = " + buildCallback("get") + "\n" + "End Property\n" +
            "Public Property Let " + propertyName + "(value__)\n" + buildCallback("set", "value__") + "\n" + "End Property\n" +
            "Public Property Set " + propertyName + "(value__)\n" + buildCallback("set", "value__") + "\n" + "End Property\n"
        );
    }

    function createObject(propertyDescriptors) {
        var objectName = "AccessorZ_" + nextIndex,
            accessorCode = "",
            definitionCode;

        each(propertyDescriptors, function (definition, name) {
            accessorCode += buildAccessors(objectName, name);
        });

        allPropertyDescriptors[objectName] = propertyDescriptors;

        definitionCode =
            "Class " + objectName + "\n" + accessorCode + "End Class\n" +
            "Set window." + globalTransportKey + ".lastObject = New " + objectName + "\n";

        execVBScript(definitionCode);

        nextIndex += 1;

        return globalTransport.lastObject;
    }
}());
