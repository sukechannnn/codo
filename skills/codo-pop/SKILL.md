---
name: codo-pop
description: >
  Pick up one task from the queue and execute it, then stop.
  Does not automatically continue to the next task.
  Requires codo CLI to be installed.
allowed-tools:
  - Bash
  - Read
  - Write
  - Grep
  - Glob
---

# タスクを1つだけ実行するスキル

## 基本フロー

1. `codo next` を実行して次のタスクを取得する（キューが空ならエラー終了）
2. 出力される JSON の `cwd` フィールドで作業ディレクトリを確認し、必要に応じて `cd` する
3. 出力された `instruction` に従って作業を実行する
4. 作業完了後、`codo done <task-id>` を実行する（キューから削除される）
5. 作業が失敗した場合は `codo fail <task-id>` を実行する（pending に戻る）
6. 完了を報告して終了する（次のタスクには進まない）

## 重要なルール

- 各タスクは独立して完了させること。タスク間で暗黙の依存を仮定しない
- エラーが発生してリカバリできない場合は fail にして次へ進む
- タスクの instruction に書かれていないことは勝手にやらない
