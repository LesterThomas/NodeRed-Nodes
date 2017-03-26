# node-red-drone-control
node-red node for accessing the lower case (based on https://github.com/shijuamt/node-red-contrib-lowercase.git)

## Installation
npm -g install node-red-drone-control

## Features
- control drone via api

## Example


**With an inject node and a debug node.**

```
[{"id":"e350110e.c7723","type":"function","z":"4a2793c9.cebd1c","name":"","func":"msg.payload = \"MESSAGE\";\nreturn msg;","outputs":1,"noerr":0,"x":343,"y":173,"wires":[["cc46c18a.22a36"]]}]
```
