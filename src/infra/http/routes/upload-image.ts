import { uploadImage } from '@/app/functions/upload-image'
import { db } from '@/infra'
import { schema } from '@/infra/db/schemas'
import { isRight, unwrapEither } from '@/shared/either'
import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'

export const uploadImageRoute: FastifyPluginAsync = async server => {
  server.post(
    '/uploads',
    {
      schema: {
        summary: 'Upload an image',
        tags: ['uploads'],
        consumes: ['multipart/form-data'],
        response: {
          201: z.null().describe('Image Uploaded'),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const uploadedFile = await request.file({
        limits: {
          fileSize: 1024 * 1024 * 2, // 2mb
        },
      })

      if (!uploadedFile) {
        return reply.status(400).send({ message: 'File is required.' })
      }

      const result = await uploadImage({
        fileName: uploadedFile.filename,
        contentType: uploadedFile.mimetype,
        contentStream: uploadedFile.file,
      })

      if (uploadedFile.file.truncated) {
        return reply.status(400).send({ message: 'File size limit reached.' })
      }

      if (isRight(result)) {
        return reply.status(201).send()
      }

      const error = unwrapEither(result)

      switch (error.constructor.name) {
        case 'InvalidFileFormat':
          return reply.status(400).send({ message: error.message })
      }
    }
  )
}
