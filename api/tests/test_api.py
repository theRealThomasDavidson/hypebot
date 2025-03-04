import requests
import time
import json
import sys

# API URL
API_URL = "http://localhost:3000"

# Test documents with specific skills and keywords for better search results
test_docs = [
    "JavaScript developer with 5 years of experience in React, Node.js, and frontend development. Expert in creating responsive web applications.",
    "Data scientist specializing in natural language processing, machine learning, and Python. Experienced in building recommendation systems.",
    "UX designer focused on creating intuitive interfaces and mobile applications. Skilled in Figma, Adobe XD, and user research.",
    "DevOps engineer with expertise in AWS, Docker, and Kubernetes. Experienced in CI/CD pipelines and infrastructure automation.",
    "Full stack developer experienced in JavaScript, Python, and cloud technologies. Passionate about building scalable web applications."
]

# Test queries designed to match the test documents
test_queries = [
    "Need a React developer for frontend work",
    "Looking for someone with machine learning and NLP experience",
    "Need a mobile app designer who knows Figma",
    "Cloud infrastructure expert with AWS knowledge",
    "Web application developer with JavaScript skills"
]

# Test profile IDs
test_profile_ids = [f"test_profile_{i+1}" for i in range(5)]

# Document IDs created during the test
doc_ids = []

def print_header(title):
    print("\n" + "=" * 80)
    print(title.center(80))
    print("=" * 80)

def check_api_health():
    print_header("SEMANTIC SEARCH API TEST")
    print("ℹ Testing API at:", API_URL)
    
    print("ℹ Checking API health...")
    try:
        response = requests.get(f"{API_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ API is healthy: {data.get('status', 'unknown')}")
            return True
        else:
            print(f"✗ API returned status code: {response.status_code}")
            print("⚠ API health check failed. Please make sure the API is running.")
            print(f"ℹ Start the API with: cd api && node src/server.js")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Failed to connect to API")
        print("⚠ API connection failed. Please make sure the API is running.")
        print(f"ℹ Start the API with: cd api && node src/server.js")
        return False

def create_test_vectors():
    print_header("CREATING TEST VECTORS")
    
    success_count = 0
    
    for i, (doc, profile_id) in enumerate(zip(test_docs, test_profile_ids)):
        print(f"ℹ Creating vector {i+1}/{len(test_docs)}: '{doc[:50]}...'")
        try:
            response = requests.post(
                f"{API_URL}/api/vectors",
                json={"text": doc, "profileId": profile_id}
            )
            
            if response.status_code == 201:
                data = response.json()
                doc_id = data.get('data', {}).get('id')
                doc_ids.append(doc_id)
                print(f"✓ Created vector with ID: {doc_id}")
                success_count += 1
            else:
                print(f"✗ Failed to create vector: {response.status_code}")
                print("⚠ Failed to create vector")
        except Exception as e:
            print(f"✗ Exception: {str(e)}")
    
    print(f"ℹ Created {success_count}/{len(test_docs)} vectors")
    
    if success_count < len(test_docs):
        print("⚠ Not all vectors were created. Tests may not work correctly.")
        
    if success_count == 0:
        print("⚠ No vectors were created. Cannot continue with tests.")
        return False
    
    # Give a moment for vectors to be indexed if needed
    print("ℹ Waiting for vectors to be indexed...")
    time.sleep(1)
    
    return True

def search_vectors():
    print_header("SEARCHING VECTORS")
    
    for i, query in enumerate(test_queries):
        print(f"ℹ Query {i+1}/{len(test_queries)}: '{query}'")
        try:
            response = requests.get(
                f"{API_URL}/api/vectors/search",
                params={"query": query}
            )
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('data', [])
                print(f"✓ Found {len(results)} results")
                
                # Display result details if any found
                if results:
                    for j, result in enumerate(results):
                        similarity = result.get('similarity', 0)
                        text = result.get('text', '')[:50] + '...'
                        print(f"  Result {j+1}: [{similarity:.4f}] {text}")
                    print()
            else:
                print(f"✗ Search failed: {response.status_code}")
        except Exception as e:
            print(f"✗ Exception: {str(e)}")
        
        print()

def delete_test_vectors():
    print_header("DELETING TEST VECTORS")
    
    for i, doc_id in enumerate(doc_ids):
        print(f"ℹ Deleting vector {i+1}/{len(doc_ids)}: ID {doc_id}")
        try:
            response = requests.delete(f"{API_URL}/api/vectors/{doc_id}")
            
            if response.status_code == 200:
                print(f"✓ Deleted vector with ID: {doc_id}")
            else:
                print(f"✗ Failed to delete vector: {response.status_code}")
        except Exception as e:
            print(f"✗ Exception: {str(e)}")

def main():
    if not check_api_health():
        return
    
    if not create_test_vectors():
        return
    
    search_vectors()
    
    delete_test_vectors()
    
    print_header("TEST COMPLETE")

if __name__ == "__main__":
    main() 