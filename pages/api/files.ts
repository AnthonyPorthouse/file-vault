import { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import { parse } from "iso8601-duration";
import { add } from "date-fns";
import { v4 as uuidV4 } from "uuid";
import argon2 from "argon2";
import prisma from "../../utils/prisma";

interface NewFileRequest {
  description: string;
  password: string;
  validFor: string;
  maxDownloads: number;
}

interface NewFileResponse {
  id: string;
  description: string;
  validUntil: Date;
  maxDownloads: number;
  remainingDownloads: number;
}

function getRequestProperties(body: NewFileRequest): NewFileRequest {
  const { description, password, validFor, maxDownloads } = body;
  return { description, password, validFor, maxDownloads };
}

function calculateValidUntilFromDuration(validFor: string) {
  const duration = parse(validFor);
  return add(new Date(), duration);
}

async function hashPassword(password: string) {
  return await argon2.hash(password);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NewFileResponse | null>
) {
  if (req.method !== "POST") {
    return res.status(StatusCodes.METHOD_NOT_ALLOWED).send(null);
  }

  const { description, password, validFor, maxDownloads } =
    getRequestProperties(req.body);

  const id = uuidV4();
  const validUntil = calculateValidUntilFromDuration(validFor);
  const passwordHash = await hashPassword(password);

  const file = await prisma.file.create({
    data: {
      id,
      description,
      password: passwordHash,
      validUntil,
      maxDownloads,
      remainingDownloads: maxDownloads,
    },
  });

  return res.status(StatusCodes.CREATED).json({
    id: file.id,
    description: file.description,
    validUntil: file.validUntil,
    maxDownloads: file.maxDownloads,
    remainingDownloads: file.remainingDownloads,
  });
}
