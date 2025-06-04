<template>
  <q-page padding class="bg-grey-1">

    <q-card class="q-mb-sm shadow-2">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div>
            <q-input outlined dense v-model.number="inputValue" type="number" label="قيمة العقدة"
              @keyup.enter="insertNode" clearable />
          </div>
          <div class="col-12 col-md-2 row q-gutter-sm">
            <q-btn unelevated color="primary" label="إدخال" @click="insertNode" />
            <q-btn color="warning" label="إدخال قيم عشوائية" @click="insertRandomValues" />
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div>
            <q-input outlined dense v-model.number="searchValue" type="number" label="ابحث عن قيمة"
              @keyup.enter="searchNode" clearable />
          </div>
          <div class="row justify-between q-gutter-sm">
            <q-btn unelevated color="secondary" label="بحث" @click="searchNode" />
            <q-btn outline color="info" label="إعادة تعيين" @click="resetTrees" />

          </div>
        </div>
      </q-card-section>
    </q-card>


    <div class="row q-gutter-sm justify-center">

      <q-card class="shadow-2 col-12 col-md-5">
        <q-bar class="bg-white text-blue">
          شجرة BST التقليدية

          <q-space />
          <q-btn flat dense round icon="refresh" @click="resetTrees" />
        </q-bar>
        <div class="col-12 col-md-6">
          <q-banner v-if="bstStatus" class="bg-primary text-white" rounded>
            {{ bstStatus }}
          </q-banner>
        </div>
        <div class="col-12 col-md-6">
          <q-banner v-if="bstSearchResult !== null" class="bg-blue-1 text-blue" rounded dense>
            <div>
              <strong>BST:</strong>
              {{ bstSearchResult ? `تم العثور على ${searchValue}` : `لم يتم العثور على ${searchValue}` }}
            </div>
            <div>زمن البحث: {{ bstSearchTime }} مللي ثانية</div>
          </q-banner>
        </div>
        <q-card-section>
          <div class="text-caption q-mb-xs">وقت الإدخال: {{ bstTime }} مللي ثانية</div>
          <div ref="bstContainer" class="tree-box"></div>
        </q-card-section>
      </q-card>
      <q-card class="shadow-2 col-12 col-md-5">
        <q-bar class="bg-white text-green">
          شجرة AVL المتوازنة
          <q-space />
          <q-btn flat dense round icon="refresh" @click="resetTrees" />
        </q-bar>
        <div class="col-12 col-md-6">
          <q-banner v-if="avlStatus" class="bg-secondary text-white" rounded>
            {{ avlStatus }}
          </q-banner>
        </div>
        <div class="col-12 col-md-6">
          <q-banner v-if="avlSearchResult !== null" class="bg-green-1 text-green" rounded dense>
            <div>
              <strong>AVL:</strong>
              {{ avlSearchResult ? `تم العثور على ${searchValue}` : `لم يتم العثور على ${searchValue}` }}
            </div>
            <div>زمن البحث: {{ avlSearchTime }} مللي ثانية</div>
          </q-banner>
        </div>
        <q-card-section>
          <div class="text-caption q-mb-xs">وقت الإدخال: {{ avlTime }} مللي ثانية</div>
          <div ref="avlContainer" class="tree-box"></div>
        </q-card-section>
      </q-card>

    </div>
  </q-page>
</template>

<style scoped>
.tree-box {
  border: 1px solid #ccc;
  padding: 10px;
  height: 450px;
  overflow: auto;
  background: white;
  border-radius: 8px;
}
</style>


<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import * as d3 from 'd3'
import { Notify } from 'quasar'

interface TreeNode {
  name: string
  children?: TreeNode[]
}

//   BST Class
class BSTNode {
  val: number
  left: BSTNode | null = null
  right: BSTNode | null = null
  constructor(val: number) {
    this.val = val
  }
}

class BST {
  root: BSTNode | null = null

  insert(val: number) {
    this.root = this._insert(this.root, val)
  }

  _insert(node: BSTNode | null, val: number): BSTNode {
    if (!node) return new BSTNode(val)
    if (val < node.val) node.left = this._insert(node.left, val)
    else if (val > node.val) node.right = this._insert(node.right, val)
    return node
  }

  search(val: number): boolean {
    return this._search(this.root, val)
  }

  _search(node: BSTNode | null, val: number): boolean {
    if (!node) return false
    if (val === node.val) return true
    return val < node.val ? this._search(node.left, val) : this._search(node.right, val)
  }

  delete(val: number) {
    this.root = this._delete(this.root, val)
  }

  _delete(node: BSTNode | null, val: number): BSTNode | null {
    if (!node) return null
    if (val < node.val) node.left = this._delete(node.left, val)
    else if (val > node.val) node.right = this._delete(node.right, val)
    else {
      if (!node.left) return node.right
      else if (!node.right) return node.left
      node.val = this._minValue(node.right)
      node.right = this._delete(node.right, node.val)
    }
    return node
  }

  _minValue(node: BSTNode): number {
    let min = node.val
    while (node.left) {
      min = node.left.val
      node = node.left
    }
    return min
  }

  toTreeNode(node: BSTNode | null): TreeNode | null {
    if (!node) return null
    const children: TreeNode[] = []
    if (node.left) children.push(this.toTreeNode(node.left)!)
    if (node.right) children.push(this.toTreeNode(node.right)!)
    return {
      name: node.val.toString(),
      children: children.length ? children : undefined
    }
  }

  async _visualSearch(node: BSTNode | null, val: number, callback: (path: number[], status: string) => void): Promise<boolean> {
    let path: number[] = []

    const traverse = async (current: BSTNode | null): Promise<boolean> => {
      if (!current) {
        callback(path, `القيمة ${val} غير موجودة`)
        return false
      }
      path.push(current.val)
      callback(path, `مقارنة ${val} مع ${current.val}`)
      await sleep(800)

      if (val === current.val) {
        callback(path, `تم العثور على ${val}`)
        return true
      }

      return val < current.val ? traverse(current.left) : traverse(current.right)
    }

    return traverse(node)
  }

  async _visualInsert(val: number, container: HTMLElement | null, treeInstance: BST | AVL, callback: (path: number[], status: string) => void): Promise<void> {
    let path: number[] = []

    const insertRecursive = async (node: BSTNode | null): Promise<BSTNode> => {
      if (!node) {
        path.push(val)
        drawTreeHighlight(this.toTreeNode(this.root), container, treeInstance, path)
        callback(path, `تم إدخال ${val}`)
        await sleep(800)
        return new BSTNode(val)
      }
      path.push(node.val)
      drawTreeHighlight(this.toTreeNode(this.root), container, treeInstance, path)
      await sleep(800)

      if (val < node.val) {
        callback(path, `مقارنة ${val} مع ${node.val} ➝ الذهاب إلى اليسار`)
        node.left = await insertRecursive(node.left)
      } else if (val > node.val) {
        callback(path, `مقارنة ${val} مع ${node.val} ➝ الذهاب إلى اليمين`)
        node.right = await insertRecursive(node.right)
      }
      return node
    }

    this.root = await insertRecursive(this.root)
    callback(path, `تم إدخال ${val} في BST`)
  }
}

//   AVL Class
class AVLNode {
  val: number
  height: number = 1
  left: AVLNode | null = null
  right: AVLNode | null = null
  constructor(val: number) {
    this.val = val
  }
}

class AVL {
  root: AVLNode | null = null

  height(node: AVLNode | null): number {
    return node ? node.height : 0
  }

  balanceFactor(node: AVLNode | null): number {
    if (!node) return 0
    return this.height(node.left) - this.height(node.right)
  }

  rightRotate(y: AVLNode): AVLNode {
    const x = y.left!
    const T2 = x.right
    x.right = y
    y.left = T2
    y.height = Math.max(this.height(y.left), this.height(y.right)) + 1
    x.height = Math.max(this.height(x.left), this.height(x.right)) + 1
    return x
  }

  leftRotate(x: AVLNode): AVLNode {
    const y = x.right!
    const T2 = y.left
    y.left = x
    x.right = T2
    x.height = Math.max(this.height(x.left), this.height(x.right)) + 1
    y.height = Math.max(this.height(y.left), this.height(y.right)) + 1
    return y
  }

  insert(val: number) {
    this.root = this._insert(this.root, val)
  }

  _insert(node: AVLNode | null, val: number): AVLNode {
    if (!node) return new AVLNode(val)
    if (val < node.val) node.left = this._insert(node.left, val)
    else if (val > node.val) node.right = this._insert(node.right, val)
    else return node

    node.height = 1 + Math.max(this.height(node.left), this.height(node.right))
    const balance = this.balanceFactor(node)

    // LL
    if (balance > 1 && val < (node.left?.val ?? 0))
      return this.rightRotate(node)
    // RR
    if (balance < -1 && val > (node.right?.val ?? 0))
      return this.leftRotate(node)
    // LR
    if (balance > 1 && val > (node.left?.val ?? 0)) {
      node.left = this.leftRotate(node.left!)
      return this.rightRotate(node)
    }
    // RL
    if (balance < -1 && val < (node.right?.val ?? 0)) {
      node.right = this.rightRotate(node.right!)
      return this.leftRotate(node)
    }
    return node
  }

  search(val: number): boolean {
    return this._search(this.root, val)
  }

  _search(node: AVLNode | null, val: number): boolean {
    if (!node) return false
    if (val === node.val) return true
    return val < node.val ? this._search(node.left, val) : this._search(node.right, val)
  }

  delete(val: number) {
    this.root = this._delete(this.root, val)
  }

  _delete(node: AVLNode | null, val: number): AVLNode | null {
    if (!node) return null
    if (val < node.val) node.left = this._delete(node.left, val)
    else if (val > node.val) node.right = this._delete(node.right, val)
    else {
      if (!node.left) return node.right
      else if (!node.right) return node.left
      node.val = this._minValue(node.right)
      node.right = this._delete(node.right, node.val)
    }
    if (!node) return node
    node.height = 1 + Math.max(this.height(node.left), this.height(node.right))
    const balance = this.balanceFactor(node)

    // Rebalance
    if (balance > 1 && this.balanceFactor(node.left!) >= 0)
      return this.rightRotate(node)
    if (balance > 1 && this.balanceFactor(node.left!) < 0) {
      node.left = this.leftRotate(node.left!)
      return this.rightRotate(node)
    }
    if (balance < -1 && this.balanceFactor(node.right!) <= 0)
      return this.leftRotate(node)
    if (balance < -1 && this.balanceFactor(node.right!) > 0) {
      node.right = this.rightRotate(node.right!)
      return this.leftRotate(node)
    }
    return node
  }

  _minValue(node: AVLNode): number {
    let current = node
    while (current.left) current = current.left
    return current.val
  }

  toTreeNode(node: AVLNode | null): TreeNode | null {
    if (!node) return null
    const children: TreeNode[] = []
    if (node.left) children.push(this.toTreeNode(node.left)!)
    if (node.right) children.push(this.toTreeNode(node.right)!)
    return {
      name: node.val.toString(),
      children: children.length ? children : undefined
    }
  }

  async _visualSearch(node: AVLNode | null, val: number, callback: (path: number[], status: string) => void): Promise<boolean> {
    let path: number[] = []

    const traverse = async (current: AVLNode | null): Promise<boolean> => {
      if (!current) {
        callback(path, `القيمة ${val} غير موجودة`)
        return false
      }
      path.push(current.val)
      callback(path, `مقارنة ${val} مع ${current.val}`)
      await sleep(800)

      if (val === current.val) {
        callback(path, `تم العثور على ${val}`)
        return true
      }

      return val < current.val ? traverse(current.left) : traverse(current.right)
    }

    return traverse(node)
  }

  async _visualInsert(val: number, container: HTMLElement | null, treeInstance: BST | AVL, callback: (path: number[], status: string) => void): Promise<void> {
    let path: number[] = []

    const insertRecursive = async (node: AVLNode | null): Promise<AVLNode> => {
      if (!node) {
        path.push(val)
        drawTreeHighlight(this.toTreeNode(this.root), container, treeInstance, path)
        callback(path, `تم إدخال ${val}`)
        await sleep(800)
        return new AVLNode(val)
      }
      path.push(node.val)
      drawTreeHighlight(this.toTreeNode(this.root), container, treeInstance, path)
      await sleep(800)

      if (val < node.val) {
        callback(path, `مقارنة ${val} مع ${node.val} ➝ الذهاب إلى اليسار`)
        node.left = await insertRecursive(node.left)
      } else if (val > node.val) {
        callback(path, `مقارنة ${val} مع ${node.val} ➝ الذهاب إلى اليمين`)
        node.right = await insertRecursive(node.right)
      }
      return node
    }

    this.root = await insertRecursive(this.root)
    callback(path, `تم إدخال ${val} في AVL`)
  }
}

const bst = new BST()
const avl = new AVL()

const inputValue = ref<number | null>(null)
const searchValue = ref<number | null>(null)

const bstContainer = ref<HTMLElement | null>(null)
const avlContainer = ref<HTMLElement | null>(null)

const bstTime = ref(0)
const avlTime = ref(0)
const bstSearchResult = ref<boolean | null>(null)
const avlSearchResult = ref<boolean | null>(null)
const bstSearchTime = ref(0)
const avlSearchTime = ref(0)

const bstStatus = ref<string | null>(null)
const avlStatus = ref<string | null>(null)

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getTreeDepth(node: TreeNode): number {
  if (!node.children || node.children.length === 0) return 1
  return 1 + Math.max(...node.children.map(child => getTreeDepth(child)))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function countNodes(node: TreeNode): number {
  let count = 1
  if (node.children) {
    for (const child of node.children) {
      count += countNodes(child)
    }
  }
  return count
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function drawTree(data: TreeNode | null, container: HTMLElement | null, treeInstance: BST | AVL) {
  if (!container) return
  d3.select(container).select('svg').remove()
  if (!data) return

  const width = 600
  const height = 400

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(40,0)')

  const root = d3.hierarchy(data)
  const treeLayout = d3.tree<TreeNode>().size([height - 50, width - 160])
  treeLayout(root)

  svg.selectAll('path.link')
    .data(root.links())
    .join('path')
    .attr('class', 'link')
    .attr('fill', 'none')
    .attr('stroke', '#555')
    .attr('stroke-width', 2)
    .attr('d', d => `M${d.source.y},${d.source.x} C${d.source.y},${((d.source.x ?? 0) + (d.target?.x ?? 0)) / 2} ${d.target.y},${((d.source.x ?? 0) + (d.target?.x ?? 0)) / 2} ${d.target.y},${d.target.x}`)

  const node = svg.selectAll('g.node')
    .data(root.descendants())
    .join('g')
    .attr('class', 'node')
    .attr('transform', d => `translate(${d.y},${d.x})`)
    .on('contextmenu', function (event, d) {
      event.preventDefault()
      const valueToDelete = parseInt(d.data.name)
      searchValue.value = valueToDelete
      bst.delete(valueToDelete)
      avl.delete(valueToDelete)
      drawTree(bst.toTreeNode(bst.root), bstContainer.value, bst)
      drawTree(avl.toTreeNode(avl.root), avlContainer.value, avl)
      Notify.create({ message: `تم حذف العقدة: ${valueToDelete}`, color: 'negative' })
    })

  node.append('circle')
    .attr('r', 15)
    .attr('fill', '#0f62fe')
    .attr('cursor', 'pointer')
    .on('mouseover', function () { d3.select(this).attr('fill', 'red') })
    .on('mouseout', function () { d3.select(this).attr('fill', '#0f62fe') })

  node.append('text')
    .attr('dy', 5)
    .attr('x', 0)
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .text(d => d.data.name)
}

function drawTreeHighlight(data: TreeNode | null, container: HTMLElement | null, treeInstance: BST | AVL, path: number[]) {
  if (!container) return
  d3.select(container).select('svg').remove()
  if (!data) return

  const width = 600
  const height = 400

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(40,0)')

  const root = d3.hierarchy(data)
  const treeLayout = d3.tree<TreeNode>().size([height - 50, width - 160])
  treeLayout(root)

  svg.selectAll('path.link')
    .data(root.links())
    .join('path')
    .attr('class', 'link')
    .attr('fill', 'none')
    .attr('stroke', '#555')
    .attr('stroke-width', 2)
    .attr('d', d => `M${d.source.y},${d.source.x} C${d.source.y},${((d.source.x ?? 0) + (d.target?.x ?? 0)) / 2} ${d.target.y},${((d.source.x ?? 0) + (d.target?.x ?? 0)) / 2} ${d.target.y},${d.target.x}`)

  const node = svg.selectAll('g.node')
    .data(root.descendants())
    .join('g')
    .attr('class', 'node')
    .attr('transform', d => `translate(${d.y},${d.x})`)
    .on('contextmenu', function (event, d) {
      event.preventDefault()
      const valueToDelete = parseInt(d.data.name)
      searchValue.value = valueToDelete
      bst.delete(valueToDelete)
      avl.delete(valueToDelete)
      drawTree(bst.toTreeNode(bst.root), bstContainer.value, bst)
      drawTree(avl.toTreeNode(avl.root), avlContainer.value, avl)
      Notify.create({ message: `تم حذف العقدة: ${valueToDelete}`, color: 'negative' })
    })

  node.append('circle')
    .attr('r', 15)
    .attr('fill', d => path.includes(parseInt(d.data.name)) ? 'red' : '#0f62fe')
    .attr('cursor', 'pointer')
    .on('mouseover', function () { d3.select(this).attr('fill', 'red') })
    .on('mouseout', function () { d3.select(this).attr('fill', d => path.includes(parseInt((d as any).data.name)) ? 'red' : '#0f62fe') })

  node.append('text')
    .attr('dy', 5)
    .attr('x', 0)
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .text(d => d.data.name)
}

async function insertNode() {
  if (inputValue.value === null) return

  bstStatus.value = `جاري إدخال ${inputValue.value} في BST`
  avlStatus.value = `جاري إدخال ${inputValue.value} في AVL`

  await (bst as any)._visualInsert(inputValue.value, bstContainer.value, bst, (path: number[], status: string) => {
    drawTreeHighlight(bst.toTreeNode(bst.root), bstContainer.value, bst, path)
    bstStatus.value = status
  })

  await (avl as any)._visualInsert(inputValue.value, avlContainer.value, avl, (path: number[], status: string) => {
    drawTreeHighlight(avl.toTreeNode(avl.root), avlContainer.value, avl, path)
    avlStatus.value = status
  })

  drawTree(bst.toTreeNode(bst.root), bstContainer.value, bst)
  drawTree(avl.toTreeNode(avl.root), avlContainer.value, avl)

  Notify.create({ message: `تم إدخال: ${inputValue.value}`, color: 'positive' })
  inputValue.value = null
}

async function searchNode() {
  if (searchValue.value === null) return

  bstStatus.value = 'جاري البحث...'
  avlStatus.value = 'جاري البحث...'

  await bst._visualSearch(bst.root, searchValue.value, (path, status) => {
    drawTreeHighlight(bst.toTreeNode(bst.root), bstContainer.value, bst, path)
    bstStatus.value = status
  })

  await avl._visualSearch(avl.root, searchValue.value, (path, status) => {
    drawTreeHighlight(avl.toTreeNode(avl.root), avlContainer.value, avl, path)
    avlStatus.value = status
  })

  const startBST = performance.now()
  bstSearchResult.value = bst.search(searchValue.value)
  const endBST = performance.now()
  bstSearchTime.value = +(endBST - startBST).toFixed(4)

  const startAVL = performance.now()
  avlSearchResult.value = avl.search(searchValue.value)
  const endAVL = performance.now()
  avlSearchTime.value = +(endAVL - startAVL).toFixed(4)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function deleteNode() {
  if (searchValue.value === null) return

  bst.delete(searchValue.value)
  avl.delete(searchValue.value)

  drawTree(bst.toTreeNode(bst.root), bstContainer.value, bst)
  drawTree(avl.toTreeNode(avl.root), avlContainer.value, avl)

  Notify.create({ message: `تم حذف: ${searchValue.value}`, color: 'negative' })
  bstSearchResult.value = null
  avlSearchResult.value = null
}

function resetTrees() {
  bst.root = null
  avl.root = null
  drawTree(null, bstContainer.value, bst)
  drawTree(null, avlContainer.value, avl)
  Notify.create({ message: 'تم إعادة تعيين الشجرة', color: 'info' })
}

function insertRandomValues() {
  const values = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100))
  values.forEach(val => {
    bst.insert(val)
    avl.insert(val)
  })
  drawTree(bst.toTreeNode(bst.root), bstContainer.value, bst)
  drawTree(avl.toTreeNode(avl.root), avlContainer.value, avl)
  Notify.create({ message: `تم إدخال ${values.join(', ')}`, color: 'warning' })
}

onMounted(() => {
  drawTree(null, bstContainer.value, bst)
  drawTree(null, avlContainer.value, avl)
})
</script>

<style scoped>
.link {
  stroke: #aaa;
}

.node text {
  font-size: 14px;
  font-weight: bold;
  user-select: none;
}

.result-box {
  padding: 10px;
  border-radius: 5px;
  margin-top: 5px;
}

.status-box {
  padding: 8px;
  border-radius: 4px;
  font-size: 14px;
  color: white;
}

.status-box.bg-primary {
  background-color: #1976d2;
}

.status-box.bg-secondary {
  background-color: #388e3c;
}

.tree-box {
  border: 1px solid #ccc;
  padding: 10px;
  height: 450px;
  overflow: auto;
  background: white;
  border-radius: 8px;
}
</style>
