$(function () {
    // init socket.io
    var socket = io.connect({path: '/posm-admin/socket.io'});
    var deployment = "aoi-deploy";
    var pathname = window.location.pathname; // Returns path only
    var deploymentStatus;

    // get deployment status on page load
    POSM.deployment.updateDeploymentStatus(function (status) {
        deploymentStatus = status[deployment];
        showProgressSpinner(deploymentStatus);

        addHotExportURLTextField(status);

        // add list of deployment radio buttons
        status["aoi-list"].forEach(function (obj) {
            // get parent div
            var $deployContent = $("#deploy-content");

            // create label, add classes and attributes
            var $label = $("<label></label>");
            $label.addClass("deploy-list mdl-radio mdl-js-radio mdl-js-ripple-effect");
            $label.attr("for", obj.name);

            // create input, add classes & attributes
            // activeAOI is checked
            var $input = (obj.name == status.activeAOI) ? $("<input checked>") : $("<input>");
            $input.addClass("mdl-radio__button");
            $input.attr("id", obj.name).attr("name", "aoi-deploy").attr("type", "radio");

            // create span, add classes & attributes
            var $span = $("<span></span>");
            $span.addClass("mdl-radio__label").html(obj.label + ' (' + obj.name + ')');

            // add input and span to label
            $label.append($input);
            $label.append($span);

            // add label to parent div after 2nd child
            $deployContent.children(":eq(2)").after($label);
        });

    });

    // do this on url submission
    $('#action-btn').click(function (evt) {
        var postJson = {};
        postJson.url = $('#hot-export-url-input').val();
        postJson.aoi = getSelectedAOI();

        $.post('/posm-admin/aoi-deploy', postJson)
            .done(function (data) {
                $('#snackbar').get(0).MaterialSnackbar.showSnackbar({
                    message: data.msg,
                    timeout: 3000,
                    actionText: 'Cancel'
                });
                POSM.deployment.updateDeploymentStatus();
            }).error(function (err) {

            $('#snackbar').get(0).MaterialSnackbar.showSnackbar({
                message: JSON.parse(err.responseText).msg,
                timeout: 3000,
                actionText: 'Cancel'
            });
            updateSupportMessage(JSON.parse(err.responseText).msg);
            POSM.deployment.updateDeploymentStatus();
        });

        evt.preventDefault();
    });

    // cancel process
    $('#cancelProcess').click(function (evt) {
        socket.emit(deployment + '/kill');
    });

    // listen for stdout on posm
    socket.on('aoi-deploy', function (iomsg) {
        // handle progress spinner
        showProgressSpinner(iomsg.status);

        // add hot export URL when page is opened during installation
        if ($('#hot-export-url-input').val() == "") {
            $('#hot-export-url-input').val(iomsg.exportUrl);
            // remove background label
            $("#hot-export-url-input-label").html("");
        }

        // in progress
        if (iomsg.status.initialized) {
            updateSupportMessage(iomsg.status.msg);
            POSM.updateNavBarStatusIcon('initialized');
        }

        if (iomsg.output) {
            if (iomsg.status.error) {
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
            POSM.deployment.updateDeploymentStatus();
            // false means the scripts exited without trouble
            if (!iomsg.status.error) {
                updateSupportMessage(iomsg.status.msg);
                POSM.updateNavBarStatusIcon('complete');

                var manifest = iomsg.manifest;
                if (manifest) {
                    receiveManifest(manifest);
                }
            } else {
                POSM.updateNavBarStatusIcon(null, 'error');
                updateSupportMessage('Error completing the deployment.')
            }
        }

    });

    // update status message above url input
    function updateSupportMessage(text) {
        $('#supporting-msg-txt').html(text);
    }

    // hide spinner and disable action button
    function showProgressSpinner(status) {
        if (status.initialized) {
            $("#aoi-deploy-progress-spinner").show();
            // disable star button
            $("#action-btn").prop("disabled", true);
        } else {
            $("#aoi-deploy-progress-spinner").hide();
            $("#action-btn").prop("disabled", false);

        }
    }

    function receiveManifest(manifest) {
        $('.deployment-title').html(manifest.title);
        $('a[href*="/deployment/"]').each(function () {
            $(this).attr('href', $(this).attr('href') + '?deployment=' + manifest.name);
        });
        window.history.replaceState({}, manifest.title, window.location.href.split('?')[0] + '?deployment=' + manifest.name);
    }

    function getSelectedAOI() {
        var checkedRadio;

        $(":radio").each(function (index, value) {
            if ($(value).parent().hasClass("is-checked") && value.id !== "hot-export-url") {
                checkedRadio = value.id;
            }
        });

        return checkedRadio;
    }

    // add hot export url radio button on page load
    function addHotExportURLTextField (status) {
        // get parent div
        var $deployContent = $("#deploy-content");

        // create label, add classes and attributes
        var $labelRadio = $("<label></label>");
        $labelRadio.addClass("deploy-list mdl-radio mdl-js-radio mdl-js-ripple-effect");
        $labelRadio.attr("for", "hot-export-url");

        // create input, add classes & attributes
        // activeAOI is checked
        var $inputRadio = (status.activeAOI.length > 0) ? $("<input checked>") : $("<input>");
        $inputRadio.addClass("mdl-radio__button");
        $inputRadio.attr("id", "hot-export-url").attr("name", "aoi-deploy").attr("type", "radio");

        // create span, add classes & attributes
        var $span = $("<span></span>");
        $span.addClass("mdl-radio__label");

        var $divTextField = $("<div></div>");
        $divTextField.addClass("mdl-textfield mdl-js-textfield");

        var $inputText = $("<input>");
        $inputText.addClass("mdl-textfield__input");
        $inputText.attr("type", "text").attr("id", "hot-export-url-input");
        $inputText.click(function () {
            // select radio button on click
            $(":radio").each(function (index, value) {
                if (value.id === "hot-export-url") {
                    $(value).parent().addClass("is-checked");
                } else {
                    $(value).parent().removeClass("is-checked");
                }
            });
        });

        var $labelTextField = $("<label></label>");
        $labelTextField.addClass("mdl-textfield__label");
        $labelTextField.attr("id", "hot-export-url-input-label").attr("for", "hot-export-url-input");
        $labelTextField.html("HOT Export URL");

        $divTextField.append($inputText);
        $divTextField.append($labelTextField);

        $span.append($divTextField);

        // add input and span to label
        $labelRadio.append($inputRadio);
        $labelRadio.append($span);

        // add label to parent div after 2nd child
        $deployContent.children(":eq(1)").after($labelRadio);

        // set hot export url on page load
        if ($("#hot-export-url").parent().hasClass("is-checked")) {
            $('#hot-export-url-input').val(status[deployment].exportUrl);
            // remove background label
            $("#hot-export-url-input-label").html("");
        } else {
            $('#hot-export-url-input').val("");
        }
    }

});
