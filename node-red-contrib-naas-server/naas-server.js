module.exports = function (RED) {
  function RemoteServerNode (n) {
    RED.nodes.createNode(this, n);
    this.host = n.host;
    this.apikeyname = n.apikeyname;
    this.apikeyvalue = n.apikeyvalue;
  }
  RED.nodes.registerType('naas-server', RemoteServerNode);
};
