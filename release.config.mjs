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
				/* publint options */
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
