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
			try {
				//console.log("####callHTTPGetStatus####");

				var str='';
				var url;
				url='http://droneapi.ddns.net:1235/vehicle/'+msg.temp.droneNo+'/action';
				//console.log(url);
				require('http').get(url, (res) => {
				    res.setEncoding('utf8');
				    res.on('data', function (chunk) {
				    	str+=chunk;
				    });
				    res.on('end', function () {
				    	try {
					    	var output=JSON.parse(str);

					    	var outmsg=findMsg(node,output._links.self.href);

					    	//console.log(output);
							if (outmsg.temp.currentActionId==-1){
								return   //no need to check status
							}

					    	var targetAction;
					    	var actionInterrupted=false;
					    	for(var i=output.actions.length-1;i>=0;i--) { //look through the array backwards to find our action
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
						}
					catch (err) {
						console.error("DroneSendActionNode:Error in HTTP GET");
						console.error(err);
					}


			    	});
				});
			}
			catch (err) {
				console.error("DroneSendActionNode:Error in callHTTPGetStatus");
				console.error(err);
			}

		}
		function findMsg(node,inURI) {
			try {
				found=false
				for (var i = 0; i < node.msgArray.length; i++) {
					outMsg=node.msgArray[i];
					if (inURI.indexOf(outMsg.temp.droneNo) !== -1){
						return outMsg;
					}
				}
				console.warn("DroneSendActionNode:Did not find message");
				return null;
			}
			catch (err) {
				console.error("DroneSendActionNode:Error in findMsg");
				console.error(err);
			}

		}

		var callHTTPPost= function (node,msg){
	    	try {

				//console.log("DroneSendActionNode:####callHTTPPost####");
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
	   				node.status({fill:"red",shape:"ring",text:node.action+ " interrupted"});
				}

				request.post(
				    url,
				    { json: actionData },
				    function (error, response, body) {
				    	try {
					        if (!error && response.statusCode == 200) {
					        	if (body.error){
					        		//unknown error has occurred in HTTP POST
					        		msg.payload=body;
							        node.send([null,null,msg]);
		               				node.status({fill:"red",shape:"ring",text:node.action+ " error"});
					        	} else {
							        console.log("HTTP POST body");
							        console.log(body);
							        console.log("");
						            postOutMsg=findMsg(node,body.href);
							        postOutMsg.payload=body;
							        postOutMsg.temp.currentActionData=body;
							        postOutMsg.payload.id=postOutMsg.temp.droneNo;
							        if (postOutMsg.payload.action.status=="Error"){
							        	postOutMsg.payload.complete=false;
										postOutMsg.payload.completeStatus="Error";
								        node.send([null,null,postOutMsg]);
								        postOutMsg.temp.currentActionId=-1;
			               				node.status({fill:"red",shape:"ring",text:node.action+ " error"});
							        } else {
								        node.send([postOutMsg,null,null]);
								        postOutMsg.temp.currentActionId=postOutMsg.payload.action.id;
					                	node.status({fill:"green",shape:"dot",text:node.action});
								        //check for status updates
							        	callHTTPGetStatus(node,postOutMsg);
								    }
								}
					        }
					    }
						catch (err) {
							console.error("DroneSendActionNode:Error in HTTP POST");
							console.error(err);
						}
				    });
				}
				catch (err) {
					console.error("DroneSendActionNode:Error in callHTTPPost");
					console.error(err);
				}
			}
				
        this.on('input', function(msg) {
        	try {
	        	//call REST API to get status of drone
	        	console.log("########################################################'");
	        	console.log("DroneSendActionNode:Send action called with payload '");
	        	console.log(msg.payload);
	        	msg.temp={"currentActionId":-1};  
				if (node.droneId) {
					msg.temp.droneNo=node.droneId;
				}else{
					msg.temp.droneNo=msg.payload.id;
				}

				//Clone the object to stop it being confused with any subsequent msg events
				var clonedMsg=JSON.parse(JSON.stringify(msg));
				node.msgArray.push(clonedMsg);
				console.log("node.msgArray.length="+node.msgArray.length);
				callHTTPPost(node,clonedMsg);
			}
			catch (err) {
				console.error("DroneSendActionNode:Error in this.on input");
				console.error(err);
			}
    	});
    }
    RED.nodes.registerType("drone-control-send-action",DroneSendActionNode);
}