module.exports = function(RED) {
	var http=require('http');
	var request = require('request');

    function DroneDisconnectDroneNode(config) {
        RED.nodes.createNode(this,config);
        this.droneId=config.droneId;
        var node = this;

		var callHTTPDelete= function (node,msg){

			var url;
			var droneNo;
			if (node.droneId) {
				droneNo=node.droneId
				console.log('Setting to node id ' + droneNo);
			}
			else{
				droneNo=msg.payload.id;
				console.log('Setting to msg id '+droneNo);
			}
			url='http://droneapi.ddns.net/vehicle/'+ droneNo;
			console.log(url);
			console.log(msg.payload);
			node.status({fill:"green",shape:"dot",text:"disconnecting"});

			request.delete(
			    url,
			    { },
			    function (error, response, body) {

			        if (!error && response.statusCode == 200) {
			            console.log(body)			            
				        msg.payload=body;

				        if (msg.payload.status=="Error"){
					        node.send([null,msg]);
					        console.log("Sent error message for disconnect drone ");
               				node.status({fill:"red",shape:"ring",text:"error"});
				        } else {
					        node.send([msg,null]);
					        console.log("Sent msg for disconnect drone ");
					        node.status({});

					    }
			        }
			    });
			}
				
        this.on('input', function(msg) {
        	//call REST API to Create simulated drone
        	console.log("Disconnect drone called with payload '"+msg.payload+"'");
			callHTTPDelete(node,msg);
    	});
    }
    RED.nodes.registerType("drone-control-disconnect-drone",DroneDisconnectDroneNode);
}
