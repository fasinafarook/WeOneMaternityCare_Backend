// // import IFileStorageService from "../../interfaces/utils/IFileStorageService";
// // import AWS from "aws-sdk";
// // import fs from "fs"

// // AWS.config.update({
// //     accessKeyId: process.env.AWS_ACCESS_KEY,
// //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// //     region: process.env.AWS_REGION,
// //   });

// //   const s3 = new AWS.S3();

// // class FileStorageService implements IFileStorageService {
// //     async uploadFile(file: any, keyPrefix: string): Promise<string> {
// //         const params = {
// //             Bucket: process.env.AWS_S3_BUCKET_NAME!,
// //             Key: `${keyPrefix}/${Date.now()}-${file[0].originalname}`,
// //             Body: fs.createReadStream(file[0].path),
// //             ContentType: file[0].mimetype,
// //             ACL: 'public-read',
// //         };
// //           const data = await s3.upload(params).promise();
// //           return data.Location;
// //     }
// // }

// // export default FileStorageService

import IFileStorageService from "../../interfaces/utils/IFileStorageService";
import cloudinary from "cloudinary";
import { v2 as cloudinaryV2 } from 'cloudinary';
import fs from "fs";

// Configure Cloudinary with your credentials
cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log(process.env.CLOUDINARY_CLOUD_NAME);
console.log(process.env.CLOUDINARY_API_KEY);
console.log(process.env.CLOUDINARY_API_SECRET);

class FileStorageService implements IFileStorageService {
  async uploadFile(file: any, keyPrefix: string): Promise<string> {
    const filePath = file[0].path; // Get the file path from the uploaded file

    // Upload the file to Cloudinary
    const result = await cloudinaryV2.uploader.upload(filePath, {
      folder: keyPrefix, // This is the equivalent of the keyPrefix in S3
      use_filename: true, // Use the original file name
      unique_filename: false, // Do not generate a unique file name

    });

    // Clean up the local file if needed
    fs.unlinkSync(filePath);

    // Return the URL of the uploaded file
    return result.secure_url;
  }


  async uploadFiles(file: any, keyPrefix: string): Promise<string> {
        try {
          // Check if file and file.path are available
          if (!file || !file.path) {
            throw new Error("File or file path is missing");
          }
    
          const filePath = file.path;
          const resourceType = file.mimetype.startsWith("video/")
            ? "video"
            : "image";
    
          console.log("Uploading file:", filePath);
          console.log("Resource type:", resourceType);
    
          // Upload the file to Cloudinary
          const result = await cloudinaryV2.uploader.upload(filePath, {
            folder: keyPrefix,
            use_filename: true,
            unique_filename: false,
            resource_type: resourceType, // Set resource type dynamically
          });
    
          console.log("Upload result:", result);
    
          // Clean up the local file if needed
          fs.unlinkSync(filePath);
    
          // Return the URL of the uploaded file
          return result.secure_url;
        } catch (error) {
          console.error("Error uploading file to Cloudinary:", error);
          throw new Error("Failed to upload file to Cloudinary");
        }
      }
}

export default FileStorageService;

// import IFileStorageService from "../../interfaces/utils/IFileStorageService";

// import cloudinary from "cloudinary";
// import { v2 as cloudinaryV2 } from "cloudinary";
// import fs from "fs";

// // Configure Cloudinary with your credentials
// cloudinaryV2.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// class FileStorageService implements IFileStorageService {
//   async uploadFile(file: any, keyPrefix: string): Promise<string> {
//     try {
//       // Check if file and file.path are available
//       if (!file || !file.path) {
//         throw new Error("File or file path is missing");
//       }

//       const filePath = file.path;
//       const resourceType = file.mimetype.startsWith("video/")
//         ? "video"
//         : "image";

//       console.log("Uploading file:", filePath);
//       console.log("Resource type:", resourceType);

//       // Upload the file to Cloudinary
//       const result = await cloudinaryV2.uploader.upload(filePath, {
//         folder: keyPrefix,
//         use_filename: true,
//         unique_filename: false,
//         resource_type: resourceType, // Set resource type dynamically
//       });

//       console.log("Upload result:", result);

//       // Clean up the local file if needed
//       fs.unlinkSync(filePath);

//       // Return the URL of the uploaded file
//       return result.secure_url;
//     } catch (error) {
//       console.error("Error uploading file to Cloudinary:", error);
//       throw new Error("Failed to upload file to Cloudinary");
//     }
//   }
// }

// export default FileStorageService;
