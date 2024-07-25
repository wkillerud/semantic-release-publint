import fs from "node:fs/promises";
import path from "node:path";
import c from "picocolors";
import { publint } from "publint";
import { formatMessage } from "publint/utils";

let DEBUG = Boolean(process.env.DEBUG);

/**
 * @typedef {Omit<import('publint').Options, 'vfs'>} PublintPluginConfig
 */

/**
 * @param {PublintPluginConfig} [pluginConfig={}]
 * @param {{ logger: { log: (message: string ) => void } }} [context={ logger: console }]
 */
export async function verifyConditions(
	pluginConfig = {},
	context = { logger: console }
) {
	let { logger } = context;

	if (DEBUG) {
		logger.log(`Running publint with config ${JSON.stringify(pluginConfig)}`);
	}

	let packageDirectory = pluginConfig.pkgDir
		? path.resolve(pluginConfig.pkgDir)
		: process.cwd();
	let packageJsonPath = path.join(packageDirectory, "package.json");

	if (DEBUG) {
		logger.log(`running publint on ${packageJsonPath}`);
	}

	let { messages } = await publint({
		...pluginConfig,
		pkgDir: packageDirectory,
	});

	if (DEBUG) {
		logger.log(`publint completed`);
	}

	if (messages.length === 0) {
		logger.log(`${c.green("✓ no issues")}`);
	} else {
		if (DEBUG) {
			logger.log(`reading and parsing ${packageJsonPath} contents`);
		}
		const packageJsonContent = await fs.readFile(packageJsonPath, "utf8");
		const packageJson = JSON.parse(packageJsonContent);
		if (DEBUG) {
			logger.log(`read and parsed`);
		}

		let suggestions = messages.filter((m) => m.type === "suggestion");
		let warnings = messages.filter((m) => m.type === "warning");
		let errors = messages.filter((m) => m.type === "error");

		let shouldThrow =
			errors.length > 0 || (pluginConfig.strict && warnings.length > 0);

		if (suggestions.length > 0) {
			let title = c.bold("Suggestions:");
			logger.log(title);
			for (let suggestion of suggestions) {
				let message = `  ${formatMessage(suggestion, packageJson)}`;
				if (message) logger.log(message);
			}
		}

		if (warnings.length > 0) {
			let title = c.bold(c.yellow("Warnings:"));
			logger.log(title);
			for (let warning of warnings) {
				let message = `  ${formatMessage(warning, packageJson)}`;
				if (message) logger.log(message);
			}
		}

		if (errors.length > 0) {
			let title = c.bold(c.red("Errors:"));
			logger.log(title);
			for (let error of errors) {
				let message = `  ${formatMessage(error, packageJson)}`;
				if (message) logger.log(message);
			}
		}

		if (shouldThrow) {
			let message = `publint reported ${errors.length} errors and ${warnings.length} warnings`;
			if (DEBUG) {
				logger.log(message + ", throwing");
			}
			throw new Error(message);
		}
	}
}
