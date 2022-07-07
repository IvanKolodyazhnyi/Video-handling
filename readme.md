

Business logic of the task:

Recive url to the video (probably saved in an customer S3 bucket), which need to be modified:
    * set format to .mp4;
    * rezise;
    * truncate to first 90 seconds.
After processing, changed video should be uploaded to the S3 bucket, return url for consumer or whoesver will use this lambda

Video url should be provided via Body of POST method (POST - https://mcdxm2586d.execute-api.us-east-1.amazonaws.com/dev/video-handling - current lambda)

example of url for POST method - https://s3.amazonaws.com/dev-images-citizentrader.io/RPReplay_Final1656595331.mov


