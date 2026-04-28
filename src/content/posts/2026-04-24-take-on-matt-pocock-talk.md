---
title: "My Take on Matt Pocock’s Talk: Why Software Fundamentals Matter More Than Ever"
date: 2026-04-24
description: "A reflection on the enduring importance of clean design, deep modules, and testability in the age of AI-driven development."
draft: false
---

Lately, many AI companies are pushing the narrative that traditional software engineering skills are coming to an end. But as Matt Pocock argued at the AI Engineer Europe conference, the reality is the exact opposite. AI isn't a paradigm shift that makes engineering obsolete; it is a tool that **amplifies** your existing engineering practices—for better or worse.

### The AI Failure Loop
A major pitfall in the current landscape is the "garbage-in, garbage-out" cycle. When developers feed vague specs to an AI and blindly accept the output, the codebase quickly degrades. 
* **Design Oversight:** Without a clear mental model, AI-generated code drifts from the actual intent.
* **Verbosity & Complexity:** AI models often generate overly wordy or complex solutions where a simple one would suffice.
* **The Maintenance Tax:** Code isn't cheap. Poorly generated code carries a heavy maintenance cost that compounds with every regeneration.

### Deep Modules vs. Shallow Modules
Drawing on John Ousterhout’s philosophy, Pocock emphasizes the need for **Deep Modules**. This concept is the secret weapon for making AI more effective in your codebase.



* **Deep Modules:** These hide significant complexity behind a simple, intuitive interface. They provide a clear boundary that allows both humans and AI to reason about the logic without getting "lost in the swamp."
* **Shallow Modules:** These have limited functionality but expose intricate, confusing interfaces. This "tangled logic" makes it nearly impossible for an AI to generate meaningful updates without breaking things.

### Testability as a Signal
Pocock made a point that resonates deeply with any seasoned engineer: **"Good codebases are easy to test."**

Testability isn't just a "nice-to-have" feature; it is a signal of structural quality. A well-tested, well-structured module is far more amenable to AI-assisted development. If an AI can reason about a module through its tests and interfaces, it can assist in debugging and extending it. If the code is a brittle, untested mess, the AI will only accelerate its collapse.

### Fundamentals Don’t Die; They Get Amplified
AI cannot replace solid software engineering; it acts as a force multiplier. 
* **Good Practices:** Lead to better results, faster iterations, and cleaner systems.
* **Bad Practices:** Produce "garbage code" faster than ever before.



### Conclusion
The engineers who thrive in this new era won't be those trying to replace engineering with AI. They will be the ones using AI within a framework of disciplined, fundamental engineering. By embracing modularity, testability, and clear design, you aren't resisting the future—you are harnessing the power of AI to build software that actually works.

---
**Watch the full talk:** [Matt Pocock: "It Ain't Broke: Why Software Fundamentals Matter More Than Ever"](https://www.youtube.com/watch?v=0L_jNOCLxS0)