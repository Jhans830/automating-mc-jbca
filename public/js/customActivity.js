define([
    'postmonger'
], function(
    Postmonger
) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};

    connection.on('initActivity', initialize);
    connection.on('clickedNext', save);

    function initialize(data) {
        if (data) {
            payload = data;
            var setcpURL = payload['arguments'].execute.inArguments[0].cloudpageURL;
            $('#cpURL').val(setcpURL);
        }
        connection.trigger('updateButton', {
            button: 'next',
            text: 'done',
            visible: true
        });
    }


    function save() {
        // grab TSD customer key from activity on save
        var cpURL = $('#cpURL').val();
        payload['arguments'].execute.inArguments = [{
            "cloudpageURL": cpURL
        }];
        payload['metaData'].isConfigured = true;
        connection.trigger('updateActivity', payload);
    }
});