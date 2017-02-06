# AWS REST API Authentication Demo
## Overview
In order to use the AWS REST API, the requestor has to authenticate using a Signature Version 4 header.
This project is a demonstration of how to build this header, and make a successful request using Node.js.

The request used in this demo will list the contents of a given S3 bucket.

## Pre-requisites
* This was tested with the latest LTS release of Node.js (currently v6.9.5)
* This requires the 'xml2js' package, which can be pulled through npm
* An AWS account with at least S3 read permissions is required
* A target S3 bucket name is required, and the region of the bucket should be known

## Substitutions
The following lines need to be updated before running the script:
```JavaScript
var access_key = 'ACCESS_KEY_VALUE';
var secret_key = 'SECRET_KEY_VALUE';
var region = 'eu-west-1';
var url = 'my-bucket-name.s3.amazonaws.com';
```

## Future Development
Looking to add the following functionality over time:
* POST requests to S3
* List Buckets in S3
* Work with other AWS services (DynamoDB, EC2, RDS)
