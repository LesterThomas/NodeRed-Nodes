module.exports = function (RED) {
  class ServiceSpecificationNode {
    constructor (config) {
      console.log('#################################################################################################');
      console.log('In ServiceSpecificationNode constructor');
      RED.nodes.createNode(this, config);
      this.server = RED.nodes.getNode(config.server);
      this.serviceOrderLine = config.serviceOrderLine;
      console.log('this.serviceOrderLine');
      console.log(this.serviceOrderLine);

      if (this.server) {
        // Do something with:
        this.host = this.server.host;
        this.apikeyname = this.server.apikeyname;
        this.apikeyvalue = this.server.apikeyvalue;
        this.serviceSpecArray = [];
        var request = require('request');
        var options = {
          url: this.host,
          headers: {}
        };
        options.headers[this.server.apikeyname] = this.server.apikeyvalue;
        console.log('calling request with options: ');
        console.log(options);

        request(options, async function (error, response, body) {
          if (!error && response.statusCode === 200) {
            this.serviceSpecArray = JSON.parse(body);
          } else {
            console.log('status: ' + response.statusCode);
            console.log('Error: ' + body);
          }
        }.bind(this));
      } else {
        // No config node configured
        this.host = 'no host';
      }
      this.on('input', this.handleMsg);
    }

    handleMsg (msg) {
      console.log('input message received');
      // console.log(this.host);
      // console.log(this.serviceOrderLine);
      // console.log(this);
      msg.payload = this.serviceOrderLine;
      this.send(msg);
    }
  }
  RED.nodes.registerType('service-specification', ServiceSpecificationNode);

  // Make all the available types accessible for the node's config screen
  RED.httpAdmin.get('/service-specification', RED.auth.needsPermission('service-specification.read'), function (req, res) {
    console.log('req.query.id');
    console.log(req.query.id);
    var node = RED.nodes.getNode(req.query.id);
    console.log("In RED.httpAdmin.get('/service-specification");
    // console.log(node.host);
    // console.log(node.apikeyname);
    // console.log(node.serviceSpecArray);
    res.json(node.serviceSpecArray);
  });
};
