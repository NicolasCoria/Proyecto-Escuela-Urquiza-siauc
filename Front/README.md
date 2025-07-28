<!--
███╗   ███╗
████╗ ████║
██╔████╔██║
██║╚██╔╝██║
██║ ╚═╝ ██║
╚═╝     ╚═╝
-->

# Urquiza School - SIAUC

This application is designed for **Urquiza N°49 School** in Rosario, Santa Fe, Argentina.

Its primary goal is to **organize and manage users (students)**, along with an **administrator** who assigns roles according to each user's role within the institution.

This project not only aims to **improve the current software system**, but also to **enhance our development skills** through real-world application and teamwork.

---

### 📦 Install Dependencies

bash
npm install

### Setup environment file

create a file at root called `.env` and add this:

    REACT_APP_API_URL=<server url>

### Run App

    npm start

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
The page will reload if you make edits.\
You will also see any lint errors in the console.

### 🧹 Linting

Check for lint errors:

npm run lint

Fix lint errors automatically:

npm run lint:fix

<br>

### Members

| 👤 Name       | 🌐 GitHub                                        | 🛠️ Role       |
| ------------- | ------------------------------------------------ | ------------- |
| m1rkodev      | [@m1rkodev](https://github.com/m1rkodev)         | Founder / Dev |
| Nicolas Coria | [@NicolasCoria](https://github.com/NicolasCoria) | Founder / Dev |
| Fivan25       | [@Fivan25](https://github.com/Fivan25)           | Founder / Dev |

<br>

## **🔧 Problema Identificado y Solucionado:**

### **❌ Error Original:**

```
Integrity constraint violation: 1452 Cannot add or update a child row:
a foreign key constraint fails (`terciario`.`grupos_destinatarios`,
CONSTRAINT `grupos_destinatarios_id_admin_creador_foreign`
FOREIGN KEY (`id_admin_creador`) REFERENCES `administrador` (`id_admin`))
```

### ** Causa del Problema:**

- El código intentaba usar `id_admin_creador = 1`
- Pero en la base de datos solo existe un administrador con `id_admin = 5`
- La restricción de clave foránea fallaba

### **✅ Solución Aplicada:**

1. **Verifiqué los administradores existentes:**
   - Solo existe: `ID: 5 - Admin Test (admin.test@test.com)`

2. **Modifiqué el controlador:**

   ```php
   // Obtener el primer administrador disponible
   $admin = Administrador::first();
   if (!$admin) {
       return response()->json([
           'success' => false,
           'error' => 'No hay administradores disponibles en el sistema'
       ], 400);
   }

   // Usar el ID correcto
   'id_admin_creador' => $admin->id_admin, // Ahora usa ID = 5
   ```

## **🚀 Ahora el Sistema Funciona Completamente:**

### **✅ Creación de Grupos:**

- ✅ **Filtrado múltiple** - Carreras, años, materias
- ✅ **Selección de alumnos** - Basada en filtros
- ✅ **Creación exitosa** - Con administrador válido

### **✅ Casos de Uso:**

- **"Todos los 1er años"** → 1-1°, 1-2°, 1-3° de todas las carreras
- **"DS Completo"** → Todos los años de Desarrollo de Software
- **"Materia específica"** → Alumnos de una materia particular

¡Ahora puedes crear grupos de destinatarios sin problemas! 🎯

¿Quieres probar creando un grupo con múltiples criterios o ya está todo funcionando como esperabas?
