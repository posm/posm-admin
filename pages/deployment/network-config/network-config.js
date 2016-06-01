$(function () {
    //TODO get from url
    var deployment = 'network-config';
    var pathname = window.location.pathname; // Returns path only
    // init socket.io
    var socket = io.connect({path:'/posm-admin/socket.io'});
    var subTasks = ['wpa', 'wpa-passphrase', 'network-mode', 'ssid'];

    // get deployment status on page load
    POSM.deployment.updateDeploymentStatus(function(status){
        if(typeof status[deployment].msg === "string"){
            updateSupportMessage(status[deployment].msg);
        }

        showProgressSpinner(status[deployment]);
        updateDeploySubNav(status[deployment]);
        addTextFieldOnClickEvents(status[deployment]);

    });

    $('#action-btn').click(function (evt) {
        var cfg = getSelectedNetworkConfig();
        var value = getConfigValue(cfg);

        if(typeof value === 'string' && typeof cfg === 'string') {
            $.post('/posm-admin/network-config/' + cfg + '?value=' + value)
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
                .error(function (err) {
                    $('#snackbar').get(0).MaterialSnackbar.showSnackbar({
                        message: JSON.parse(err.responseText).msg,
                        timeout: 3000,
                        actionHandler: function (event) {
                            // TODO Cancel
                        },
                        actionText: 'Cancel'
                    });

                    updateSupportMessage(JSON.parse(err.responseText).msg);
                    POSM.updateNavBarStatusIcon(null, 'error_outline');

                });
        }
        evt.preventDefault();
    });

    // listen for stdout on posm
    socket.on('network-config', function (iomsg) {
        // handles progress spinner
        showProgressSpinner(iomsg.status);
        updateDeploySubNav(iomsg.status);
        POSM.deployment.updateDeploymentStatus();

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
            //updateDeploySubNav(iomsg.status);
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

        $(":radio").each(function(index,value){
            var id = value.id;
            $(".sub-task").each(function(index,value){
                var icon = value.children[0];
                var inputId = value.children[1].id.replace("-textfield", "");

                if (status[id] && inputId == id){
                    var iconType;

                    if(status[id].error) iconType = 'error_outline';
                    if(status[id].initialized) iconType = 'compare_arrows';
                    if(status[id].complete) iconType = 'check_circle';

                    $(icon).text(iconType);
                }

            })
        })

        //$(".deploy-sub-nav li").each(function (i,o) {
        //    if (status[o.id]) {
        //        var icon_text = (status[id].initialized) ? 'compare_arrows' : 'brightness_1';
        //        icon_text = (status[id].complete) ? 'check_circle' : icon_text;
        //        $(o.childNodes[0]).text(icon_text);
        //    }
        //});
    }

    // get selected radio button, return config name
    function getSelectedNetworkConfig() {
        var checkedRadio;

        $(":radio").each(function (index, value) {
            if ($(value).parent().hasClass("is-checked")) {
                checkedRadio = value.id;
            }
        });

        return checkedRadio;
    }

    function getConfigValue(cfg){
        var value;

        if(cfg === 'wpa' || cfg === 'wpa-passphrase' || cfg === 'ssid'){
            value = $('#' + cfg + '-textfield').val();
        }

        return value;
    }

    // select radio button on text input click
    function addTextFieldOnClickEvents(status) {

        subTasks.forEach(function(task){
            var value = status[task].value
            if(task !== 'network-mode'){
                $('#' + task + '-textfield').click(function(){
                    // find the corresponding radio button and check
                    $(":radio").each(function (index, value) {
                        if (value.id === task) {
                            $(value).parent().addClass("is-checked");
                        } else {
                            $(value).parent().removeClass("is-checked");
                        }

                    })
                })
            }

            if (typeof value === 'string'){
                $('#' + task + '-textfield').val(value);
                $('#' + task + '-textfield-label').html('');
            }
        })

    }
});