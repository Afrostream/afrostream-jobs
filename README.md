# Description

delayed jobs with retry (ex: email, encoding, packaging, ..)

# Create a Job

```js
// inside /jobs/wow.js
module.exports = function(job, ctx, done){
  // do something here, call done when finished
  setTimeout(done, 1000);
});

// inside /app/jobs.js
queue.process('wow', require('../jobs/wow.js'));
```

(more info, @see https://github.com/Automattic/kue#processing-jobs )

# Create a delayed job

A delayed job, is a job whose status is updated by http call.

```js
// inside /jobs/wow.js
module.exports = function(job, ctx){
  // do something here
  // call http PUT /api/job/:id/status { status: 'success|error' }
  // to update the job status
});

// inside /app/jobs.js
//  30000 is the job timeout in ms, default=60000
queue.process('wow', delayed.process(require('../jobs/wow.js'), 30000));
```

# HTTP REST API

you can create jobs using kue REST api
@see https://github.com/Automattic/kue#json-api

you can access the api in HTTPS only + header token auth in production environment.

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