var zipFolder = require('zip-folder');
var path = require('path');
var fs = require('fs');
var request = require('request');

var rootFolder = path.resolve('.');
var zipPath = path.resolve(rootFolder, '../blankbot-9482.zip');
var kuduApi = 'https://blankbot-9482.scm.azurewebsites.net/api/zip/site/wwwroot';
var userName = '$blankbot-9482';
var password = 'RYETLvXL4wQ74B25K46eaChdHoqFsD1Xihd7XGda0Xl5zzpg6mu4uuX6x1iS';

function uploadZip(callback) {
  fs.createReadStream(zipPath).pipe(request.put(kuduApi, {
    auth: {
      username: userName,
      password: password,
      sendImmediately: true
    },
    headers: {
      "Content-Type": "applicaton/zip"
    }
  }))
  .on('response', function(resp){
    if (resp.statusCode >= 200 && resp.statusCode < 300) {
      fs.unlink(zipPath);
      callback(null);
    } else if (resp.statusCode >= 400) {
      callback(resp);
    }
  })
  .on('error', function(err) {
    callback(err)
  });
}

function publish(callback) {
  zipFolder(rootFolder, zipPath, function(err) {
    if (!err) {
      uploadZip(callback);
    } else {
      callback(err);
    }
  })
}

publish(function(err) {
  if (!err) {
    console.log('blankbot-9482 publish');
  } else {
    console.error('failed to publish blankbot-9482', err);
  }
});