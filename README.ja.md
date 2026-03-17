# codo

[Claude Code](https://docs.anthropic.com/en/docs/claude-code) 用のタスクキュー管理ツール。タスクをキューに積んでおくと、Claude Code が順番に実行します。

## 仕組み

```
┌──────────────┐          ┌──────────────┐
│  codo (TUI)  │          │  Claude Code  │
│              │          │               │
│  タスク追加   │  ←JSON→  │  /codo        │
│  順序変更     │   File   │  → タスク取得  │
│  編集/削除    │          │  → 実行       │
│  履歴確認     │          │  → 完了/失敗   │
└──────────────┘          └──────────────┘
        ↕
  ~/.codo/queue.json
```

- **TUI/CLI**: タスクキューを管理
- **CC スキル** (`/codo`): Claude Code がキューからタスクを取得し、順番に実行

## インストール

```bash
npm install -g codo
```

以下がインストールされます:
- `codo` CLI コマンド
- `/codo` Claude Code スキル (`~/.claude/skills/codo` にシンボリックリンク)

## 使い方

### CLI

```bash
# タスク追加
codo add "user.rb にメールバリデーション追加。RSpec テストも書くこと"

# 一覧表示
codo list

# 次のタスクを取得（CC スキルが使用）
codo next
codo next --wait 10  # 最大10分待機

# 完了 / 失敗 / 削除
codo done <task-id>
codo fail <task-id>
codo rm <task-id>

# 順序変更
codo move <task-id> --to 1
```

### TUI

```bash
codo  # TUI を起動
```

| キー | 操作 |
|------|------|
| `a` | タスク追加（インライン） |
| `A` | タスク追加（$EDITOR） |
| `e` | タスク編集（インライン） |
| `E` | タスク編集（$EDITOR） |
| `d` | タスク削除 |
| `K` / `J` | タスクを上下に移動 |
| `k` / `j` / `↑` / `↓` | カーソル移動 |
| `Enter` | タスク詳細を展開 |
| `h` | 履歴表示 |
| `q` / `Esc` | 終了 |

### Claude Code スキル

Claude Code セッション内で:

```
/codo
```

Claude Code が以下を自動で行います:
1. キューから次の pending タスクを取得
2. instruction に従って作業を実行
3. 完了（または失敗）としてマーク
4. 次のタスクへ進む
5. キューが空なら最大10分待機

別のターミナルから `codo add` でタスクを追加すると、待機中の Claude Code が自動的にそれを拾って作業を始めます。

## データ

すべてのデータは `~/.codo/` に保存されます:
- `queue.json` — アクティブなタスクキュー
- `history.json` — 直近100件の完了/削除タスク履歴

## ライセンス

MIT
