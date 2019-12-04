# DOT4 API JavaScript Client Library for Node.js

This project provides a Node.js package that makes it easy to consume and manage Realtech DOT4 Service Management. It supports:

- Configuration Management
- Service Management
- Incident Management

## Installation

```shell
$ npm install dot4-api-client --save
```

## Usage

```javascript
const createDot4Client = require('dot4-api-client');
const config = {
  user: 'my.user@realtech.de',
  password: 'mypassword',
  tenant: 'MyTechnicalTenantName'
};

const dot4Client = createDot4Client(config);
await dot4Client.connect();
```

You use the required "createDot4Client" Factory function to create a dot4Client object. For the creation of the dot4Client is a config object needed. This config object includes:

- user: the dot4 user (your email address)
- password: the dot4 user passord
- tenant: the techniacl tenant name of your dot4 solution
- [optional] baseUrl: the base url to the dot4 api Default is "https://api.dot4.de"

## Methods of dot4Client

### dot4Client.connect()

The connect() method connects to the dot4 api with the given config data. The Method generates an authorization token, which is used to access the api. After you connected to the api you can execute other methods on the dot4Client object

### dot4Client.disconnect()

The disconnect() method destroys the connection and the requested authorization token.

### dot4Client.getVersion()

The getVersion() method returns the current version of the dot4 api

```javascript
const version = dot4Client.getVersion()
// version => "2019.1.2818.1"
```

### dot4Client.getUserInfo()

The getUserInfo() method returns information of the current user

```javascript
const userInfo = dot4Client.getUserInfo()
// userinfo => {
      id: 1,
      uuid: '1a18a13c-b0fc-4251-b8d0-6b5a91d6243b',
      email: 'user@email.de',
      culture: 'en-US',
      firstName: 'User Firstname',
      lastName: 'User Lastname',
      description: 'Description of the User',
      lastLogin: '2019-02-07T07:52:58.53Z',
      //...
    };
```



## Use Configuration Managagment Api

```javascript
const configurationManagementApi = await dot4Client.createConfigurationManagementApi();

const cis = configurationManagementApi.getCis();
```
