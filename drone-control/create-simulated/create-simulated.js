module.exports = function(RED) {
	var http=require('http');
	var request = require('request');

    function DroneCreateSimulatedNode(config) {
        RED.nodes.createNode(this,config);
        this.action=config.action;
        this.droneName=config.droneName;
        this.currentActionId=-1;
        var node = this;

		var callHTTPPost= function (node,msg){

			var url;
			var droneName;
			if (node.droneName) {
				droneName=node.droneName;
			}else{
				droneName=msg.payload.droneName;
			}
			url='http://droneapi.ddns.net:1235/vehicle';
			console.log(url);
			console.log(msg.payload);
			createData={"vehicleType":"simulated","name":droneName};
			node.status({fill:"green",shape:"dot",text:"creating"});

			request.post(
			    url,
			    { json: createData },
			    function (error, response, body) {

			        if (!error && response.statusCode == 200) {
			            console.log(body)			            
				        msg.payload=body;

				        if (msg.payload.status=="Error"){
					        node.send([null,msg]);
					        console.log("Sent error message for create drone ");
               				node.status({fill:"red",shape:"ring",text:"error"});
				        } else {
					        node.send([msg,null]);
					        console.log("Sent msg for create drone ");
					        node.status({});

					    }
			        }
			    });
			}
				
        this.on('input', function(msg) {
        	//call REST API to Create simulated drone
        	console.log("Create simulated called with payload '"+msg.payload+"'");
			callHTTPPost(node,msg);
    	});
    }
    RED.nodes.registerType("drone-control-create-simulated",DroneCreateSimulatedNode);
}