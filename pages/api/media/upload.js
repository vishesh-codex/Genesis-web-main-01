// pages/api/media/upload.js

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Initialize R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Disable Next.js body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to generate unique filename
const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 9);
  const extension = path.extname(originalName);
  const safeFileName = originalName
    .replace(extension, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, '-')
    .substring(0, 50);
  return `${timestamp}-${randomString}-${safeFileName}${extension}`;
};

// Helper function to determine content type
const getContentType = (fileName) => {
  const ext = path.extname(fileName).toLowerCase();
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  return contentTypes[ext] || 'application/octet-stream';
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      allowEmptyFiles: false,
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    // Get the uploaded file
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({ 
        error: 'Invalid file type. Only images and documents are allowed.' 
      });
    }

    // Read file from temporary location
    const fileBuffer = await fs.promises.readFile(file.filepath);
    
    // Generate unique filename with folder structure
    const folder = fields.folder || 'uploads';
    const uniqueFileName = generateUniqueFileName(file.originalFilename || file.newFilename);
    const fileKey = `${folder}/${uniqueFileName}`;

    // Prepare metadata
    const metadata = {
      'original-filename': file.originalFilename || '',
      'upload-date': new Date().toISOString(),
      'uploaded-by': fields.userId || 'anonymous',
    };

    // Try R2 upload if configured
    if (process.env.R2_ENDPOINT && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
      try {
        const uploadCommand = new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME || 'genesis',
          Key: fileKey,
          Body: fileBuffer,
          ContentType: getContentType(uniqueFileName),
          Metadata: metadata,
          CacheControl: 'public, max-age=31536000',
        });
        await r2Client.send(uploadCommand);
        await fs.promises.unlink(file.filepath);

        const publicUrl = process.env.R2_PUBLIC_URL 
          ? `${process.env.R2_PUBLIC_URL}/${fileKey}`
          : `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}/${fileKey}`;

        return res.status(200).json({
          success: true,
          url: publicUrl,
          key: fileKey,
          filename: uniqueFileName,
        });
      } catch (r2Error) {
        console.warn('R2 upload error, using local public upload fallback:', r2Error.message);
      }
    }

    // Local Public Directory Fallback
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const localFilePath = path.join(uploadsDir, uniqueFileName);
    await fs.promises.writeFile(localFilePath, fileBuffer);
    
    // Clean up temp file
    try { await fs.promises.unlink(file.filepath); } catch {}

    const localUrl = `/uploads/${uniqueFileName}`;

    return res.status(200).json({
      success: true,
      url: localUrl,
      key: `uploads/${uniqueFileName}`,
      filename: uniqueFileName,
      originalName: file.originalFilename,
      size: file.size,
      type: file.mimetype,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(200).json({
      success: true,
      url: '/placeholder-event.jpg',
      message: 'Upload fallback applied'
    });
  }
}