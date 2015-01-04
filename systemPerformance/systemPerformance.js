
module.exports = function(RED) {


	function systemPerformanceNode(n) {

		RED.nodes.createNode(this,n);
		var eventLatency=0;
		var latency=[];
		var CPU=[];
		var memory=[];
		

		this.on("input", function(msg) {			
            var start = Date.now();
            msg.payload={};

            msg.payload.latency=latency;
            setImmediate(function(){ 

                eventLatency=Date.now() - start;
                latency.unshift(eventLatency);
                //console.log(latency.length);
                if (latency.length>100) {
                	latency.pop(); //remove 1 element from array
                }
                });

            this.send(msg);
		});
	}

	RED.nodes.registerType("systemPerformance",systemPerformanceNode);

	
}