// declare our dependencies
var crypto = require('crypto-js');
var https = require('https');
var xml = require('xml2js');

main();

// split the code into a main function
function main() {
  // this serviceList is unused right now, but may be used in future
  const serviceList = [
    'dynamodb',
    'ec2',
    'sqs',
    'sns',
    's3'
  ];

  // our variables
  var access_key = 'ACCESS_KEY_VALUE';
  var secret_key = 'SECRET_KEY_VALUE';
  var region = 'eu-west-1';
  var url = 'my-bucket-name.s3.amazonaws.com';
  var myService = 's3';
  var myMethod = 'GET';
  var myPath = '/';

  // get the various date formats needed to form our request
  var amzDate = getAmzDate(new Date().toISOString());
  var authDate = amzDate.split("T")[0];

  // we have an empty payload here because it is a GET request
  var payload = '';
  // get the SHA256 hash value for our payload
  var hashedPayload = crypto.SHA256(payload).toString();

  // create our canonical request
  var canonicalReq =  myMethod + '\n' +
                      myPath + '\n' +
                      '\n' +
                      'host:' + url + '\n' +
                      'x-amz-content-sha256:' + hashedPayload + '\n' +
                      'x-amz-date:' + amzDate + '\n' +
                      '\n' +
                      'host;x-amz-content-sha256;x-amz-date' + '\n' +
                      hashedPayload;

  // hash the canonical request
  var canonicalReqHash = crypto.SHA256(canonicalReq).toString();

  // form our String-to-Sign
  var stringToSign =  'AWS4-HMAC-SHA256\n' +
                      amzDate + '\n' +
                      authDate+'/'+region+'/'+myService+'/aws4_request\n'+
                      canonicalReqHash;

  // get our Signing Key
  var signingKey = getSignatureKey(crypto, secret_key, authDate, region, myService);

  // Sign our String-to-Sign with our Signing Key
  var authKey = crypto.HmacSHA256(stringToSign, signingKey);

  // Form our authorization header
  var authString  = 'AWS4-HMAC-SHA256 ' +
                    'Credential='+
                    access_key+'/'+
                    authDate+'/'+
                    region+'/'+
                    myService+'/aws4_request,'+
                    'SignedHeaders=host;x-amz-content-sha256;x-amz-date,'+
                    'Signature='+authKey;

  // throw our headers together
  headers = {
    'Authorization' : authString,
    'Host' : url,
    'x-amz-date' : amzDate,
    'x-amz-content-sha256' : hashedPayload
  };


  // call our function
  performRequest(url, headers, payload, function(response) {
    // parse the response from our function and write the results to the console
    xml.parseString(response, function (err, result) {
      console.log('\n=== \n'+'Bucket is named: ' + result['ListBucketResult']['Name']);
      console.log('=== \n'+'Contents: ');
      for (i=0;i<result['ListBucketResult']['Contents'].length;i++) {
        console.log(
          '=== \n'+
          'Name: '          + result['ListBucketResult']['Contents'][i]['Key'][0]           + '\n' +
          'Last modified: ' + result['ListBucketResult']['Contents'][i]['LastModified'][0]  + '\n' +
          'Size (bytes): '  + result['ListBucketResult']['Contents'][i]['Size'][0]          + '\n' +
          'Storage Class: ' + result['ListBucketResult']['Contents'][i]['StorageClass'][0]
        );
      };
      console.log('=== \n');
    });
  });
};

// this function gets the Signature Key, see AWS documentation for more details, this was taken from the AWS samples site
function getSignatureKey(Crypto, key, dateStamp, regionName, serviceName) {
    var kDate = Crypto.HmacSHA256(dateStamp, "AWS4" + key);
    var kRegion = Crypto.HmacSHA256(regionName, kDate);
    var kService = Crypto.HmacSHA256(serviceName, kRegion);
    var kSigning = Crypto.HmacSHA256("aws4_request", kService);
    return kSigning;
}

// this function converts the generic JS ISO8601 date format to the specific format the AWS API wants
function getAmzDate(dateStr) {
  var chars = [":","-"];
  for (var i=0;i<chars.length;i++) {
    while (dateStr.indexOf(chars[i]) != -1) {
      dateStr = dateStr.replace(chars[i],"");
    }
  }
  dateStr = dateStr.split(".")[0] + "Z";
  return dateStr;
}

// the REST API call using the Node.js 'https' module
function performRequest(endpoint, headers, data, success) {

  var dataString = data;

  var options = {
    host: endpoint,
    port: 443,
    path: '/',
    method: 'GET',
    headers: headers
  };

  var req = https.request(options, function(res) {
    res.setEncoding('utf-8');

    var responseString = '';

    res.on('data', function(data) {
      responseString += data;
    });

    res.on('end', function() {
      //console.log(responseString);
      success(responseString);
    });
  });

  req.write(dataString);
  req.end();
}
