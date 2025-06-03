// src/composables/useBSTree.ts

export interface BSTNode<T> {
  value: T;
  left: BSTNode<T> | null;
  right: BSTNode<T> | null;
}

function insertBST<T>(
  node: BSTNode<T> | null,
  value: T,
  compare: (a: T, b: T) => number
): BSTNode<T> {
  if (!node) {
    return { value, left: null, right: null };
  }

  const cmp = compare(value, node.value);
  if (cmp < 0) {
    node.left = insertBST(node.left, value, compare);
  } else if (cmp > 0) {
    node.right = insertBST(node.right, value, compare);
  }
  // لا يُسمح بالتكرار
  return node;
}

function searchBST<T>(
  node: BSTNode<T> | null,
  value: T,
  compare: (a: T, b: T) => number
): BSTNode<T> | null {
  if (!node) return null;
  const cmp = compare(value, node.value);
  if (cmp === 0) return node;
  if (cmp < 0) return searchBST(node.left, value, compare);
  return searchBST(node.right, value, compare);
}

export function useBSTree<T>(compare: (a: T, b: T) => number) {
  let root: BSTNode<T> | null = null;

  function insert(value: T) {
    const start = performance.now();
    root = insertBST(root, value, compare);
    const time = performance.now() - start;
    return { root, time };
  }

  function search(value: T) {
    const start = performance.now();
    const result = searchBST(root, value, compare);
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
