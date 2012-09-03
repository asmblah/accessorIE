require({
    paths: {
        "js": "/../../../js",
        "bdd": ".",
        "lib": "/../../../lib",
        "orangeJS": "/../../../lib/orangeJS/js",
        "vendor": "../../vendor"
    }
}, [
    "bdd/ObjectTest"
], function () {
    "use strict";

    mocha.run();
});
