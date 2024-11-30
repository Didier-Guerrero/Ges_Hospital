# **Gestión de Hospitales**
 
Este proyecto es un sistema de gestión hospitalaria que permite manejar casos médicos, sesiones relacionadas, exámenes solicitados y datos de pacientes. El objetivo principal es ofrecer una solución integral para registrar y visualizar la evolución de los pacientes y sus tratamientos, así como facilitar la interacción entre médicos, pacientes y administradores.
 
---
 
## **Características Principales**
 
- **Gestión de Casos Médicos**:

  - Registro de casos médicos asociados a un paciente y médico.

  - Visualización detallada de casos médicos, incluyendo:

    - Enfermedad.

    - Diagnóstico.

    - Tratamiento inicial.

    - Porcentaje de éxito basado en sesiones relacionadas.

- **Gestión de Sesiones**:

  - Registro de sesiones asociadas a un caso médico.

  - Visualización de detalles de sesiones (evolución, tratamiento aplicado, observaciones, éxito).

  - Edición y eliminación de sesiones.
 
- **Gestión de Exámenes**:

  - Solicitud de exámenes desde una sesión específica.

  - Visualización de detalles de exámenes solicitados (tipo, estado, fecha de solicitud y completado).

  - Edición y eliminación de exámenes.
 
- **Gestión de Pacientes**:

  - Asociación de casos médicos a pacientes registrados.

  - Visualización de datos de pacientes relacionados con cada caso.
 
- **Estadísticas**:

  - Cálculo automático del porcentaje de éxito de un caso médico basado en sesiones exitosas.

  - Listado de casos médicos similares para análisis de patrones y reutilización de tratamientos.
 
---
 
## **Requisitos del Proyecto**
 
### **Tecnologías Utilizadas**

- **Backend**: Node.js con Express.

- **Frontend**: Plantillas EJS para renderizar vistas.

- **Base de Datos**: Supabase como servicio backend para consultas SQL.

- **Gestión de Sesiones**: `express-session`.

- **Middleware**: `method-override` para manejar métodos HTTP como PUT y DELETE.
 
### **Dependencias**

```bash

express

ejs

body-parser

method-override

dotenv

express-session

supabase-js

```
 
### **Estructura del Proyecto**

```

├── controllers/

│   ├── caseController.js

│   ├── sessionController.js

│   ├── examController.js

│   ├── userController.js

├── models/

│   ├── Case.js

│   ├── Session.js

│   ├── Exam.js

│   ├── User.js

├── routes/

│   ├── cases.js

│   ├── sessions.js

│   ├── exams.js

│   ├── users.js

├── views/

│   ├── cases/

│   │   ├── show.ejs

│   │   ├── edit.ejs

│   │   ├── new.ejs

│   ├── sessions/

│   │   ├── details.ejs

│   │   ├── edit.ejs

│   │   ├── new.ejs

│   ├── exams/

│   │   ├── details.ejs

│   │   ├── edit.ejs

│   │   ├── new.ejs

├── public/

│   ├── css/

│   │   ├── styles.css

├── app.js

├── .env

└── README.md

```
 
Instalación y Configuración

Requisitos Previos

Node.js instalado en el sistema.

Una base de datos configurada en Supabase.

Pasos de Instalación
 
 
Clonar el repositorio:

```bash

git clone https://github.com/Didier-Guerrero/Ges_Hospital.git

cd Gestion_Hospital

```

Instalar dependencias:

```bash

npm install
 
```
 
Configurar variables de entorno: Crea un archivo .env en la raíz del proyecto y configura las siguientes variables:


```bash
SUPABASE_URL=<Tu_URL_de_Supabase>

SUPABASE_KEY=<Tu_Clave_de_Supabase>

```

Iniciar el servidor:
 ```bash
node server.js

```

Abrir en el navegador: El servidor estará disponible en:

```
http://localhost:5000

```

Funcionalidades Detalladas

Casos Médicos

Creación: Los médicos pueden registrar nuevos casos médicos para pacientes.

Visualización: Incluye enfermedad, diagnóstico, tratamiento inicial, y porcentaje de éxito calculado automáticamente.

Edición y Eliminación: Los casos pueden ser modificados o eliminados por médicos o administradores.

Sesiones

Creación: Se pueden registrar sesiones asociadas a un caso médico.

Visualización: Listado de sesiones con detalles de evolución, tratamiento, éxito, y observaciones.

Estadísticas: Calcula automáticamente el porcentaje de éxito basado en sesiones exitosas.

Exámenes

Solicitud: Desde una sesión, se pueden solicitar exámenes médicos con tipo, estado y observaciones.

Gestión: Se permite editar o eliminar exámenes existentes.
 
### Contacto
 
Email: didierguerrerosoft@gmail.com
GitHub: https://github.com/Didier-Guerrero/Ges_Hospital.git


 
