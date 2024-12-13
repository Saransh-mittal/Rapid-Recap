const VECTOR_CONSTANTS = {
  // Maximum number of vectorized articles to maintain
  MAX_VECTORIZED_ARTICLES: 6500,

  // Number of articles to devectorize in each batch
  DEVECTORIZATION_BATCH_SIZE: 1000,

  // Vector search index name
  VECTOR_INDEX_NAME: 'vector_index',

  // OpenAI embedding model
  EMBEDDING_MODEL: 'text-embedding-3-small',

  // Vector dimensions for the embedding
  VECTOR_DIMENSIONS: 1536,

  // Similarity metric for vector search
  SIMILARITY_METRIC: 'dotProduct',
}

module.exports = VECTOR_CONSTANTS
