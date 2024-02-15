import test from "ava";
import { DataComparer } from "../data-comparer.js";

type ExampleType = {
  id: number;
  name: string;
  value: string;
  dateModified: Date;
  isActive: boolean;
};

test("Identifies multiple changes in objects", (t) => {
  const before: ExampleType[] = [
    {
      id: 1,
      name: "Item 1",
      value: "Value 1",
      dateModified: new Date("2021-01-01"),
      isActive: true,
    },
    {
      id: 2,
      name: "Item 2",
      value: "Value 2",
      dateModified: new Date("2021-02-01"),
      isActive: true,
    },
  ];
  const after: ExampleType[] = [
    {
      id: 1,
      name: "Item 1",
      value: "Value 1",
      dateModified: new Date("2021-01-01"),
      isActive: false,
    }, // isActive changed
    {
      id: 2,
      name: "Item 2 Updated",
      value: "Value 2",
      dateModified: new Date("2021-03-01"),
      isActive: true,
    }, // name and dateModified changed
  ];

  const comparer = new DataComparer<ExampleType, "id">("id", before, after);
  const result = comparer.runAnalysis();

  t.is(result.changed.length, 2);
  t.deepEqual(result.changed.find((c) => c.pk.value === 1)?.fields.isActive, {
    before: true,
    after: false,
  });
  t.deepEqual(result.changed.find((c) => c.pk.value === 2)?.fields.name, {
    before: "Item 2",
    after: "Item 2 Updated",
  });
  t.deepEqual(
    result.changed.find((c) => c.pk.value === 2)?.fields.dateModified,
    { before: new Date("2021-02-01"), after: new Date("2021-03-01") }
  );
});

test("Handles complex scenario with additions, removals, and changes", (t) => {
  const before: ExampleType[] = [
    {
      id: 1,
      name: "Item 1",
      value: "Original Value",
      dateModified: new Date("2020-12-31"),
      isActive: true,
    },
    {
      id: 2,
      name: "Item 2",
      value: "Will be deleted",
      dateModified: new Date("2021-01-01"),
      isActive: true,
    },
  ];
  const after: ExampleType[] = [
    // Item 1 changed value and isActive status
    {
      id: 1,
      name: "Item 1",
      value: "Updated Value",
      dateModified: new Date("2020-12-31"),
      isActive: false,
    },
    // Item 3 is new
    {
      id: 3,
      name: "Item 3",
      value: "New Item",
      dateModified: new Date("2021-01-02"),
      isActive: true,
    },
  ];

  const comparer = new DataComparer<ExampleType, "id">("id", before, after);
  const result = comparer.runAnalysis();

  // Verifying removal
  t.is(result.removed.length, 1);
  t.is(result.removed[0].id, 2);

  // Verifying addition
  t.is(result.added.length, 1);
  t.is(result.added[0].id, 3);

  // Verifying changes
  t.is(result.changed.length, 1);
  t.deepEqual(result.changed[0].fields.value, {
    before: "Original Value",
    after: "Updated Value",
  });
  t.deepEqual(result.changed[0].fields.isActive, {
    before: true,
    after: false,
  });
});
