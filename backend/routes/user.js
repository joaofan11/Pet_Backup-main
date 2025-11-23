const router = require('express').Router();
const db = require('../db');
const checkAuth = require('../middleware/checkAuth');
const { uploadPet } = require('../config/cloudinary'); 

router.get('/me', checkAuth, async (req, res) => {
    try {
        const user = await db.query("SELECT id, name, email, phone, photo_url AS \"photoUrl\" FROM users WHERE id = $1", [req.userData.userId]);
        if (user.rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado' });
        res.json(user.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao buscar perfil' });
    }
});

router.put('/me', checkAuth, uploadPet.single('photo'), async (req, res) => {
    const { name, phone } = req.body;
    let photoUrl = req.body.photoUrl; 
    
    if (req.file) {
        photoUrl = req.file.path;
    }

    try {
        const updated = await db.query(
            `UPDATE users SET name = $1, phone = $2, photo_url = $3 
             WHERE id = $4 
             RETURNING id, name, email, phone, photo_url AS "photoUrl"`,
            [name, phone, photoUrl, req.userData.userId]
        );
        res.json(updated.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao atualizar perfil' });
    }
});

module.exports = router;