# Deno Image Classification Project (Simulated)

This project demonstrates the structure of a machine learning pipeline in a Deno environment.

## Important Note: This is a Simulation

The machine learning ecosystem for Deno is still developing. As of now, there are no mature, stable libraries equivalent to TensorFlow or PyTorch for training complex models directly in Deno with GPU support.

Therefore, this project **simulates** the machine learning workflow:
-   **Model Building:** Defines a conceptual model architecture.
-   **Training:** Simulates the training loop, generating plausible-looking loss and accuracy metrics over time. It does **not** perform actual backpropagation or weight updates.
-   **Prediction:** Simulates inference by returning a random result.

The primary goal is to showcase a well-structured, modular Deno application that follows the same design principles as the Go and Python versions.

## Workflow

This project has a two-step workflow:

1.  **Train a Model:** First, you must run `main.ts` to create a (simulated) model file. This file is required by the crawler.
2.  **Crawl with the Model:** Once the model file exists, you can run `crawl.ts` to find conceptual coincidences on the web.

---

## How to Use

The project now has two main scripts: `main.ts` for training and `crawl.ts` for web crawling.

### 1. Training a Model (`main.ts`)

This script trains a (simulated) model based on the images you provide.

**Usage:**
```bash
deno run -A main.ts --name="<model_name>" [--binaryConceptFolder="<path_to_data>"]
```

**Train like:**
```bash
deno run -A main.ts --name="this-person-doesnt-exists" --binaryConceptFolder="data/this-person-doesnt-exists"
```

-   `--name`: (Required) The name for your model (e.g., "Faces", "Cars"). This determines the filename of the saved model (`models/Faces.json`) and the default data directory.
-   `--binaryConceptFolder`: (Optional) The path to the parent folder containing your `concept` and `no-concept` subfolders.

**Scenarios:**

*   **To create a new model and data structure:**
    Omit the `--binaryConceptFolder` flag. The script will create a data directory for you and exit, prompting you to add images.
    ```bash
    deno run -A main.ts --name="Faces"
    # Output: Prompts you to add images to 'data/Faces/'
    ```

*   **To train with existing data:**
    Provide the path to your data folder.
    ```bash
    # Assuming you have images in 'data/Faces/concept' and 'data/Faces/no-concept'
    deno run -A main.ts --name="Faces" --binaryConceptFolder="data/Faces"
    ```

### 2. Crawling for Coincidences (`crawl.ts`)

This script crawls a given URL, runs predictions on all found images using a specified model, and saves any matches.

**Usage:**
```bash
deno run -A crawl.ts --name="<model_name>" --crawl="<url_to_crawl>"
```

-   `--name`: (Required) The name of the trained model you want to use for predictions.
-   `--crawl`: (Required) The full URL of the website you want to scan for images.

**Example:**
```bash
deno run -A crawl.ts --name="this-person-doesnt-exists" --crawl="https://this-person-does-not-exist.com/"
```
This command will:
1.  Load the `models/Faces.json` predictor.
2.  Fetch and parse the HTML from the URL.
3.  Run a (simulated) prediction on every image found.
4.  If an image gets a `1` (match), it will be downloaded to `data/Faces/coincidences/`.
5.  A log of all matches will be saved to `data/Faces/triggers.json`.
