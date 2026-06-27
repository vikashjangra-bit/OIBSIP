(() => {
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => document.querySelectorAll(s);

    const forms = {
        login: { form: $('#loginForm'), email: $('#loginEmail'), pass: $('#loginPassword'), msg: $('#loginMsg') },
        register: { form: $('#registerForm'), name: $('#regName'), email: $('#regEmail'), pass: $('#regPassword'), confirm: $('#regConfirm'), msg: $('#regMsg') }
    };

    const strengthFill = $('#strengthFill');
    const toggleBtns = $$('.toggle-pass');
    const tabBtns = $$('.tab-btn');
    const logoutBtn = $('#logoutBtn');

    let currentUser = null;

    const getUsers = () => JSON.parse(localStorage.getItem('users') || '{}');
    const saveUsers = (u) => localStorage.setItem('users', JSON.stringify(u));
    const getSession = () => JSON.parse(sessionStorage.getItem('session') || 'null');
    const saveSession = (u) => sessionStorage.setItem('session', JSON.stringify(u));
    const clearSession = () => sessionStorage.removeItem('session');

    const showMsg = (el, msg, type = 'success') => {
        el.textContent = msg;
        el.className = `message ${type}`;
    };

    const hideMsg = (el) => { el.className = 'message'; };

    const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

    const switchTab = (tab) => {
        tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
        ['loginForm', 'registerForm'].forEach(id => {
            $(`#${id}`).classList.toggle('active', id === (tab === 'login' ? 'loginForm' : 'registerForm'));
        });
        hideMsg(forms.login.msg);
        hideMsg(forms.register.msg);
    };

    tabBtns.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.closest('.input-group').querySelector('input');
            input.type = input.type === 'password' ? 'text' : 'password';
            this.textContent = input.type === 'password' ? '👁' : '👁‍🗨';
        });
    });

    forms.register.pass.addEventListener('input', function() {
        const p = this.value;
        let strength = 0;
        if (p.length >= 8) strength++;
        if (/[a-z]/.test(p) && /[A-Z]/.test(p)) strength++;
        if (/\d/.test(p)) strength++;
        if (/[^a-zA-Z0-9]/.test(p)) strength++;

        const levels = ['weak', 'fair', 'good', 'strong'];
        const index = Math.min(strength, 3);
        strengthFill.className = `strength-fill ${p.length ? levels[index] : ''}`;
    });

    forms.register.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = forms.register.name.value.trim();
        const email = forms.register.email.value.trim();
        const pass = forms.register.pass.value;
        const confirm = forms.register.confirm.value;

        if (!name || !email || !pass || !confirm) {
            return showMsg(forms.register.msg, 'All fields required', 'error');
        }
        if (!validateEmail(email)) {
            return showMsg(forms.register.msg, 'Invalid email address', 'error');
        }
        if (pass.length < 6) {
            return showMsg(forms.register.msg, 'Password must be 6+ characters', 'error');
        }
        if (pass !== confirm) {
            return showMsg(forms.register.msg, 'Passwords do not match', 'error');
        }

        const users = getUsers();
        if (users[email]) {
            return showMsg(forms.register.msg, 'Email already registered', 'error');
        }

        users[email] = { name, password: pass, created: new Date().toISOString() };
        saveUsers(users);
        showMsg(forms.register.msg, 'Account created! Please sign in.', 'success');
        forms.register.form.reset();
        strengthFill.className = 'strength-fill';

        setTimeout(() => {
            switchTab('login');
            forms.login.email.value = email;
        }, 1500);
    });

    forms.login.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = forms.login.email.value.trim();
        const pass = forms.login.pass.value;

        if (!email || !pass) {
            return showMsg(forms.login.msg, 'Enter email and password', 'error');
        }
        if (!validateEmail(email)) {
            return showMsg(forms.login.msg, 'Invalid email address', 'error');
        }

        const users = getUsers();
        const user = users[email];
        if (!user || user.password !== pass) {
            return showMsg(forms.login.msg, 'Invalid credentials', 'error');
        }

        currentUser = { email, name: user.name, created: user.created };
        saveSession(currentUser);
        showDashboard();
        forms.login.form.reset();
        hideMsg(forms.login.msg);
    });

    const showDashboard = () => {
        $('#authContainer').style.display = 'none';
        const dash = $('#dashboard');
        dash.classList.add('visible');
        if (currentUser) {
            $('#dashName').textContent = currentUser.name;
            $('#userName').textContent = currentUser.name;
            $('#sessionEmail').textContent = currentUser.email;
        }
    };

    const hideDashboard = () => {
        $('#authContainer').style.display = 'flex';
        $('#dashboard').classList.remove('visible');
        currentUser = null;
        clearSession();
    };

    logoutBtn.addEventListener('click', () => {
        hideDashboard();
        switchTab('login');
    });

    const session = getSession();
    if (session) {
        currentUser = session;
        showDashboard();
    } else {
        switchTab('login');
    }

    const remembered = localStorage.getItem('rememberedEmail');
    if (remembered) {
        forms.login.email.value = remembered;
        $('#remember').checked = true;
    }

    $('#remember')?.addEventListener('change', function() {
        if (this.checked) {
            localStorage.setItem('rememberedEmail', forms.login.email.value);
        } else {
            localStorage.removeItem('rememberedEmail');
        }
    });
})();