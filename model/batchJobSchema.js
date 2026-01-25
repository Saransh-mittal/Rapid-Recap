const mongoose = require('mongoose')

const batchJobSchema = new mongoose.Schema(
  {
    // OpenAI Batch ID (e.g., "batch_abc123")
    batchId: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined for failed setups
    },

    // Status of our internal workflow
    status: {
      type: String,
      enum: ['preparing', 'submitted', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'preparing',
      required: true,
    },

    // OpenAI status (validating, in_progress, completed, etc.)
    openaiStatus: String,

    // File IDs
    inputFileId: { type: String, required: true },
    outputFileId: String,
    errorFileId: String, // Keeping this as it was not explicitly removed by the instruction

    // Tracking
    processedCount: {
      type: Number,
      default: 0,
    },
    jobType: { type: String, enum: ['content_generation', 'quiz_generation'], default: 'content_generation' },

    // Metadata
    type: {
      type: String,
      default: 'forge_generation',
    },

    // Error tracking
    error: String,

    completedAt: Date,
  },
  { timestamps: true, collection: 'BatchJobs' }
)

// Index for finding active jobs
batchJobSchema.index({ status: 1, createdAt: -1 })

const BatchJob = mongoose.model('BATCH_JOB', batchJobSchema)

module.exports = BatchJob
