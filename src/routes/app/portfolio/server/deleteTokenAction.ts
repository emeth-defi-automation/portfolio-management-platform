import { routeAction$, zod$, z } from "@builder.io/qwik-city";
import { structureExists } from "~/interface/structure/removeStructure";
import { connectToDB } from "~/database/db";

export const useDeleteToken = routeAction$(
    async (data, requestEvent) => {
        const db = await connectToDB(requestEvent.env);
        const cookie = requestEvent.cookie.get("accessToken");
        if (!cookie) {
            throw new Error("No cookie found");
        }
        if (!(await structureExists(db, data.structureId))) {
            throw new Error("Structure does not exist");
        }

        await db.query(`
      DELETE structure_balance WHERE in=${data.structureId} AND out=${data.balanceId}`);

        const [balanceCount]: any = await db.query(`
      RETURN COUNT(SELECT id AS num_rows FROM structure_balance WHERE in=${data.structureId})`);

        if (balanceCount === 0) {
            await db.delete(data.structureId as string);
        }

        return {
            success: true,
        }
    },
    zod$({
        structureId: z.string(),
        balanceId: z.string(),
    }),
);