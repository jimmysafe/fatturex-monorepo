"use server";

import { auth } from "@repo/auth";
import { MAX_FILE_SIZE } from "@repo/shared/const";
import { put } from "@vercel/blob";
import { headers } from "next/headers";
import { z } from "zod";

import { env } from "@/env";

import { authProcedure } from "../procedures/authenticated";

const LogoUploadSchema = z.object({
  file: z.instanceof(File)
    .refine(file => file.size <= MAX_FILE_SIZE, `Il file non può superare ${MAX_FILE_SIZE / 1024 / 1024}MB`),
});

export const logoUpload = authProcedure
  .createServerAction()
  .input(LogoUploadSchema, { type: "state" })
  .handler(async ({ input: { file }, ctx: { user } }) => {
    const folder = `fatturex/${user.id}`;
    const extension = file.name.split(".").pop();
    const fileName = `${folder}/logo.${extension}`;

    const blob = await put(fileName, file, {
      access: "public",
      token: env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: true,
      // cacheControlMaxAge: 0
    });

    const key = blob.url.split(env.NEXT_PUBLIC_BUCKET_URL)[1];

    if (blob) {
      // update db entry
      await auth.api.updateUser({
        headers: await headers(),
        body: {
          logoPath: key,
        },
      });
    }

    return blob;
  });

export const colorUpdate = authProcedure
  .createServerAction()
  .input(z.object({ color: z.string() }))
  .handler(async ({ input: { color }, ctx: { user } }) => {
    const res = await auth.api.updateUser({
      headers: await headers(),
      body: {
        themeColor: color,
      },
    });

    return res;
  });
