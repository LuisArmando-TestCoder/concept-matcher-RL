import { parse } from "https://deno.land/std@0.224.0/flags/mod.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { ensureDir } from "https://deno.land/std@0.224.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.224.0/path/mod.ts";
import * as log from "./src/logger/logger.ts";
import { LogLevel } from "./src/logger/logger.ts";
import { Predictor } from "./src/predictor/predictor.ts";

interface Trigger {
  imageSrc: string;
  foundOn: string;
  savedTo: string;
}

async function main() {
  const flags = parse(Deno.args, {
    string: ["crawl", "name"],
    default: {
      logLevel: "minimal",
    },
  });

  await log.setupLogger(flags.logLevel === 'verbose' ? LogLevel.Verbose : LogLevel.Minimal);

  if (!flags.crawl || !flags.name) {
    log.error("Los argumentos --crawl y --name son obligatorios.");
    return;
  }

  const modelName = flags.name;
  const modelPath = `models/${modelName}.json`;
  const crawlUrl = flags.crawl;

  try {
    // --- 1. Cargar el Predictor ---
    const predictor = await Predictor.load(modelPath);

    // --- 2. Obtener y Parsear el HTML ---
    log.info(`Haciendo crawling en: ${crawlUrl}`);
    const response = await fetch(crawlUrl);
    if (!response.ok) {
      throw new Error(`No se pudo obtener la URL: ${response.statusText}`);
    }
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (!doc) {
      throw new Error("No se pudo parsear el HTML.");
    }

    // --- 3. Procesar Imágenes ---
    const images = doc.querySelectorAll("img");
    log.info(`Se encontraron ${images.length} imágenes.`);

    const dataPath = `data/${encodeURIComponent(modelName)}`;
    const coincidencesPath = path.join(dataPath, "coincidences");
    const triggersPath = path.join(dataPath, "triggers.json");
    await ensureDir(coincidencesPath);

    const triggers: Trigger[] = [];

    for (const img of images) {
      const src = img.getAttribute("src");
      if (!src || !/\.(jpe?g|png)$/i.test(src)) {
        continue; // Ignorar si no es una URL de imagen válida
      }

      const absoluteSrc = new URL(src, crawlUrl).href;
      const prediction = await predictor.predict(absoluteSrc);

      if (prediction === 1) {
        log.info(`¡Coincidencia encontrada!: ${absoluteSrc}`);
        
        // Descargar y guardar la imagen
        const imgResponse = await fetch(absoluteSrc);
        const imgBuffer = await imgResponse.arrayBuffer();
        const fileName = path.basename(new URL(absoluteSrc).pathname);
        const localPath = path.join(coincidencesPath, fileName);
        await Deno.writeFile(localPath, new Uint8Array(imgBuffer));

        triggers.push({
          imageSrc: absoluteSrc,
          foundOn: crawlUrl,
          savedTo: localPath,
        });
      }
    }

    // --- 4. Guardar los Triggers ---
    if (triggers.length > 0) {
      await Deno.writeTextFile(triggersPath, JSON.stringify(triggers, null, 2));
      log.info(`Se guardaron ${triggers.length} coincidencias en '${triggersPath}'.`);
    } else {
      log.info("No se encontraron nuevas coincidencias.");
    }

  } catch (error) {
    log.error(`Error en el proceso de crawling: ${error.message}`);
  }
}

if (import.meta.main) {
  await main();
}
