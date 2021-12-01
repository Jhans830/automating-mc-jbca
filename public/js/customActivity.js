define([
    'postmonger'
], function(
    Postmonger
) {
    'use strict';

    var connection = new Postmonger.Session();
    var authTokens = {};
    var payload = {};
    var eventDefinitionKey;
    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('clickedNext', save);


    function onRender() {
        connection.trigger('ready');
    }

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

    function onGetTokens(tokens) {
        console.log(tokens);
        authTokens = tokens;
    }

    function onGetEndpoints(endpoints) {
        console.log(endpoints);
    }

    function save() {
        // grab TSD customer key from activity on save
        var cpURL = $('#cpURL').val();
        payload['arguments'].execute.inArguments = [{
            "subscriberKey": "{{Contact.Key}}",
            "cloudpageURL": cpURL
        }];
        payload['metaData'].isConfigured = true;
        console.log(payload);
        connection.trigger('updateActivity', payload);
    }
});