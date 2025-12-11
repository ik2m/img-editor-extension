# Coding Standards

このドキュメントは、このプロジェクトで採用しているコーディング規約とベストプラクティスをまとめたものです。

## 目次

- [Vue 3 Composition API](#vue-3-composition-api)
- [TypeScript](#typescript)
- [スタイリング（Tailwind CSS）](#スタイリングtailwind-css)
- [命名規則](#命名規則)
- [ファイル構成](#ファイル構成)

---

## Vue 3 Composition API

### Props定義

**✅ Good: インライン型定義 + withDefaults**

```typescript
const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
  }>(),
  {
    variant: 'primary',
    disabled: false,
    type: 'button',
  }
);
```

**❌ Avoid: 別途interface定義**

```typescript
interface Props {
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  disabled: false,
});
```

**理由**: より簡潔で、型定義とデフォルト値が視覚的に近く、可読性が高い

### Emits定義

```typescript
const emit = defineEmits<{
  openModal: [];
  submit: [value: string];
  update: [id: string, data: Record<string, unknown>];
}>();
```

### Template内の属性定義

**原則: 静的な属性は静的に、動的な属性のみバインディング構文を使う**

**✅ Good: 静的な属性はプレフィックスなしで記述**

```vue
<button
  type="button"
  class="block w-full cursor-pointer rounded border-none text-white"
  aria-label="送信ボタン"
  :disabled="isLoading"
  :class="[colorCls, sizeCls]"
  @click="handleClick"
>
  <slot />
</button>

<input
  type="text"
  placeholder="名前を入力"
  class="border rounded px-4 py-2"
  :value="inputValue"
  @input="handleInput"
/>
```

**❌ Avoid: 静的な値に動的バインディングを使う**

```vue
<button
  :type="'button'"
  :class="'block w-full cursor-pointer rounded border-none text-white ' + dynamicClass"
  :aria-label="'送信ボタン'"
>
  <slot />
</button>
```

**理由**:
- HTMLとして自然で読みやすい
- 実行時のオーバーヘッドを避ける
- 静的解析ツールやエディタのサポートが向上
- Vueの最適化が効きやすい
- コードレビュー時に動的な部分が一目で分かる

**適用例**:
- `class` - 静的なクラスは `class`、動的なクラスは `:class`
- `type`, `placeholder`, `alt`, `title` などの固定値
- `aria-*` 属性で固定の値
- `data-*` 属性で固定の値

### v-bind="$attrs" の使用

Vue 3では非props属性は自動的に継承されるため、明示的な `v-bind="$attrs"` は不要です。

```vue
<!-- ✅ Good -->
<button :type="type" :disabled="disabled">

<!-- ❌ Avoid -->
<button :type="type" :disabled="disabled" v-bind="$attrs">
```

---

## TypeScript

### 型推論の活用

**✅ Good: 型推論に任せる**

```typescript
const map = {
  primary: 'bg-primary hover:bg-primary-hover',
  secondary: 'bg-dark-border hover:bg-[#4d4d4d]',
};
```

**❌ Avoid: 冗長な型注釈**

```typescript
const classes: Record<string, string> = {
  primary: 'bg-primary hover:bg-primary-hover',
  secondary: 'bg-dark-border hover:bg-[#4d4d4d]',
};
```

**理由**: TypeScriptの型推論で十分な場合は冗長な型注釈を避ける

### Composables の型定義

```typescript
import type { Ref } from 'vue';
import type { Shape } from '@/components/editor/types';

export function useLayerManagement() {
  const shapes = ref<Shape[]>([]);
  const selectedShapeId = ref('');

  // ... implementation

  return {
    shapes,
    selectedShapeId,
    selectLayer,
    moveLayerUp,
  };
}
```

### Composables と Pinia Stores の使用方法

#### 分割代入パターン

**✅ Good: 分割代入でプロパティを取り出す**

```typescript
// script setup内
// Composables
const { rectangleColor, arrowColor, setRectangleColor, setArrowColor } = useShapeColor();

// Pinia Stores
const { shapes, selectedShapeId, selectLayer, moveLayerUp, moveLayerDown } = useLayerStore();
const { imageUrl, stageWidth, stageHeight, isImageLoaded, handleImageUpload } = useImageStore();

// 使用時
const handleAddShape = () => {
  if (!isImageLoaded.value) return;  // script内では.valueが必要
  shapes.value.push(newShape);
  selectLayer(newShape.id);
};
```

```vue
<!-- template内 -->
<EditorCanvas
  :shapes="shapes"
  :stage-width="stageWidth"
  :image-url="imageUrl"
  @select-layer="selectLayer"
/>
```

**❌ Avoid: オブジェクトごと受け取る**

```typescript
// BAD: ドット記法でアクセスする必要があり冗長
const layers = useLayerStore();
const image = useImageStore();

const handleAddShape = () => {
  if (!image.isImageLoaded.value) return;
  layers.shapes.value.push(newShape);
  layers.selectLayer(newShape.id);
};
```

```vue
<!-- template内も冗長 -->
<EditorCanvas
  :shapes="layers.shapes.value"
  :stage-width="image.stageWidth.value"
/>
```

**理由**:
- コードが簡潔で読みやすくなる
- プロパティ名が短くなり、可読性が向上
- テンプレート内で`.value`の記述が不要（Vueが自動で展開）
- 使用するプロパティが一目でわかる

**注意点**:
- **script setup内**: Refの値にアクセスする際は`.value`が必要
- **template内**: `.value`は不要（Vueが自動的に展開）

#### Pinia Store の実装パターン

**✅ Good: 分割代入可能なexport default パターン**

```typescript
import { ref, readonly } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import type { Shape } from '@/components/editor/types';

const useLayerStore = defineStore('layer', () => {
  // State
  const shapes = ref<Shape[]>([]);
  const selectedShapeId = ref('');

  // Actions
  const addShape = (shape: Shape) => {
    shapes.value.push(shape);
  };

  const selectLayer = (id: string) => {
    selectedShapeId.value = id;
  };

  const moveLayerUp = (id: string) => {
    // ... implementation
  };

  return {
    shapes: readonly(shapes),  // 配列はreadonlyで返す
    selectedShapeId,
    addShape,
    selectLayer,
    moveLayerUp,
  };
});

/**
 * レイヤーストアを使用する
 * stateとactionsを分割代入可能な形で返す
 */
export default () => {
  const store = useLayerStore();
  return { ...store, ...storeToRefs(store) };
};
```

**❌ Avoid: 直接 named export**

```typescript
// BAD: 使用側でstoreToRefsを呼ぶ必要がある
export const useLayerStore = defineStore('layer', () => {
  // ... implementation
  return { shapes, selectedShapeId, selectLayer };
});

// 使用側で追加の記述が必要
import { storeToRefs } from 'pinia';
const store = useLayerStore();
const { shapes, selectedShapeId } = storeToRefs(store);
const { selectLayer } = store;
```

**理由**:
- `storeToRefs`を使用側で意識する必要がない
- composableと同じ使い勝手で一貫性がある
- 分割代入だけで state も actions も取得できる
- リアクティビティが自動的に保たれる

**Store実装時の注意点**:
- Store定義は内部の `const` として定義（`const useLayerStore = defineStore(...)`）
- `export default` でラッパー関数を公開
- ラッパー関数内で `storeToRefs` を適用してから返す
- これにより、使用側は単純な分割代入だけで使える

**Store間の依存関係における注意点**:

他のstoreに依存するstoreを実装する場合、初期化タイミングに注意が必要です。

**❌ Avoid: defineStore内で他のstoreの値を分割代入**

```typescript
const useDrawingStore = defineStore('drawing', () => {
  const imageStore = useImageStore();
  const { layerScale } = imageStore;  // ❌ 初期化タイミングでundefinedになる可能性

  const startDrawing = (pos: { x: number; y: number }) => {
    currentLine.value = [
      pos.x / layerScale.value.x,  // エラー: Cannot read properties of undefined
      pos.y / layerScale.value.y,
    ];
  };

  return { startDrawing };
});
```

**✅ Good: 関数内で都度useStoreを呼び出す**

```typescript
const useDrawingStore = defineStore('drawing', () => {
  const startDrawing = (pos: { x: number; y: number }) => {
    const { layerScale } = useImageStore();  // ✅ 実行時に取得
    currentLine.value = [
      pos.x / layerScale.value.x,
      pos.y / layerScale.value.y,
    ];
  };

  return { startDrawing };
});
```

**理由**:
- `defineStore`内で他のstoreを呼び出すと、初期化順序によってはrefが正しく取得できない
- カスタムエクスポートパターン `{ ...store, ...storeToRefs(store) }` により、分割代入した値がundefinedになる可能性がある
- 関数実行時に都度`useStore()`を呼び出すことで、常に最新の状態を取得できる
- わずかなオーバーヘッドはあるが、Piniaのstore取得は高速で実用上問題ない

**外部から直接変更する必要がないStateはreadonlyで公開する**:
- 外部から直接代入や変更をする必要がないStateは `readonly()` でラップして返す
- 変更は必ずアクション経由で行うことを強制し、状態管理を一元化する
- 実行時にも変更を防止でき、型レベルと実行時の両方で安全性を確保
- アクション（`addShape`, `updateShape` など）を提供して、変更方法を明示する

```typescript
// ✅ Good: 外部から直接変更する必要がないStateはreadonlyで返し、変更用のアクションを提供
return {
  shapes: readonly(shapes),  // 外部からの直接変更を防止
  addShape,                   // 追加はアクション経由
  updateShape,                // 更新もアクション経由
};

// ❌ Avoid: 外部から直接変更できてしまう
return {
  shapes,  // shapes.value.push() で外部から直接変更できてしまう
};
```

**ファイル名**: `useXxxStore.ts` の形式（例: `useLayerStore.ts`, `useImageStore.ts`）

### JSDoc コメント

Composables には簡潔なJSDocコメントを付ける：

```typescript
/**
 * レイヤー（Shape配列）の管理を行うcomposable
 */
export function useLayerManagement() {
  // ...
}
```

---

## スタイリング（Tailwind CSS）

### 関心の分離（Separation of Concerns）

スタイルの種類ごとに computed プロパティを分離する：

**✅ Good: 色とサイズを分離**

```typescript
const colorCls = computed(() => {
  const map = {
    primary: 'bg-primary hover:bg-primary-hover disabled:bg-dark-elevated',
    secondary: 'bg-dark-border hover:bg-[#4d4d4d] disabled:opacity-30',
    icon: 'bg-dark-border hover:bg-[#4d4d4d] disabled:opacity-30',
  };

  let result = map[props.variant];

  if (props.danger && props.variant === 'icon') {
    result += 'text-danger hover:bg-danger hover:text-white';
  }

  return result;
});

const sizeCls = computed(() => {
  const map = {
    primary: 'px-4 py-2 text-base font-semibold mb-2',
    secondary: 'px-4 py-2 text-base mb-2',
    icon: 'px-2 py-1 text-xs rounded-sm',
  };
  return map[props.variant];
});
```

**❌ Avoid: すべてを1つに混在**

```typescript
const variantClasses = computed(() => {
  const classes = {
    primary: 'bg-primary hover:bg-primary-hover px-4 py-2 text-base font-semibold',
    secondary: 'bg-dark-border hover:bg-[#4d4d4d] px-4 py-2 text-base',
  };
  return classes[props.variant];
});
```

**理由**: スタイルの種類ごとに分離することで、保守性と可読性が向上

### Map オブジェクトの命名

```typescript
// ✅ Good: シンプルに "map"
const map = {
  primary: '...',
  secondary: '...',
};

// ❌ Avoid: 冗長な命名
const variantToClassesMapping = { ... };
```

---

## 命名規則

### 変数名

- **キャメルケース**を使用
- **簡潔だが意味が明確**な命名を好む
- 省略形の使用例：
  - `colorCls` = color classes
  - `sizeCls` = size classes
  - `cls` = classes

```typescript
// ✅ Good
const colorCls = computed(() => ...);
const sizeCls = computed(() => ...);

// ❌ Avoid: 過度に長い名前
const variantColorClasses = computed(() => ...);
```

### 関数名

- 動詞で始める
- 明確な意図を示す

```typescript
// ✅ Good
const selectLayer = (id: string) => { ... };
const moveLayerUp = (id: string) => { ... };
const deleteLayer = (id: string) => { ... };
```

### Composables

- `use` プレフィックスで始める
- 機能を明確に表現

```typescript
// ✅ Good
useLayerManagement()
useShapeTransform()
useImageManagement()
```

---

## Composables vs Utils の使い分け

### Composables（`src/composables/`）は状態管理に限定する

- リアクティブな状態（`ref`, `computed`, `reactive`など）を持つものだけをcomposableにする
- Vueのライフサイクルや副作用（`watch`, `onMounted`など）を扱うもの
- 複数のコンポーネント間で共有される状態を管理するもの

**✅ Good: composableとして適切（状態を持つ）**

```typescript
// useLayerManagement.ts - shapes配列とselectedShapeIdの状態を管理
export function useLayerManagement() {
  const shapes = ref<Shape[]>([]);
  const selectedShapeId = ref<string>('');

  const selectLayer = (id: string) => {
    selectedShapeId.value = id;
  };

  return { shapes, selectedShapeId, selectLayer };
}
```

### Utils（`src/utils/`）は純粋関数として実装する

- 状態を持たない単純な関数
- 入力を受け取り、出力を返すだけのロジック
- データ変換、計算、オブジェクト生成など

**✅ Good: utilsとして適切（純粋関数）**

```typescript
// shapeFactory.ts - 図形オブジェクトを生成する純粋関数
export function createRectangle(
  name: string,
  color: string,
  x = 100,
  y = 100
): RectShape {
  return {
    id: `rect-${Date.now()}`,
    name,
    x,
    y,
    fill: 'transparent',
    stroke: hexToRgba(color, 0.7),
    strokeWidth: 8,
    cornerRadius: 2,
    draggable: true,
  };
}
```

### 避けるべきパターン

**❌ Avoid: 単なるラッパーcomposable（状態を持たない）**

```typescript
// BAD: 状態を持たず、ただ関数を返すだけ
export function useRectangleShape(shapes, selectLayer, getName) {
  const addRectangle = () => {
    const rect = createRectangle(getName());
    shapes.value.push(rect);
  };
  return { addRectangle };
}
```

**✅ Good: コンポーネント内で直接utilsを使用**

```typescript
// GOOD: コンポーネント内で直接utilsの関数を呼ぶ
import { createRectangle } from '@/utils/shapeFactory';

const handleAddRectangle = () => {
  const rect = createRectangle(nameCounters.getNextRectName(), color);
  layers.shapes.value.push(rect);
  layers.selectLayer(rect.id);
};
```

### 判断基準

1. **過度な抽象化を避ける** - 本当に必要な場合だけcomposableを作る
2. **明確な責務分離** - 状態管理 = composables、ロジック = utils
3. **実用的判断** - 「状態が必要か？」で判断する
4. **不要なラッパーを作らない** - ただ関数を呼ぶだけなら直接呼ぶ

---

## ファイル構成

### Feature-based Structure

機能ごとにディレクトリを整理する：

```
src/
├── components/
│   ├── common/          # 共通コンポーネント
│   │   ├── BaseButton.vue
│   │   └── BaseSection.vue
│   └── editor/          # エディター専用コンポーネント
│       ├── EditorCanvas.vue
│       ├── EditorToolbar.vue
│       └── types.ts
│
├── composables/
│   └── editor/          # エディター専用composables
│       ├── useLayerManagement.ts
│       └── useShapeTransform.ts
│
└── entrypoints/         # WXTエントリーポイント
    └── editor/
        ├── App.vue
        ├── index.html
        └── main.ts
```

### Import パス

- 絶対パスエイリアス `@/` を使用
- 同一ディレクトリ内は相対パス `./` を使用

```typescript
// ✅ Good
import BaseButton from '@/components/common/BaseButton.vue';
import { useLayerManagement } from '@/composables/editor/useLayerManagement';
import type { Shape } from './types';  // 同じディレクトリ内

// ❌ Avoid: 長い相対パス
import BaseButton from '../../../components/common/BaseButton.vue';
```

---

## 全体的な原則

1. **簡潔性優先**: 冗長なコードを避け、シンプルで読みやすいコードを書く
2. **関心の分離**: 機能ごとに適切に分割し、責務を明確にする
3. **型推論活用**: TypeScriptの型推論を信頼し、不要な型注釈は省略する
4. **モダンVue 3**: Vue 3の機能（Composition API、自動attrs継承など）を積極的に活用する
5. **一貫性**: プロジェクト全体で統一されたスタイルを維持する

---

## 参考

- [Vue 3 Style Guide](https://vuejs.org/style-guide/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Tailwind CSS Best Practices](https://tailwindcss.com/docs/reusing-styles)
