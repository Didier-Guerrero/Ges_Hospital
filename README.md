# Sistema de Gestión Hospitalaria

Este proyecto es una aplicación básica para la gestión de pacientes y casos médicos en un hospital. Incluye funcionalidades de autenticación, creación de usuarios, y la administración de historias médicas para ayudar a los médicos y administradores en la toma de decisiones clínicas.

## Funcionalidades

### Gestión de Pacientes
- **Autenticación**: Los usuarios pueden iniciar sesión y solo los administradores pueden registrar nuevos usuarios.
- **Roles de Usuario**:
  - **Admin**: Puede crear y gestionar usuarios (médicos y pacientes).
  - **Médico**: Puede ver y gestionar los casos médicos.
  - **Paciente**: Puede ver únicamente sus propios casos médicos.

### Gestión de Casos Médicos
- **Creación de Casos**: Los médicos pueden crear nuevas historias médicas para los pacientes.
- **Visualización de Casos**:
  - **Médicos y Administradores**: Pueden ver todos los casos médicos y realizar búsquedas por enfermedad.
  - **Pacientes**: Solo pueden ver sus propias historias médicas.
- **Edición de Casos**: Los médicos pueden modificar los detalles de un caso, incluyendo enfermedad, diagnóstico, síntomas y tratamiento.
- **Eliminación de Casos**: Los médicos pueden eliminar un caso cuando sea necesario.

## Tecnologías Utilizadas

- **Backend**: Node.js y Express
- **Base de Datos**: Supabase
- **Autenticación**: Basada en sesiones para el control de acceso
- **Frontend**: Plantillas EJS
- **CSS**: Estilos básicos en `public/css/styles.css`

## Instalación

1. Clona el repositorio:
    ```bash
    git clone https://github.com/tu-usuario/tu-repositorio.git
    cd tu-repositorio
    ```

2. Instala las dependencias:
    ```bash
    npm install
    ```

3. Configura el archivo `.env` con tus credenciales de Supabase:
    ```
    SUPABASE_URL=tu_url_de_supabase
    SUPABASE_KEY=tu_key_de_supabase
    ```

4. Ejecuta el servidor:
    ```bash
    npm start
    ```

5. Accede a la aplicación en tu navegador:
    ```
    http://localhost:5000
    ```

## Rutas Principales

- **`/api/users/login`**: Página de inicio de sesión para todos los usuarios.
- **`/api/users/register`**: Registro de nuevos usuarios (solo accesible por un administrador).
- **`/api/cases`**: Vista de todos los casos médicos (para médicos y administradores) o casos individuales (para pacientes).
- **`/api/cases/:id`**: Detalles de un caso médico específico.
- **`/api/cases/new`**: Formulario para la creación de un nuevo caso médico (para médicos y administradores).
- **`/api/cases/:id/edit`**: Formulario de edición para un caso específico (solo médicos y administradores).

## Estructura de Archivos
Ges_Hospital/
├── public/
│   └── css/
│       └── styles.css               
├── views/
│   ├── cases/
│   │   ├── index_patient.ejs        
│   │   ├── index_doctor_admin.ejs  
│   │   ├── show.ejs                 
│   │   ├── create.ejs               
│   │   └── edit.ejs                 
│   └── users/
│       ├── login.ejs                
│       └── register.ejs             
├── models/
│   ├── User.js                      
│   └── Case.js                      
├── controllers/
│   ├── userController.js            
│   └── caseController.js            
├── routes/
│   ├── users.js                     
│   └── cases.js                    
├── config/
│   └── supabase.js                  
├── .env                           
├── .gitignore                       
├── package.json                    
├── package-lock.json                
└── server.js                       
## Notas

- **Archivos estáticos**: Los estilos CSS se encuentran en `public/css/styles.css`.
- **Archivo de Configuración `.env`**: Asegúrate de configurar las credenciales de Supabase correctamente en el archivo `.env` y mantenerlo en privado.

## Próximos Pasos

- Añadir funcionalidades de gestión de citas.
- Implementacion de observaciones de citas medicas y casos de pacientes
- Mejorar el sistema de reportes para casos médicos.
