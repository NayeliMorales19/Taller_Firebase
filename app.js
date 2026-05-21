const express = require("express");
const admin = require("firebase-admin");
const path = require("path");

// 1.- Inicializar Firebase Admin
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

console.log(
    "Proyecto conectado:",
    admin.app().options.credential.projectId
);

// 2.- Configuración inicial
const db = admin.firestore();
const app = express();

const COLECCION = "tareas";

// Middleware para leer JSON
app.use(express.json());

// 3.- Servir página HTML
app.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// 4.- Listar todas las tareas
app.get("/tareas", async (_req, res) => {
    try {
        const snap = await db.collection(COLECCION).get();

        const tareas = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(tareas);

    } catch (error) {
        console.error("ERROR:", error);

        res.status(500).json({
            error: error.message
        });
    }
});

// 5.- Obtener una tarea por ID
app.get("/tareas/:id", async (req, res) => {
    try {
        const doc = await db
            .collection(COLECCION)
            .doc(req.params.id)
            .get();

        if (!doc.exists) {
            return res.status(404).json({
                error: "Tarea no encontrada"
            });
        }

        res.json({
            id: doc.id,
            ...doc.data()
        });

    } catch (error) {
        console.error("ERROR:", error);

        res.status(500).json({
            error: error.message
        });
    }
});

// 6.- Crear una nueva tarea
app.post("/tareas", async (req, res) => {
    try {
        const nuevaTarea = req.body;

        const docRef = await db
            .collection(COLECCION)
            .add(nuevaTarea);

        res.json({
            mensaje: "Tarea agregada",
            id: docRef.id
        });

    } catch (error) {
        console.error("ERROR:", error);

        res.status(500).json({
            error: error.message
        });
    }
});

// 7.- Actualizar tarea
app.put("/tareas/:id", async (req, res) => {
    try {
        await db
            .collection(COLECCION)
            .doc(req.params.id)
            .update(req.body);

        res.json({
            mensaje: "Tarea actualizada"
        });

    } catch (error) {
        console.error("ERROR:", error);

        res.status(500).json({
            error: error.message
        });
    }
});

// 8.- Eliminar tarea
app.delete("/tareas/:id", async (req, res) => {
    try {
        await db
            .collection(COLECCION)
            .doc(req.params.id)
            .delete();

        res.json({
            mensaje: "Tarea eliminada"
        });

    } catch (error) {
        console.error("ERROR:", error);

        res.status(500).json({
            error: error.message
        });
    }
});

// 9.- Iniciar servidor
app.listen(4000, () => {
    console.log("Servidor en http://localhost:4000");
});