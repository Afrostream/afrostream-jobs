# Description

delayed jobs with retry (ex: email, encoding, packaging, ..)

# API

you can create jobs using kue REST api
@see https://github.com/Automattic/kue#json-api

you can access the api in HTTPS only + header token auth in production environment.

# Create a Job

add your job inside /jobs
export the "process" function (@see https://github.com/Automattic/kue#processing-jobs )

example: jobs/foobar.js

```js
module.exports = function(job, ctx, done){
  setTimeout(done, 1000);
});
```

register it inside server.js 

```js
queue.process('foobar', require('./jobs/foobar.js'));
```