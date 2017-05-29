module.exports = function(RED) {
	var http=require('http');



    function DroneGetInventoryNode(config) {
    	try {
	        RED.nodes.createNode(this,config);
	        var node = this;

			var callHTTPGet= function (node,msg){
				try {
					var str='';

					var url;
					url='http://droneapi.ddns.net:1235/vehicle';
					
					console.log(url);
					require('http').get(url, (res) => {
					    res.setEncoding('utf8');
					    res.on('data', function (chunk) {
					    	str+=chunk;
					    });
					    res.on('end', function () {
					    	try {
						    	node.status({});
						    	var output=JSON.parse(str);
						        droneArray=output._embedded.vehicle;
						        console.log(droneArray);
						        droneArray.forEach(function(entry) {
						       	 	console.log("sending message");
						       	 	msg.payload=entry;
						        	node.send(msg);
								    console.log(entry);
								});
							}
							catch (err) {
								console.error("DroneGetInventoryNode:Error in this.on 'input'");
								console.error(err);
							}	

				    	});
					});
				}
				catch (err) {
					console.error("DroneGetInventoryNode:Error in this.on 'input'");
					console.error(err);
				}	

			}
					
	        this.on('input', function(msg) {
	        	try {
		        	//call REST API to get inventory of drones
		        	console.log("Get inventory called with payload '"+msg.payload+"'");
		        	node.status({fill:"green",shape:"dot",text:"calling API"});
					callHTTPGet(node,msg);
					}
				catch (err) {
					console.error("DroneGetInventoryNode:Error in this.on 'input'");
					console.error(err);
				}	

	    	});
	    }
	catch (err) {
		console.error("DroneGetInventoryNode:Error in main object");
		console.error(err);
		}	
	}
    RED.nodes.registerType("drone-control-get-inventory",DroneGetInventoryNode);
}