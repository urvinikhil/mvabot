const builder =require('botbuilder');
const restify =require('restify');
const connector =new builder.ChatConnector();

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

var server = restify.createServer();
server.post('/api/messages', connector.listen());
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('listening'); 
 });
