import { expandGlob } from "https://deno.land/std@0.224.0/fs/expand_glob.ts";
import * as log from "../logger/logger.ts";

export interface ImageItem {
  path: string;
  label: 0 | 1;
}

async function listImageFiles(dir: string): Promise<string[]> {
  const imagePaths: string[] = [];
  const imgExtensions = ["jpg", "jpeg", "png"];
  
  for await (const file of expandGlob(`${dir}/**/*.{${imgExtensions.join(',')}}`)) {
    if (file.isFile) {
      imagePaths.push(file.path);
    }
  }
  return imagePaths;
}

export async function loadData(
  conceptDir: string,
  noConceptDir: string,
  valSplit = 0.2,
): Promise<{ train: ImageItem[]; val: ImageItem[] }> {
  log.debug("Iniciando la carga de datos para los formatos: jpg, jpeg, png...");

  const conceptFiles = await listImageFiles(conceptDir);
  const noConceptFiles = await listImageFiles(noConceptDir);

  log.info(`Encontradas ${conceptFiles.length} imágenes en el directorio 'concept'.`);
  log.info(`Encontradas ${noConceptFiles.length} imágenes en el directorio 'no-concept'.`);

  const labeledData: ImageItem[] = [
    ...conceptFiles.map((p) => ({ path: p, label: 1 as const })),
    ...noConceptFiles.map((p) => ({ path: p, label: 0 as const })),
  ];

  if (labeledData.length === 0) {
    throw new Error("No se encontraron imágenes en los directorios especificados.");
  }

  // Mezclar los datos
  for (let i = labeledData.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [labeledData[i], labeledData[j]] = [labeledData[j], labeledData[i]];
  }
  log.debug("Datos mezclados aleatoriamente.");

  // Dividir en entrenamiento y validación
  const splitIndex = Math.floor(labeledData.length * (1 - valSplit));
  const trainData = labeledData.slice(0, splitIndex);
  const valData = labeledData.slice(splitIndex);

  log.info(`Datos divididos: ${trainData.length} para entrenamiento, ${valData.length} para validación.`);

  return { train: trainData, val: valData };
}
