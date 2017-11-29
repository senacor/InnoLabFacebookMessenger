#!/bin/sh

echo "create web bucket"
aws s3api create-bucket --acl public-read --bucket digital-logistic-web --region eu-central-1 --create-bucket-configuration LocationConstraint=eu-central-1

echo "create parcel bucket"
aws s3api create-bucket --acl private --bucket digital-logistic-parcel --region eu-central-1 --create-bucket-configuration LocationConstraint=eu-central-1
