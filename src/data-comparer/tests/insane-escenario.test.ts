import test from "ava";
import { DataComparer } from "../data-comparer.js";

type Address = {
  id: number;
  street: string;
  city: string;
  zipCode: string;
  country: string;
};

type User = {
  id: number;
  username: string;
  email: string;
  addresses: Address[];
};

test("DataComparer detects changes in nested objects", (t) => {
  const before: User[] = [
    {
      id: 1,
      username: "user1",
      email: "user1@domain.com",
      addresses: [
        {
          id: 1,
          street: "123 Main St",
          city: "Anytown",
          zipCode: "12345",
          country: "USA",
        },
        {
          id: 2,
          street: "456 Elm St",
          city: "Othertown",
          zipCode: "101112",
          country: "USA",
        },
      ],
    },
  ];

  const after: User[] = [
    {
      id: 1,
      username: "user1",
      email: "user1@example.com", // Email changed
      addresses: [
        {
          id: 1,
          street: "123 Main St",
          city: "Anytown",
          zipCode: "12345",
          country: "USA",
        },
        {
          // This address is completely different
          id: 8,
          street: "666 Venice St",
          city: "Georgia",
          zipCode: "222555",
          country: "USA",
        },
      ],
    },
  ];

  const comparer = new DataComparer<User, "id">("id", before, after);
  const result = comparer.runAnalysis();

  t.is(result.added.length, 0);
  t.is(result.removed.length, 0);
  t.deepEqual(result.changed, [
    {
      pk: {
        key: "id",
        value: 1,
      },
      fields: {
        email: {
          before: "user1@domain.com",
          after: "user1@example.com",
        },
        addresses: {
          before: [
            {
              id: 1,
              street: "123 Main St",
              city: "Anytown",
              zipCode: "12345",
              country: "USA",
            },
            {
              id: 2,
              street: "456 Elm St",
              city: "Othertown",
              zipCode: "101112",
              country: "USA",
            },
          ],
          after: [
            {
              id: 1,
              street: "123 Main St",
              city: "Anytown",
              zipCode: "12345",
              country: "USA",
            },
            {
              id: 8,
              street: "666 Venice St",
              city: "Georgia",
              zipCode: "222555",
              country: "USA",
            },
          ],
        },
      },
    },
  ]);
});
