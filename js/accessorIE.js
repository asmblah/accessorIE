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
        Object = global.Object,
        document = global.document,
        needsAccessorShim = !!global.execScript,
        namespacePath = null,
        namespaceName = "accessorIE",
        transportName = "__transport__";

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

    if (!Object.keys) {
        Object.keys = function (obj) {
            var keys = [];

            for (key in obj) {
                keys.push(key);
            }

            return keys;
        };
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
                obj[transportName].defineProperty(name, descriptor);

                return obj;
            };

            Object.defineProperties = function (obj, descriptors) {
                each(descriptors, function (descriptor, name) {
                    Object.defineProperty(obj, name, descriptor);
                });

                return obj;
            };

            Object.getOwnPropertyDescriptor = function (obj, name) {
                return obj[transportName].getOwnPropertyDescriptor(name);
            };

            Object.create = (function (parent) {
                return function (extend, propertyDescriptors) {
                    var obj;

                    if (extend === null) {
                        obj = createObject();

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
        var namespace = document.namespaces.add(namespaceName);

        document.getElementsByTagName("head")[0].insertAdjacentHTML("beforeEnd", "<?import namespace='" + namespaceName + "' implementation='" + namespacePath + "'> /");

        namespace.doImport(namespacePath);
    }

    function createObject() {
        var obj = document.createElement(namespaceName + ":object");

        document.appendChild(obj);

        if (!obj[transportName]) {
            throw new Error("accessorIE shim .htc missing or served with wrong MIME type");
        }

        return obj;
    }
}());
