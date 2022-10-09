import { S3Client, PutObjectCommand} from "@aws-sdk/client-s3";
import fs from "fs";
import HttpError from '../models/httpError.js';

const region = process.env.AWS_BUCKET_REGION;
const accessKey = process.env.AWS_ACCESS_KEY;
const secretKey = process.env.AWS_SECRET_KEY;
const bucketName = process.env.AWS_BUCKET_NAME;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey
  },
  region: region,
});

// uploads a file to s3


const uploadFileS3 = async (req, res, next) => {
  if (req.file && !req.body.image) {
    const uploadParams = {
      Bucket: bucketName,
      Body: fs.createReadStream(req.file.path),
      Key: req.file.filename,
      ContentType: req.file.mimetype
    }

    const command = new PutObjectCommand(uploadParams);
    try {
      await s3.send(command)
    } catch (err) {
      const error = new HttpError('Cannot upload the image to the cloud, please try again', 500);
      return next(error);
    }

  }
  next();
};

export default uploadFileS3;






