import SemanticReleaseError from "@semantic-release/error";
import fs from "node:fs/promises";
import path from "node:path";
import c from "picocolors";
import { publint } from "publint";
import { formatMessage } from "publint/utils";

/**
 * @typedef {Omit<import('publint').Options, 'vfs'>} PublintPluginConfig
 */

/**
 * @typedef {object} Context
 * @property {{ log: (message: string ) => void }} logger
 * @property {string} cwd
 * @property {object} options
 * @property {boolean} [options.debug]
 */

/**
 * @param {PublintPluginConfig} [pluginConfig={}]
 * @param {Context} [context={ logger: console }]
 */
export async function verifyConditions(
	pluginConfig = {},
	context = { logger: console, cwd: process.cwd(), options: {} }
) {
	let { logger, cwd, options } = context;

	let DEBUG = Boolean(process.env.DEBUG) || options.debug;

	if (DEBUG) {
		logger.log(`Running publint with config ${JSON.stringify(pluginConfig)}`);
	}

	let packageDirectory = pluginConfig.pkgDir
		? path.resolve(cwd, pluginConfig.pkgDir)
		: cwd;
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

		/** @type {string[]} */
		let logs = [];

		if (suggestions.length > 0) {
			let title = c.bold("Suggestions:");
			logger.log(title);
			logs.push(title);
			for (let suggestion of suggestions) {
				let message = `  ${formatMessage(suggestion, packageJson)}`;
				if (message) {
					logger.log(message);
					logs.push(message);
				}
			}
		}

		if (warnings.length > 0) {
			let title = c.bold(c.yellow("Warnings:"));
			logger.log(title);
			logs.push(title);
			for (let warning of warnings) {
				let message = `  ${formatMessage(warning, packageJson)}`;
				if (message) {
					logger.log(message);
					logs.push(message);
				}
			}
		}

		if (errors.length > 0) {
			let title = c.bold(c.red("Errors:"));
			logger.log(title);
			logs.push(title);
			for (let error of errors) {
				let message = `  ${formatMessage(error, packageJson)}`;
				if (message) {
					logger.log(message);
					logs.push(message);
				}
			}
		}

		if (shouldThrow) {
			let message = `publint reported ${errors.length} errors and ${
				warnings.length
			} warnings\n${logs.join("\n")}`;
			if (DEBUG) {
				logger.log(message + ", throwing");
			}
			throw new SemanticReleaseError(message, "EPUBLINT", `${suggestions.join("\n")}
${warnings.join("\n")}
${errors.join("\n")}`.trim());
		}
	}
}
