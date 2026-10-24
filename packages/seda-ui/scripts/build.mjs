import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import ts from "typescript";
import { buildThemeAssets } from "./theme-assets.mjs";
import { verifyIconAssets } from "./icon-assets.mjs";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "src");
const iconCatalog = verifyIconAssets(root);
const output = path.join(root, "dist");
const staging = path.join(root, `.build-dist-${process.pid}`);
function assertOwned(directory) {
  const resolved = path.resolve(directory);
  if (
    path.dirname(resolved) !== root ||
    !/^(dist|\.build-dist-\d+)$/.test(path.basename(resolved))
  )
    throw new Error("Refusing output outside the package build directories");
  if (fs.existsSync(resolved) && fs.lstatSync(resolved).isSymbolicLink())
    throw new Error("Build output must not be a symlink");
}
assertOwned(output);
assertOwned(staging);
const config = ts.readConfigFile(
  path.join(root, "tsconfig.json"),
  ts.sys.readFile,
);
if (config.error)
  throw new Error(
    ts.flattenDiagnosticMessageText(config.error.messageText, "\n"),
  );
const parsed = ts.parseJsonConfigFileContent(
  {
    ...config.config,
    exclude: ["src/**/*.stories.*", "src/**/*.test.*", "src/**/*.spec.*"],
  },
  ts.sys,
  root,
);
const options = {
  ...parsed.options,
  rootDir: source,
  outDir: staging,
  noEmit: false,
  noEmitOnError: true,
  declaration: true,
  emitDeclarationOnly: false,
};
const host = ts.createCompilerHost(options);
const program = ts.createProgram(parsed.fileNames, options, host);
function esmSpecifier(context) {
  return (file) => {
    const visit = (node) => {
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        const value = node.moduleSpecifier.text;
        if (value.startsWith(".")) {
          const resolved = ts.resolveModuleName(
            value,
            file.fileName,
            options,
            host,
          ).resolvedModule;
          if (
            resolved &&
            path
              .resolve(resolved.resolvedFileName)
              .startsWith(source + path.sep)
          ) {
            let relative = path
              .relative(path.dirname(file.fileName), resolved.resolvedFileName)
              .replace(/\.(tsx?|mts)$/i, ".js")
              .split(path.sep)
              .join("/");
            if (!relative.startsWith(".")) relative = "./" + relative;
            const specifier = ts.factory.createStringLiteral(relative);
            return ts.isImportDeclaration(node)
              ? ts.factory.updateImportDeclaration(
                  node,
                  node.modifiers,
                  node.importClause,
                  specifier,
                  node.attributes,
                )
              : ts.factory.updateExportDeclaration(
                  node,
                  node.modifiers,
                  node.isTypeOnly,
                  node.exportClause,
                  specifier,
                  node.attributes,
                );
          }
        }
      }
      return ts.visitEachChild(node, visit, context);
    };
    return ts.visitNode(file, visit);
  };
}
try {
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length)
    throw new Error(
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCanonicalFileName: (f) => f,
        getCurrentDirectory: () => root,
        getNewLine: () => "\n",
      }),
    );
  const result = program.emit(undefined, undefined, undefined, false, {
    before: [esmSpecifier],
    afterDeclarations: [esmSpecifier],
  });
  if (result.emitSkipped) throw new Error("TypeScript skipped package output");
  fs.copyFileSync(
    path.join(source, "styles.css"),
    path.join(staging, "styles.css"),
  );
  const themeAssets = buildThemeAssets(root, staging);
  fs.writeFileSync(path.join(staging, "icon-catalog.json"), JSON.stringify(iconCatalog, null, 2) + "\n");
  fs.appendFileSync(
    path.join(staging, "styles.css"),
    "\n" +
      fs.readFileSync(path.join(source, "provider.css"), "utf8") +
      "\n" + fs.readFileSync(path.join(source, "navigation.css"), "utf8") +
      "\n" + fs.readFileSync(path.join(source, "overlays.css"), "utf8") +
      "\n" + fs.readFileSync(path.join(source, "layout.css"), "utf8") +
      "\n" +
      themeAssets.css,
  );
  const files = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(file);
      else
        files.push({
          path: path.relative(staging, file).split(path.sep).join("/"),
          sha256: crypto
            .createHash("sha256")
            .update(fs.readFileSync(file))
            .digest("hex"),
        });
    }
  }
  walk(staging);
  fs.writeFileSync(
    path.join(staging, "manifest.json"),
    JSON.stringify(
      {
        kind: "seda-ui-build",
        format: "esm",
        react: "external-peer",
        css: "explicit-import",
        files: files.sort((a, b) => a.path.localeCompare(b.path)),
      },
      null,
      2,
    ) + "\n",
  );
  if (fs.existsSync(output))
    fs.rmSync(output, { recursive: true, force: true });
  fs.cpSync(staging, output, { recursive: true });
  fs.rmSync(staging, { recursive: true, force: true });
  console.log(
    JSON.stringify({
      output,
      files: files.length,
      format: "esm",
      reactBundled: false,
    }),
  );
} catch (error) {
  if (fs.existsSync(staging))
    fs.rmSync(staging, { recursive: true, force: true });
  throw error;
}
