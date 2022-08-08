# Markovmatch
#### An algorithm for approximate string matching using Markov chains

## Explaination of the math

Every string can be seen as a sequence of symbols.
A markov chain is a tool that initially comes from probability theory and work in the following way:

When we have a sequence of event where the next event are conditionned by the one that come before: 

$ Event 1 -> Event 2 -> Event 3 -> ... -> Event n $

All those events can be represented by a matrix where each collumn and line are representing event nodes.
Each word is a unique sequence of symbols. Therefore each word has a unique matrix $M_{word}$ and strings with switching word order will have very similar matricies.

"Good Dog" and "Dog Good" will have very similar matricies for exemple.

The text matching will use that propriety of the matricies.

We can compute the absolute error between two matricies by computing the absolute difference for each cell and summming them all.
This error will be used to sort the strings in order to find the most similar one.





