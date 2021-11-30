define([
    'postmonger'
], function(
    Postmonger
) {
    'use strict';

    var connection = new Postmonger.Session();
    var authTokens = {};
    var payload = {};
    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);

    connection.on('clickedNext', save);
    var eventDefinitionKey;
    connection.trigger('requestTriggerEventDefinition');

    connection.on('requestedTriggerEventDefinition',
        function(eventDefinitionModel) {
            if (eventDefinitionModel) {
                eventDefinitionKey = eventDefinitionModel.eventDefinitionKey;
            }
        });

    function onRender() {
        // JB will respond the first time 'ready' is called with 'initActivity'
        connection.trigger('ready');
        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
    }

    function initialize(data) {
        console.log(data);
        if (data) {
            payload = data;
            var setcpURL = payload['arguments'].execute.inArguments[0].cloudpageURL;
            $('#cpURL').val(setcpURL);
        }

        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};

        console.log(inArguments);

        $.each(inArguments, function(index, inArgument) {
            $.each(inArgument, function(key, val) {


            });
        });

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
            "tokens": authTokens,
            "subscriberKey": "{{Event." + eventDefinitionKey + ".\"SubscriberKey\"}}",
            "cloudpageURL": cpURL
        }];
        payload['metaData'].isConfigured = true;
        console.log(payload);
        connection.trigger('updateActivity', payload);
    }
});