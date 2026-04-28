---
title: "Veeto"
date: 2025-04-10
description: "A powerful encryption and decryption service designed to streamline cryptographic operations for Visa and Mastercard payment workflows using JWE standards."
draft: false
highlight: true
workType: "Backend Development & Security"
industry:
  - "fintech"
  - "cybersecurity"
  - "saas"
dateCompleted: 2025-06-30
thumbnail: "/images/work/veeto/thumbnail.png"
gallery:
  - "/images/work/veeto/gallery-01.png"
  - "/images/work/veeto/gallery-02.png"
liveLink: "https://github.com/Wiran-Larbi/veto-service"
partnership: "None"
soloOrAgency: "Contract"
estimatedTimeSpent: "8 weeks"
tags:
  - "cryptography"
  - "aws"
  - "payment-systems"
  - "tokenization"
---

## Overview
**Veeto** is a specialized encryption and decryption service designed to streamline cryptographic operations for Visa and Mastercard payment workflows. By providing a unified API for both symmetric and asymmetric encryption, Veeto eliminates the complexity of implementing secure Field Level Encryption (FLE) in payment applications.

## Key Features
- **Dual Cryptographic Support**: Handles both symmetric (API keys/shared secrets) and asymmetric (RSA PKI) encryption workflows.
- **Credential Management**: Securely registers and manages cryptographic credentials.
- **AWS Integration**: Built on AWS infrastructure with IAM authentication and Secrets Manager for secure key storage.
- **JWE Standards**: Implements industry-standard JSON Web Encryption (JOSE) for maximum interoperability.

## Technical Impact
Veeto significantly reduces the implementation burden for developers by abstracting intricate cryptographic details behind a clean API. It ensures compliance by maintaining consistent encryption profiles that meet major payment network requirements while improving security through managed key lifecycles.