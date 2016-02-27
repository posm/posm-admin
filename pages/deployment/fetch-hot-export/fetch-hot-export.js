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
                    timeout: 3000,
                    actionHandler: function (event) {
                        // TODO Cancel
                    },
                    actionText: 'Cancel'
                });

                var $instructionsDiv = $('#instructions-div');
                $('#supporting-msg-div').show();
                $instructionsDiv.hide();
                $('#supporting-msg-txt').html(data.msg);

                socket.on(data.uuid, function (iomsg) {
                    console.log(iomsg);
                    if (iomsg.output) {
                        $('#console').append(iomsg.output);
                    }

                    // done
                    if (iomsg.close) {
                        $instructionsDiv.show();
                        $('#supporting-msg-div').hide();
                        // false means the scripts exited without trouble
                        if (iomsg.code === false) {
                            $('#instructions-div').html('HOT Export tar.gz has been fetched and unpacked. Press fetch to redo.');
                            $('a[href*="/fetch-hot-export/"]>i').html('check_circle');
                            var manifest = iomsg.manifest;
                            if (manifest) {
                                receiveManifest(manifest);
                            }
                        } else {
                            $('#instructions-div').html('There was a problem with fetching and unpacking the HOT Export tar.gz.');
                            $('a[href$="fetch-hot-export/"]>i').html('error');
                        }
                    }

                });
            });
        evt.preventDefault();
    });

    function receiveManifest(manifest) {
        $('.deployment-title').html(manifest.title);
        $('a[href*="/deployment/"]').each(function () {
            $(this).attr('href', $(this).attr('href') + '?deployment=' + manifest.name);
        });
        window.history.replaceState({} , manifest.title, window.location.href.split('?')[0] + '?deployment=' + manifest.name);
    }

});
