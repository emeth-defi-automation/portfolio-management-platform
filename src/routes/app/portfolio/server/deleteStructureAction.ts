import { routeAction$, zod$, z } from "@builder.io/qwik-city";
import { structureExists } from "~/interface/structure/removeStructure";
import { connectToDB } from "~/database/db";

export const useDeleteStructure = routeAction$(
    async (structure, requestEvent) => {
        const db = await connectToDB(requestEvent.env);

        const cookie = requestEvent.cookie.get("accessToken");
        if (!cookie) {
            throw new Error("No cookie found");
        }
        if (!(await structureExists(db, structure.id))) {
            throw new Error("Structure does not exist");
        }

        await db.delete(structure.id as string);

        return {
            success: true,
            structure: { id: structure.id },
        };
    },
    zod$({
        id: z.string(),
    }),
);