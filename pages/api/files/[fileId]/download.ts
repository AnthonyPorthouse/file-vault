import nc from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import argon2 from "argon2";
import { isBefore } from "date-fns";
import * as fs from "fs";
import prisma from "../../../../utils/prisma";

import cors from "cors";

const handler = nc<NextApiRequest, NextApiResponse>({
  onNoMatch: (req, res) => {
    return res.status(StatusCodes.NOT_FOUND).send(null);
  },
});

const corsReq = cors({
  origin: "*",
  allowedHeaders: "*",
  exposedHeaders: ["Content-Disposition"],
  credentials: true,
});

handler.use(corsReq);

handler.options(corsReq);

handler.get(async (req, res) => {
  const { fileId } = <{ fileId: string }>req.query;

  const authHeader = req.headers.authorization;

  if (!authHeaderContainsPassword(authHeader)) {
    return res.status(StatusCodes.UNAUTHORIZED).send(null);
  }

  const password = getPasswordFromAuthHeader(authHeader);

  const file = await getFile(fileId);

  if (!file || !file.filename || !file.storagePath) {
    return res.status(StatusCodes.NOT_FOUND).send(null);
  }

  if (
    isBefore(file.validUntil, new Date()) ||
    maxDownloadsExceeded(file.maxDownloads, file.remainingDownloads) ||
    !(await passwordIsValid(file.password, password))
  ) {
    return res.status(StatusCodes.NOT_FOUND).send(null);
  }

  await updateRemainingDownloads(file);

  return res
    .status(StatusCodes.OK)
    .setHeader("Content-Disposition", `attachment; filename=${file.filename}`)
    .send(fs.readFileSync(file.storagePath));
});

async function getFile(id: string) {
  return await prisma.file.findUnique({
    where: {
      id,
    },
  });
}

function authHeaderContainsPassword(header?: string) {
  return header && header.startsWith("Bearer ");
}

function getPasswordFromAuthHeader(header?: string) {
  if (!header) {
    return "";
  }

  return Buffer.from(header.split(" ")[1], "base64").toString("utf8");
}

async function passwordIsValid(hash: string, password: string) {
  return await argon2.verify(hash, password);
}

function maxDownloadsExceeded(
  maxDownloads: number,
  remainingDownloads: number
) {
  return maxDownloads > 0 && remainingDownloads === 0;
}

async function updateRemainingDownloads(file: {
  id: string;
  maxDownloads: number;
}) {
  if (file.maxDownloads === 0) {
    return;
  }

  await prisma.file.update({
    where: {
      id: file.id,
    },
    data: {
      remainingDownloads: {
        decrement: 1,
      },
    },
  });
}

export default handler;
