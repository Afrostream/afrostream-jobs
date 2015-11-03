# Description

delayed jobs with retry (ex: email, encoding, packaging, ..)

# API

you can create jobs using kue REST api
@see https://github.com/Automattic/kue#json-api

you can access the api in HTTPS only + header token auth in production environment.

# Create a Job

create /jobs/{jobName}/index.js
export the process function
```js
module.exports = {

}
```