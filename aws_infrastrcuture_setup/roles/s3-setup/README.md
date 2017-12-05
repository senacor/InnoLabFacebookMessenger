s3-setup
========

This role setup the s3 buckets and its content.


Role Variables
--------------

With this role variables you are able to setup the s3 strcuture and files to upload.
```yaml
region: eu-central-1
bucket_name: digital-logistic-web3
file_syncs:
  - name: delivery_status_images
    file_root: ./images
    key_prefix: images
    permission: public-read
    cache_control: "public, max-age=31536000"
    include: "*.png"
  - name: simple_webpage
    file_root: ./frontend
    key_prefix: ""
    permission: public-read
    cache_control: "public, max-age=31536000"
    include: "*.html"
```

Example Playbook
----------------

See the example test playbook:

```yaml
---
- hosts: localhost
  connection: local
  roles:
    - ../../s3-setup
```

Test Playbook
-------------

Run the follwoing command in the root of the role to test this role:

    ansible-playbook tests/test.yml
