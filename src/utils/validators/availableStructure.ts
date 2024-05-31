import type {
  Structure,
  StructureBalance,
} from "~/interface/structure/Structure";
import { server$, z } from "@builder.io/qwik-city";
import { connectToDB } from "~/database/db";
import jwt, { type JwtPayload } from "jsonwebtoken";

export const hasExecutableWallet = (
  structures: Structure[] | Structure,
): boolean => {
  if (Array.isArray(structures)) {
    return structures.some((structure: Structure) =>
      structure.structureBalance.some(
        (item: StructureBalance) => item.wallet.isExecutable,
      ),
    );
  } else {
    return structures.structureBalance.some(
      (item: StructureBalance) => item.wallet.isExecutable,
    );
  }
};

const UniqueNameResult = z.object({
  name: z.array(z.string()),
});
type UniqueNameResult = z.infer<typeof UniqueNameResult>;

export const isNameUnique = server$(async function (name: string) {
  const db = await connectToDB(this.env);
  const cookie = this.cookie.get("accessToken");
  if (!cookie) {
    throw new Error("No cookie found");
  }
  const { userId } = jwt.decode(cookie.value) as JwtPayload;
  const result = (
    await db.query(`
      SELECT name FROM
      SELECT VALUE ->has_structure.out FROM ${userId}`)
  ).at(0);
  if (!result) {
    return true;
  }
  const usersAvailableStructures = UniqueNameResult.array().parse(result);
  for (const structure of usersAvailableStructures) {
    if (structure.name[0] === name) {
      return false;
    }
  }
  return true;
});
