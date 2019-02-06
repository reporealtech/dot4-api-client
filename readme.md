# JavaScript Client Library for dot4 Api

## Usage - Installation

```shell
$ npm install dot4-api-client --save
```

## Use library in Node.js

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

## Use Configuration Managagment  Api



```javascript
const configurationManagementApi = await dot4Client.createConfigurationManagementApi();

const cis = configurationManagementApi.getCis()

```

