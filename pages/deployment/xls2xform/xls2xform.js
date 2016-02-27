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
                    if (iomsg.close) {
                        if (iomsg.code === false) {

                        }
                    }
                });
            });
        evt.preventDefault();
    });
});


