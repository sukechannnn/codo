# codo

[Claude Code](https://docs.anthropic.com/en/docs/claude-code) 用のタスクキュー管理ツール。タスクをキューに積んでおくと、Claude Code が順番に実行します。

## インストール

```bash
npm install -g @sukechannnn/codo
```

`codo` コマンドと `/codo` Claude Code スキルがインストールされます。

## クイックスタート

1. TUI を起動してタスクを追加:

```bash
codo
```

2. 別のターミナルで Claude Code を起動し、以下を実行:

```
/codo
```

Claude Code がキューからタスクを取得し、順番に実行します。キューが空になると新しいタスクが追加されるまで待機します。TUI からいつでもタスクを追加できます。

## CLI リファレンス

```bash
codo                        # TUI を起動
codo add <instruction>      # タスク追加
codo list                   # 一覧表示
codo next                   # 次のタスクを取得（CC スキルが使用）
codo done <task-id>         # 完了
codo fail <task-id>         # 失敗
codo rm <task-id>           # 削除
codo move <task-id> --to N  # 順序変更
```

## ライセンス

MIT
