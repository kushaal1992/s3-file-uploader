
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const parser = require('lambda-multipart-parser');

const BUCKET_NAME = process.env.FILE_UPLOAD_BUCKET_NAME;

module.exports.handler = async (event) => {
    console.log('event---->', event);

    const response = {
        isBase64Encoded: false,
        statusCode: 200,
        body: JSON.stringify({ message: "Successfully uploaded file to S3" }),
    };

    try {
        const result = await parser.parse(event);
        console.log('result-->', result)
        // const parsedBody = JSON.parse(event.body);
        // const base64File = parsedBody.file;
        // const decodedFile = Buffer.from(base64File.replace(/^data:image\/\w+;base64,/, ""), "base64");
        const { content, filename, contentType } = result.files[0];
        const params = {
            Bucket: BUCKET_NAME,
            Key: `images/${new Date().toISOString()}.mp4`,
            Body: content,
            ContentType: contentType,
            // ACL: "public-read",
            ContentDisposition: `attachment; filename="${filename}";`
        };
        let url = await getSignedUrl(params)
        console.log(url)

        const uploadResult = await s3.upload(params).promise();

        response.body = JSON.stringify({ message: "Successfully uploaded file to S3", uploadResult });
    } catch (e) {
        console.error(e);
        response.body = JSON.stringify({ message: "File failed to upload", errorMessage: e });
        response.statusCode = 500;
    }

    return response;
};