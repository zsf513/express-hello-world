const express = require('express')
const path = require("path");
const autocannon = require('autocannon');
const app = express();

// #############################################################################
// Logs all request paths and method
app.use(function (req, res, next) {
  res.set('x-timestamp', Date.now())
  res.set('x-powered-by', 'cyclic.sh')
  console.log(`[${new Date().toISOString()}] ${req.ip} ${req.method} ${req.path}`);
  next();
});

// #############################################################################
// This configures static hosting for files in /public that have the extensions
// listed in the array.
var options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html','css','js','ico','jpg','jpeg','png','svg'],
  index: ['index.html'],
  maxAge: '1m',
  redirect: false
};
app.use(express.static('public', options));


// async/await
async function start(options) {
  console.log('url:' + options.url);
  const result = await autocannon(options);
  console.log('result:',result);
}

app.use('/press',(req,res)=>{

  let query = req.query;
  let queryStr = '';
  for(key in query){
    queryStr += key + '=' + query[key] + ',';
  }
  if(queryStr.lastIndexOf(',') == queryStr.length -1){
    queryStr = queryStr.substring(0, queryStr.lastIndexOf(','));
  }

  let url = query['url'];
  console.log('queryUrl:' + url);
  console.log('queryStr:' + queryStr);

  let options = {
    url: url,
    connections: 10,
    pipelining: 1,
    duration: 8
  };

  options = Object.assign(options, query);
  console.log('options:', options);
  start(options);

  res.json({
    data: options
  });
});

// #############################################################################
// Catch all handler for all other request.
app.use('*', (req,res) => {
  res.json({
      at: new Date().toISOString(),
      method: req.method,
      hostname: req.hostname,
      ip: req.ip,
      query: req.query,
      headers: req.headers,
      cookies: req.cookies,
      params: req.params
    })
    .end();
});

module.exports = app;
