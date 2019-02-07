<a name="module_dot4-client"></a>

## dot4-client
A module for creating a DOT4 API Client.

<a name="module_dot4-client..createDot4Client"></a>

### dot4-client~createDot4Client(config) ⇒ <code>dot4client</code>
The main dot4 Client Creation function

**Kind**: inner method of [<code>dot4-client</code>](#module_dot4-client)  
**Returns**: <code>dot4client</code> - returns an dot4 api client object  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | configuration object for connecting to the dot4 api |

**Example**  
Create an dot4 api client with a given configuration and connnect it
```javascript
const createDot4Client = require('dot4-api-client');
const config = {
  user: 'admin@realtech.de',
  password: 'admin',
  tenant: 'Default',  
};

const dot4Client = createDot4Client(config);
await dot4Client.connect();
```
