# node-red-drone-control
node-red node for controlling drone-control API (at http://droneapi.ddns.net:1235). Note: This node-red-node and the drone-control API are experimental.

## Installation
npm -g install node-red-drone-control

## Features
- control drone via api

## Example


**With a query status and  land action.**

```
[{"id":"d970052a.b97f98","type":"drone-control-get-status","z":"37371b43.bbb344","name":"","droneId":"2ee739b3","attribute":"battery","x":458.2422180175781,"y":147.91409301757812,"wires":[["131249a3.144306"]]},{"id":"d599c7c3.7df388","type":"inject","z":"37371b43.bbb344","name":"","topic":"","payload":"","payloadType":"str","repeat":"","crontab":"","once":false,"x":151.5078125,"y":147.5234375,"wires":[["d970052a.b97f98"]]},{"id":"ab270193.203b2","type":"drone-control-send-action","z":"37371b43.bbb344","name":"","droneId":"2ee739b3","action":"Land","x":481.2421875,"y":270.8828125,"wires":[["d400867.1a23278"],["6dbd1943.d01a88"],["c1903e94.7bdfa"]]},{"id":"bd57d0b4.b5fab","type":"inject","z":"37371b43.bbb344","name":"","topic":"","payload":"{}","payloadType":"str","repeat":"","crontab":"","once":false,"x":156.3333282470703,"y":277.4444274902344,"wires":[["187ce7c.572a818"]]},{"id":"187ce7c.572a818","type":"json","z":"37371b43.bbb344","name":"","x":284.3333740234375,"y":274.0069885253906,"wires":[["ab270193.203b2"]]},{"id":"131249a3.144306","type":"debug","z":"37371b43.bbb344","name":"","active":true,"console":"false","complete":"false","x":696,"y":150,"wires":[]},{"id":"d400867.1a23278","type":"debug","z":"37371b43.bbb344","name":"","active":true,"console":"false","complete":"false","x":808.0000648498535,"y":210.25004768371582,"wires":[]},{"id":"6dbd1943.d01a88","type":"debug","z":"37371b43.bbb344","name":"","active":true,"console":"false","complete":"false","x":811.0000648498535,"y":245.25004768371582,"wires":[]},{"id":"7cf8cfca.9f3af","type":"comment","z":"37371b43.bbb344","name":"Test actions","info":"","x":107,"y":227,"wires":[]},{"id":"c1903e94.7bdfa","type":"debug","z":"37371b43.bbb344","name":"","active":true,"console":"false","complete":"false","x":812.7500534057617,"y":281.75004386901855,"wires":[]},{"id":"fa0e0996.58dd58","type":"inject","z":"37371b43.bbb344","name":"","topic":"","payload":"{}","payloadType":"str","repeat":"","crontab":"","once":false,"x":920,"y":123,"wires":[["e6dc2497.546e08"]]}]
```
