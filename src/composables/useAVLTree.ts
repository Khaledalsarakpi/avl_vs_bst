// src/composables/useAVLTree.ts

export interface AVLNode<T> {
  value: T;
  left: AVLNode<T> | null;
  right: AVLNode<T> | null;
  height: number;
}

function getHeight<T>(node: AVLNode<T> | null): number {
  return node ? node.height : 0;
}

function updateHeight<T>(node: AVLNode<T>) {
  node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
}

function getBalance<T>(node: AVLNode<T> | null): number {
  if (!node) return 0;
  return getHeight(node.left) - getHeight(node.right);
}

function rotateRight<T>(y: AVLNode<T>): AVLNode<T> {
  const x = y.left!;
  const T2 = x.right;

  x.right = y;
  y.left = T2;

  updateHeight(y);
  updateHeight(x);

  return x;
}

function rotateLeft<T>(x: AVLNode<T>): AVLNode<T> {
  const y = x.right!;
  const T2 = y.left;

  y.left = x;
  x.right = T2;

  updateHeight(x);
  updateHeight(y);

  return y;
}

function insertAVL<T>(
  node: AVLNode<T> | null,
  value: T,
  compare: (a: T, b: T) => number
): AVLNode<T> {
  if (!node) {
    return { value, left: null, right: null, height: 1 };
  }

  const cmp = compare(value, node.value);
  if (cmp < 0) {
    node.left = insertAVL(node.left, value, compare);
  } else if (cmp > 0) {
    node.right = insertAVL(node.right, value, compare);
  } else {
    return node; // لا يُسمح بالتكرار
  }

  updateHeight(node);
  const balance = getBalance(node);

  // حالات التوازن
  if (balance > 1 && compare(value, node.left!.value) < 0) {
    return rotateRight(node); // LL
  }

  if (balance < -1 && compare(value, node.right!.value) > 0) {
    return rotateLeft(node); // RR
  }

  if (balance > 1 && compare(value, node.left!.value) > 0) {
    node.left = rotateLeft(node.left!); // LR
    return rotateRight(node);
  }

  if (balance < -1 && compare(value, node.right!.value) < 0) {
    node.right = rotateRight(node.right!); // RL
    return rotateLeft(node);
  }

  return node;
}

function searchAVL<T>(
  node: AVLNode<T> | null,
  value: T,
  compare: (a: T, b: T) => number
): AVLNode<T> | null {
  if (!node) return null;

  const cmp = compare(value, node.value);
  if (cmp === 0) return node;
  if (cmp < 0) return searchAVL(node.left, value, compare);
  return searchAVL(node.right, value, compare);
}

export function useAVLTree<T>(compare: (a: T, b: T) => number) {
  let root: AVLNode<T> | null = null;

  function insert(value: T) {
    const start = performance.now();
    root = insertAVL(root, value, compare);
    const time = performance.now() - start;
    return { root, time };
  }

  function search(value: T) {
    const start = performance.now();
    const result = searchAVL(root, value, compare);
    const time = performance.now() - start;
    return { result, time };
  }

  return {
    get root() {
      return root;
    },
    insert,
    search,
  };
}
