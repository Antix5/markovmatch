# Markovmatch

#### An algorithm for approximate string matching using inpired by [Markov chains](https://en.wikipedia.org/wiki/Markov_chain)

## Why is it important ?

Approximate string matching is a very common problem in computer science (for text suggestions, spell checking, etc.) and is a very important subject for data processing. For exemple, two database can have the same datas but with slightly different spelling.

Finding efficent algorithms for approximate string matching is not easy a common one is [Levenshtein distance](https://en.wikipedia.org/wiki/Levenshtein_distance).

In this small article we will explore an other approach inspired by automatic text generation allowing for a blazingly fast approximate string matching.
(We will also talk about the limitations and possible solutions)

## Introduction to Markov chains

Markov chains are a mathematical system for modelling the probability of a sequence of events.

In a markov chain, the prediction regarding the next event is based solely on the previous event.

**Exemple :**

 We have 3 points : A, B and C and a character :)

The character routine is the following :

- In the morning he wake up at A and go to B
- From B, our character go to C
- They forgot something at home and go back to A to get it
- They remember that they also forgot something at C
- They go back to their friends home at B before coming back to A

We can explain their trip with the following graph :

```mermaid

graph LR;

A -- 1/2 -->B;
B -- 1/2 -->C;
C -- 1/2 -->A;
A -- 1/2 -->C;
C -- 1/2 -->B;
B -- 1/2 -->A;

```

Where 1/2 is the probability of the event.

Every graph can me matched with something called a transition matrix (also known as adjacency matrix. The contrary is not always true, there exist a non injective and non surjective mapping between the class of n-noded directional connected graphs and the class of $n \times n$ matrix).
The one for the markov chain just above is the following :


$$
\begin{bmatrix}
   & a & b & c \\
 a & 0 & \frac{1}{2} & \frac{1}{2} \\
 b & \frac{1}{2} & 0 & \frac{1}{2} \\
 c & \frac{1}{2} & \frac{1}{2} & 0 \\
\end{bmatrix}
$$

The matrix is symetric because all node are bidirectional in this graph.

## How does the algorithm work ?

The Markovmatch algorithm work in the following way :

- We take a string (exemple : "Hello world")
- We create an unnormalized (1) adjacency matrix from this string

Ex: **Hello world**

```mermaid

graph LR;

H((H))-->e((e));
e((e))-->l((l));
l((l))-->l((l));
l((l))-->o((o));
o((o))-->space((space));
space((space))-->w((w));
w((w))-->o((o));
o((o))-->r((r));
r((r))-->l((l));
l((l))-->d((d));

```

Matrix :

With the character set : H, e, l, o, space, w, r, d

$$
\begin{bmatrix}
    & H & e & l & o & \_ & w & r & d \\
    H & 0 & 1 & 0 & 0 & 0 & 0 & 0 & 0 \\
    e & 0 & 0 & 1 & 0 & 0 & 0 & 0 & 0 \\
    l & 0 & 0 & 1 & 1 & 0 & 0 & 0 & 1 \\
    o & 0 & 0 & 0 & 0 & 1 & 0 & 1 & 0 \\
    \_ & 0 & 0 & 0 & 0 & 0 & 1 & 0 & 0 \\
    w & 0 & 0 & 0 & 1 & 0 & 0 & 0 & 0 \\
    r & 0 & 0 & 1 & 0 & 0 & 0 & 0 & 0 \\
    d & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 \\
\end{bmatrix}
$$

#### (1) Have you noticed something strange ?

This matrix is not normalised (sum of probabilities > 1 :scream: ). Normalisation is very important with transition matrices when we use them in the usual setting of a Markov chain. Here we don't normalise the matrix because we want to limit the number of possible matching words linked to this matrix, **we are not working with probabilities but quantities**.

#### What do I mean by limiting the matching words ?

Markov chaines use probabilities to predict the next event, here we use the adjacency matrix for a totally different purpose which is to find a way to measure the "distance" (I will come back later to this word) between two strings.

By counting the double link in the matrix (when > 1) we have additional information that are not available in a normalised transition matrix.

**Here is an exemple :** 

We have this graph

```mermaid
  graph LR;
      h((h))-->e((e));
      e((e))-->f((f));
      f((f))-->i((i));
      i((i))-->c((c));
      c((c))-->f((f));
      f((f))-->b((b));
      b((b))-->h((h));
      h((h))-->d((d));
      d((d))-->e((e));
      e((e))-->a((a));
      a((a))-->g((g));
```

We start from the letter "h", let's see all the possible word we can build by going only one time by each edge of the graph.

Matrix :

With the character set : a,b,c,d,e,f,g,h,i

$$
\begin{bmatrix}
      & a & b & c & d & e & f & g & h & i \\
    a & 0 & 0 & 0 & 0 & 0 & 0 & 1 & 0 & 0 \\
    b & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 1 & 0 \\
    c & 0 & 0 & 0 & 0 & 0 & 1 & 0 & 0 & 0 \\
    d & 0 & 0 & 0 & 0 & 1 & 0 & 0 & 0 & 0 \\
    e & 1 & 0 & 0 & 0 & 0 & 1 & 0 & 0 & 0 \\
    f & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 1 \\
    g & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 & 0 \\
    h & 0 & 0 & 0 & 1 & 1 & 0 & 0 & 0 & 0 \\
    i & 0 & 0 & 1 & 0 & 0 & 0 & 0 & 0 & 0 \\
\end{bmatrix}
$$

```mermaid
  graph TB;
      h((h))-->he((he));
      he((he))-->heag((heag));
      he((he))-->hef((hef));
      hef((hef))-->hefi((heficfbhdeag));
      hef((hef))-->hefbhdeag((hefbhdeag));
      
      h((h))-->hd((hde));
      hd((hde))-->hdeag((hdeag));
      hd((hde))-->hdf((hdf));
      hdf((hdf))-->hdficfbheag((hdficfbheag));
    
```

Several words can give the same graph, therefore there is no isomorphism between the set of words (+starting letter) and the set of adjacency matrix.

#### Is this a problem ?

Not really, we are going to see why :

The possible words don't mean anything and it's going to be the case most of the time. Beside that, strings that are much longer than the one we are looking for will get penalised by the algorithm due to the fact they have a lot of unused edges, **this penality is comming from the fact that the matrix is not normalised. We have an exact idea of the number of connection there are in a word, if a string has more letters, the number of edge is going to be much greater, when we are going to compute the absolute difference between the two matrices, the resulting matrix will be very different from an empty one**.

#### We converted the string to a matrix but what do we do now ?

Matrix are numerical, we can therefore do operations on them.

##### Let's talk about the distance between two matrices

In mathematics, a distance is computed thanks to a norm.

A norm in a vector space ($V$) is a function that takes a element from the space and returns a positive real number.

Notation : ||.||

The norm has to satisfy the following properties :

- The norm output is always non-negative
- The norm has to satify the triangle inequality
- For all X in the space, $||\lambda . X||=|\lambda|.||X||$
- $||X||=0$ if and only if $X=0_V$

A distance is defined in the following way :

$$ d(X,Y) = ||X-Y|| $$

##### Defintion of the norm we are going to use :

$$ ||X|| = \sum_{i=0, j=0}^{dim(X)} |X_{i,j}| $$

We check if this is a valid norm :

1. We check the triangle inequality :

$$ || X + Y || \leq ||X|| + ||Y|| $$


$$ ||X + Y|| = \sum_{i=0, j=0}^{dim(X)} |X_{i,j} + Y_{i,j}| $$

We know that : $ |X_{i,j} + Y_{i,j}| \leq |X_{i,j}| + |Y_{i,j}|$

Therefore :

$$ ||X + Y|| \leq \sum_{i=0, j=0}^{dim(X)} |X_{i,j}| + |Y_{i,j}| $$

$$ \Leftrightarrow $$

$$ ||X + Y|| \leq \sum_{i=0, j=0}^{dim(X)} |X_{i,j}| + \sum_{i=0}^{dim(X)} |Y_{i,j}|$$

We verfied the triangle inequality

2. We verify the homogeneity of the norm

the norm is homogeneous if and only if $ ||\lambda . X || = | \lambda | . ||X||$

let's prove it,

$$ || \lambda . X || = \sum_{i=0,j=0}^{dim(X)} |\lambda . X_{i,j}| = |\lambda| \sum_{i=0,j=0}^{dim(X)} |X_{i,j}| = |\lambda|.||X||$$

3. We verify that $||X|| = 0$ if and only if $X=0_V$

$$ ||X|| = \sum_{i=0, j=0}^{dim(X)} |X_{i,j}| = 0 \Leftrightarrow X=0_V $$

4. The norm is positive valued because it's a sum of absolute values

This is not a usual [Matrix norm](https://en.wikipedia.org/wiki/Matrix_norm) but a [Frobenius norm](https://en.wikipedia.org/wiki/Frobenius_norm). This norm has been chosen because the computational cost is really low.

The distance we will use is therefore the distance induced by the Frobenius norm.

$$d(X,Y)=||Y-X||_{2,2}$$

##### We are reaching the core of the algorithm, now let's resume the math.

As explained above, a graph can correspond to a set of strings. 

Let $G$ be a graph and $S$ be a string and $f(S)$ be a function that takes a string and returns a graph.

$f$ is neither surjective nor injective.

Therefore it's impossible to talk about the distance between two strings (due to the fact that several strings can give the same graph and therefore different string can have a distance of 0).

We are in something called a [pseudo-metric space](https://en.wikipedia.org/wiki/Pseudo-metric_space) with $d(S_1,S_2)$ the pseudo-distance between two strings.

As explained earlier that's not really a problem due to the type of problem we are dealing with.

Now, let's resume the algorithm in 2 steps :

1. We compute each string matrix (with a given alphabet shared for both conversion)

2. We compute the distance between each string matrix using the Frobenius norm

**Here it is !**

#### Now it's time to test it, how does it compare with common algorithms used int the field ?

We are going to analyse the following metrics : Speed and accuracy.