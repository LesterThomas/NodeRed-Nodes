module.exports = function(RED) {
	var http=require('http');



    function DroneGetStatusNode(config) {
        RED.nodes.createNode(this,config);
        this.attribute=config.attribute;
        this.droneId=config.droneId;
        var node = this;

		var callHTTPGet= function (node,msg){
			var str='';
			var url;
			var droneNo;
			if (node.droneId) {
				droneNo=node.droneId;
			}else{
				droneNo=msg.payload.id;
			}
			url='http://droneapi.ddns.net:1235/vehicle/'+droneNo;
			
			console.log(url);
			require('http').get(url, (res) => {
			    res.setEncoding('utf8');
			    res.on('data', function (chunk) {
			    	str+=chunk;
			    });
			    res.on('end', function () {
			    	node.status({});
			    	var output=JSON.parse(str);
			    	if (node.attribute=="all"){
			    		msg.payload=output;
			    	}
			    	else {
			    		msg.payload=output[node.attribute];
			    	}

			        console.log("sending message");
			        node.send(msg);
		    	});
			});
		}
				
        this.on('input', function(msg) {
        	//call REST API to get status of drone
        	console.log("Get status called with payload '"+msg.payload+"'");
        	node.status({fill:"green",shape:"dot",text:"calling API"});
			callHTTPGet(node,msg);
    	});
    }
    RED.nodes.registerType("drone-control-get-status",DroneGetStatusNode);
}