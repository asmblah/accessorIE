define([
    "vendor/chai/chai"
], function (
    chai
) {
    "use strict";

    var expect = chai.expect;

    describe("Object", function () {
        var obj;

        before(function () {
            obj = Object.create(null);
        });

        describe("create", function () {
            it("should return an Object", function () {
                expect(Object.create(null)).to.be.an("object");
            });
        });

        describe("defineProperty", function () {
            it("should throw a TypeError if given a null descriptor", function () {
                expect(function () {
                    Object.defineProperty(obj, "prop", null);
                }).to.Throw(TypeError);
            });

            it("should support 'length' property", function () {
                Object.defineProperty(obj, "length", {
                    get: function () {
                        return 7;
                    }
                });

                expect(obj.length).to.equal(7);
            });

            it("should work with existing DOM objects", function () {
                var obj = document.createElement("span");

                Object.defineProperty(obj, "prop", {
                    value: 9
                });

                expect(obj.prop).to.equal(9);
            });

            describe("for a data descriptor", function () {
                it("should default 'configurable' data descriptor attribute to false", function () {
                    Object.defineProperty(obj, "parent", {
                        value: "guardian"
                    });

                    expect(Object.getOwnPropertyDescriptor(obj, "parent").configurable).to.equal(false);
                });

                it("should default 'enumerable' data descriptor attribute to false", function () {
                    Object.defineProperty(obj, "parent", {
                        value: "guardian"
                    });

                    expect(Object.getOwnPropertyDescriptor(obj, "parent").enumerable).to.equal(false);
                });

                it("should default 'writable' data descriptor attribute to false", function () {
                    Object.defineProperty(obj, "parent", {
                        value: "guardian"
                    });

                    expect(Object.getOwnPropertyDescriptor(obj, "parent").writable).to.equal(false);
                });
            });
        });

        describe("defineProperties", function () {
            it("should not error when given an empty hash of descriptors", function () {
                Object.defineProperties(obj, {});
            });

            it("should be able to define a single property", function () {
                var descriptor = {
                    configurable: true,
                    enumerable: true,
                    value: "Frank",
                    writable: true
                };

                Object.defineProperties(obj, {
                    name: descriptor
                });

                expect(Object.getOwnPropertyDescriptor(obj, "name")).to.eql(descriptor);
            });
        });

        describe("getOwnPropertyDescriptor", function () {
            describe("for a data descriptor", function () {
                it("should return all relevant descriptor attributes", function () {
                    Object.defineProperty(obj, "parent", {
                        value: "guardian"
                    });

                    expect(Object.getOwnPropertyDescriptor(obj, "parent")).to.eql({
                        configurable: false,
                        enumerable: false,
                        value: "guardian",
                        writable: false
                    });
                });
            });
        });

        describe("getOwnPropertyNames", function () {

        });

        describe("getPrototypeOf", function () {

        });

        describe("__proto__", function () {
            it("should handle null prototype", function () {
                obj.prototype = null;
            });

            it("should remove properties inherited from previous prototype when prototype is changed", function () {
                obj.__proto__ = {
                    test: 3
                };

                obj.__proto__ = null;

                expect(obj.test).to.be.undefined;
            });
        });
    });
});
