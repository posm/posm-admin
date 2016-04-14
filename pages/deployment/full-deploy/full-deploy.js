$(function () {
    // init socket.io
    var socket = io.connect({path:'/posm-admin/socket.io'});
    var deployment = "full-deploy";
    var pathname = window.location.pathname; // Returns path only

    // fetch status
    var postJson = {};
    postJson.deployment = deployment;

    // get deployment status on page load
    $.get('/posm-admin/status?deployment=' + deployment)
        .done(function (data) {
            // Deployment has begun
            if(data.initialized) {
                updateNavBarStatusIcon('initialized');
                updateSupportMessage(data.msg);
            }
            // Deployment complete
            else if (data.complete) {
                updateNavBarStatusIcon('complete');
                updateSupportMessage(data.msg);
            }
            // Development has not begun
             else if(!data.initialized) {
                updateSupportMessage("Enter the URL of the HOT Export tar.gz to begin the full deployment.");
            }

        });

    $('#action-btn').click(function (evt) {
        var postJson = {};
        postJson.url = $('#hot-export-url-input').val();
        $.post('/posm-admin/full-deploy', postJson)
            .done(function (data) {

                $('#snackbar').get(0).MaterialSnackbar.showSnackbar({
                    message: data.msg,
                    timeout: 3000,
                    actionHandler: function (event) {
                        // TODO Cancel
                    },
                    actionText: 'Cancel'
                });
            });
        evt.preventDefault();
    });

    socket.on('full-deploy', function (iomsg) {

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
            if (!iomsg.error) {
                updateSupportMessage('The full deployment script has been executed.');
                updateNavBarStatusIcon('complete');

                var manifest = iomsg.manifest;
                if (manifest) {
                    receiveManifest(manifest);
                }
            } else {
                updateSupportMessage('There was a problem with fetching and unpacking the HOT Export tar.gz.');
                updateNavBarStatusIcon(null,'error');
            }
        }

    });

    function updateSupportMessage (text) {
        $('#supporting-msg-txt').html(text);
    }

    function updateNavBarStatusIcon (status, icon) {
        var icon_text = (status == 'initialized') ? 'compare_arrows' : 'check_circle';
        if (icon) icon_text = icon;

        $(".mdl-navigation__link").each(function (i,o) {
            if (o.pathname == pathname.substring(0,pathname.length-1)) {
                $(o.childNodes[0]).text(icon_text);
            }
        });

        if(status == 'initialized'){
            $("#progressSpinner").show();
            // disable star button
            $("#action-btn").prop("disabled", true);
            
        } else {
            $("#progressSpinner").hide();
        }
    }

    function receiveManifest(manifest) {
        $('.deployment-title').html(manifest.title);
        $('a[href*="/deployment/"]').each(function () {
            $(this).attr('href', $(this).attr('href') + '?deployment=' + manifest.name);
        });
        window.history.replaceState({} , manifest.title, window.location.href.split('?')[0] + '?deployment=' + manifest.name);
    }

});
