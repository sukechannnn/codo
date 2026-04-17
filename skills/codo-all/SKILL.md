---
name: codo-all
description: >
  Fetch all pending tasks from the queue at once and execute them as a batch.
  Considers dependencies and ordering across tasks.
  Requires codo CLI to be installed.
allowed-tools:
  - Bash
  - Read
  - Write
  - Grep
  - Glob
---

# 全タスク一括実行スキル

## 基本フロー

1. `codo list --json` を実行して現在のキューにある全タスクを JSON で取得する
2. キューが空なら「タスクなし」と報告して終了する
3. 全タスクの instruction を読み、全体の作業計画を立てる
4. タスク間の依存関係や最適な実行順序を考慮して作業を進める
5. 各タスクの作業を開始する前に `codo next` でタスクを取得し in_progress にする
6. 作業完了後、`codo done <task-id>` を実行する
7. 作業が失敗した場合は `codo fail <task-id>` を実行する
8. 全タスク完了後、結果を報告して終了する

## 重要なルール

- 最初に全タスクを俯瞰し、関連するタスクをまとめて効率的に処理する
- エラーが発生してリカバリできない場合は fail にして次へ進む
- タスクの instruction に書かれていないことは勝手にやらない
