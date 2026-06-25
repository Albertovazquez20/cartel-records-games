// ============== PERFIL.JS ==============

async function initPerfil() {

    if (!window.SESION?.id) {
        window.location.href = 'log-in/log-in.php';
        return;
    }

    // Cargar datos actuales del usuario
    try {
        const res = await fetch('api/perfil.php', { cache: 'no-store' });
        const data = await res.json();

        if (data.error) {
            console.error('❌ perfil:', data.error);
            return;
        }

        // Rellenar el formulario y el avatar con los datos actuales
        document.querySelector('#perfilNombre').value       = data.nombre_usuario;
        document.querySelector('#perfilEmail').value        = data.email;
        document.querySelector('#perfilNombreAvatar').textContent = data.nombre_usuario;
        document.querySelector('#perfilEmailAvatar').textContent  = data.email;

    } catch (err) {
        console.error('❌ perfil fetch:', err);
    }

    // ── Guardar datos personales ──────────────────────────────────────────────
    document.querySelector('#btnGuardarDatos').addEventListener('click', async function () {
        const btn = this;
        const msg = document.querySelector('#msgDatos');

        btn.disabled = true;
        btn.textContent = '⏳ Guardando…';
        msg.textContent = '';
        msg.className = 'perfil-msg';

        const formData = new FormData();
        formData.append('nombre_usuario', document.querySelector('#perfilNombre').value.trim());
        formData.append('email',          document.querySelector('#perfilEmail').value.trim());

        try {
            const res = await fetch('api/perfil.php', { method: 'POST', body: formData });
            const data = await res.json();

            if (data.error) {
                msg.textContent = '❌ ' + data.error;
                msg.className = 'perfil-msg error';
            } else {
                msg.textContent = '✅ Datos actualizados correctamente.';
                msg.className = 'perfil-msg ok';

                // Actualizar el avatar con el nuevo nombre
                document.querySelector('#perfilNombreAvatar').textContent = data.nombre_usuario;
                document.querySelector('#perfilEmailAvatar').textContent  = document.querySelector('#perfilEmail').value.trim();

                // Actualizar el nombre en el header
                document.querySelectorAll('#perfilToggle span').forEach(el => {
                    if (el.textContent.trim() == window.SESION.nombre) {
                        el.textContent = data.nombre_usuario;
                    }
                });
            }

        } catch (err) {
            msg.textContent = '❌ Error de conexión.';
            msg.className = 'perfil-msg error';
        }

        btn.disabled = false;
        btn.textContent = '💾 Guardar cambios';
    });

    // ── Cambiar contraseña ────────────────────────────────────────────────────
    document.querySelector('#btnGuardarPass').addEventListener('click', async function () {
        const btn = this;
        const msg = document.querySelector('#msgPass');

        btn.disabled = true;
        btn.textContent = '⏳ Guardando…';
        msg.textContent = '';
        msg.className = 'perfil-msg';

        const passActual = document.querySelector('#perfilPassActual').value;
        const passNueva  = document.querySelector('#perfilPassNueva').value;

        if (!passActual || !passNueva) {
            msg.textContent = '❌ Rellena ambos campos de contraseña.';
            msg.className = 'perfil-msg error';
            btn.disabled = false;
            btn.textContent = '🔒 Cambiar contraseña';
            return;
        }

        const formData = new FormData();
        formData.append('nombre_usuario',  document.querySelector('#perfilNombre').value.trim());
        formData.append('email',           document.querySelector('#perfilEmail').value.trim());
        formData.append('password_actual', passActual);
        formData.append('password_nueva',  passNueva);

        try {
            const res = await fetch('api/perfil.php', { method: 'POST', body: formData });
            const data = await res.json();

            if (data.error) {
                msg.textContent = '❌ ' + data.error;
                msg.className = 'perfil-msg error';
            } else {
                msg.textContent = '✅ Contraseña actualizada correctamente.';
                msg.className = 'perfil-msg ok';
                document.querySelector('#perfilPassActual').value = '';
                document.querySelector('#perfilPassNueva').value = '';
            }

        } catch (err) {
            msg.textContent = '❌ Error de conexión.';
            msg.className = 'perfil-msg error';
        }

        btn.disabled = false;
        btn.textContent = '🔒 Cambiar contraseña';
    });
}
