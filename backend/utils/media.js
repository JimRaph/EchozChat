import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import CloudinaryStorage from 'multer-storage-cloudinary';
import path from 'path';

const sanitizeFilename = (name)=> {
  return name
    .replace(/\s+/g, '_')           
    .replace(/[()]/g, '')           
    .replace(/[^a-zA-Z0-9._-]/g, '')
}


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

 const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {

    const fileType = file.mimetype.split('/')[0];
    const originalFilename = path.parse(file.originalname).name;
    const extension = path.parse(file.originalname).ext.toLowerCase();
    const sanitizedName = sanitizeFilename(originalFilename);    
    

    const uploadOptions = {
      folder: 'EchozChat-clone',
      use_filename: false,
      unique_filename: false,
      overwrite: false,
    };
    

       if (fileType === 'image') {
      uploadOptions.resource_type = 'image';
      uploadOptions.public_id = sanitizedName.replace(/\.[^/.]+$/, '');
    } else if (fileType === 'video' || fileType === 'audio') {
      uploadOptions.public_id = sanitizedName.replace(/\.[^/.]+$/, '');
      uploadOptions.resource_type = 'video'; 
    } else {
      uploadOptions.resource_type = 'raw';
      uploadOptions.public_id = sanitizedName + extension; 
    }


    if (fileType === 'image') {
      uploadOptions.responsive_breakpoints = {
        create_derived: true,
        bytes_step: 20000,
        min_width: 200,
        max_width: 1000,
      };
    } else if (fileType === 'video' || fileType === 'audio') {
      uploadOptions.quality = 'auto';
    }

    return uploadOptions
  }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/png", "image/jpeg", "image/jpg", "image/gif",
            "video/mp4", "video/mov", "video/avi",
            "application/pdf", "text/csv", "application/octet-stream",
            "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/plain", "application/csv",
            "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only images, videos, PDFs, Word, Excel, and PowerPoint files are allowed."));
        }
    }
});


export { storage, upload, cloudinary };
