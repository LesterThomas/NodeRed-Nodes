System Performance Node
=======================

This is a Node-Red node to return 3 performance characteristics of the server/container that Node-Red is executing inside.
It returns 3 Arrays showing the last 100 seconds (at an interval of 1 record per second). The arrays are:
    <ul>
        <li> <b>latency</b>: The latency of the Node-Red event queue on this server. It is an indication of the load of the server.</li>
        <li> <b>CPU</b>: The % load of the CPU</li>
        <li> <b>memory</b>: The % memory of the CPU</li>
    </ul>

The format of the msg object returned is:

```
{
msg: {
	payload:{
		latency:[],     
		CPU:[],
		memory:[]
		}
	}
}
```

Each array has up to 100 elements showing the last 100 recorded values.

