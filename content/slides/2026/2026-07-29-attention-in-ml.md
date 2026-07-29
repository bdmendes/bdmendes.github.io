---
title: "Attention In Machine Learning"
description: High level discussion of the 2017 paper by Google "Attention Is All You Need".
---

class: center, middle, inverse, small-images

# Attention In Machine Learning

In regards to the 2017 paper by Google "Attention Is All You Need"

Bruno Mendes

---

### Transduction

.left-column-66[
- The Statistics term
  - Compared to *induction*, does not try to derive any general predictive model
  - Instead it is the process of tying unlabeled data to labeled counterparts in a known universe
- More broadly
  - The process of converting a sequence into another
  - English to Portuguese, words to image, etc

The paper uses the latter meaning.
]

.right-column-33[
    <img src="/assets/slides/attention-26-review/Transduction_1.png" style="width: 150px;">
    <p class="caption">Transduction algorithms such as k-nearest neighbors can predict a category for unknown points in this set.</p>
    <div style="height: 20px;"></div>
    <img src="/assets/slides/attention-26-review/Transduction_2.jpg" style="width: 150px;">
    <p class="caption">An interpreter interprets.</p>
]

---

### Previous transduction models

.left-column[
- Before the paper models relied mostly on RNNs and/or CNNs
  - Recurrent layers process token by token updating an internal state sequentially
  - Convolutional layers extract local patterns 
  - Both struggle with long sequences and are hard to parallelize
- The *transformer* is proposed as a new architecture
  - Based solely on attention mechanisms
]

.right-column[
  <img src="/assets/slides/attention-26-review/Transformer_arch.png" style="width: 250px;">
.caption[
Tokens, encoded as positional embeddings, are fed to attention functions that transform them according to a context, yielding to the next layer and so on.
]
]

---

### Embeddings

.left-column[
- The representation of a token (~ word) in a multi-dimesional space, somewhat related to meaning
  - Somewhere along the space there are *towers*...
  - The Eiffel Tower and the Clérigos Tower might be neighbors, perhaps symmetric in one dimension akin to longitude
- In the case of transformers, augmented with position to inject order into the equation
]

.right-column[
<img src="/assets/slides/attention-26-review/Vector_embeddings.jpg" style="width: 250px;">
<p class="caption">The animals and fruits cities.</p>
<div style="height: 30px;"></div>
<img src="/assets/slides/attention-26-review/Positional_encoding.png" style="width: 220px;">
.caption[
Let *pos* be the token index in the input, *i* the embedding dimension and *dmodel* the number of dimensions. Add to the plain embedding vector.
]
]

---

### Attention

- A function `(Q,K,V) => Seq[Embedding] => Seq[Embedding]`
  - Q, K and V are parameters of each "attention head", the *model*<sup>*</sup>
  - Parallel attention heads yield updated embeddings for each token, concatenated at the end: *multi-head attention*
  - The attention layer output is fed into a feed-forward layer, yielding the next layer's input

.center[
<div style="height: 5px;"></div>
<img src="/assets/slides/attention-26-review/Attention_formula.png" style="width: 300px;">
]

- Attention generates "contextually refined" state, to be processed by another module
  - For translation, we want to use a decoder, mapping state to probabilities over the target vocabulary

<p class="footnote"><sup>*</sup> Not going into training; as with many ML models, it can be done by comparing predicted output with real text.</p>
---

### Q,K,V mnemonics

- In a world where height is a learned feature
  - Some query (Q) dimension might ask "what is my height?"
  - Some key (K) dimension might answer "I am 300 meters tall"
  - `Q.K` provides a relevancy score to the token pair
  - Some value (V) dimension might answer "my height is very important"; gets added to the token's embedding, weighted by the relevancy score

.left-column-66[
- In a self attention head, each token gets related to tokens in the same sequence
  - This differs from cross attention, where the query comes from one sequence and the key/value from another
]

.right-column-33[
<img src="/assets/slides/attention-26-review/Cross_tokens.png" style="width: 180px;">
]

---

### From transformers to LLMs

- An LLM is usually a large *decoder-only transformer*
  - It repeatedly predicts the next token from all previous tokens
  - Training on vast amounts of text makes this next-token task learn language, facts, and patterns

- At inference time, each predicted token is appended to the input
  - The process repeats until the model emits an end token

- Agents are harnesses that use LLMs to perform tasks
  - A living loop with a tooling portfolio feeding the LLM with context and interpreting its output to perform actions

---

### Math to meaning

- The introduced architecture was a major step forwards in machine translation
  - It established *BLEU* score records after a few days of training
  - Then it got used to "revolutionize" the world...
- But how close are we to real intelligence?
  - They are trained on a dataset of existing text, but then so are we?...
  - What does it mean to be intelligent?
