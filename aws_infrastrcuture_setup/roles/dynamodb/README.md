Dynamodb
========

Create the dynamodb tables and add the trigger to lambda functions

Requirements
------------

This Project needs an install AWS CLI with Boto, ideally use this docker commandline as discribed here: https://github.com/kochp/ansible-aws-bash

    docker run -ti -v $(pwd):/project -v ~/.aws:/root/.aws -v $HOME/.ssh:/root/.ssh  -v /var/run/docker.sock:/var/run/docker.sock kochp/ansible-aws-bash:v1.6 bash


Role Variables
--------------

These variables are defined in the defaults to created the dynamodb tables and connect the trigger to a existing lambda.

```yaml
region: eu-central-1
account: 604370441254

tables:
  - name: digital_logistics_parcel_2
    hash_key_name: parcel_id
    hash_key_type: STRING
    range_key_name: parcel_create_time
    range_key_type: STRING
    read_capacity: 2
    write_capacity: 2
    trigger:
      enabled: false
  - name: digital_logistics_customer_2
    hash_key_name: customer_id
    hash_key_type: STRING
    range_key_name: ''
    range_key_type: STRING
    read_capacity: 2
    write_capacity: 2
    trigger:
      enabled: true
      stream_view_type: NEW_AND_OLD_IMAGES
      function_name: update_parcel_status_test
``

Example Playbook
----------------

Including an example of how to use your role (for instance, with variables passed in as parameters) is always nice for users too:

```yaml
        - hosts: localhost
          connection: local
          roles:
            - ../../dynamodb
```


Test Playbook
-------------

Run the follwoing command in the root of the role to test this role:

    ansible-playbook tests/test.yml
