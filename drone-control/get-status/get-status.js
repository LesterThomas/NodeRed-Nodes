module.exports = function(RED) {
	var http=require('http');



    function DroneGetStatusNode(config) {
    	try {
	        RED.nodes.createNode(this,config);
	        this.attribute=config.attribute;
	        this.droneId=config.droneId;
	        var node = this;

			var callHTTPGet= function (node,msg){
				try {
					var str='';
					var url;
					var droneNo;
					if (node.droneId) {
						droneNo=node.droneId;
					}else{
						droneNo=msg.payload.id;
					}
					url='http://droneapi.ddns.net/vehicle/'+droneNo;
					
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
						    	if (node.attribute=="all"){
						    		msg.payload=output;
						    	}
						    	else {
						    		msg.payload=output[node.attribute];
						    		msg.payload.id=output["id"];
						    	}
						        node.send(msg);
						    }
							catch (err) {
								console.error("DroneGetStatusNode:Error in HTTP GET");
								console.error(err);
							}    
				    	});
					});
				}
				catch (err) {
					console.error("DroneGetStatusNode:Error in callHTTPGet");
					console.error(err);
				}

			}
					
	        this.on('input', function(msg) {
	        	//call REST API to get status of drone
	        	try {
		        	console.log("Get status called with payload '"+msg.payload+"'");
		        	node.status({fill:"green",shape:"dot",text:"calling API"});
					callHTTPGet(node,msg);
				}
				catch (err) {
					console.error("DroneGetStatusNode:Error in this.on 'input'");
					console.error(err);
				}	

	    	});
		}
		catch (err) {
			console.error("DroneGetStatusNode:Error in main object");
			console.error(err);
		}	
    }
    RED.nodes.registerType("drone-control-get-status",DroneGetStatusNode);
	
}
