# Deno Image Classification Project (Simulated)

This project demonstrates the structure of a machine learning pipeline in a Deno environment.

## Important Note: This is a Simulation

The machine learning ecosystem for Deno is still developing. As of now, there are no mature, stable libraries equivalent to TensorFlow or PyTorch for training complex models directly in Deno with GPU support.

Therefore, this project **simulates** the machine learning workflow:
-   **Model Building:** Defines a conceptual model architecture.
-   **Training:** Simulates the training loop, generating plausible-looking loss and accuracy metrics over time. It does **not** perform actual backpropagation or weight updates.
-   **Prediction:** Simulates inference by returning a random result.

The primary goal is to showcase a well-structured, modular Deno application that follows the same design principles as the Go and Python versions.

## How to Run the Project

1.  **Install Deno:**
    If you don't have Deno installed, follow the official instructions at [https://deno.com/manual/getting_started/installation](https://deno.com/manual/getting_started/installation).

2.  **Prepare Your Data:**
    The script expects image files to be present to run the data loading part.
    ```bash
    # Run from the root of the `isthereyouinimg` directory
    mkdir -p deno/data/concept deno/data/no-concept
    ```
    -   Add images containing the concept to `deno/data/concept`.
    -   Add images not containing the concept to `deno/data/no-concept`.

3.  **Run the Application:**
    Navigate to the project's root directory (`isthereyouinimg`) and use the `deno run` command. You must provide permissions for the script to read files, write the simulated model, and access network for downloading modules.

    ```bash
    deno run --allow-read --allow-write --allow-net deno/main.ts
    ```

4.  **Customizing the Run:**
    You can pass command-line flags to customize the simulated process:
    ```bash
    # Example: Run for 20 epochs with a different model path
    deno run --allow-read --allow-write --allow-net deno/main.ts --epochs=20 --modelPath=models/my_sim_model.json

    # Example: Run a simulated prediction on a dummy file path
    deno run --allow-read --allow-write --allow-net deno/main.ts --predictImage=./deno/data/concept/some_image.jpg

### Test 1: desired result => 1
```
deno run -A main.ts --predictImage=./extra/concept.jpeg
```

### Test 1: desired result => 0
```
deno run -A main.ts --predictImage=./extra/no-concept.jpeg
```
