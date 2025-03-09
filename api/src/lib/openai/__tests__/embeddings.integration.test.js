// Mock embeddings for test data
const mockEmbeddings = {
  'John Doe': new Array(1536).fill(0).map((_, i) => i % 2 ? 0.5 : -0.5),
  'AI-Powered Code Assistant': new Array(1536).fill(0).map((_, i) => i % 2 ? 0.8 : -0.2),
  'React developer': new Array(1536).fill(0).map((_, i) => i % 2 ? 0.7 : -0.3),
  'Who has experience with React and TypeScript?': new Array(1536).fill(0).map((_, i) => i % 2 ? 0.6 : -0.4),
  'Tell me about blockchain projects': new Array(1536).fill(0).map((_, i) => i % 2 ? 0.1 : -0.9),
};

// Mock OpenAI client
jest.mock('../../openai/config', () => {
  const generateMockEmbedding = (seed) => {
    return Array(1536).fill(0).map((_, i) => {
      const base = i % 2 === 0 ? seed : -seed;
      return base + (Math.random() * 0.1 - 0.05);
    });
  };

  const mockProfile = {
    id: '1',
    name: 'John Doe',
    title: 'Senior Software Engineer',
    bio: 'Experienced developer with expertise in React, TypeScript, and cloud technologies. Strong background in building scalable web applications and developer tools.',
    skills: ['React', 'TypeScript', 'AWS', 'Node.js'],
    keywords: ['Full Stack', 'Cloud Architecture'],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockProject = {
    id: '2',
    title: 'AI-Powered Code Assistant',
    blurb: 'Next-generation development tool',
    description: 'An intelligent code assistant that helps developers write better code faster. Uses advanced NLP models to understand code context and provide smart suggestions.',
    skills: ['Python', 'Machine Learning', 'NLP', 'React', 'TypeScript'],
    keywords: ['AI', 'Code Generation', 'Developer Tools'],
    profile_id: '1',
    profile: { name: 'John Doe' },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockEmbeddings = {
    // Profile text
    [mockProfile.name + '\n' + mockProfile.title + '\n' + mockProfile.bio + '\n' + mockProfile.skills.join(', ')]: generateMockEmbedding(0.8),
    
    // Project text
    [mockProject.title + '\n' + mockProject.blurb + '\n' + mockProject.description + '\n' + mockProject.skills.join(', ')]: generateMockEmbedding(0.7),
    
    // Search queries
    'Who has experience with React and TypeScript?': generateMockEmbedding(0.75),
    'Show me projects using machine learning': generateMockEmbedding(0.65),
    'Find developers with AWS experience': generateMockEmbedding(0.85),
    'What projects involve AI and code generation?': generateMockEmbedding(0.68),
    'Tell me about blockchain projects': generateMockEmbedding(0.1),
    'React developer': generateMockEmbedding(0.7),
    'Tell me about the AI-Powered Code Assistant project': generateMockEmbedding(0.72),
    'Who has experience with AWS?': generateMockEmbedding(0.82)
  };

  const openAIConfig = {
    getClient: () => ({
      embeddings: {
        create: ({ input }) => {
          const text = Array.isArray(input) ? input[0] : input;
          console.log(`[DEBUG] Generating embedding for text: "${text.substring(0, 50)}..."`);
          const embedding = mockEmbeddings[text];
          if (!embedding) {
            console.log(`[DEBUG] No pre-defined embedding found for text, generating random one`);
            return Promise.resolve({
              data: [{
                embedding: generateMockEmbedding(0.5)
              }]
            });
          }
          return Promise.resolve({
            data: [{
              embedding
            }]
          });
        }
      },
      chat: {
        completions: {
          create: ({ messages }) => {
            const query = messages[0].content;
            const isNoResults = query.includes('no relevant') || 
                              query.includes('blockchain') ||
                              query.includes('empty results');
            
            let response;
            if (isNoResults) {
              response = 'I could not find any relevant information. Could you please provide more details about what you are looking for?';
            } else if (query.includes('AI-Powered Code Assistant')) {
              response = 'The AI-Powered Code Assistant is a next-generation development tool that helps developers write better code faster. It uses advanced NLP models to understand code context and provide smart suggestions.';
            } else if (query.includes('AWS')) {
              response = 'John Doe has experience with AWS and cloud technologies. They have a strong background in building scalable web applications.';
            } else {
              response = 'Based on the search results, John Doe has experience with React and TypeScript. They have worked on several projects including the AI-Powered Code Assistant.';
            }
            
            return Promise.resolve({
              choices: [{
                message: {
                  content: response
                }
              }]
            });
          }
        }
      }
    }),
    getModels: () => ({
      embedding: { name: 'text-embedding-3-small' },
      chat: { name: 'gpt-4-turbo-preview' }
    }),
    withRetry: (fn) => fn()
  };

  const OPENAI_MODELS = {
    embedding: { name: 'text-embedding-3-small' },
    chat: { name: 'gpt-4-turbo-preview' }
  };

  return { openAIConfig, OPENAI_MODELS };
});

const {
  generateProfileEmbedding,
  generateProjectEmbedding,
  storeDocumentWithEmbedding
} = require('../../openai/embeddings');

const { semanticSearch } = require('../../rag/search');
const { generateResponse } = require('../../rag/context');
const { setupMockPinecone } = require('../../pinecone');

// Test data
const mockProfile = {
  id: '1',
  name: 'John Doe',
  title: 'Senior Software Engineer',
  bio: 'Experienced developer with expertise in React, TypeScript, and cloud technologies. Strong background in building scalable web applications and developer tools.',
  skills: ['React', 'TypeScript', 'AWS', 'Node.js'],
  keywords: ['Full Stack', 'Cloud Architecture'],
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockProject = {
  id: '2',
  title: 'AI-Powered Code Assistant',
  blurb: 'Next-generation development tool',
  description: 'An intelligent code assistant that helps developers write better code faster. Uses advanced NLP models to understand code context and provide smart suggestions.',
  skills: ['Python', 'Machine Learning', 'NLP', 'React', 'TypeScript'],
  keywords: ['AI', 'Code Generation', 'Developer Tools'],
  profile_id: '1',
  profile: { name: 'John Doe' },
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('RAG System E2E Tests', () => {
  beforeAll(async () => {
    // Ensure OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for E2E tests');
    }
    
    // Use mock Pinecone for tests
    console.log('[TEST] Setting up mock Pinecone...');
    setupMockPinecone();
  });

  beforeEach(async () => {
    console.log('[TEST] Clearing Pinecone index before test...');
    // Clear all vectors
    if (global.pineconeIndex && global.pineconeIndex.deleteMany) {
      await global.pineconeIndex.deleteMany({ filter: {} });
    }
  });

  describe('Document Indexing', () => {
    it('should generate and store profile embeddings', async () => {
      const text = `${mockProfile.name}\n${mockProfile.title}\n${mockProfile.bio}\n${mockProfile.skills.join(', ')}`;
      const embedding = await generateProfileEmbedding(mockProfile);
      const id = await storeDocumentWithEmbedding(text, mockProfile.id, embedding, {
        type: 'profile',
        name: mockProfile.name,
        skills: mockProfile.skills
      });

      expect(id).toBeTruthy();
      expect(id).toContain(mockProfile.id);
    }, 30000);

    it('should generate and store project embeddings', async () => {
      const text = `${mockProject.title}\n${mockProject.blurb}\n${mockProject.description}\n${mockProject.skills.join(', ')}`;
      const embedding = await generateProjectEmbedding(mockProject);
      const id = await storeDocumentWithEmbedding(text, mockProject.id, embedding, {
        type: 'project',
        title: mockProject.title,
        skills: mockProject.skills,
        profile_id: mockProject.profile_id
      });

      expect(id).toBeTruthy();
      expect(id).toContain(mockProject.id);
    }, 30000);
  });

  describe('Semantic Search', () => {
    const queries = [
      'Who has experience with React and TypeScript?',
      'Show me projects using machine learning',
      'Find developers with AWS experience',
      'What projects involve AI and code generation?'
    ];

    beforeEach(async () => {
      // Store test documents before each search test
      const profileText = `${mockProfile.name}\n${mockProfile.title}\n${mockProfile.bio}\n${mockProfile.skills.join(', ')}`;
      const profileEmbed = await generateProfileEmbedding(mockProfile);
      await storeDocumentWithEmbedding(profileText, mockProfile.id, profileEmbed, {
        type: 'profile',
        name: mockProfile.name,
        skills: mockProfile.skills
      });
      
      const projectText = `${mockProject.title}\n${mockProject.blurb}\n${mockProject.description}\n${mockProject.skills.join(', ')}`;
      const projectEmbed = await generateProjectEmbedding(mockProject);
      await storeDocumentWithEmbedding(projectText, mockProject.id, projectEmbed, {
        type: 'project',
        title: mockProject.title,
        skills: mockProject.skills,
        profile_id: mockProject.profile_id
      });
    });

    it('should find relevant documents based on semantic queries', async () => {
      const results = await Promise.all(
        queries.map(query => semanticSearch(query, 3))
      );

      results.forEach((searchResults, i) => {
        expect(Array.isArray(searchResults)).toBe(true);
        expect(searchResults.length).toBeLessThanOrEqual(3);
        
        searchResults.forEach(result => {
          expect(result).toHaveProperty('content_type');
          expect(result).toHaveProperty('content_id');
          expect(result).toHaveProperty('content_text');
          expect(result).toHaveProperty('similarity');
          expect(result.similarity).toBeGreaterThanOrEqual(0);
          expect(result.similarity).toBeLessThanOrEqual(1);
        });

        // Log search quality metrics
        console.log(`Query: "${queries[i]}"`);
        console.log('Top results:', searchResults.map(r => ({
          type: r.content_type,
          similarity: r.similarity.toFixed(3)
        })));
      });
    }, 60000);

    it('should respect performance SLA', async () => {
      const startTime = Date.now();
      await semanticSearch('React developer', 5);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(1000); // 1s SLA
      console.log(`Search completed in ${duration}ms`);
    }, 30000);
  });

  describe('Response Generation', () => {
    const testQueries = [
      {
        query: 'Who has experience with React and TypeScript?',
        expectProfile: true,
        expectProject: true
      },
      {
        query: 'Tell me about the AI-Powered Code Assistant project',
        expectProfile: false,
        expectProject: true
      },
      {
        query: 'Who has experience with AWS?',
        expectProfile: true,
        expectProject: false
      }
    ];

    beforeEach(async () => {
      // Store test documents before each response generation test
      const profileText = `${mockProfile.name}\n${mockProfile.title}\n${mockProfile.bio}\n${mockProfile.skills.join(', ')}`;
      const profileEmbed = await generateProfileEmbedding(mockProfile);
      await storeDocumentWithEmbedding(profileText, mockProfile.id, profileEmbed, {
        type: 'profile',
        name: mockProfile.name,
        skills: mockProfile.skills
      });
      
      const projectText = `${mockProject.title}\n${mockProject.blurb}\n${mockProject.description}\n${mockProject.skills.join(', ')}`;
      const projectEmbed = await generateProjectEmbedding(mockProject);
      await storeDocumentWithEmbedding(projectText, mockProject.id, projectEmbed, {
        type: 'project',
        title: mockProject.title,
        skills: mockProject.skills,
        profile_id: mockProject.profile_id
      });
    });

    it('should generate relevant responses with source attribution', async () => {
      for (const test of testQueries) {
        // 1. Perform semantic search
        const searchResults = await semanticSearch(test.query, 3);
        expect(searchResults.length).toBeGreaterThan(0);

        // 2. Generate response
        const response = await generateResponse(test.query, searchResults);
        
        // 3. Verify response structure
        expect(response).toHaveProperty('response');
        expect(response).toHaveProperty('sources');
        expect(typeof response.response).toBe('string');
        expect(response.response.length).toBeGreaterThan(0);

        // 4. Verify source attribution
        if (test.expectProfile) {
          expect(response.sources.profiles).toContain(mockProfile.id);
        }
        if (test.expectProject) {
          expect(response.sources.projects).toContain(mockProject.id);
        }

        // 5. Log response quality
        console.log(`\nQuery: "${test.query}"`);
        console.log('Response:', response.response);
        console.log('Sources:', {
          profiles: response.sources.profiles.length,
          projects: response.sources.projects.length
        });
      }
    }, 90000);

    it('should handle queries with no relevant results gracefully', async () => {
      const query = "Tell me about blockchain projects";
      
      // 1. Perform semantic search with higher threshold for irrelevant queries
      const searchResults = await semanticSearch(query, 3, { threshold: 0.8 });
      
      // 2. Generate response
      const response = await generateResponse(query, searchResults);
      
      // 3. Verify graceful handling
      expect(response.response).toContain('Could you please provide more details');
      expect(response.sources.profiles).toHaveLength(0);
      expect(response.sources.projects).toHaveLength(0);
    }, 30000);
  });

  describe('Concurrent Operations', () => {
    beforeEach(async () => {
      // Store test documents before concurrent operations test
      const profileText = `${mockProfile.name}\n${mockProfile.title}\n${mockProfile.bio}\n${mockProfile.skills.join(', ')}`;
      const profileEmbed = await generateProfileEmbedding(mockProfile);
      await storeDocumentWithEmbedding(profileText, mockProfile.id, profileEmbed, {
        type: 'profile',
        name: mockProfile.name,
        skills: mockProfile.skills
      });
      
      const projectText = `${mockProject.title}\n${mockProject.blurb}\n${mockProject.description}\n${mockProject.skills.join(', ')}`;
      const projectEmbed = await generateProjectEmbedding(mockProject);
      await storeDocumentWithEmbedding(projectText, mockProject.id, projectEmbed, {
        type: 'project',
        title: mockProject.title,
        skills: mockProject.skills,
        profile_id: mockProject.profile_id
      });
    });

    it('should handle multiple concurrent requests', async () => {
      const queries = [
        "Who has experience with React and TypeScript?",
        "Tell me about the AI-Powered Code Assistant project",
        "Who has experience with AWS?"
      ];

      const operations = queries.map(query => semanticSearch(query, 3));

      const startTime = Date.now();
      const results = await Promise.all(operations);
      const duration = Date.now() - startTime;

      results.forEach(searchResults => {
        expect(Array.isArray(searchResults)).toBe(true);
        expect(searchResults.length).toBeGreaterThan(0);
      });

      // Verify total time is reasonable (allowing for some parallel execution)
      expect(duration).toBeLessThan(4000); // 4s for 3 concurrent requests in test environment
      console.log(`Concurrent operations completed in ${duration}ms`);
    }, 30000);
  });
}); 