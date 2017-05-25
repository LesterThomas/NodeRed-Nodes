module.exports = function(RED) {
	var http=require('http');
	var request = require('request');



    function DroneSendActionNode(config) {
        RED.nodes.createNode(this,config);
        this.action=config.action;
        this.droneId=config.droneId;
        this.currentActionId=-1;
        var node = this;

		var callHTTPGetStatus= function (node,msg){
			var str='';
			if (node.currentActionId==-1){
				return   //no need to check status
			}
			var url;
			var droneNo;
			if (node.droneId) {
				droneNo=node.droneId;
			}else{
				droneNo=msg.payload.droneId;
			}
			url='http://droneapi.ddns.net:1235/vehicle/'+droneNo+'/action';
			console.log(url);
			require('http').get(url, (res) => {
			    res.setEncoding('utf8');
			    res.on('data', function (chunk) {
			    	str+=chunk;
			    });
			    res.on('end', function () {
			    	console.log("Get action status returns");
			    	console.log(str);
			    	console.log("***************************************************************");
			    	var output=JSON.parse(str);
			    	var targetAction;
			    	var actionInterrupted=false;
			    	for(var i=output.actions.length-1;i>=0;i--) { //look through the array backwards to find our action
			    		if (output.actions[i].action.id==node.currentActionId){
			    			targetAction=output.actions[i];
			    			i=0;
			    		} else {
			    			actionInterrupted=true;
			    		}
			    	}
			    	console.log("Target action for id " + node.currentActionId );
			    	console.log(targetAction);
			    	if (targetAction.complete){
				        msg.payload=targetAction;
				        console.log("sending complete message");
				        node.status({});
				        node.send([null,msg,null]);
				        node.currentActionId=-1;
				    } else if (actionInterrupted) {
				        msg.payload=targetAction;
				        console.log("sending interrupted message");
        				node.status({fill:"red",shape:"ring",text:node.action+ " interrupted"});
				        node.send([null,null,msg]);
				        node.currentActionId=-1;
				    } else 
				    {
				        console.log("repeat monitor status");
				    	setTimeout(function(){callHTTPGetStatus(node,msg)},1000);
				    }
		    	});
			});
		}

		var callHTTPPost= function (node,msg){

			var url;
			var droneNo;
			if (node.droneId) {
				droneNo=node.droneId;
			}else{
				droneNo=msg.payload.droneId;
			}
			var actionData=msg.payload;
			actionData.name=node.action;
			url='http://droneapi.ddns.net:1235/vehicle/'+droneNo+'/action';
			console.log(url);
			console.log(msg.payload);

			if (node.currentActionId!=-1){ //if there is a current action then interrupt the current action
				node.currentActionData.complete=false;
				node.currentActionData.completeStatus="Interrupted";
				msg.payload=node.currentActionData;
		        node.send([null,null,msg]);
		        console.log("Sent interrupted message for action "+ node.currentActionId);
   				node.status({fill:"red",shape:"ring",text:node.action+ " interrupted"});
			}

			request.post(
			    url,
			    { json: actionData },
			    function (error, response, body) {

			        if (!error && response.statusCode == 200) {
			            console.log(body)			            
				        msg.payload=body;
				        node.currentActionData=body;

				        if (msg.payload.action.status=="Error"){
				        	msg.payload.complete=false;
							msg.payload.completeStatus="Error";
					        node.send([null,null,msg]);
					        node.currentActionId=-1;
					        console.log("Sent error message for action "+ node.currentActionId);
               				node.status({fill:"red",shape:"ring",text:node.action+ " error"});
				        } else {
					        node.send([msg,null,null]);
					        node.currentActionId=msg.payload.action.id;
					        console.log("Sent action acknowledge message for action "+ node.currentActionId);
		                	node.status({fill:"green",shape:"dot",text:node.action});
					        //check for status updates
					        console.log("starting to monitor status");
				        	callHTTPGetStatus(node,msg);
					    }
			        }
			    });
			}
				
        this.on('input', function(msg) {
        	//call REST API to get status of drone
        	console.log("Get status called with payload '"+msg.payload+"'");
			callHTTPPost(node,msg);
    	});
    }
    RED.nodes.registerType("drone-control-send-action",DroneSendActionNode);
}