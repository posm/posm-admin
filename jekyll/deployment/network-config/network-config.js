$(function () {
    //TODO get from url
    var deployment = 'network-config';
    var pathname = window.location.pathname; // Returns path only
    // init socket.io
    var socket = io.connect({path:'/posm-admin/socket.io'});

    // get deployment status on page load
    POSM.deployment.updateDeploymentStatus(function(status){
        if(typeof status[deployment].msg === "string"){
            updateSupportMessage(status[deployment].msg);
        }

        showProgressSpinner(status[deployment]);
        updateDeploySubNav(status[deployment]);

    });

    $('#action-btn').click(function (evt) {
        var cfg = getSelectedNetworkConfig();
        console.log(cfg);
        //$.post('/posm-admin/render-db')
        //    .done(function (data) {
        //
        //        $('#snackbar').get(0).MaterialSnackbar.showSnackbar({
        //            message: data.msg,
        //            timeout: 3000,
        //            actionHandler: function (event) {
        //                // TODO Cancel
        //            },
        //            actionText: 'Cancel'
        //        });
        //    })
        //    .error(function(err){
        //        $('#snackbar').get(0).MaterialSnackbar.showSnackbar({
        //            message: JSON.parse(err.responseText).msg,
        //            timeout: 3000,
        //            actionHandler: function (event) {
        //                // TODO Cancel
        //            },
        //            actionText: 'Cancel'
        //        });
        //
        //        updateSupportMessage(JSON.parse(err.responseText).msg);
        //        POSM.updateNavBarStatusIcon(null,'error_outline');
        //
        //    });
        evt.preventDefault();
    });

    // listen for stdout on posm
    socket.on('network-config', function (iomsg) {
        // handles progress spinner
        showProgressSpinner(iomsg.status);

        // in progress
        if(iomsg.status.initialized){
            updateSupportMessage(iomsg.status.msg);
            // updateDeploySubNav(iomsg.status);
            POSM.updateNavBarStatusIcon('initialized');
            updateDeploySubNav(iomsg.status);
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
            // update status
            POSM.deployment.updateDeploymentStatus();
            // false means the scripts exited without trouble
            if (!iomsg.status.error) {
                updateSupportMessage('The full deployment script has been executed.');
                POSM.updateNavBarStatusIcon('complete');
                updateDeploySubNav(iomsg.status);

                // var manifest = iomsg.manifest;
                // if (manifest) {
                //     receiveManifest(manifest);
                // }
            } else {
                updateSupportMessage('There was a problem with fetching and unpacking the HOT Export tar.gz.');
                POSM.updateNavBarStatusIcon(null,'error');
            }
        }

    });

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

    // update deploy sub scripts icons
    function updateDeploySubNav (status, selector){

        $(".deploy-sub-nav li").each(function (i,o) {
            if (status[o.id]) {
                var icon_text = (status[o.id].initialized) ? 'compare_arrows' : 'brightness_1';
                icon_text = (status[o.id].complete) ? 'check_circle' : icon_text;
                $(o.childNodes[0]).text(icon_text);
            }
        });
    }

    // get selected radio button
    function getSelectedNetworkConfig() {
        var checkedRadio;

        $(":radio").each(function (index, value) {
            if ($(value).parent().hasClass("is-checked")) {
                checkedRadio = value.id;
            }
        });

        return checkedRadio;
    }

});
