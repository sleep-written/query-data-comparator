import test from "ava";
import { DataComparer } from "../data-comparer.js";

type Address = {
  id: number;
  street: string;
  city: string;
  zipCode: string;
  country: string;
};

type Contact = {
  id: number;
  type: "email" | "phone";
  value: string;
};

type User = {
  id: number;
  username: string;
  fullName: string;
  isActive: boolean;
  lastLogin: Date;
  addresses: Address[];
  contacts: Contact[];
};

test("Handles insane complex scenario with nested objects in a DB-like context", (t) => {
  const before: User[] = [
    {
      id: 1,
      username: "userComplex",
      fullName: "Complex User",
      isActive: true,
      lastLogin: new Date("2022-07-01"),
      addresses: [
        {
          id: 1,
          street: "123 Complex St",
          city: "Complexity",
          zipCode: "78910",
          country: "Complicania",
        },
        {
          id: 2,
          street: "456 Intricate Ave",
          city: "Complexville",
          zipCode: "111213",
          country: "Complicania",
        },
      ],
      contacts: [
        {
          id: 1,
          type: "email",
          value: "complex@example.com",
        },
        {
          id: 2,
          type: "phone",
          value: "+1234567890",
        },
      ],
    },
  ];

  const after: User[] = [
    {
      id: 1,
      username: "userComplex",
      fullName: "Complex User Updated",
      isActive: false, // Changed
      lastLogin: new Date("2022-08-01"), // Changed
      addresses: [
        // Removed id 2, Added id 3
        {
          id: 1,
          street: "123 Complex St",
          city: "Complexity",
          zipCode: "78910",
          country: "Complicania",
        },
        {
          id: 3,
          street: "789 New Path",
          city: "Newtown",
          zipCode: "141516",
          country: "Complicania",
        },
      ],
      contacts: [
        // Email changed, phone removed, new phone added
        {
          id: 1,
          type: "email",
          value: "updated@example.com",
        },
        {
          id: 3,
          type: "phone",
          value: "+0987654321",
        },
      ],
    },
  ];

  const comparer = new DataComparer<User, "id">("id", before, after);
  const result = comparer.runAnalysis();

  // Assertion for changed user
  t.is(result.changed.length, 1);
  const changedUser = result.changed[0];
  t.is(changedUser.pk.value, 1);
  t.deepEqual(changedUser.fields.fullName, { before: "Complex User", after: "Complex User Updated" });
  t.deepEqual(changedUser.fields.isActive, { before: true, after: false });

  const lastLogin = changedUser.fields.lastLogin;
  t.true(lastLogin?.before instanceof Date)
  t.true(lastLogin?.after instanceof Date)
  t.true((lastLogin?.before as Date) < (lastLogin?.after as Date));

  // Assertion for addresses and contacts changes
  t.deepEqual(changedUser?.fields?.addresses?.before.length, 2);
  t.deepEqual(changedUser?.fields?.addresses?.after.length, 2); // One removed, one added
  t.deepEqual(changedUser?.fields?.contacts?.before.length, 2);
  t.deepEqual(changedUser?.fields?.contacts?.after.length, 2); // One changed, one removed, one added
});

