import nc from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes } from "http-status-codes";
import { PrismaClient } from "@prisma/client";
import path from "path";
import multer from "multer";

const prisma = new PrismaClient();

const upload = multer({
  dest: path.join(__dirname, "..", "..", "..", "storage"),
});

interface FileUploadedResponse {
  id: string;
  description: string;
  validUntil: Date;
  maxDownloads: number;
  remainingDownloads: number;
  filename: string;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = nc<NextApiRequest, NextApiResponse>({
  onNoMatch: (req, res) => {
    return res.status(StatusCodes.METHOD_NOT_ALLOWED);
  },
})
  .use(upload.single("file"))
  .put(
    async (
      req: NextApiRequest & { file: Express.Multer.File },
      res: NextApiResponse<FileUploadedResponse | null>
    ) => {
      const { fileId } = <{ fileId: string }>req.query;

      const file = await getFile(fileId);

      if (!file) {
        return res.status(StatusCodes.NOT_FOUND).send(null);
      }

      const upload = req.file;

      const updatedFile = await addFileDetailsToFile(
        file.id,
        upload.originalname,
        upload.path
      );

      if (updatedFile.filename === null) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(null);
      }

      return res.status(StatusCodes.CREATED).json({
        id: updatedFile.id,
        description: updatedFile.description,
        validUntil: updatedFile.validUntil,
        maxDownloads: updatedFile.maxDownloads,
        remainingDownloads: updatedFile.remainingDownloads,
        filename: updatedFile.filename,
      });
    }
  );

export default handler;

async function getFile(id: string) {
  return await prisma.file.findUnique({
    where: {
      id,
    },
  });
}

async function addFileDetailsToFile(
  id: string,
  filename: string,
  storagePath: string
) {
  return await prisma.file.update({
    where: {
      id,
    },
    data: {
      filename,
      storagePath,
    },
  });
}
