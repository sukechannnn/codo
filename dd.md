# cc-todo: Claude Code タスクキュー管理 TUI

## 概要

Claude Code (CC) で作業中に、次にやらせたいタスクをキューに積んでおき、
CC が現在のタスクを完了したら自動的に次のタスクを取得して実行する仕組み。

**2つのコンポーネント**で構成される:

1. **`cc-todo`** — TypeScript + Ink 製の TUI ツール（キューの管理UI）
2. **CC カスタムスキル** — CC がキューからタスクを取得・実行するためのスラッシュコマンド

---

## アーキテクチャ

```
┌─────────────────────┐          ┌──────────────────────────┐
│   cc-todo (TUI)    │          │     Claude Code          │
│                     │          │                          │
│  ・タスク追加        │          │  /queue                  │
│  ・一覧表示         │  ←JSON→  │   → キューから取得        │
│  ・順序変更         │   File   │   → タスク実行           │
│  ・編集/削除        │          │   → 完了→キューから削除   │
│  ・ステータス確認    │          │   → 次のタスクへ         │
│                     │          │                          │
└─────────────────────┘          └──────────────────────────┘
            ↕
   ~/.cc-todo/queue.json
```

### データの共有方法

- **ファイルベース**: `~/.cc-todo/queue.json` を単一のデータソースとする
- TUI と CC スキルの両方がこのファイルを読み書きする
- ファイルロック (`proper-lockfile`) で同時書き込みを防止
- プロジェクト単位のキューもサポート: `.cc-todo/queue.json`（カレントディレクトリ）

---

## データモデル

### queue.json

```json
{
  "version": 1,
  "tasks": [
    {
      "id": "01J7X...",
      "instruction": "app/models/user.rb にメールアドレスのフォーマットバリデーションを追加。RSpecテストも書くこと。",
      "status": "pending",
      "createdAt": "2026-03-17T10:00:00+09:00"
    },
    {
      "id": "01J7Y...",
      "instruction": "OpenSearch のインデックスを再構築するRakeタスクを作成",
      "status": "pending",
      "createdAt": "2026-03-17T10:05:00+09:00"
    }
  ]
}
```

### タスクステータス

| ステータス | 意味 |
|-----------|------|
| `pending` | キューで待機中 |
| `in_progress` | CC が現在実行中 |

- **完了したタスクはキューから削除する**（履歴は保持しない）
- 失敗した場合は `pending` に戻すか削除するかをユーザーが選ぶ

### フィールド説明

| フィールド | 型 | 必須 | 説明 |
|-----------|------|------|------|
| `id` | string | ✓ | ULID（時系列ソート可能なユニークID） |
| `instruction` | string | ✓ | CC への指示テキスト。一覧では先頭50文字を切り詰め表示 |
| `status` | enum | ✓ | `pending` or `in_progress` |
| `createdAt` | string | ✓ | 作成日時（ISO 8601） |

**キュー内の順序は配列のインデックスで管理する**（priority フィールド不要）。
`tasks[0]` が次に実行されるタスク。

---

## コンポーネント 1: cc-todo TUI + CLI

### 技術スタック

- **言語**: TypeScript（ESM）
- **TUI**: Ink 5 + React
- **CLI引数**: commander（TUI 起動 + サブコマンド）
- **データ**: zod でバリデーション
- **ID生成**: ulid
- **ファイルロック**: proper-lockfile
- **ビルド**: tsup（単一バンドル、`#!/usr/bin/env node` shebang 付き）

### 画面構成

```
╔════════════════════════════════════════════════════╗
║  cc-todo  [Global]          2 pending / 1 running ║
╠════════════════════════════════════════════════════╣
║                                                    ║
║  #  Status    Instruction                          ║
║  ── ───────── ──────────────────────────────────── ║
║  1  ▶ RUN     GraphQL スキーマを public/internal…  ║
║  2  ○ PEND    user.rb にメールバリデーション追加…  ║
║  3  ○ PEND    OpenSearch のインデックスを再構築…   ║
║                                                    ║
╠════════════════════════════════════════════════════╣
║  [a]dd  [e]dit  [d]el  [K/J]move  [Enter]expand   ║
║  [q]uit                                            ║
╚════════════════════════════════════════════════════╝
```

### キーバインド

| キー | アクション |
|------|-----------|
| `a` | 新規タスク追加（インラインエディタ or $EDITOR 起動） |
| `e` | 選択中タスクの instruction を編集 |
| `d` | 選択中タスクを削除（確認あり） |
| `K` / `J` | 選択中タスクをキュー内で上/下に移動 |
| `k` / `j` / `↑` / `↓` | カーソル移動 |
| `Enter` | instruction 全文を展開表示 |
| `Tab` | Global / Project キュー切替 |
| `q` / `Esc` | 終了 |

### CLI サブコマンド（TUI を起動せずに操作）

TUI を使わずにシェルから直接操作できるサブコマンドも提供する。
CC のスキルから Bash 経由で呼び出す際にも使う。
コマンドは `codo`

```bash
# タスク追加
codo add "user.rb にメールバリデーション追加。RSpecテストも書くこと"

# 一覧表示
codo list

# 次のタスクを取得（先頭を in_progress にし、内容を stdout に JSON 出力）
codo next

# タスク完了（キューから削除）
codo done <task-id>

# タスク失敗（pending に戻す）
codo fail <task-id>

# 順序変更（指定タスクを先頭に移動）
codo move <task-id> --to 1

# 削除
codo rm <task-id>

# TUI起動（デフォルト）
codo                          # = codo tui
```

---

## コンポーネント 2: CC カスタムスキル

### ファイル配置

```
~/.claude/skills/queue/
  └── SKILL.md
```

### SKILL.md

```markdown
---
name: queue
description: >
  タスクキューから次のタスクを取得して実行する。
  現在のタスクが完了したら自動で次のタスクに進む。
  cc-todo CLI がインストールされている前提。
allowed-tools:
  - Bash
  - Read
  - Write
  - Grep
  - Glob
---

# タスクキュー実行スキル

## 基本フロー

1. `cc-todo next` を実行して次のタスクを取得する
2. 出力された instruction に従って作業を実行する
3. 作業完了後、`cc-todo done <task-id>` を実行する（キューから削除される）
4. 作業が失敗した場合は `cc-todo fail <task-id>` を実行する（pending に戻る）
5. `cc-todo next` を再度実行し、次のタスクがあれば続行する
6. キューが空になったら「全タスク完了」と報告して終了する

## 重要なルール

- 各タスクは独立して完了させること。タスク間で暗黙の依存を仮定しない
- エラーが発生してリカバリできない場合は fail にして次へ進む
- タスクの instruction に書かれていないことは勝手にやらない
```

### 使い方

```bash
# CC 内で手動実行
/queue

# または CC 起動時に直接指示
claude "キューにあるタスクを全部実行して。 /queue を使って。"
```

---

## 実装ロードマップ

### Phase 1: 最小限の CLI（まず動くものを）

**目標**: codo add / list / next / done が動く

- [ ] プロジェクト初期化（package.json, tsconfig.json, tsup.config.ts）
- [ ] zod でデータモデル定義（Task, Queue スキーマ）
- [ ] queue.json の読み書き（proper-lockfile によるファイルロック）
- [ ] CLI サブコマンド: `add`, `list`, `next`, `done`, `fail`, `move`, `rm`
- [ ] CC スキル SKILL.md 作成
- [ ] `npm link` でグローバルインストール & 動作確認

**この時点で CC 連携が動作確認できる。**

### Phase 2: TUI（Ink）

**目標**: Ink + React でリッチな管理画面

- [ ] Ink アプリケーションのエントリポイント
- [ ] TaskList コンポーネント（ステータス色分け、instruction 切り詰め表示）
- [ ] TaskForm コンポーネント（instruction のインライン入力）
- [ ] TaskDetail コンポーネント（Enter で instruction 全文展開）
- [ ] キーバインドによるキュー操作（移動、削除、編集）
- [ ] StatusBar コンポーネント（pending/running カウント）
- [ ] Global / Project キュー切替（Tab）

### Phase 3: 拡張機能

- [ ] `$EDITOR` 連携（長い instruction を外部エディタで編集）
- [ ] ファイル監視（`chokidar`）で TUI が queue.json の外部変更をリアルタイム反映
- [ ] タスク依存関係（`dependsOn` フィールド）

---

## package.json 依存パッケージ

```json
{
  "name": "cc-todo",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "cc-todo": "./dist/cli.js"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "start": "node dist/cli.js"
  },
  "dependencies": {
    "ink": "^5.1.0",
    "react": "^18.3.1",
    "commander": "^13.1.0",
    "zod": "^3.24.0",
    "ulid": "^2.3.0",
    "proper-lockfile": "^4.1.2",
    "chalk": "^5.4.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "tsup": "^8.3.0",
    "@types/react": "^18.3.0",
    "@types/proper-lockfile": "^4.1.4"
  }
}
```

### tsup.config.ts

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  target: "node20",
  banner: { js: "#!/usr/bin/env node" },
  clean: true,
  dts: false,
});
```

---

## ディレクトリ構成

```
cc-todo/
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── src/
│   ├── cli.ts                # エントリポイント、commander サブコマンド分岐
│   ├── commands/
│   │   ├── add.ts            # codo add
│   │   ├── list.ts           # codo list
│   │   ├── next.ts           # codo next
│   │   ├── done.ts           # codo done / fail
│   │   └── move.ts           # codo move / rm
│   ├── tui/
│   │   ├── App.tsx           # Ink ルートコンポーネント
│   │   ├── TaskList.tsx      # タスク一覧
│   │   ├── TaskDetail.tsx    # instruction 全文表示
│   │   ├── TaskForm.tsx      # タスク追加/編集フォーム
│   │   ├── StatusBar.tsx     # ステータスバー
│   │   └── hooks/
│   │       ├── useQueue.ts   # キューデータの読み書き hook
│   │       └── useKeymap.ts  # キーバインド管理 hook
│   ├── models/
│   │   ├── task.ts           # Task 型 + zod スキーマ
│   │   └── queue.ts          # Queue 型 + 操作関数
│   └── store/
│       └── fileStore.ts      # queue.json の読み書き + ロック
├── skills/
│   └── queue/
│       └── SKILL.md          # CC 用スキル定義
└── README.md
```


