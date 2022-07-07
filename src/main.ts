// import "dotenv/config";

import { CodePipeline, S3Outposts, WorkMailMessageFlow } from "aws-sdk";

import dotenv from "dotenv";

import AWS from "aws-sdk";
import s3ParseUrl from "s3-url-parser";

// import * as Ffmpeg from "fluent-ffmpeg";

import ffmpeg from "fluent-ffmpeg";

ffmpeg.setFfmpegPath("/opt/bin/ffmpeg");
ffmpeg.setFfprobePath("/opt/bin/ffprobe");
import { Generator } from "webpack";

import { APIGatewayEvent, ErrorInterface } from "./types/aws";

import { RequestBody, Response } from "./types";

import { getEnvVar } from "./utils/env";


import fs from "fs";

import { APIGatewayResponse } from "./utils/aws";

const { BUCKET_NAME } = process.env;

const s3 = new AWS.S3();

export const handler = async (
  event
): Promise<APIGatewayResponse<Response>> => {

  try {
    const body = JSON.parse(event.body);

    const videoUrl = body.url;

    const { bucket, region, key } = s3ParseUrl(`${videoUrl}`);

    const videoName = key.split(".");

    const videoChangedName = `${videoName[0]}_changed.mp4`;

    let objectToConvert = ffmpeg(videoUrl).duration(90);

    await new Promise(async (resolve, reject) => {
      ffmpeg.ffprobe(videoUrl, (err, metadata) => {
        if (err) {
          return reject(err);
        }
        const width = metadata.streams[0].width;
        const height = metadata.streams[0].height;

        if (width > 800 && height < 800) {
          objectToConvert.size("800x?");
        }
        if (height > 800 && width < 800) {
          objectToConvert.size("?x800");
        }
        if (height > 800 && width > 800) {
          objectToConvert.size("800x800");
        }

        objectToConvert.save("/tmp/outputVideo.mp4").on("end", () => {

          resolve(true);

        });
      });
    });
    const videoBuffer = fs.readFileSync("/tmp/outputVideo.mp4");
    const uploadVideo = await s3
      .putObject({
        Bucket: BUCKET_NAME,
        Key: videoChangedName,
        Body: videoBuffer,
      })
      .promise();
    
    const uploadUrl = s3.getSignedUrl("getObject", {
      Bucket: BUCKET_NAME,
      Key: videoChangedName,
    });

    const response: APIGatewayResponse<Response> = {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        changedVideoUrl: uploadUrl,
      }),
    };
    
    return response;

  } catch (e) {
    console.log(e);
    const response: APIGatewayResponse<Response> = {
      body: {
        message: "Error",
      },
    };
    return response;
  }
};
