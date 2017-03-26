module.exports = function(RED) {
	var http=require('http');



    function DroneGetStatusNode(config) {
        RED.nodes.createNode(this,config);
        this.attribute=config.attribute;
        this.droneId=config.droneId;
        var node = this;

		var callHTTPGet= function (node,msg){

			var url;
			var droneNo;
			if (node.droneId) {
				droneNo=node.droneId;
			}else{
				droneNo=msg.payload.droneId;
			}
			if (node.attribute=="all"){
				url='http://localhost:1235/vehicle/'+droneNo+'/';
			} else {
				url='http://localhost:1235/vehicle/'+droneNo+'/'+node.attribute;
			}
			console.log(url);
			require('http').get(url, (res) => {
			    res.setEncoding('utf8');
			    res.on('data', function (body) {
			    	node.status({});
			    	var output=JSON.parse(body);
			        msg.payload=output.vehicleStatus;
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