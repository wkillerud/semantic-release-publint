import assert from "node:assert";
import test from "node:test";
import { verifyConditions } from "./index.js";

test("throws SemanticReleaseError on publint error", async () => {
	await assert.rejects(async () => {
		await verifyConditions({ pkgDir: "./fixtures/missing-files/" });
	});
});

test("does not throw when publint reports no errors", async () => {
	await assert.doesNotReject(async () => {
		await verifyConditions({ pkgDir: "./fixtures/ok/" });
	});
});
