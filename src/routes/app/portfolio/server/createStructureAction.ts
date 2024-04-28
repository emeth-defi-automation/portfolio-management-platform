import { routeAction$, zod$, z } from "@builder.io/qwik-city";
import { connectToDB } from "~/database/db";
import jwt, { type JwtPayload } from "jsonwebtoken";

export const useCreateStructure = routeAction$(
    async (data, requestEvent) => {
        const cookie = requestEvent.cookie.get("accessToken");
        if (!cookie) {
            throw new Error("No cookie found");
        }
        const { userId } = jwt.decode(cookie.value) as JwtPayload;

        const db = await connectToDB(requestEvent.env);

        const [namesList]: any = await db.query(`
      SELECT VALUE out.name FROM ${userId}->has_structure`);

        if (namesList.includes(data.name)) {
            return {
                success: false,
                message: "Name already taken",
            };
        }
        const structure = await db.create("structure", {
            name: data.name,
        });

        await db.query(`
      relate only ${userId}-> has_structure -> ${structure[0].id}`);

        for (const balanceId of data.balancesId) {
            await db.query(`
        relate only ${structure[0].id}-> structure_balance -> ${balanceId}`);
        }

        return {
            success: true,
            structure: { name: data.name, balances: data.balancesId },
        };
    },
    zod$({
        name: z.string().min(2, { message: "structure name invalid" }),
        balancesId: z.array(z.string()),
    }),
);