#!/bin/bash

gulp app styles libs
aws s3 cp index.html s3://app.texenergo.com/index.html --region eu-west-1 --acl public-read --cache-control max-age=86400
aws s3 cp public/ s3://app.texenergo.com/public/ --recursive  --region eu-west-1 --acl public-read --cache-control max-age=86400
aws s3 cp app/ s3://app.texenergo.com/app/ --recursive --exclude "*" --include "*.html" --region eu-west-1 --acl public-read --cache-control max-age=86400
aws s3 cp assets/plugin/tinymce/ s3://app.texenergo.com/assets/plugin/tinymce/ --recursive --exclude "*" --include "tinymce.min.js" --region eu-west-1 --acl public-read --cache-control max-age=86400
aws s3 cp assets/img/ s3://app.texenergo.com/assets/img/ --recursive  --region eu-west-1 --acl public-read --cache-control max-age=86400
aws s3 cp assets/smart_admin/ s3://app.texenergo.com/assets/smart_admin/ --recursive  --region eu-west-1 --acl public-read --cache-control max-age=86400