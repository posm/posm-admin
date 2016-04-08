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

POSM.deployment.updateLinksWithDeployment = function () {
    var deploymentName = POSM.deployment.getParam('deployment');
    // $('.deployment-title').html(manifest.title);
    $('a[href*="/deployment/"]').each(function () {
        $(this).attr('href', $(this).attr('href') + '?deployment=' + deploymentName);
    });
};

// Do this on each deployment page when the DOM is ready.
$(function () {
    POSM.deployment.updateLinksWithDeployment();
});

// Add check icon indicating current page on left menu
jQuery(window).ready(function () {
    var pathname = window.location.pathname; // Returns path only
    $(".mdl-navigation__link").each(function (i,o) {
        if (o.pathname == pathname.substring(0,pathname.length-1)) {
            $(o.childNodes[0]).text("done_all");
        }
    });

});

