# Publint Semantic Release Plugin

This is a plugin for [semantic-release] that runs [publint] as part of the [Verify Conditions step], to help you catch packaging errors before publishing.

By default the plugin will log all lint messages, but only fail verification if there are messages at the `error` level. You can turn on `strict` mode, which treats any `warning` as errors as well.

## Usage

```sh
npm install --save-dev semantic-release-publint
```

```js
// release.config.mjs
/**
 * @type {Partial<import('semantic-release').GlobalConfig>}
 */
export default {
	plugins: [
		"@semantic-release/commit-analyzer",
		"@semantic-release/release-notes-generator",
		[
			"@semantic-release/npm",
			{
				tarballDir: "release",
			},
		],
		[
			"semantic-release-publint",
			{
				strict: true, // optional, to treat warnings as errors
			},
		],
		[
			"@semantic-release/github",
			{
				assets: "release/*.tgz",
			},
		],
	],
	branches: ["main"],
};
```

## Options

The config is passed to [publint].

```js
{
  /**
   * Path to your package that contains a package.json file.
   * Defaults to `process.cwd()`.
   */
  pkgDir: './path/to/package',
  /**
   * The level of messages to log (default: `'suggestion'`).
   * - `suggestion`: logs all messages
   * - `warning`: logs only `warning` and `error` messages
   * - `error`: logs only `error` messages
   */
  level: 'warning',
  /**
   * Report warnings as errors (default: `false`)
   */
  strict: true
}
```

## Rules

See the [publint documentation] for an explanation of the different rules and messages.

[semantic-release]: https://github.com/semantic-release
[publint]: https://github.com/bluwy/publint
[Verify Conditions step]: https://github.com/semantic-release/semantic-release?tab=readme-ov-file#release-steps
[publint documentation]: https://publint.dev/rules
