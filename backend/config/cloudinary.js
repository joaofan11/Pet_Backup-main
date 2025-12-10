const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ========================================
// FORMATOS DE IMAGEM SUPORTADOS
// ========================================
// Formatos mais comuns + formatos modernos
const ALLOWED_IMAGE_FORMATS = [
  'jpg', 'jpeg', 'png', 'webp',  // Formatos comuns
  'gif',                          // Animações
  'bmp', 'tiff',                  // Formatos antigos
  'svg',                          // Vetorial
  'heic', 'heif',                 // Formatos iPhone
  'avif'                          // Formato moderno de alta compressão
];

// ========================================
// STORAGE PARA PETS
// ========================================
const petStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'petplus/pets',
    allowed_formats: ALLOWED_IMAGE_FORMATS,
    transformation: [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto:good' }, // Otimização automática de qualidade
      { fetch_format: 'auto' }  // Converte para o melhor formato
    ],
    public_id: (req, file) => `pet-${Date.now()}`
  }
});

// ========================================
// STORAGE PARA POSTS DO BLOG
// ========================================
const postStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'petplus/posts',
    allowed_formats: ALLOWED_IMAGE_FORMATS,
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' }
    ],
    public_id: (req, file) => `post-${Date.now()}`
  }
});

// ========================================
// STORAGE PARA FOTOS DE PERFIL
// ========================================
const userStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'petplus/users',
    allowed_formats: ALLOWED_IMAGE_FORMATS,
    transformation: [
      { width: 500, height: 500, crop: 'fill', gravity: 'face' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' }
    ],
    public_id: (req, file) => `user-${Date.now()}`
  }
});

// ========================================
// CONFIGURAÇÃO DO MULTER COM VALIDAÇÃO
// ========================================
const createMulterUpload = (storage, maxSize = 10) => {
  return multer({ 
    storage: storage,
    limits: { 
      fileSize: maxSize * 1024 * 1024 // Converte MB para bytes
    },
    fileFilter: (req, file, cb) => {
      // Verifica se o mimetype é de imagem
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
      }
      
      // Extrai a extensão do arquivo
      const ext = file.originalname.split('.').pop().toLowerCase();
      
      // Verifica se a extensão está na lista de permitidos
      if (!ALLOWED_IMAGE_FORMATS.includes(ext)) {
        return cb(new Error(`Formato .${ext} não é suportado. Formatos aceitos: ${ALLOWED_IMAGE_FORMATS.join(', ')}`), false);
      }
      
      cb(null, true);
    }
  });
};

// ========================================
// EXPORTS COM LIMITES DE TAMANHO
// ========================================
const uploadPet = createMulterUpload(petStorage, 10);    // 10MB para pets
const uploadPost = createMulterUpload(postStorage, 10);  // 10MB para posts
const uploadUser = createMulterUpload(userStorage, 5);   // 5MB para perfil

module.exports = {
  cloudinary,
  uploadPet,
  uploadPost,
  uploadUser,
  ALLOWED_IMAGE_FORMATS // Exporta para uso em outras partes da aplicação
};
