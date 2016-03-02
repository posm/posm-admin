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
$(function() {
	POSM.deployment.updateLinksWithDeployment();
});
