import { parse } from "https://deno.land/std@0.224.0/flags/mod.ts";
import { ensureDir } from "https://deno.land/std@0.224.0/fs/ensure_dir.ts";
import * as log from "./src/logger/logger.ts";
import { LogLevel } from "./src/logger/logger.ts";
import { loadData } from "./src/data_loader/data_loader.ts";
import { buildModel } from "./src/model_builder/model_builder.ts";
import { trainModel } from "./src/trainer/trainer.ts";
import { Predictor } from "./src/predictor/predictor.ts";

async function main() {
  const flags = parse(Deno.args, {
    string: ["conceptDir", "noConceptDir", "logLevel", "modelPath", "predictImage"],
    default: {
      conceptDir: "data/concept",
      noConceptDir: "data/no-concept",
      logLevel: "minimal",
      epochs: 10,
      batchSize: 32,
      modelPath: "models/simulated_model.json",
    },
  });

  // --- 1. Configuración del Logger ---
  const logLevel = flags.logLevel === 'verbose' ? log.LogLevel.Verbose : log.LogLevel.Minimal;
  await log.setupLogger(logLevel);

  // --- 2. Carga de Datos ---
  try {
    const { train, val } = await loadData(flags.conceptDir, flags.noConceptDir);

    // --- 3. Construcción del Modelo (Simulado) ---
    const model = buildModel([224, 224, 3]);

    // --- 4. Entrenamiento del Modelo (Simulado) ---
    await ensureDir("models"); // Asegurarse de que el directorio del modelo exista
    const startTime = Date.now();
    const history = await trainModel(model, train, val, flags.epochs, flags.batchSize);
    const totalTrainingTime = (Date.now() - startTime) / 1000;

    // --- 5. Resumen Final ---
    const summary = `
--- Resumen de la Tarea (Deno) ---
Épocas completadas: ${history.epochs}
Pérdida final simulada: ${history.finalLoss.toFixed(4)}
Precisión final simulada: ${history.finalAccuracy.toFixed(4)}
Tiempo total de ejecución: ${totalTrainingTime.toFixed(2)} segundos
Modelo guardado en: ${flags.modelPath}
------------------------------------
`;
    log.info(summary);

    // --- 6. Inferencia de Ejemplo (Simulada) ---
    if (flags.predictImage) {
      log.info("Iniciando fase de inferencia de ejemplo (simulada)...");
      const predictor = await Predictor.load(flags.modelPath);
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
