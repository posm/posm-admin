$(function () {
    $('#hot-export-url-fetch-btn').click(function (evt) {
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

                // Init socket.io to listen based off
                // of uuid of fetch-hot-export operation
                var socket = io.connect(null, { resource: 'socket.io' });
                socket.on(data.uuid, function (iomsg) {
                    console.log(iomsg);
                    $('#console').append(iomsg.output);
                });
            });
        evt.preventDefault();
    });
});


