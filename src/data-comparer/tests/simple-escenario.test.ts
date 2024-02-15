import test from "ava";
import { DataComparer } from "../data-comparer.js";

type ExampleType = {
  id: number;
  name: string;
  value: string;
};

test("Identifies added objects", (t) => {
  const before: ExampleType[] = [{ id: 1, name: "Item 1", value: "Value 1" }];
  const after: ExampleType[] = [
    ...before,
    { id: 2, name: "Item 2", value: "Value 2" }, // Added object
  ];

  const comparer = new DataComparer<ExampleType, "id">("id", before, after);
  const result = comparer.runAnalysis();

  t.is(result.added.length, 1);
  t.is(result.added[0].id, 2);
});

test("Identifies removed objects", (t) => {
  const before: ExampleType[] = [
    { id: 1, name: "Item 1", value: "Value 1" },
    { id: 2, name: "Item 2", value: "Value 2" },
  ];
  const after: ExampleType[] = [
    { id: 1, name: "Item 1", value: "Value 1" },
    // 2nd object deleted
  ];

  const comparer = new DataComparer<ExampleType, "id">("id", before, after);
  const result = comparer.runAnalysis();

  t.is(result.removed.length, 1);
  t.is(result.removed[0].id, 2);
});

test("Identifies changes in objects", (t) => {
  const before: ExampleType[] = [{ id: 1, name: "Item 1", value: "Value 1" }];
  const after: ExampleType[] = [
    { id: 1, name: "Item 1", value: "New Value" }, // Changed item
  ];

  const comparer = new DataComparer<ExampleType, "id">("id", before, after);
  const result = comparer.runAnalysis();

  t.is(result.changed.length, 1);
  t.deepEqual(result.changed[0].fields.value, {
    before: "Value 1",
    after: "New Value",
  });
});
