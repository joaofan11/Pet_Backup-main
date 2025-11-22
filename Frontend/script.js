const API_URL = 'https://petplus-backend.onrender.com/api'; 
let currentUser = null;
let pets = [];
let serviceProviders = [];
let blogPosts = [];

async function apiFetch(endpoint, options = {}) {
    const headers = { ...options.headers };
    if (currentUser && currentUser.token) {
        headers['Authorization'] = `Bearer ${currentUser.token}`;
    }
    if (!options.isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    try {
        const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
        }
        if (response.status === 204) return null;
        return await response.json();
    } catch (error) {
        console.error(`Fetch error ${endpoint}:`, error);
        throw error;
    }
}

function showMessage(elementId, message, type = 'success') {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.className = `message ${type} active`;
    setTimeout(() => el.classList.remove('active'), 5000);
}

function formatDate(date) {
    if (!date) return 'Data inválida';
    return new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function formatDateTime(date) {
    if (!date) return 'Data inválida';
    return new Date(date).toLocaleString('pt-BR');
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) target.classList.add('active');
    
    const btn = Array.from(document.querySelectorAll('.nav-btn')).find(b => b.getAttribute('onclick')?.includes(pageId));
    if (btn) btn.classList.add('active');

    if (pageId === 'adoption') loadAdoptionPets();
    else if (pageId === 'my-pets') loadMyPets();
    else if (pageId === 'services') loadServices();
    else if (pageId === 'blog') loadBlogPosts();
    else if (pageId === 'user-profile') loadUserProfile();
}

function updateAuthButtons() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const myPetsBtn = document.getElementById('myPetsBtn');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    const heroRegisterBtn = document.getElementById('heroRegisterBtn');
    const userAvatarNav = document.getElementById('userAvatarNav');

    if (currentUser) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        myPetsBtn.style.display = 'inline-block';
        if(heroRegisterBtn) heroRegisterBtn.style.display = 'none';
        userInfo.classList.add('active');
        userName.textContent = currentUser.user.name;
        
        // Atualiza avatar no nav se existir
        if (currentUser.user.photoUrl) {
            userAvatarNav.src = currentUser.user.photoUrl;
            userAvatarNav.style.display = 'inline-block';
        } else {
            userAvatarNav.style.display = 'none';
        }

    } else {
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        myPetsBtn.style.display = 'none';
        if(heroRegisterBtn) heroRegisterBtn.style.display = 'inline-block';
        userInfo.classList.remove('active');
        userAvatarNav.style.display = 'none';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try {
        const data = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        // Busca dados completos do usuário incluindo foto
        currentUser = data;
        localStorage.setItem('petplus_auth', JSON.stringify(currentUser));
        
        // Tenta atualizar o objeto user com dados frescos (foto)
        try {
            const freshUser = await apiFetch('/users/me');
            currentUser.user = { ...currentUser.user, ...freshUser };
            localStorage.setItem('petplus_auth', JSON.stringify(currentUser));
        } catch(e) {}

        updateAuthButtons();
        showPage('landing');
        e.target.reset();
    } catch (error) {
        showMessage('loginMessage', error.message, 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    if (password !== confirmPassword) return showMessage('registerMessage', 'Senhas não conferem', 'error');

    try {
        await apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, phone, password, confirmPassword })
        });
        showMessage('registerMessage', 'Cadastro realizado!', 'success');
        e.target.reset();
        setTimeout(() => showPage('login'), 2000);
    } catch (error) {
        showMessage('registerMessage', error.message, 'error');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('petplus_auth');
    updateAuthButtons();
    showPage('landing');
}

function checkLocalStorageLogin() {
    const authData = localStorage.getItem('petplus_auth');
    if (authData) {
        currentUser = JSON.parse(authData);
        updateAuthButtons();
    }
}

// --- PERFIL DO USUÁRIO ---

async function loadUserProfile() {
    if (!currentUser) return showPage('login');
    try {
        const user = await apiFetch('/users/me');
        document.getElementById('profileName').value = user.name;
        document.getElementById('profileEmail').value = user.email;
        document.getElementById('profilePhone').value = user.phone;
        
        const preview = document.getElementById('profileImagePreview');
        if (user.photoUrl) {
            preview.style.backgroundImage = `url(${user.photoUrl})`;
            preview.textContent = '';
        } else {
            preview.style.backgroundImage = '';
            preview.textContent = 'Sem foto';
            preview.style.display = 'flex';
            preview.style.alignItems = 'center';
            preview.style.justifyContent = 'center';
        }
    } catch (error) {
        showMessage('profileMessage', 'Erro ao carregar perfil', 'error');
    }
}

function previewProfileImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profileImagePreview').style.backgroundImage = `url(${e.target.result})`;
            document.getElementById('profileImagePreview').textContent = '';
        }
        reader.readAsDataURL(input.files[0]);
    }
}

document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
        const updatedUser = await apiFetch('/users/me', {
            method: 'PUT',
            body: formData,
            isFormData: true
        });
        
        // Atualiza sessão local
        currentUser.user = { ...currentUser.user, ...updatedUser };
        localStorage.setItem('petplus_auth', JSON.stringify(currentUser));
        updateAuthButtons();
        
        showMessage('profileMessage', 'Perfil atualizado!', 'success');
    } catch (error) {
        showMessage('profileMessage', error.message, 'error');
    }
});

// --- PETS ---

async function loadAdoptionPets() {
    const container = document.getElementById('adoptionPets');
    container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    try {
        const params = new URLSearchParams({
            search: document.getElementById('searchFilter')?.value || '',
            species: document.getElementById('speciesFilter')?.value || ''
        });
        pets = await apiFetch(`/pets/adoption?${params}`);
        displayPets(pets, container, true);
    } catch (error) {
        container.innerHTML = '<p>Erro ao carregar pets.</p>';
    }
}

async function loadMyPets() {
    if (!currentUser) return showPage('login');
    const container = document.getElementById('myPetsGrid');
    container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    try {
        pets = await apiFetch('/pets/mypets');
        displayPets(pets, container, false);
    } catch (error) {
        container.innerHTML = '<p>Erro ao carregar seus pets.</p>';
    }
}

function displayPets(list, container, isAdoption) {
    if (list.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>Nenhum pet encontrado</h3></div>';
        return;
    }
    container.innerHTML = list.map(pet => {
        const img = pet.photoUrl ? `<img src="${pet.photoUrl}">` : (pet.species === 'dog' ? '🐕' : '🐱');
        let btns = `<button class="btn btn-small" onclick="openPetProfile(${pet.id})">Ver Perfil</button>`;
        
        if (!isAdoption && currentUser && pet.ownerId == currentUser.user.userId) {
            btns += `<button class="btn btn-small" onclick="showPetRegisterPage(${pet.id})" style="background:#4299e1">Editar</button>`;
            if (pet.type === 'personal') btns += `<button class="btn btn-small" onclick="openVaccinationModal(${pet.id})" style="background:#ed8936">+ Vacina</button>`;
        } else if (isAdoption && currentUser) {
            btns += `<button class="btn btn-small" style="background:#38a169" onclick="showContact('${pet.ownerName}', '${pet.ownerPhone}', '${pet.ownerEmail}')">Contato</button>`;
        }

        return `
        <div class="pet-card">
            <div class="pet-image">${typeof img === 'string' && img.startsWith('<') ? img : `<span style="font-size:4rem">${img}</span>`}</div>
            <div class="pet-info">
                <div class="pet-name">${pet.name}</div>
                <p>${pet.breed}, ${pet.age}</p>
                <div class="pet-actions">${btns}</div>
            </div>
        </div>`;
    }).join('');
}

function showPetRegisterPage(petId) {
    document.getElementById('petRegisterForm').reset();
    document.getElementById('petEditId').value = '';
    document.getElementById('petFormButton').textContent = 'Cadastrar Pet';
    document.getElementById('deletePetButtonWrapper').style.display = 'none';
    
    if (petId) {
        const pet = pets.find(p => p.id === petId);
        if (pet) {
            document.getElementById('petEditId').value = pet.id;
            document.getElementById('petName').value = pet.name;
            document.getElementById('petType').value = pet.type;
            document.getElementById('petSpecies').value = pet.species;
            document.getElementById('petBreed').value = pet.breed;
            document.getElementById('petAge').value = pet.age;
            document.getElementById('petSize').value = pet.size;
            document.getElementById('petGender').value = pet.gender;
            document.getElementById('petDescription').value = pet.description;
            document.getElementById('petFormButton').textContent = 'Atualizar Pet';
            document.getElementById('deletePetButtonWrapper').style.display = 'block';
        }
    }
    showPage('pet-register');
}

document.getElementById('petRegisterForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const id = document.getElementById('petEditId').value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/pets/${id}` : '/pets';
    
    // Se editando e não enviou nova foto, tenta manter a antiga (a lógica idealmente é no backend não substituir se null, mas aqui garantimos envio se necessário)
    if (id) {
         const pet = pets.find(p => p.id == id);
         if (pet && pet.photoUrl) formData.append('photoUrl', pet.photoUrl);
    }

    try {
        await apiFetch(url, { method, body: formData, isFormData: true });
        showMessage('petRegisterMessage', `Pet ${id ? 'atualizado' : 'cadastrado'}!`);
        setTimeout(() => showPage('my-pets'), 1500);
    } catch (error) {
        showMessage('petRegisterMessage', error.message, 'error');
    }
});

async function deletePetFromForm() {
    const id = document.getElementById('petEditId').value;
    if (confirm('Excluir este pet?')) {
        try {
            await apiFetch(`/pets/${id}`, { method: 'DELETE' });
            showPage('my-pets');
        } catch (e) { alert(e.message); }
    }
}

// --- VACINAS (EDICÃO/EXCLUSÃO) ---

function openPetProfile(petId) {
    const pet = pets.find(p => p.id === petId);
    if (!pet) return;
    const isOwner = currentUser && currentUser.user.userId == pet.ownerId;
    
    const vaccinesHtml = pet.vaccines.map(v => {
        let actions = '';
        if (isOwner) {
            // Passar dados via JSON stringify pode ser complexo com aspas, melhor passar ID e buscar do objeto pet
            actions = `
            <div class="vaccine-actions">
                <button class="btn-icon" onclick='prepareEditVaccine(${pet.id}, ${JSON.stringify(v)})' title="Editar">✏️</button>
                <button class="btn-icon" onclick="deleteVaccine(${pet.id}, ${v.id})" title="Excluir">🗑️</button>
            </div>`;
        }
        return `
        <div class="vaccination-item">
            <div class="vaccination-info">
                <h4>💉 ${v.name}</h4>
                <small>Data: ${formatDate(v.date)} | Vet: ${v.vet || '-'}</small>
                ${v.nextDate ? `<br><small style="color:#ed8936">Próxima: ${formatDate(v.nextDate)}</small>` : ''}
            </div>
            ${actions}
        </div>`;
    }).join('') || '<p>Sem vacinas registradas.</p>';

    document.getElementById('petModalContent').innerHTML = `
        <div style="text-align:center">
            <h2>${pet.name}</h2>
            <p>${pet.description}</p>
        </div>
        <div class="vaccination-section">
            <h3>Vacinas ${isOwner ? `<button class="btn btn-small" onclick="openVaccinationModal(${pet.id})">+</button>` : ''}</h3>
            <div class="vaccination-list">${vaccinesHtml}</div>
        </div>
    `;
    document.getElementById('petModal').classList.add('active');
}

function openVaccinationModal(petId, vaccineData = null) {
    const form = document.getElementById('vaccinationForm');
    form.reset();
    document.getElementById('vaccinePetId').value = petId;
    
    if (vaccineData) {
        document.getElementById('vaccineModalTitle').textContent = 'Editar Vacina';
        document.getElementById('vaccineEditId').value = vaccineData.id;
        document.getElementById('vaccineName').value = vaccineData.name;
        document.getElementById('vaccineDate').value = vaccineData.date.split('T')[0];
        if (vaccineData.nextDate) document.getElementById('vaccineNext').value = vaccineData.nextDate.split('T')[0];
        document.getElementById('vaccineVet').value = vaccineData.vet;
        document.getElementById('vaccineNotes').value = vaccineData.notes;
        document.getElementById('vaccineFormButton').textContent = 'Atualizar';
    } else {
        document.getElementById('vaccineModalTitle').textContent = 'Adicionar Vacina';
        document.getElementById('vaccineEditId').value = '';
        document.getElementById('vaccineFormButton').textContent = 'Salvar';
    }
    
    document.getElementById('vaccinationModal').classList.add('active');
}

function prepareEditVaccine(petId, vaccine) {
    // Fecha modal do pet momentaneamente ou sobrepoe
    // Aqui vamos apenas abrir o modal de vacina por cima
    openVaccinationModal(petId, vaccine);
}

document.getElementById('vaccinationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const petId = document.getElementById('vaccinePetId').value;
    const vaccineId = document.getElementById('vaccineEditId').value;
    
    const body = {
        name: document.getElementById('vaccineName').value,
        date: document.getElementById('vaccineDate').value,
        nextDate: document.getElementById('vaccineNext').value || null,
        vet: document.getElementById('vaccineVet').value,
        notes: document.getElementById('vaccineNotes').value
    };

    try {
        if (vaccineId) {
            await apiFetch(`/pets/${petId}/vaccines/${vaccineId}`, { method: 'PUT', body: JSON.stringify(body) });
        } else {
            await apiFetch(`/pets/${petId}/vaccines`, { method: 'POST', body: JSON.stringify(body) });
        }
        
        // Atualiza lista local
        if (document.getElementById('my-pets').classList.contains('active')) await loadMyPets();
        else await loadAdoptionPets();
        
        // Reabre modal do pet atualizado
        openPetProfile(parseInt(petId));
        closeVaccinationModal();
    } catch (err) { alert(err.message); }
});

async function deleteVaccine(petId, vaccineId) {
    if (!confirm('Excluir esta vacina?')) return;
    try {
        await apiFetch(`/pets/${petId}/vaccines/${vaccineId}`, { method: 'DELETE' });
        if (document.getElementById('my-pets').classList.contains('active')) await loadMyPets();
        else await loadAdoptionPets();
        openPetProfile(petId);
    } catch (err) { alert(err.message); }
}

function closeVaccinationModal() { document.getElementById('vaccinationModal').classList.remove('active'); }
function closePetModal() { document.getElementById('petModal').classList.remove('active'); }
function closeContactModal() { document.getElementById('contactModal').classList.remove('active'); }

function showContact(name, phone, email) {
    document.getElementById('contactModalContent').innerHTML = `
        <h3>Contato</h3>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Tel:</strong> <a href="tel:${phone}">${phone}</a></p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
    `;
    document.getElementById('contactModal').classList.add('active');
}

// --- BLOG ---

async function loadBlogPosts() {
    const container = document.getElementById('blogFeed');
    container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    if (currentUser) document.getElementById('blog-actions').style.display = 'block';
    try {
        blogPosts = await apiFetch('/blog');
        if (blogPosts.length === 0) container.innerHTML = '<div class="empty-state"><h3>Sem posts ainda.</h3></div>';
        else {
            container.innerHTML = blogPosts.map(post => `
                <div class="post-card">
                    <div class="post-header">
                        <div class="post-author-info">
                            <div class="post-author-avatar">${post.ownerName[0]}</div>
                            <div>
                                <strong>${post.ownerName}</strong><br>
                                <small>${formatDateTime(post.createdAt)}</small>
                            </div>
                        </div>
                        ${currentUser && currentUser.user.userId == post.ownerId ? `<button class="btn-small" onclick="deletePost(${post.id})">🗑️</button>` : ''}
                    </div>
                    <div class="post-body">
                        <p class="post-content">${post.content}</p>
                        ${post.photoUrl ? `<img src="${post.photoUrl}" class="post-image">` : ''}
                        ${post.location ? `<div class="post-location">📍 ${post.location}</div>` : ''}
                    </div>
                    <div class="post-footer">
                       <span>❤️ ${post.likes.length}</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) { container.innerHTML = '<p>Erro ao carregar blog.</p>'; }
}

function toggleNewPostForm(show) {
    document.getElementById('new-post-container').style.display = show ? 'block' : 'none';
    document.getElementById('blog-actions').style.display = show ? 'none' : 'block';
}

document.getElementById('postForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
        await apiFetch('/blog', { method: 'POST', body: formData, isFormData: true });
        toggleNewPostForm(false);
        loadBlogPosts();
    } catch (err) { alert(err.message); }
});

async function deletePost(id) {
    if(confirm('Apagar post?')) {
        try { await apiFetch(`/blog/${id}`, { method:'DELETE' }); loadBlogPosts(); }
        catch(e){ alert(e.message); }
    }
}

// --- SERVICES (Basic Load) ---
async function loadServices() {
    const container = document.getElementById('servicesGrid');
    container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    try {
        const res = await apiFetch('/services');
        container.innerHTML = res.map(s => `
            <div class="service-card">
                <h3>${s.name}</h3>
                <p>${s.professional}</p>
                <p>${s.description}</p>
                ${s.phone === 'Faça login para ver' ? '<small>Faça login para contato</small>' : `<a href="tel:${s.phone}" class="btn btn-small">Ligar</a>`}
            </div>
        `).join('');
    } catch (e) { container.innerHTML = '<p>Erro.</p>'; }
}
function showServiceRegisterPage() { showMessage('services', 'Implementação similar a pets', 'error'); }

// INIT
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => {
        if (e.target === m) m.classList.remove('active');
    }));

    checkLocalStorageLogin();
    showPage('landing');
});