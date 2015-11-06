# Description

delayed jobs with retry (ex: email, encoding, packaging, ..)

# API

you can create jobs using kue REST api
@see https://github.com/Automattic/kue#json-api

you can access the api in HTTPS only + header token auth in production environment.

# Create a Job

## create process function

add your job inside /jobs

export the "process" function (@see https://github.com/Automattic/kue#processing-jobs )

example: jobs/foobar.js

```js
// normal job
module.exports = function(job, ctx, done){
  // do something here, call done when finished
  setTimeout(done, 1000);
});
```

```js
// delayed job
module.exports = function(job, ctx){
  // do something here
  // call http PUT /api/job/:id/status { status: 'success|error' }
  // to update the job status
});
```

## register process function

open /app/jobs.js & register your job

```js
// normal job
queue.process('job type', require('../jobs/yourjob.js'));
```

```js
// delayed job
queue.process('job type', delayed.process(require('../jobs/yourjob.js')));
```

# Testing

## integration

```
npm test
```

## curl

Example: update a job status

```
curl -X PUT --header "Content-Type: application/json" --header "Authorization: Basic ZGV2OmRldg==" --data '{"foo":42}' http://localhost:12000/api/jobs/14/
```