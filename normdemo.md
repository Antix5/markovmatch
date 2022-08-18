##### Defintion of the norm we are going to use

$$ ||X|| = \sum_{i=0, j=0}^{dim(X)} |X_{i,j}| $$

We check if this is a valid norm :

1. We check the triangle inequality :

$$ || X + Y || \leq ||X|| + ||Y|| $$

$$ ||X + Y|| = \sum_{i=0, j=0}^{dim(X)} |X_{i,j} + Y_{i,j}| $$

We know that : $|X_{i,j} + Y_{i,j}| \leq |X_{i,j}| + |Y_{i,j}|$

Therefore :

$$ ||X + Y|| \leq \sum_{i=0, j=0}^{dim(X)} |X_{i,j}| + |Y_{i,j}| $$

$$ \Leftrightarrow $$

$$ ||X + Y|| \leq \sum_{i=0, j=0}^{dim(X)} |X_{i,j}| + \sum_{i=0}^{dim(X)} |Y_{i,j}|$$

We verfied the triangle inequality

2. We verify the homogeneity of the norm

the norm is homogeneous if and only if $||\lambda . X || = | \lambda | . ||X||$

let's prove it,

$$ || \lambda . X || = \sum_{i=0,j=0}^{dim(X)} |\lambda . X_{i,j}| = |\lambda| \sum_{i=0,j=0}^{dim(X)} |X_{i,j}| = |\lambda|.||X||$$

3. We verify that $||X|| = 0$ if and only if $X=0_V$

$$ ||X|| = \sum_{i=0, j=0}^{dim(X)} |X_{i,j}| = 0 \Leftrightarrow X=0_V $$

1. The norm is positive because it's a sum of absolute values