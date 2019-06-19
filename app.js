var sb = require("@azure/service-bus");

const connectionString = process.env.SB_CONNECTION_STRING;

const client = sb.ServiceBusClient.createFromConnectionString(connectionString);
const queue = client.createQueueClient("build-completed");
const receiver = queue.createReceiver(sb.ReceiveMode.peekLock);

receiver.registerMessageHandler(
    (message) => {
        try {
            const resource = message.body.resource;
            const definition = resource.definition;
            const id = resource.id;
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