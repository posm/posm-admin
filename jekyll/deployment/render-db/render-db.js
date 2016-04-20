$(function () {
    //TODO get from url
    var deployment = "render-db";
    var pathname = window.location.pathname; // Returns path only
    var deploymentStatus;
    // init socket.io
    var socket = io.connect({path:'/posm-admin/socket.io'});

    // get deployment status on page load
    POSM.deployment.updateDeploymentStatus(function(data){
        deploymentStatus = data[deployment];
        updateSupportMessage(deploymentStatus.msg);
        showProgressSpinner(deploymentStatus);
    });

    $('#action-btn').click(function (evt) {
        $.post('/posm-admin/render-db')
            .done(function (data) {

                $('#snackbar').get(0).MaterialSnackbar.showSnackbar({
                    message: data.msg,
                    timeout: 3000,
                    actionHandler: function (event) {
                        // TODO Cancel
                    },
                    actionText: 'Cancel'
                });
            })
            .error(function(err){
                $('#snackbar').get(0).MaterialSnackbar.showSnackbar({
                    message: JSON.parse(err.responseText).msg,
                    timeout: 3000,
                    actionHandler: function (event) {
                        // TODO Cancel
                    },
                    actionText: 'Cancel'
                });

                updateSupportMessage(JSON.parse(err.responseText).msg);
                updateNavBarStatusIcon(null,'error_outline');

            });
        evt.preventDefault();
    });

    // listen for stdout on posm
    socket.on('render-db', function (iomsg) {
        // handles progress spinner
        showProgressSpinner(iomsg.status);

        // in progress
        if(iomsg.status.initialized){
            updateSupportMessage(iomsg.status.msg);
            // updateDeploySubNav(iomsg.status);
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
            // false means the scripts exited without trouble
            if (!iomsg.status.error) {
                updateSupportMessage('The full deployment script has been executed.');
                updateNavBarStatusIcon('complete');

                // var manifest = iomsg.manifest;
                // if (manifest) {
                //     receiveManifest(manifest);
                // }
            } else {
                updateSupportMessage('There was a problem with fetching and unpacking the HOT Export tar.gz.');
                updateNavBarStatusIcon(null,'error');
            }
        }

    });

    // // Get deployment name.
    // var deploymentName = POSM.deployment.getParam('deployment');

    // // Check the status of the deployment.
    // checkStatus(deploymentName);
    //
    // // Listen for updates on the status from socket.io
    // listenForStatusUpdates(socket, deploymentName);
    //
    // // Handle click of the action buttons.
    // handleApi2PbfButton(deploymentName);
    // handlePbf2RenderButton(deploymentName);
    // handleAllButton(deploymentName);

    function checkStatus(deploymentName) {
        if (typeof deploymentName !== 'string') return;
        var url = '/posm-admin/status?deployment=' + deploymentName;
        $.get(url, function (data) {
            updateUIFromStatus(data);
        }).fail(function() {
            // QUICK FIX: .showSnackbar is not always a function ???
            setTimeout(function () {
                $('#snackbar').get(0).MaterialSnackbar.showSnackbar({
                    message: 'There is no deployment with the name: ' + deploymentName,
                    timeout: 100000,
                    actionHandler: function (event) {
                        window.location = '/posm-admin/deployment/'
                    },
                    actionText: 'Start over'
                });
            }, 500);
        });
    }

    function listenForStatusUpdates(socket, deploymentName) {
        socket.on('render-db', function (iomsg) {
            console.log(iomsg);
            if (iomsg.output) {
                $('#console').append(iomsg.output);
            }

            // done
            if (iomsg.close) {
                var $instructionsDiv = $('#instructions-div');
                $instructionsDiv.show();
                $('#supporting-msg-div').hide();
                // false means the scripts exited without trouble
                if (iomsg.code === false) {
                    $instructionsDiv.html('operation complete');
                } else {
                    $instructionsDiv.html('error');
                }
            }

            // status update
            if (iomsg.status) {
                updateUIFromStatus(iomsg.status);
            }
        });
    }

    function updateUIFromStatus(status) {
        var keys = Object.keys(status);
        for (var i = 0, len = keys.length; i < len; i++) {
            var key = keys[i];
            var val = status[key];
            // it was a success
            if (val === 'done') {
                $('a[href*="/'+key+'/"]>i').html('check_circle');
            }
            // it was a failure
            else {
                $('a[href*="/'+key+'/"]>i').html('error');
            }
        }
    }

    function handleApi2PbfButton(deploymentName) {
        $('#api2pbf-btn').click(function (evt) {
            $.post('/posm-admin/render-db/api2pbf', {deployment: deploymentName})
                .done(function (data) {

                    $('#supporting-msg-div').show();
                    $('#instructions-div').hide();
                    $('#supporting-msg-txt').html(data.msg);

                    listenForStatusUpdates(socket, data.deployment);

                });
            evt.preventDefault();
        });
    }

    function handlePbf2RenderButton(deploymentName) {
        $('#pbf2render-btn').click(function (evt) {
            $.post('/posm-admin/render-db/pbf2render', {deployment: deploymentName})
                .done(function (data) {

                    $('#supporting-msg-div').show();
                    $('#instructions-div').hide();
                    $('#supporting-msg-txt').html(data.msg);

                    listenForStatusUpdates(socket, data.deployment);

                });
            evt.preventDefault();
        });
    }

    function handleAllButton(deploymentName) {
        $('#reset-and-populate-btn').click(function (evt) {
            $.post('/posm-admin/render-db/all', {deployment: deploymentName})
                .done(function (data) {

                    $('#supporting-msg-div').show();
                    $('#instructions-div').hide();
                    $('#supporting-msg-txt').html(data.msg);

                    listenForStatusUpdates(socket, data.deployment);

                });
            evt.preventDefault();
        });
    }

    // hide spinner and disable action button
    function showProgressSpinner (status) {
        if(status.initialized){
            $("#render-db-progress-spinner").show();
            // disable star button
            $("#action-btn").prop("disabled", true);
        } else {
            $("#render-db-progress-spinner").hide();
            $("#action-btn").prop("disabled", false);
        }
    }

    // update status message above url input
    function updateSupportMessage (text) {
        $('#supporting-msg-txt').html(text);
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
