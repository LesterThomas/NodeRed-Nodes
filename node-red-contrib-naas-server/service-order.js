module.exports = function (RED) {
  class ServiceOrderNode {
    constructor (config) {
      RED.nodes.createNode(this, config);
      this.server = RED.nodes.getNode(config.server);
      if (this.server) {
        // Do something with:
        this.host = this.server.host;
        //  this.server.port
      } else {
        // No config node configured
        this.host = 'no host';
      }
      this.serviceSpecArray = [];
      this.on('input', this.handleMsg);
    }

    handleMsg (msg) {
      console.log('input message received');
      this.serviceSpecArray.push(msg.payload);

      if (this.timer) {
        console.log('Cancel previous timer');
        // cancel previous timer
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.timer = setTimeout(function () { this.postServiceOrder(); }.bind(this), 1000);
    }

    postServiceOrder () {
      console.log('in PostServiceOrder');
      console.log(this);
      var msg = { payload: { serviceSpecArray: this.serviceSpecArray } };
      this.serviceSpecArray = [];
      console.log(msg);
      this.send(msg);
    }
  }
  RED.nodes.registerType('service-order', ServiceOrderNode);
};
