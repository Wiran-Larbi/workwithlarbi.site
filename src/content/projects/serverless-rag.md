---
name: Serverless RAG
tagline: Enterprise-grade document intelligence powered by AWS and LLMs.
url: https://github.com/Wiran-Larbi/serverless-rag
year: 2026
started: 2026-02-15
role: Designer & builder
stack: [Python, AWS, FAISS, Streamlit]
image: /assets/images/projects/serverless-rag.png
featured: true
order: 6
status: active
---

## About

Serverless RAG is a scalable document intelligence platform that leverages Retrieval-Augmented Generation to provide semantic search capabilities across enterprise data. It transforms static PDFs into a queryable knowledge base, allowing users to interact with their documents using natural language.

The system features a dual-stage architecture: a high-performance ingestion pipeline that encodes document chunks into vectors using Amazon Titan, and a real-time question-answering interface that synthesizes answers using Claude or GPT. It handles the complexity of vector synchronization across instances via an S3-backed layer, ensuring consistency in distributed environments.

## Tools & process

- **AWS Ecosystem** — Orchestrated via EC2, S3, and ALB within a secure VPC isolation layer to ensure enterprise-grade reliability and security.
- **Vector Intelligence** — Utilizes FAISS for high-performance similarity search and Amazon Titan for state-of-the-at semantic embeddings.
- **Full-Stack Implementation** — Developed with a Python 3.11 backend and a Streamlit-powered frontend for rapid deployment and intuitive admin/client interfaces.