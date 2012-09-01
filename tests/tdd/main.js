require({
    paths: {
        "js": "/../../../js",
        "tdd": ".",
        "lib": "/../../../lib",
        "orangeJS": "/../../../lib/orangeJS/js"
    }
}, [
    "tdd/accessorIETest"
], function () {
    "use strict";

    mocha.run();
});
