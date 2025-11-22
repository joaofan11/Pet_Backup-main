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
    folder: 'petplus/pets',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
    public_id: (req, file) => `pet-${Date.now()}`
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

// NOVO: Storage para USUÁRIOS (Perfil)
const userStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'petplus/users',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    public_id: (req, file) => `user-${Date.now()}`
  }
});

// Configurar Multer
const uploadPet = multer({ 
  storage: petStorage,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

const uploadPost = multer({ 
  storage: postStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadUser = multer({ 
  storage: userStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = {
  cloudinary,
  uploadPet,
  uploadPost,
  uploadUser // Exportando o uploader de usuário
};