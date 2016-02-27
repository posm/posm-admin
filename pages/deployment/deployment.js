var POSM = {};
POSM.deployment = {};

/**
 * Parses a query parameter.
 *
 * @param name
 * @returns {string}
 */
POSM.deployment.getParam = function (name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};
