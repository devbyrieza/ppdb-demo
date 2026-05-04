import { hasReachedStatus, type StatusProses } from "../access-control";

function testBulkAssignLogic(currentStatus: string) {
  const updatedStatus = hasReachedStatus(
    currentStatus as StatusProses,
    "scheduled",
  )
    ? currentStatus
    : "scheduled";
  return updatedStatus;
}

const cases = [
  { input: "docs_verified", expected: "scheduled" },
  { input: "verified", expected: "scheduled" },
  { input: "draft", expected: "scheduled" },
  { input: "scheduled", expected: "scheduled" },
  { input: "tested", expected: "tested" }, // Should NOT downgrade
  { input: "accepted", expected: "accepted" }, // Should NOT downgrade
];

console.log("Testing Bulk Assign Status Progression Logic:");
cases.forEach((c) => {
  const result = testBulkAssignLogic(c.input);
  const pass = result === c.expected;
  console.log(
    `[${pass ? "PASS" : "FAIL"}] Input: ${c.input.padEnd(15)} -> Result: ${result.padEnd(12)} (Expected: ${c.expected})`,
  );
  if (!pass) process.exit(1);
});
console.log("\nAll Bulk Assign tests passed!");
