#!/bin/sh

aws s3api create-bucket --acl public-read --bucket digital-logistic-web --region eu-central-1 --create-bucket-configuration LocationConstraint=eu-central-1
