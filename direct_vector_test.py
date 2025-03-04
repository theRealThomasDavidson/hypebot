#!/usr/bin/env python3
"""
Direct Vector Comparison Script

This script bypasses the API and directly:
1. Connects to Supabase
2. Retrieves document vectors
3. Generates embeddings for test queries
4. Performs cosine similarity calculations
5. Compares the results

Usage:
    python direct_vector_test.py

Requirements:
    pip install supabase openai numpy python-dotenv
"""

import os
import json
import numpy as np
from typing import List, Dict, Any, Optional, Union
import time
from dotenv import load_dotenv
from supabase import create_client, Client
import openai
import math

# Load environment variables
load_dotenv()

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI client
openai.api_key = OPENAI_API_KEY

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Test queries - EXACT matches to test document text for guaranteed similarity
EXACT_MATCH_QUERIES = [
    "JavaScript developer with 5 years of experience in React and Node.js",
    "Data scientist specializing in natural language processing and machine learning",
    "UX designer focused on creating intuitive interfaces for mobile applications",
    "DevOps engineer with expertise in AWS, Docker, and Kubernetes",
    "Full stack developer experienced in JavaScript, Python, and SQL databases",
]

# ANSI colors for console output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(text: str) -> None:
    """Print a formatted header text."""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'=' * 80}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(80)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'=' * 80}{Colors.ENDC}")

def print_result(success: bool, text: str) -> None:
    """Print a formatted result based on success or failure."""
    if success:
        print(f"{Colors.GREEN}✓ {text}{Colors.ENDC}")
    else:
        print(f"{Colors.RED}✗ {text}{Colors.ENDC}")

def print_info(text: str) -> None:
    """Print information text."""
    print(f"{Colors.CYAN}ℹ {text}{Colors.ENDC}")

def print_warning(text: str) -> None:
    """Print warning text."""
    print(f"{Colors.YELLOW}⚠ {text}{Colors.ENDC}")

def print_debug(text: str) -> None:
    """Print debug information."""
    print(f"{Colors.BLUE}🔍 DEBUG: {text}{Colors.ENDC}")

def fetch_documents() -> List[Dict[str, Any]]:
    """Fetch all documents with embeddings from Supabase."""
    print_info("Fetching documents from Supabase...")
    
    try:
        response = supabase.table('documents').select('*').execute()
        documents = response.data
        
        print_result(True, f"Retrieved {len(documents)} documents")
        return documents
    except Exception as e:
        print_result(False, f"Failed to fetch documents: {str(e)}")
        return []

def examine_embedding_formats(documents: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Examine the embedding formats in the documents."""
    print_header("EXAMINING EMBEDDING FORMATS")
    
    formats = {
        "string": 0,
        "array": 0,
        "object": 0,
        "null": 0,
        "other": 0
    }
    
    dimensions = set()
    first_values = {}
    errors = []
    
    for i, doc in enumerate(documents[:10]):  # Examine first 10 documents
        doc_id = doc.get('id')
        embedding = doc.get('embedding')
        
        if embedding is None:
            formats["null"] += 1
            continue
        
        embedding_type = type(embedding).__name__
        print_info(f"Document {doc_id}: Embedding type = {embedding_type}")
        
        if embedding_type == 'str':
            formats["string"] += 1
            try:
                # Try to parse as JSON
                parsed = json.loads(embedding)
                parsed_type = type(parsed).__name__
                print_debug(f"Parsed as JSON: type = {parsed_type}")
                
                if isinstance(parsed, list):
                    dimensions.add(len(parsed))
                    first_values[doc_id] = parsed[:3]
            except Exception as e:
                errors.append(f"Document {doc_id}: Failed to parse embedding string: {str(e)}")
        
        elif embedding_type == 'list':
            formats["array"] += 1
            dimensions.add(len(embedding))
            first_values[doc_id] = embedding[:3]
        
        elif embedding_type == 'dict':
            formats["object"] += 1
            print_debug(f"Object keys: {', '.join(embedding.keys())}")
        
        else:
            formats["other"] += 1
    
    # Print summary
    print_info("\nEmbedding Format Summary:")
    for fmt, count in formats.items():
        if count > 0:
            print_info(f"  - {fmt.capitalize()}: {count} documents")
    
    if dimensions:
        print_info(f"Vector dimensions observed: {', '.join(map(str, dimensions))}")
    
    if first_values:
        print_info("\nSample Vector Values:")
        for doc_id, values in list(first_values.items())[:3]:
            print_info(f"  - Document {doc_id}: {values}")
    
    if errors:
        print_warning("\nErrors encountered:")
        for error in errors[:5]:  # Show first 5 errors
            print_warning(f"  - {error}")
    
    return {
        "formats": formats,
        "dimensions": list(dimensions),
        "errors": errors
    }

def generate_embedding(text: str) -> List[float]:
    """Generate an embedding for text using OpenAI API."""
    print_info(f"Generating embedding for: \"{text[:50]}...\"")
    
    try:
        response = openai.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        embedding = response.data[0].embedding
        print_result(True, f"Generated embedding of length {len(embedding)}")
        return embedding
    except Exception as e:
        print_result(False, f"Failed to generate embedding: {str(e)}")
        return []

def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """Calculate cosine similarity between two vectors."""
    # Check for empties
    if not vec_a or not vec_b:
        return 0.0
    
    # Convert to numpy for efficiency
    a = np.array(vec_a)
    b = np.array(vec_b)
    
    # Handle different lengths
    min_length = min(len(a), len(b))
    a = a[:min_length]
    b = b[:min_length]
    
    # Calculate cosine similarity
    dot_product = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    
    if norm_a == 0 or norm_b == 0:
        return 0.0
    
    similarity = dot_product / (norm_a * norm_b)
    
    # Handle numerical instability
    if similarity > 1.0:
        similarity = 1.0
    elif similarity < -1.0:
        similarity = -1.0
    
    return float(similarity)

def parse_embedding(embedding: Any) -> Optional[List[float]]:
    """Parse an embedding into a list of floats."""
    if embedding is None:
        return None
    
    if isinstance(embedding, list):
        # Check if it's a list of floats
        if all(isinstance(x, (int, float)) for x in embedding):
            return embedding
    
    if isinstance(embedding, str):
        try:
            parsed = json.loads(embedding)
            if isinstance(parsed, list):
                # Check if it's a list of floats
                if all(isinstance(x, (int, float)) for x in parsed):
                    return parsed
        except:
            pass
    
    return None

def search_similar_documents(query_embedding: List[float], documents: List[Dict[str, Any]], threshold: float = 0.1, limit: int = 5) -> List[Dict[str, Any]]:
    """Search for similar documents using cosine similarity."""
    results = []
    
    for doc in documents:
        doc_embedding = parse_embedding(doc.get('embedding'))
        
        if not doc_embedding:
            continue
        
        similarity = cosine_similarity(query_embedding, doc_embedding)
        
        # Store result with similarity score
        results.append({
            "id": doc.get('id'),
            "text": doc.get('text', '')[:100] + '...',
            "similarity": similarity,
            "passed_threshold": similarity >= threshold
        })
    
    # Sort by similarity (highest first) and limit results
    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results[:limit]

def test_exact_match_queries(documents: List[Dict[str, Any]], threshold: float = 0.1) -> None:
    """Test exact match queries against the documents."""
    print_header("TESTING EXACT MATCH QUERIES")
    print_info(f"Using similarity threshold: {threshold}")
    
    for i, query in enumerate(EXACT_MATCH_QUERIES):
        print_info(f"\nQuery {i+1}/{len(EXACT_MATCH_QUERIES)}: '{query[:50]}...'")
        
        # Generate embedding for query
        query_embedding = generate_embedding(query)
        if not query_embedding:
            continue
        
        # Search for similar documents
        results = search_similar_documents(query_embedding, documents, threshold)
        
        # Display results
        matching = [r for r in results if r["passed_threshold"]]
        print_result(len(matching) > 0, f"Found {len(matching)} documents above threshold")
        
        if matching:
            print("\nTop matches:")
            for j, result in enumerate(matching):
                similarity = result["similarity"] * 100
                print(f"  {j+1}. [{similarity:.1f}%] {result['text']}")
        else:
            # Show top results even if below threshold
            print("\nBest matches (below threshold):")
            for j, result in enumerate(results[:3]):
                similarity = result["similarity"] * 100
                print(f"  {j+1}. [{similarity:.1f}%] {result['text']}")

def create_test_document(text: str, profile_id: str = "test_user") -> Optional[int]:
    """Create a test document with embedding in Supabase."""
    print_info(f"Creating test document: '{text[:50]}...'")
    
    try:
        # Generate embedding
        embedding = generate_embedding(text)
        if not embedding:
            return None
        
        # Insert document
        response = supabase.table('documents').insert({
            "text": text,
            "profile_id": profile_id,
            "embedding": embedding
        }).execute()
        
        if response.data and len(response.data) > 0:
            doc_id = response.data[0].get('id')
            print_result(True, f"Created document with ID: {doc_id}")
            return doc_id
        else:
            print_result(False, "Failed to create document")
            return None
    except Exception as e:
        print_result(False, f"Error creating document: {str(e)}")
        return None

def delete_test_document(doc_id: int) -> bool:
    """Delete a test document from Supabase."""
    print_info(f"Deleting document ID: {doc_id}")
    
    try:
        response = supabase.table('documents').delete().eq('id', doc_id).execute()
        print_result(True, f"Deleted document ID: {doc_id}")
        return True
    except Exception as e:
        print_result(False, f"Failed to delete document: {str(e)}")
        return False

def main() -> None:
    """Main function to run the direct vector test."""
    print_header("DIRECT VECTOR TEST")
    
    # Check environment variables
    missing_vars = []
    if not SUPABASE_URL:
        missing_vars.append("SUPABASE_URL")
    if not SUPABASE_KEY:
        missing_vars.append("SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY")
    if not OPENAI_API_KEY:
        missing_vars.append("OPENAI_API_KEY")
    
    if missing_vars:
        print_warning("Missing environment variables: " + ", ".join(missing_vars))
        print_info("Please set these variables in your .env file and try again.")
        return

    print_info(f"Using Supabase URL: {SUPABASE_URL[:20]}...")
    print_info(f"Using Supabase Key: {SUPABASE_KEY[:5]}...{SUPABASE_KEY[-4:]}")
    print_info(f"Using OpenAI API Key: {OPENAI_API_KEY[:5]}...")
    
    # Fetch documents
    documents = fetch_documents()
    
    if not documents:
        print_warning("No documents found. Creating a test document...")
        test_doc_id = create_test_document(EXACT_MATCH_QUERIES[0])
        if test_doc_id:
            documents = fetch_documents()
            if not documents:
                print_warning("Still no documents found after creating test document.")
                return
    
    # Examine embedding formats
    formats_info = examine_embedding_formats(documents)
    
    # Determine threshold based on format
    threshold = 0.1
    if formats_info["formats"]["string"] > 0:
        print_warning("String embeddings detected, using lower threshold (0.05)")
        threshold = 0.05
    
    # Test exact match queries
    test_exact_match_queries(documents, threshold)
    
    print_header("TEST COMPLETE")

if __name__ == "__main__":
    main() 