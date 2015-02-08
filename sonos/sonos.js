
module.exports = function(RED) {

	var sonosObj= require('/root/thethingbox/node_modules/node-red/node_modules/sonos');
	function sonosNode(n) {

		RED.nodes.createNode(this,n);
		
		this.on("input", function(msg) {

			var url = msg.payload;	
			console.log('Sonos playing: ' + url + " at IP: " + n.ipAddress);
            var sonos = new sonosObj.Sonos(n.ipAddress); //'192.168.0.199'

            console.log('Sonos object created. ');
			sonos.play(url, function(err, playing) {
			  console.log([err, playing]);
			});

		});
	}

	RED.nodes.registerType("sonos",sonosNode);

	
}