#!/bin/bash

# Configuration
LAST_UPLOAD_STAMP=.last_upload_stamp
AWS_BUCKET=app.texenergo.com
CF_DISTRIBUTION_ID=E2151ROOTNL7JP

# Function that upload all files received as parameters to AWS
function aws_s3_cp
{
    for i in "$@"; do
        aws s3 cp "$i" "s3://$AWS_BUCKET/$i" --region eu-west-1 --acl public-read --cache-control max-age=864000    
    done
}

# Function that invalidates on cloudfront all files received as parameters
function aws_cloudfront_invalidate
{
    declare -a paths=("${@}")
    if [ ${#paths[@]} -gt 0 ]; then
        aws cloudfront create-invalidation --distribution-id $CF_DISTRIBUTION_ID --paths "${paths[@]}"
    fi
}

# Exit immediately if a command exits with a non-zero status
set -e 

# Concatenate and minify any JS and CSS files.
gulp

# Create the file for upload timestamp if it doesn't exist  
if [ ! -f "$LAST_UPLOAD_STAMP" ]; then
    touch  -t 0001010000 "$LAST_UPLOAD_STAMP"
    first_upload=TRUE
fi

# Check index.html
root_files=()
if [ "index.html" -nt "$LAST_UPLOAD_STAMP" ]; then
    root_files=("index.html")
fi

# Check public files
public_files=()
while IFS= read -d $'\0' -r file ; do
     public_files=("${public_files[@]}" "$file")
done < <(find public -type f -newer "$LAST_UPLOAD_STAMP" -print0)

# Check app files
app_files=()
while IFS= read -d $'\0' -r file ; do
     app_files=("${app_files[@]}" "$file")
done < <(find app -type f -newer "$LAST_UPLOAD_STAMP" \( -name "*.html" -o -name "*.mp3" \)  -print0)

# Check tinymce files
tinymce_files=()
while IFS= read -d $'\0' -r file ; do
     tinymce_files=("${tinymce_files[@]}" "$file")
done < <(find assets/plugin/tinymce -type f -newer "$LAST_UPLOAD_STAMP" -print0)

# Create array with all modified files
updated_list=("${root_files[@]}" "${public_files[@]}" "${app_files[@]}" "${tinymce_files[@]}")

# Upload to S3
aws_s3_cp "${updated_list[@]}"

# Cloudfront invalidation 
if [ -n "$first_upload" ]; then
    echo "First upload, don't invalidate cloudfront"
else
    prepended_updated_list=()
    for i in "${updated_list[@]}"; do
        prepended_updated_list+=("/$i")
    done  
    aws_cloudfront_invalidate "${prepended_updated_list[@]}"
fi

# Update timestamp last upload with current time
touch "$LAST_UPLOAD_STAMP"

echo "${#updated_list[@]} file(s) updated." 







# gulp
# aws s3 cp index.html s3://app.texenergo.com/index.html --region eu-west-1 --acl public-read --cache-control max-age=864000
# aws s3 cp public/ s3://app.texenergo.com/public/ --recursive  --region eu-west-1 --acl public-read --cache-control max-age=864000
# aws s3 cp app/ s3://app.texenergo.com/app/ --recursive --exclude "*" --include "*.html" --region eu-west-1 --acl public-read --cache-control max-age=864000
# aws s3 cp app/ s3://app.texenergo.com/app/ --recursive --exclude "*" --include "*.mp3" --region eu-west-1 --acl public-read --cache-control max-age=864000
# aws s3 cp assets/plugin/tinymce/ s3://app.texenergo.com/assets/plugin/tinymce/ --recursive --region eu-west-1 --acl public-read --cache-control max-age=864000

# # aws s3 cp assets/img/ s3://app.texenergo.com/assets/img/ --recursive  --region eu-west-1 --acl public-read --cache-control max-age=864000
# # aws s3 cp assets/smart_admin/ s3://app.texenergo.com/assets/smart_admin/ --recursive  --region eu-west-1 --acl public-read --cache-control max-age=864000
# aws cloudfront create-invalidation --distribution-id E2151ROOTNL7JP --paths /public/assets/javascripts/app-modules-min.js /public/assets/javascripts/libs-min.js /public/assets/stylesheets/app-styles.css /app/supplier_orders/views/viewSupplierOrder.html