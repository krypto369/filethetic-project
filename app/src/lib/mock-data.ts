import { Dataset } from "@/types/dataset";

// Mock datasets for development
export const mockDatasets: Dataset[] = [
  {
    id: "1",
    name: "GPT-4 Responses Dataset",
    description: "A collection of GPT-4 responses to various prompts",
    owner: "0x1234...5678",
    model: "GPT-4",
    categories: ["NLP"],
    numRows: 5000,
    isVerified: true,
    verifier : "0xVerifier1",
    price: 0.05,
    createdAt: new Date("2024-06-01"),
    metadata: {
      schema: {
        prompt: "string",
        response: "string",
        rating: "number"
      },
      sampleData: [
        { prompt: "Explain quantum computing", response: "Quantum computing uses quantum bits...", rating: 4.8 }
      ],
      metrics: {
        accuracy: 0.95,
        diversity: 0.87
      }
    },
    ipfsHash: "Qm123456789",
    isPrivate: false
  },
  {
    id: "2",
    name: "DALL-E Image Prompts",
    description: "Curated prompts that generate high-quality DALL-E images",
    owner: "0xabcd...efgh",
    model: "DALL-E",
    category: "Image",
    numRows: 2500,
    isVerified: false,
    price: 0.1,
    createdAt: new Date("2024-06-15"),
    metadata: {
      schema: {
        prompt: "string",
        tags: "array",
        quality_score: "number"
      },
      sampleData: [
        { prompt: "A photorealistic mountain landscape at sunset", tags: ["nature", "sunset", "mountains"], quality_score: 4.7 }
      ]
    },
    ipfsHash: "Qm987654321",
    isPrivate: false
  },
  {
    id: "3",
    name: "Claude Conversation Dataset",
    description: "Conversations between users and Claude AI assistant",
    owner: "0x1234...5678",
    model: "Claude",
    category: "NLP",
    numRows: 3800,
    isVerified: true,
    verifier: "0xVerifier2",
    price: 0.07,
    createdAt: new Date("2024-05-20"),
    metadata: {
      schema: {
        user_input: "string",
        assistant_response: "string",
        conversation_id: "string"
      },
      sampleData: [
        { user_input: "How do I improve my writing?", assistant_response: "To improve your writing...", conversation_id: "conv123" }
      ],
      metrics: {
        helpfulness: 0.92,
        accuracy: 0.89
      }
    },
    ipfsHash: "QmClassicConv",
    isPrivate: false
  }
];
