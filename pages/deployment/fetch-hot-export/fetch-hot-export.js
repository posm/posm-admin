$(function () {
    // init socket.io
    var socket = io.connect();

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

                    // done
                    if (iomsg.close) {
                        $('#instructions-div').show();
                        $('#supporting-msg-div').hide();
                        // false means the scripts exited without trouble
                        if (iomsg.code === false) {
                            $('#instructions-div').html('HOT Export tar.gz has been fetched and unpacked. Press fetch to redo.');
                        } else {
                            $('#instructions-div').html('There was a problem with fetching and unpacking the HOT Export tar.gz.');
                        }
                    }

                });
            });
        evt.preventDefault();
    });
});


