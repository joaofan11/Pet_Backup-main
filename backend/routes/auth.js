// backend/routes/auth.js
const router = require('express').Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/checkAuth');
const { uploadUser } = require('../config/cloudinary'); // Importando o uploader

// POST /api/auth/register - AGORA COM UPLOAD DE FOTO
router.post('/register', uploadUser.single('photo'), async (req, res) => {
    const { name, email, phone, password, confirmPassword } = req.body;

    // Validações
    if (!name || !email || !phone || !password || !confirmPassword) {
        return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'As senhas não coincidem.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    // Processar Foto
    let photoUrl = null;
    if (req.file) {
        photoUrl = req.file.path;
    }

    try {
        const userExists = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Este email já está cadastrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Inserir usuário com a photo_url
        const newUser = await db.query(
            "INSERT INTO users (name, email, phone, password_hash, photo_url) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, photo_url",
            [name, email, phone, password_hash, photoUrl]
        );
        
        res.status(201).json({ message: 'Cadastro realizado com sucesso!', user: newUser.rows[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro no servidor ao tentar registrar." });
    }
});

// POST /api/auth/login (Sem alterações)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
    }

    try {
        const userResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Email ou senha incorretos.' });
        }

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou senha incorretos.' });
        }

        const payload = { 
            userId: user.id, 
            name: user.name, 
            email: user.email,
            photoUrl: user.photo_url 
        };
        const token = jwt.sign(
            payload, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' } 
        );

        res.json({ 
            message: `Bem-vindo(a), ${user.name}!`,
            token, 
            user: payload
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro no servidor ao tentar logar." });
    }
});

// GET /api/auth/profile (Para buscar dados do perfil)
router.get('/profile', checkAuth, async (req, res) => {
    try {
        const user = await db.query(
            "SELECT id, name, email, phone, photo_url AS \"photoUrl\" FROM users WHERE id = $1", 
            [req.userData.userId]
        );
        res.json(user.rows[0]);
    } catch (err) {
        res.status(500).json({ message: "Erro ao buscar perfil." });
    }
});

// PUT /api/auth/profile (Para atualizar perfil depois)
router.put('/profile', checkAuth, uploadUser.single('photo'), async (req, res) => {
    const { name, phone } = req.body;
    let photoUrl = req.body.photoUrl;

    if (req.file) {
        photoUrl = req.file.path;
    }

    try {
        const updatedUser = await db.query(
            `UPDATE users SET name = $1, phone = $2, photo_url = $3 
             WHERE id = $4 
             RETURNING id, name, email, phone, photo_url AS "photoUrl"`,
            [name, phone, photoUrl, req.userData.userId]
        );
        
        res.json({ message: "Perfil atualizado!", user: updatedUser.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao atualizar perfil." });
    }
});

module.exports = router;