$(function () {
    // init socket.io
    var socket = io.connect({path:'/posm-admin/socket.io'});
    var deployment = "full-deploy";
    var pathname = window.location.pathname; // Returns path only
    var deploymentStatus;

    // get deployment status on page load
    POSM.deployment.updateDeploymentStatus(function(data){
        deploymentStatus = data[deployment];
        updateSupportMessage(deploymentStatus.msg);
        showProgressSpinner(deploymentStatus);

        if(!deploymentStatus.initialized && !deploymentStatus.complete) {
            updateSupportMessage("Enter the URL of the HOT Export tar.gz to begin the full deployment.");
        } else {
            // add hot export URL when page is opened during installation
            if($('#hot-export-url-input').val() == "") {
                $('#hot-export-url-input').val(deploymentStatus.exportUrl);
                // remove background label
                $("#hot-export-url-input-label").html("");
            }
        }

    });

    // do this on url submission
    $('#action-btn').click(function (evt) {
        var postJson = {};
        postJson.url = $('#hot-export-url-input').val();
        $.post('/posm-admin/full-deploy', postJson)
            .done(function (data) {

                $('#snackbar').get(0).MaterialSnackbar.showSnackbar({
                    message: data.msg,
                    timeout: 3000,
                    actionText: 'Cancel'
                });
                POSM.deployment.updateDeploymentStatus();
            }).error(function(err){

            $('#snackbar').get(0).MaterialSnackbar.showSnackbar({
                message: JSON.parse(err.responseText).msg,
                timeout: 3000,
                actionText: 'Cancel'
            });
            updateSupportMessage(JSON.parse(err.responseText).msg);
            POSM.deployment.updateDeploymentStatus();
        });

        evt.preventDefault();
    });

    // cancel process
    $('#cancelProcess').click(function (evt){
        socket.emit(deployment + '/kill');
    });

    // listen for stdout on posm
    socket.on('full-deploy', function (iomsg) {
        // handle progress spinner
        showProgressSpinner(iomsg.status);

        // add hot export URL when page is opened during installation
        if($('#hot-export-url-input').val() == "") {
            $('#hot-export-url-input').val(iomsg.exportUrl);
            // remove background label
            $("#hot-export-url-input-label").html("");
        }

        // in progress
        if(iomsg.status.initialized){
            updateSupportMessage(iomsg.status.msg);
            updateNavBarStatusIcon('initialized');
        }

        if (iomsg.output) {
            if(iomsg.status.error){
                // red console text on error
                var span = $('<span />').addClass("msg-error").html(iomsg.output);
                $('#console').append(span);
            } else {
                $('#console').append(iomsg.output);
            }
            // keep scroll at bottom of console output
            var d = $('#console');
            d.scrollTop(d.prop("scrollHeight") + 45);
        }

        // done
        if (iomsg.status.complete) {
            POSM.deployment.updateDeploymentStatus();
            // false means the scripts exited without trouble
            if (!iomsg.status.error) {
                updateSupportMessage(iomsg.status.msg);
                updateNavBarStatusIcon('complete');

                var manifest = iomsg.manifest;
                if (manifest) {
                    receiveManifest(manifest);
                }
            } else {
                updateNavBarStatusIcon(null,'error');
            }
        }

    });

    // update status message above url input
    function updateSupportMessage (text) {
        $('#supporting-msg-txt').html(text);
    }

    // hide spinner and disable action button
    function showProgressSpinner (status) {
        if(status.initialized){
            $("#full-deploy-progress-spinner").show();
            // disable star button
            $("#action-btn").prop("disabled", true);
        } else {
            $("#full-deploy-progress-spinner").hide();
            $("#action-btn").prop("disabled", false);

        }
    }

    function receiveManifest(manifest) {
        $('.deployment-title').html(manifest.title);
        $('a[href*="/deployment/"]').each(function () {
            $(this).attr('href', $(this).attr('href') + '?deployment=' + manifest.name);
        });
        window.history.replaceState({} , manifest.title, window.location.href.split('?')[0] + '?deployment=' + manifest.name);
    }

    // update nav bar icon
    function updateNavBarStatusIcon (status, icon) {
        var icon_text = (status == 'initialized') ? 'compare_arrows' : 'check_circle';
        if (icon) icon_text = icon;

        $(".mdl-navigation__link").each(function (i,o) {
            if (o.pathname == pathname.substring(0,pathname.length-1)) {
                $(o.childNodes[0]).text(icon_text);
            }
        });
    }

});
