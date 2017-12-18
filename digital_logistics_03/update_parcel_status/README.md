# Update Parcel Status

## Known issues

Due to claudia's `fbSend` method implementation, it can take more then the default 3 seconds for them lambda to complete. To prevent timeout, increase limit to 10 seconds.