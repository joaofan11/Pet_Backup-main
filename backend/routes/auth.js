const router = require('express').Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/checkAuth');
const { uploadUser } = require('../config/cloudinary');

router.post('/register', async (req, res) => {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !phone || !password || !confirmPassword) {
        return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'As senhas não coincidem.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    try {
        const userExists = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Este email já está cadastrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUser = await db.query(
            "INSERT INTO users (name, email, phone, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, name, email, phone",
            [name, email, phone, password_hash]
        );
        
        res.status(201).json({ message: 'Cadastro realizado com sucesso!', user: newUser.rows[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro no servidor ao tentar registrar." });
    }
});

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

        const payload = { userId: user.id, name: user.name, email: user.email, photoUrl: user.photo_url };
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

router.get('/me', checkAuth, async (req, res) => {
    try {
        const userResult = await db.query(
            "SELECT id, name, email, phone, photo_url AS \"photoUrl\" FROM users WHERE id = $1", 
            [req.userData.userId]
        );
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        res.json(userResult.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao buscar perfil." });
    }
});

router.put('/update', checkAuth, uploadUser.single('photo'), async (req, res) => {
    const { name, email, phone, password, confirmPassword } = req.body;
    const userId = req.userData.userId;

    try {
        let updateQuery = "UPDATE users SET name = $1, email = $2, phone = $3";
        let params = [name, email, phone];
        let paramCount = 3;

        if (password) {
            if (password !== confirmPassword) {
                return res.status(400).json({ message: 'As senhas não coincidem.' });
            }
            if (password.length < 6) {
                return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres.' });
            }
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);
            paramCount++;
            updateQuery += `, password_hash = $${paramCount}`;
            params.push(password_hash);
        }

        if (req.file) {
            paramCount++;
            updateQuery += `, photo_url = $${paramCount}`;
            params.push(req.file.path);
        }

        paramCount++;
        updateQuery += ` WHERE id = $${paramCount} RETURNING id, name, email, phone, photo_url AS "photoUrl"`;
        params.push(userId);

        const updatedUser = await db.query(updateQuery, params);

        const user = updatedUser.rows[0];
        const payload = { userId: user.id, name: user.name, email: user.email, photoUrl: user.photoUrl };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ 
            message: 'Perfil atualizado com sucesso!',
            user: payload,
            token
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao atualizar perfil." });
    }
});

module.exports = router;