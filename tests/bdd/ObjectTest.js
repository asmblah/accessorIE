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
        });

        describe("defineProperties", function () {

        });

        describe("getOwnPropertyDescriptor", function () {

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

                expect(obj.test).to.be.an("undefined");
            });
        });
    });
});
