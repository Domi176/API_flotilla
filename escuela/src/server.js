
require("dotenv").config();

const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = process.env.DB_NAME || "escuela_db";

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

async function iniciarServidor() {
  const cliente = new MongoClient(MONGODB_URI);

  try {
    await cliente.connect();

    const db = cliente.db(DB_NAME);
    const alumnos = db.collection("alumnos");

    // Evitar matrículas duplicadas.
    await alumnos.createIndex(
      { matricula: 1 },
      { unique: true }
    );

    console.log("Conectado a MongoDB");
    console.log(`Base de datos: ${DB_NAME}`);

    // READ: consultar todos los alumnos.
    app.get("/api/alumnos", async (req, res) => {
      try {
        const lista = await alumnos
          .find({})
          .sort({ nombre: 1 })
          .toArray();

        res.status(200).json(lista);
      } catch (error) {
        console.error("Error al consultar alumnos:", error);

        res.status(500).json({
          mensaje: "Error al consultar los alumnos"
        });
      }
    });

    // CREATE: registrar un alumno.
    app.post("/api/alumnos", async (req, res) => {
      try {
        const { matricula, nombre, carrera, cuatrimestre, grupo, estado } =
          req.body;

        const nuevoAlumno = {
          matricula: String(matricula ?? "").trim(),
          nombre: String(nombre ?? "").trim(),
          carrera: String(carrera ?? "").trim(),
          grupo: String(grupo ?? "").trim(),
          estado: String(estado ?? "").trim()
        };

        const cuatrimestreNumero = Number(cuatrimestre);

        if (
          !nuevoAlumno.matricula ||
          !nuevoAlumno.nombre ||
          !nuevoAlumno.carrera ||
          !nuevoAlumno.grupo ||
          !nuevoAlumno.estado
        ) {
          return res.status(400).json({
            mensaje: "Todos los campos son obligatorios"
          });
        }

        if (
          cuatrimestre === undefined ||
          cuatrimestre === null ||
          String(cuatrimestre).trim() === "" ||
          !Number.isInteger(cuatrimestreNumero) ||
          cuatrimestreNumero < 1
        ) {
          return res.status(400).json({
            mensaje: "El cuatrimestre debe ser un entero mayor que cero"
          });
        }

        if (!["Activo", "Inactivo"].includes(nuevoAlumno.estado)) {
          return res.status(400).json({
            mensaje: "El estado debe ser Activo o Inactivo"
          });
        }

        nuevoAlumno.cuatrimestre = cuatrimestreNumero;

        const resultado = await alumnos.insertOne(nuevoAlumno);

        res.status(201).json({
          mensaje: "Alumno registrado correctamente",
          alumno: {
            _id: resultado.insertedId,
            ...nuevoAlumno
          }
        });
      } catch (error) {
        if (error.code === 11000) {
          return res.status(409).json({
            mensaje: "Ya existe un alumno con esa matrícula"
          });
        }

        console.error("Error al registrar alumno:", error);

        res.status(500).json({
          mensaje: "Error al registrar el alumno"
        });
      }
    });

    // UPDATE: actualizar los datos de un alumno por matrícula.
    app.put("/api/alumnos/:matricula", async (req, res) => {
      try {
        const actualizacion = {};

        for (const campo of ["nombre", "carrera", "grupo"]) {
          if (
            Object.prototype.hasOwnProperty.call(req.body, campo)
          ) {
            const valor = String(req.body[campo] ?? "").trim();

            if (!valor) {
              return res.status(400).json({
                mensaje: `El campo ${campo} no puede estar vacío`
              });
            }

            actualizacion[campo] = valor;
          }
        }

        if (
          Object.prototype.hasOwnProperty.call(
            req.body,
            "cuatrimestre"
          )
        ) {
          const cuatrimestre = Number(req.body.cuatrimestre);

          if (
            String(req.body.cuatrimestre).trim() === "" ||
            !Number.isInteger(cuatrimestre) ||
            cuatrimestre < 1
          ) {
            return res.status(400).json({
              mensaje: "El cuatrimestre no es válido"
            });
          }

          actualizacion.cuatrimestre = cuatrimestre;
        }

        if (
          Object.prototype.hasOwnProperty.call(req.body, "estado")
        ) {
          const estado = String(req.body.estado ?? "").trim();

          if (!["Activo", "Inactivo"].includes(estado)) {
            return res.status(400).json({
              mensaje: "El estado debe ser Activo o Inactivo"
            });
          }

          actualizacion.estado = estado;
        }

        if (Object.keys(actualizacion).length === 0) {
          return res.status(400).json({
            mensaje: "No se recibieron datos para actualizar"
          });
        }

        const resultado = await alumnos.updateOne(
          { matricula: req.params.matricula },
          { $set: actualizacion }
        );

        if (resultado.matchedCount === 0) {
          return res.status(404).json({
            mensaje: "Alumno no encontrado"
          });
        }

        const alumnoActualizado = await alumnos.findOne({
          matricula: req.params.matricula
        });

        res.status(200).json({
          mensaje: "Alumno actualizado correctamente",
          alumno: alumnoActualizado
        });
      } catch (error) {
        console.error("Error al actualizar alumno:", error);

        res.status(500).json({
          mensaje: "Error al actualizar el alumno"
        });
      }
    });

    // DELETE: eliminar un alumno por matrícula.
    app.delete("/api/alumnos/:matricula", async (req, res) => {
      try {
        const resultado = await alumnos.deleteOne({
          matricula: req.params.matricula
        });

        if (resultado.deletedCount === 0) {
          return res.status(404).json({
            mensaje: "Alumno no encontrado"
          });
        }

        res.status(200).json({
          mensaje: "Alumno eliminado correctamente"
        });
      } catch (error) {
        console.error("Error al eliminar alumno:", error);

        res.status(500).json({
          mensaje: "Error al eliminar el alumno"
        });
      }
    });

    // Respuesta para rutas API inexistentes.
    app.use("/api", (req, res) => {
      res.status(404).json({
        mensaje: "Ruta API no encontrada"
      });
    });

    const servidor = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Sistema escolar disponible en el puerto ${PORT}`);
    });

    servidor.on("error", async (error) => {
      console.error("Error al iniciar el servidor:", error.message);
      await cliente.close();
      process.exitCode = 1;
    });
  } catch (error) {
    console.error(
      "No se pudo iniciar la aplicación:",
      error.message
    );

    await cliente.close();
    process.exitCode = 1;
  }
}

iniciarServidor();
