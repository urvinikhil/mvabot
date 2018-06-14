const builder =require('botbuilder');
const restify =require('restify');
var connector = new builder.ChatConnector({
    appId: 2822b4a4-54f2-4b92-a09f-e62ab3d35b41,
    appPassword: 2822b4a4-54f2-4b92-a09f-e62ab3d35b41,
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user

const bot = new builder.UniversalBot( 
    connector,
    [
        function(session) {
            session.beginDialog('ensureProfile',session.dialogData.profile);
        },
        function(session, results) {
            const profile=session.dialogData.profile=results.response;
            session.endConversation(`Hi,${profile.name} of ${profile.company}`);
        }
        //{session.send('Hello World');
    ]
);
bot.dialog('ensureProfile',[
    function(session, args, next) {
        session.dialogData.profile=args||{};
        if(!session.dialogData.profile.name){
            builder.Prompts.text(session, 'What is your name?',
            {retryPrompt:'Please enter your name...'});
        }else{
            next();
        }
    },
    function(session, results,next) {
        if(results.response){
            session.dialogData.profile.name=results.response;   
        }
        if(!session.dialogData.profile.company){
            builder.Prompts.text(session, 'What is the the name of your comapany?',
            {retryPrompt:'Please enter the name of your comapany...'});
        }else{
            next();
        }
    },
    function(session,results){
        if(results.response){
            session.dialogData.profile.company=results.response;   
        }
        session.endDialogWithResult({response: session.dialogData.profile});
    }
]);
bot.dialog('help',[
    function(session){
        session.endDialog('I am a simple bot....');
    }
]).triggerAction({
    matches:/^help$/i,
    onSelectAction: function(session,args){
        session.beginDialog(args.action,args)
    }
})
bot.set('storage', tableStorage);

