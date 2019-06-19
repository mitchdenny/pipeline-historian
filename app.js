var sb = require("@azure/service-bus");
var http = require("http");
var auth = require("@azure/ms-rest-nodeauth");

auth.loginWithVmMSI({
    resource: "https://servicebus.azure.net"
}).then((credentials) => {
    // const connectionString = process.env.SB_CONNECTION_STRING;
    // const client = sb.ServiceBusClient.createFromConnectionString(connectionString);
    const client = sb.ServiceBusClient.createFromAadTokenCredentials("midenn-pipeline-historian.servicebus.windows.net", credentials);
    const queue = client.createQueueClient("build-completed");
    const receiver = queue.createReceiver(sb.ReceiveMode.peekLock);

    let lastRun = null;

    receiver.registerMessageHandler(
        (message) => {
            try {
                const resource = message.body.resource;
                const definition = resource.definition;
                const id = resource.id;
                lastRun = resource;
                console.log(`${resource.status}: ${definition.name} / ${id} (${resource.sourceGetVersion})`);
            } catch {
                console.log("Boom!");
            }
        },
        (error) => {
            console.log(error);
            receiver.close();
        }
    );

    var express = require("express");
    var app = express();

    app.param("someitem", (req, resp, next, id) => {
        console.log("Processing someitem");
        next();
    });

    app.get("/last-run/:someitem", (req, res) => {
        console.log(req.params.someitem);
        res.send(JSON.stringify(lastRun));
        res.end();
    });

    app.listen(9000);
});

