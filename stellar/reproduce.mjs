import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, "build");
const image = "uspc-stellar-repro:local";
const run = (command, args) =>
  execFileSync(command, args, { stdio: "inherit" });
const verify = () => run(process.execPath, [path.join(root, "verify.mjs")]);

verify();
mkdirSync(output, { recursive: true });
run("docker", [
  "build",
  "--platform",
  "linux/amd64",
  "--tag",
  image,
  "--file",
  path.join(root, "Dockerfile"),
  root,
]);
run("docker", [
  "run",
  "--rm",
  "--platform",
  "linux/amd64",
  "--read-only",
  "--cap-drop",
  "ALL",
  "--security-opt",
  "no-new-privileges",
  "--user",
  `${process.getuid()}:${process.getgid()}`,
  ...["contracts", "artifacts", "reproduce.sh"].flatMap((name) => [
    "--mount",
    `type=bind,source=${path.join(root, name)},target=/source/${name},readonly`,
  ]),
  "--mount",
  `type=bind,source=${output},target=/output`,
  image,
]);
verify();
