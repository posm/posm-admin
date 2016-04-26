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

/**
 * get status of all deployment and update icons in menu
 */
POSM.deployment.updateDeploymentStatus = function (cb){
    // get all statuses
    $.get('/posm-admin/status')
        .done(function (data) {
            // loop through all deployments
            Object.keys(data).forEach(function(d){
                // match deployment name with url's for each item in sidenav menu
                $(".mdl-navigation__link").each(function (i,o) {
                    if (d == o.pathname.substring(o.pathname.indexOf(d), o.pathname.length)) {
                        var icon;
                        if(data[d].error) icon = 'error_outline';
                        if(data[d].initialized) icon = 'compare_arrows';
                        if(data[d].complete) icon = 'check_circle';
                        
                        $(o.childNodes[1]).text(icon || 'brightness_1');
                    }
                });
            });

            if(cb) cb(data);
        });
};

// Do this on each deployment page when the DOM is ready.
$(function () {
    // POSM.deployment.updateLinksWithDeployment();
    POSM.deployment.updateDeploymentStatus();
});

// Add check icon indicating current page on left menu
jQuery(window).ready(function () {
    var pathname = window.location.pathname; // Returns path only
    $(".mdl-navigation__link").each(function (i,o) {
        if (o.pathname == pathname.substring(0,pathname.length-1)) {
            $(o).addClass("active");
        }
    });

});

