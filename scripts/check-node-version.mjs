const requiredMajor = 22;
const version = process.versions.node;
const major = Number.parseInt(version.split(".")[0] ?? "", 10);

if (major !== requiredMajor) {
  console.error("");
  console.error(
    `Node ${requiredMajor}.x est requis pour Commun Vivant. Version détectée : ${version}.`,
  );
  console.error("Utilise `nvm use` puis relance la commande.");
  console.error("");
  process.exit(1);
}
