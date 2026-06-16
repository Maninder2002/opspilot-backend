const fs = require("fs")
const fsPromises = require("fs/promises")
const path = require("path")

const Chat = require("../models/Chat")

const UPLOAD_DIR = path.join(
  __dirname,
  "../uploads"
)

const DEFAULT_ORPHAN_MAX_AGE_MS =
  24 * 60 * 60 * 1000

const DEFAULT_RETENTION_MS =
  7 * 24 * 60 * 60 * 1000

const DEFAULT_CLEANUP_INTERVAL_MS =
  6 * 60 * 60 * 1000

const deleteFileSafely = async (filePath) => {
  if (!filePath) {
    return false
  }

  try {
    await fsPromises.unlink(
      path.resolve(filePath)
    )

    return true
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(
        "Failed to delete file:",
        filePath,
        error.message
      )
    }

    return false
  }
}

const deleteChatAttachmentFiles = async (
  attachments = []
) => {
  let deleted = 0

  for (const attachment of attachments) {
    const removed = await deleteFileSafely(
      attachment.path
    )

    if (removed) {
      deleted += 1
    }
  }

  return deleted
}

const getReferencedPaths = async () => {
  const chats = await Chat.find(
    {},
    { attachments: 1 }
  )

  const referenced = new Set()

  for (const chat of chats) {
    for (const attachment of
      chat.attachments || []) {
      if (attachment.path) {
        referenced.add(
          path.resolve(attachment.path)
        )
      }
    }
  }

  return referenced
}

const cleanupOrphanedUploads = async ({
  maxAgeMs = DEFAULT_ORPHAN_MAX_AGE_MS,
} = {}) => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    return { deleted: 0 }
  }

  const referenced =
    await getReferencedPaths()
  const entries = await fsPromises.readdir(
    UPLOAD_DIR
  )
  const now = Date.now()
  let deleted = 0

  for (const entry of entries) {
    const fullPath = path.join(
      UPLOAD_DIR,
      entry
    )

    let stat

    try {
      stat = await fsPromises.stat(fullPath)
    } catch {
      continue
    }

    if (!stat.isFile()) {
      continue
    }

    const resolved = path.resolve(fullPath)

    if (referenced.has(resolved)) {
      continue
    }

    if (now - stat.mtimeMs < maxAgeMs) {
      continue
    }

    const removed =
      await deleteFileSafely(resolved)

    if (removed) {
      deleted += 1
    }
  }

  return { deleted }
}

const cleanupExpiredChatAttachments = async ({
  maxAgeMs = DEFAULT_RETENTION_MS,
} = {}) => {
  const cutoff = new Date(
    Date.now() - maxAgeMs
  )

  const chats = await Chat.find({
    "attachments.0": { $exists: true },
  })

  let deleted = 0

  for (const chat of chats) {
    const remaining = []

    for (const attachment of
      chat.attachments || []) {
      const uploadedAt = attachment.uploadedAt
        ? new Date(attachment.uploadedAt)
        : null

      const isExpired =
        uploadedAt && uploadedAt < cutoff

      if (isExpired) {
        const removed =
          await deleteFileSafely(
            attachment.path
          )

        if (removed) {
          deleted += 1
        }

        continue
      }

      remaining.push(attachment)
    }

    if (
      remaining.length !==
      chat.attachments.length
    ) {
      chat.attachments = remaining
      await chat.save()
    }
  }

  return { deleted }
}

const runScheduledCleanup = async () => {
  const orphanMaxAgeMs = Number(
    process.env.UPLOAD_ORPHAN_MAX_AGE_MS
  )

  const retentionMs = Number(
    process.env.UPLOAD_RETENTION_MS
  )

  const orphanResult =
    await cleanupOrphanedUploads({
      maxAgeMs:
        Number.isFinite(orphanMaxAgeMs) &&
        orphanMaxAgeMs > 0
          ? orphanMaxAgeMs
          : DEFAULT_ORPHAN_MAX_AGE_MS,
    })

  const expiredResult =
    await cleanupExpiredChatAttachments({
      maxAgeMs:
        Number.isFinite(retentionMs) &&
        retentionMs > 0
          ? retentionMs
          : DEFAULT_RETENTION_MS,
    })

  if (
    orphanResult.deleted > 0 ||
    expiredResult.deleted > 0
  ) {
    console.log(
      `Upload cleanup: removed ${orphanResult.deleted} orphaned file(s), ${expiredResult.deleted} expired attachment(s)`
    )
  }

  return {
    orphaned: orphanResult.deleted,
    expired: expiredResult.deleted,
  }
}

const startUploadCleanupScheduler = () => {
  const intervalMs = Number(
    process.env.UPLOAD_CLEANUP_INTERVAL_MS
  )

  const interval =
    Number.isFinite(intervalMs) &&
    intervalMs > 0
      ? intervalMs
      : DEFAULT_CLEANUP_INTERVAL_MS

  runScheduledCleanup().catch((error) => {
    console.error(
      "Initial upload cleanup failed:",
      error.message
    )
  })

  const timer = setInterval(() => {
    runScheduledCleanup().catch((error) => {
      console.error(
        "Scheduled upload cleanup failed:",
        error.message
      )
    })
  }, interval)

  timer.unref()

  return timer
}

module.exports = {
  UPLOAD_DIR,
  deleteFileSafely,
  deleteChatAttachmentFiles,
  cleanupOrphanedUploads,
  cleanupExpiredChatAttachments,
  runScheduledCleanup,
  startUploadCleanupScheduler,
}
