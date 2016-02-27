$(function () {

    // init socket.io
    var socket = io.connect();

    // Get deployment name.
    var deploymentName = POSM.deployment.getParam('deployment');

    // Check the status of the deployment.
    checkStatus(deploymentName);

    // Listen for updates on the status from socket.io
    listenStatus(socket, deploymentName);

    // Handle click of the action button.
    handleActionButton();


    $('#snackbar').get(0).MaterialSnackbar.showSnackbar({
        message: {message: 'message'},
        timeout: 3000,
        actionHandler: function (event) {
            // TODO Cancel
        },
        actionText: 'Cancel'
    });


    function checkStatus(deploymentName) {
        if (typeof deploymentName !== 'string') return;
        var url = '/posm-admin/status?deployment=' + deploymentName;
        $.get(url, function (data) {
            console.log(data);
        }).fail(function() {

        });
    }

    function listenStatus(socket, deploymentName) {

    }

    function handleActionButton() {
        $('#action-btn').click(function (evt) {
            var postJson = {};
            postJson.url = $('#hot-export-url-input').val();
            $.post('/posm-admin/fetch-hot-export', postJson)
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

                    socket.on(data.uuid, function (iomsg) {
                        console.log(iomsg);
                        if (iomsg.output) {
                            $('#console').append(iomsg.output);
                        }
                        if (iomsg.close) {
                            if (iomsg.code === false) {

                            }
                        }
                    });
                });
            evt.preventDefault();
        });
    }

});
