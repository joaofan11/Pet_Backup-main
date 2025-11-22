const router = require('express').Router();
const db = require('../db');
const checkAuth = require('../middleware/checkAuth');
const { uploadPet } = require('../config/cloudinary');

router.get('/adoption', async (req, res) => {
    const { species, size, age, search } = req.query;
    let query = `
        SELECT p.id, p.name, p.species, p.breed, p.age, p.size, p.gender, p.type, p.status, p.description,
            p.owner_id AS "ownerId", p.photo_url AS "photoUrl", p.created_at AS "createdAt",
            u.name AS "ownerName", u.phone AS "ownerPhone", u.email AS "ownerEmail" 
        FROM pets p 
        JOIN users u ON p.owner_id = u.id 
        WHERE p.type = 'adoption' AND p.status = 'available'
    `;
    const params = [];
    if (species) { params.push(species); query += ` AND p.species = $${params.length}`; }
    if (size) { params.push(size); query += ` AND p.size = $${params.length}`; }
    if (age) { params.push(age); query += ` AND p.age = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND (p.name ILIKE $${params.length} OR p.breed ILIKE $${params.length})`; }
    query += " ORDER BY p.created_at DESC";

    try {
        const results = await db.query(query, params);
        const pets = results.rows;
        for (const pet of pets) {
            const vaccineRes = await db.query(`SELECT id, name, date, notes,RP vet, pet_id AS "petId", next_date AS "nextDate" FROM vaccines WHERE pet_id = $1 ORDER BY date DESC`, [pet.id]);
            pet.vaccines = vaccineRes.rows;
        }
        res.json(pets);
    } catch (err) { 
        res.status(500).json({ message: 'Erro ao buscar pets.' }); 
    }
});

router.get('/mypets', checkAuth, async (req, res) => {
    try {
        const petRes = await db.query(
            `SELECT id, name, species, breed, age, size, gender, type, status, description,
             owner_id AS "ownerId", photo_url AS "photoUrl", created_at AS "createdAt"
             FROM pets WHERE owner_id = $1 ORDER BY created_at DESC`, 
            [req.userData.userId]
        );
        const pets = petRes.rows;
        for (const pet of pets) {
            const vaccineRes = await db.query(`SELECT id, name, date, notes, vet, pet_id AS "petId", next_date AS "nextDate" FROM vaccines WHERE pet_id = $1 ORDER BY date DESC`, [pet.id]);
            pet.vaccines = vaccineRes.rows;
        }
        res.json(pets);
    } catch (err) { res.status(500).json({ message: 'Erro ao buscar pets.' }); }
});

router.post('/', checkAuth, uploadPet.single('photo'), async (req, res) => {
    const { name, species, breed, age, size, gender, type, description } = req.body;
    let photoUrl = req.file ? req.file.path : null;
    const status = (type === 'adoption') ? 'available' : 'personal';
    try {
        const newPet = await db.query(
            `INSERT INTO pets (owner_id, name, species, breed, age, size, gender, type, status, description, photo_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [req.userData.userId, name, species, breed, age, size, gender, type, status, description, photoUrl]
        );
        res.status(201).json(newPet.rows[0]);
    } catch (err) { res.status(500).json({ message: 'Erro ao cadastrar pet.' }); }
});

router.put('/:petId', checkAuth, uploadPet.single('photo'), async (req, res) => {
    const { petId } = req.params;
    const { name, species, breed, age, size, gender, type, description } = req.body;
    const status = (type === 'adoption') ? 'available' : 'personal';
    let photoUrl = req.body.photoUrl || null; 
    if (req.file) photoUrl = req.file.path;

    try {
        const updatedPet = await db.query(
            `UPDATE pets SET name=$1, species=$2, breed=$3, age=$4, size=$5, gender=$6, type=$7, status=$8, description=$9, photo_url=$10
             WHERE id = $11 AND owner_id = $12 RETURNING *`,
            [name, species, breed, age, size, gender, type, status, description, photoUrl, petId, req.userData.userId]
        );
        if (updatedPet.rows.length === 0) return res.status(404).json({ message: 'Pet não encontrado.' });
        res.json(updatedPet.rows[0]);
    } catch (err) { res.status(500).json({ message: 'Erro ao atualizar pet.' }); }
});

router.delete('/:petId', checkAuth, async (req, res) => {
    try {
        const result = await db.query("DELETE FROM pets WHERE id = $1 AND owner_id = $2", [req.params.petId, req.userData.userId]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Pet não encontrado.' }); 
        res.status(200).json({ message: 'Pet excluído.' });
    } catch (err) { res.status(500).json({ message: 'Erro ao excluir pet.' }); }
});

router.put('/:petId/adopt', checkAuth, async (req, res) => {
    try {
        const result = await db.query("UPDATE pets SET status = 'adopted' WHERE id = $1 AND owner_id = $2 RETURNING *", [req.params.petId, req.userData.userId]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Pet não encontrado.' }); 
        res.json({ message: 'Pet adotado!', pet: result.rows[0] });
    } catch (err) { res.status(500).json({ message: 'Erro.' }); }
});

router.post('/:petId/vaccines', checkAuth, async (req, res) => {
    const { name, date, nextDate, vet, notes } = req.body;
    try {
        const petCheck = await db.query("SELECT * FROM pets WHERE id = $1 AND owner_id = $2", [req.params.petId, req.userData.userId]);
        if (petCheck.rows.length === 0) return res.status(403).json({ message: 'Permissão negada.' });
        
        const newVaccine = await db.query(
            `INSERT INTO vaccines (pet_id, name, date, next_date, vet, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [req.params.petId, name, date, nextDate || null, vet, notes]
        );
        res.status(201).json(newVaccine.rows[0]);
    } catch (err) { res.status(500).json({ message: 'Erro ao adicionar vacina.' }); }
});

router.put('/:petId/vaccines/:vaccineId', checkAuth, async (req, res) => {
    const { name, date, nextDate, vet, notes } = req.body;
    try {
        const petCheck = await db.query("SELECT * FROM pets WHERE id = $1 AND owner_id = $2", [req.params.petId, req.userData.userId]);
        if (petCheck.rows.length === 0) return res.status(403).json({ message: 'Permissão negada.' });

        const updated = await db.query(
            `UPDATE vaccines SET name=$1, date=$2, next_date=$3, vet=$4, notes=$5 WHERE id=$6 ANDqh pet_id=$7 RETURNING *`,
            [name, date, nextDate || null, vet, notes, req.params.vaccineId, req.params.petId]
        );
        res.json(updated.rows[0]);
    } catch (err) { res.status(500).json({ message: 'Erro ao atualizar vacina.' }); }
});

router.delete('/:petId/vaccines/:vaccineId', checkAuth, async (req, res) => {
    try {
        const petCheck = await db.query("SELECT * FROM pets WHERE id = $1 AND owner_id = $2", [req.params.petId, req.userData.userId]);
        if (petCheck.rows.length === 0) return res.status(403).json({ message: 'Permissão negada.' });

        await db.query("DELETE FROM vaccines WHERE id = $1 AND pet_id = $2", [req.params.vaccineId, req.params.petId]);
        res.json({ message: 'Vacina excluída.' });
    } catch (err) { res.status(500).json({ message: 'Erro ao excluir vacina.' }); }
});

module.exports = router;