let modelIndex = 1;
const modelContainer = document.getElementById("model-container");

function loadNextModel() {
  const modelPath = `models/${modelIndex}.glb`;
  const newModel = document.createElement("a-entity");

  newModel.setAttribute("gltf-model", `url(${modelPath})`);
  newModel.setAttribute("position", "0 1 -3");
  newModel.setAttribute("scale", "3 3 3");

  newModel.addEventListener("model-loaded", () => {
    console.log("Model loaded:", modelPath);
    document.dispatchEvent(new Event("modelReady")); // Custom event
  });

  while (modelContainer.firstChild) {
    modelContainer.removeChild(modelContainer.firstChild);
  }

  modelContainer.appendChild(newModel);
  modelIndex = modelIndex >= 3 ? 1 : modelIndex + 1;
}

setInterval(loadNextModel, 10000);
loadNextModel();