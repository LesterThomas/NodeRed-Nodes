module.exports = function(RED) {
	var http=require('http');
	var request = require('request');



    function DroneSendActionNode(config) {
        RED.nodes.createNode(this,config);
        this.action=config.action;
        this.droneId=config.droneId;
        this.msgArray=[];  //for asynchronous functions, store all the input messages in an array and search for the correct msg in the async function
        var node = this;

		var callHTTPGetStatus= function (node,msg) {
			//console.log("###################################################################################");
			//console.log("callHTTPGetStatus");
			//console.log("msg.temp");
			//console.log(msg.temp);

			var str='';
			if (msg.temp.currentActionId==-1){
				return   //no need to check status
			}
			var url;
			url='http://droneapi.ddns.net:1235/vehicle/'+msg.temp.droneNo+'/action';
			//console.log(url);
			require('http').get(url, (res) => {
			    res.setEncoding('utf8');
			    res.on('data', function (chunk) {
			    	str+=chunk;
			    });
			    res.on('end', function () {
					//console.log("###################################################################################");
					//console.log("GET action http response");
			    	//console.log("");
			    	var output=JSON.parse(str);

			    	var outmsg=findMsg(node,output._links.self.href);

			    	//console.log(output);
					console.log("outmsg");
					console.log(outmsg);
					if (outmsg.temp.currentActionId==-1){
						return   //no need to check status
					}

			    	var targetAction;
			    	var actionInterrupted=false;
			    	for(var i=output.actions.length-1;i>=0;i--) { //look through the array backwards to find our action
			    		console.log("Drone "+outmsg.temp.droneNo+" Target action "+outmsg.temp.currentActionId + " testing " + output.actions[i].action.id)
			    		if (output.actions[i].action.id==outmsg.temp.currentActionId){
			    			targetAction=output.actions[i];
			    			i=0;
			    		} else {
			    			actionInterrupted=true;
			    		}
			    	}
			    	if (targetAction) {
				    	//console.log("Target action for id " + msg.temp.currentActionId );
				    	//console.log(targetAction);
				    	if (targetAction.complete){
					        outmsg.payload=targetAction;
					        outmsg.payload.id=outmsg.temp.droneNo;
					        //console.log("sending complete message");
					        node.status({});
					        node.send([null,outmsg,null]);
					        outmsg.temp.currentActionId=-1;
					        //remove msg from array
					        var index = node.msgArray.indexOf(outmsg);
					        console.log("index");
					        console.log(index);
							if (index > -1) {
							    node.msgArray.splice(index, 1);
							}


					    } else if (actionInterrupted) {
					        outmsg.payload=targetAction;
					        outmsg.payload.id=outmsg.temp.droneNo;
					        //console.log("sending interrupted message");
	        				node.status({fill:"red",shape:"ring",text:node.action+ " interrupted"});
					        node.send([null,null,outmsg]);
					        outmsg.temp.currentActionId=-1;
					    } else 
					    {
					        //console.log("repeat monitor status");
					    	setTimeout(function(){callHTTPGetStatus(node,outmsg)},1000);
					    }
					} else {
						//console.log("Can not find Target action for id " + msg.temp.currentActionId );
					    //console.log("repeat monitor status");
					    setTimeout(function(){callHTTPGetStatus(node,outmsg )},1000);
					}


		    	});
			});
		}
		function findMsg(node,inURI) {
			console.log("findMsg: msgArray.length="+node.msgArray.length);
			console.log("input URI="+inURI);
			found=false
			for (var i = 0; i < node.msgArray.length; i++) {
				outMsg=node.msgArray[i];
				console.log("Looking for "+outMsg.temp.droneNo)
				if (inURI.indexOf(outMsg.temp.droneNo) !== -1){
					console.log("Found msg");
					console.log(outMsg);
					return outMsg;
				}
			}
			console.warn("Did not find message");
			return null;
		}

		var callHTTPPost= function (node,msg){
			console.log("###################################################################################");
			console.log("callHTTPPost");
			//console.log("msg.payload");
			//console.log(msg.payload);
			//console.log("msg.temp");
			//console.log(msg.temp);
			//console.log("node");
			//console.log(node);
			var url;
			var actionData=msg.payload;
			actionData.name=node.action;
			url='http://droneapi.ddns.net:1235/vehicle/'+msg.temp.droneNo+'/action';
			//console.log(url);

			if (msg.temp.currentActionId!=-1){ //if there is a current action then interrupt the current action
				msg.temp.currentActionData.complete=false;
				msg.temp.currentActionData.completeStatus="Interrupted";
				msg.payload=msg.temp.currentActionData;
				msg.payload.id=msg.temp.droneNo;
		        node.send([null,null,msg]);
		        //console.log("Sent interrupted message for action "+ msg.temp.currentActionId);
   				node.status({fill:"red",shape:"ring",text:node.action+ " interrupted"});
			}

			request.post(
			    url,
			    { json: actionData },
			    function (error, response, body) {

			        if (!error && response.statusCode == 200) {
			            console.log("callHTTPPost body returned");
			            console.log(body);
			            postOutMsg=findMsg(node,body.href);

				        postOutMsg.payload=body;
				        postOutMsg.temp.currentActionData=body;
				        postOutMsg.payload.id=postOutMsg.temp.droneNo;
				        if (postOutMsg.payload.action.status=="Error"){
				        	postOutMsg.payload.complete=false;
							postOutMsg.payload.completeStatus="Error";
					        node.send([null,null,postOutMsg]);
					        postOutMsg.temp.currentActionId=-1;
					        //console.log("Sent error message for action "+ msg.temp.currentActionId);
               				node.status({fill:"red",shape:"ring",text:node.action+ " error"});
				        } else {
					        node.send([postOutMsg,null,null]);
					        console.log("Setting target action id for drone "+postOutMsg.temp.droneNo+" to "+ postOutMsg.payload.action.id )
					        postOutMsg.temp.currentActionId=postOutMsg.payload.action.id;
					        //console.log("Sent action acknowledge message for action "+ msg.temp.currentActionId);
		                	node.status({fill:"green",shape:"dot",text:node.action});
					        //check for status updates
					        //console.log("starting to monitor status");
				        	callHTTPGetStatus(node,postOutMsg);
					    }
			        }
			    });
			}
				
        this.on('input', function(msg) {
        	//call REST API to get status of drone
        	console.log("########################################################'");
        	console.log("Send action called with payload '");
        	console.log(msg.payload);
        	msg.temp={"currentActionId":-1};  
			if (node.droneId) {
				msg.temp.droneNo=node.droneId;
			}else{
				msg.temp.droneNo=msg.payload.id;
			}

			//Clone the object to stop it being confused with any subsequent msg events
			var clonedMsg=JSON.parse(JSON.stringify(msg));
			console.log("before")
			for(var i=0;i<node.msgArray.length;i++){
				console.log("node.msgArray index "+i+" value "+node.msgArray[i].temp.droneNo)
			}
			node.msgArray.push(clonedMsg);
			console.log("after")
			for(var i=0;i<node.msgArray.length;i++){
				console.log("node.msgArray index "+i+" value "+node.msgArray[i].temp.droneNo)
			}

			console.log("node.msgArray.length="+node.msgArray.length);
			callHTTPPost(node,clonedMsg);
    	});
    }
    RED.nodes.registerType("drone-control-send-action",DroneSendActionNode);
}