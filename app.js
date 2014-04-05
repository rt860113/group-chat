
/**
 * Module dependencies.
 */

var express = require('express.io');
var path = require('path');
var app = express().http().io();

// all environments

app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({secret:"Mylover"}));
app.use(express.static(path.join(__dirname, 'public')));

// development only
var array_users=[];
// first contact
app.io.route("ready",function(req){
	var counter=0;
	var old_users=[];
	array_users.push({name:req.data.name,sessionID:req.sessionID,message:""});
	if (array_users.length>500) 
	{
		for (var i = 0; i < array_users.length-1; i++) {
			array_users[i]=array_users[i+1];
			array_users.pop();
		};
	};
	for (var i = 0; i < array_users.length; i++) {
		if (array_users[i].sessionID==req.sessionID&&array_users[i].name!=req.data.name) 
		{
			if (array_users[i].message!=="") 
			{
				old_users[counter]={name:array_users[i].name,message:array_users[i].message};
				array_users[i].name=req.data.name;
				counter++;
			};
		};
	};
	req.io.emit("existing_messages",{message:array_users});
	if (counter==0) 
	{
		app.io.broadcast("new_user_enter",{message:array_users[array_users.length-1]});
	}else
	{
		app.io.broadcast("old_user_enter",{old:old_users,newname:req.data.name});;
	};
});
// send message
app.io.route("send_message",function(req){
	array_users.push({name:req.data.name,sessionID:req.sessionID,message:req.data.message});
	if (array_users.length>500) 
	{
		for (var i = 0; i < array_users.length-1; i++) {
			array_users[i]=array_users[i+1];
			array_users.pop();
		};
	};
	app.io.broadcast("new_message",{message:array_users[array_users.length-1]});
})

var route=require("./routes/index")(app);
app.listen(8000);
