import { parse } from "https://deno.land/std@0.224.0/flags/mod.ts";
import { ensureDir, exists } from "https://deno.land/std@0.224.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.224.0/path/mod.ts";
import * as log from "./src/logger/logger.ts";
import { LogLevel } from "./src/logger/logger.ts";
import { loadData } from "./src/data_loader/data_loader.ts";
import { buildModel } from "./src/model_builder/model_builder.ts";
import { trainModel } from "./src/trainer/trainer.ts";
import { Predictor } from "./src/predictor/predictor.ts";

async function main() {
  const flags = parse(Deno.args, {
    string: ["name", "binaryConceptFolder", "logLevel", "predictImage"],
    default: {
      logLevel: "minimal",
      epochs: 10,
      batchSize: 32,
    },
  });

  // --- 1. Configuración del Logger ---
  const logLevel = flags.logLevel === 'verbose' ? log.LogLevel.Verbose : log.LogLevel.Minimal;
  await log.setupLogger(logLevel);

  if (!flags.name) {
    log.error("El argumento --name es obligatorio.");
    return;
  }

  // --- 2. Gestión de Directorios ---
  let conceptDir: string;
  let noConceptDir: string;
  const modelName = flags.name;
  const modelPath = `models/${modelName}.json`;

  if (flags.binaryConceptFolder) {
    if (!(await exists(flags.binaryConceptFolder, { isDirectory: true }))) {
      log.error(`El directorio especificado en --binaryConceptFolder no existe: ${flags.binaryConceptFolder}`);
      return;
    }
    conceptDir = path.join(flags.binaryConceptFolder, "concept");
    noConceptDir = path.join(flags.binaryConceptFolder, "no-concept");
  } else {
    const dataPath = `data/${encodeURIComponent(modelName)}`;
    await ensureDir(path.join(dataPath, "concept"));
    await ensureDir(path.join(dataPath, "no-concept"));
    log.info(`No se proporcionó --binaryConceptFolder. Se ha creado el directorio de datos en: '${dataPath}'.`);
    log.info("Por favor, añade imágenes a las carpetas 'concept' y 'no-concept' y vuelve a ejecutar.");
    return;
  }

  // --- 3. Carga de Datos ---
  try {
    const { train, val } = await loadData(conceptDir, noConceptDir);

    // --- 4. Construcción del Modelo (Simulado) ---
    const model = buildModel([224, 224, 3]);

    // --- 5. Entrenamiento del Modelo (Simulado) ---
    await ensureDir("models");
    const startTime = Date.now();
    const history = await trainModel(model, train, val, flags.epochs, flags.batchSize, modelPath);
    const totalTrainingTime = (Date.now() - startTime) / 1000;

    // --- 6. Resumen Final ---
    const summary = `
--- Resumen de la Tarea (Deno) ---
Épocas completadas: ${history.epochs}
Pérdida final simulada: ${history.finalLoss.toFixed(4)}
Precisión final simulada: ${history.finalAccuracy.toFixed(4)}
Tiempo total de ejecución: ${totalTrainingTime.toFixed(2)} segundos
Modelo guardado en: ${modelPath}
------------------------------------
`;
    log.info(summary);

    // --- 7. Inferencia de Ejemplo (Simulada) ---
    if (flags.predictImage) {
      log.info("Iniciando fase de inferencia de ejemplo (simulada)...");
      const predictor = await Predictor.load(modelPath);
      const prediction = await predictor.predict(flags.predictImage);
      log.info(`La predicción para '${flags.predictImage}' es: ${prediction}`);
    }

  } catch (error) {
    log.error(`Error en el pipeline principal: ${error.message}`);
  }
}

if (import.meta.main) {
  await main();
}
