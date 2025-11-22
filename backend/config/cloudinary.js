// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage para PETS
const petStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'petplus/pets', // Pasta no Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }], // Redimensiona
    public_id: (req, file) => `pet-${Date.now()}` // Nome do arquivo
  }
});

// Storage para POSTS DO BLOG
const postStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'petplus/posts',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
    public_id: (req, file) => `post-${Date.now()}`
  }
});

// Configurar Multer
const uploadPet = multer({ 
  storage: petStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB
});

const uploadPost = multer({ 
  storage: postStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = {
  cloudinary,
  uploadPet,
  uploadPost
};