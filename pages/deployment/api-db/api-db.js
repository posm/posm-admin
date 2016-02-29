$(function () {

    // init socket.io
    var socket = io.connect();

    // Get deployment name.
    var deploymentName = POSM.deployment.getParam('deployment');

    // Check the status of the deployment.
    checkStatus(deploymentName);

    // Listen for updates on the status from socket.io
    listenForStatusUpdates(socket, deploymentName);

    // Handle click of the action button.
    handleActionButton(deploymentName);



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
        socket.on('deployments/' + deploymentName, function (iomsg) {
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
                    $instructionsDiv.html('The .xlsx files have been converted to XForm XML and moved to OpenMapKit Server. Press CONVERT AND MOVE to redo.');
                } else {
                    $instructionsDiv.html('There was a problem with fetching and unpacking the HOT Export tar.gz.');
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

    function handleActionButton(deploymentName) {
        $('#action-btn').click(function (evt) {
            $.post('/posm-admin/xls2xform', {deployment: deploymentName})
                .done(function (data) {

                    $('#snackbar').get(0).MaterialSnackbar.showSnackbar({
                        message: data.msg,
                        timeout: 5000,
                        actionHandler: function (event) {
                            // TODO Cancel
                        },
                        actionText: 'Cancel'
                    });

                    $('#supporting-msg-div').show();
                    $('#instructions-div').hide();
                    $('#supporting-msg-txt').html(data.msg);

                    listenForStatusUpdates(socket, data.deployment);

                });
            evt.preventDefault();
        });
    }

});
