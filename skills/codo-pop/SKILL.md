---
name: codo-pop
description: >
  Pick up tasks from the queue and execute them, then stop.
  Accepts an optional count argument (e.g. /codo-pop 3).
  Defaults to 1 task if no argument is given.
  Requires codo CLI to be installed.
allowed-tools:
  - Bash
  - Read
  - Write
  - Grep
  - Glob
---

# タスクを指定数だけ実行するスキル

引数 `$ARGUMENTS` が指定されていればその数だけ、未指定なら1つだけタスクを実行する。

## 基本フロー

1. `codo next` を実行して次のタスクを取得する（キューが空ならエラー終了）
2. 出力される JSON の `cwd` フィールドで作業ディレクトリを確認し、必要に応じて `cd` する
3. 出力された `instruction` に従って作業を実行する
4. 作業完了後、`codo done <task-id>` を実行する（キューから削除される）
5. 作業が失敗した場合は `codo fail <task-id>` を実行する（pending に戻る）
6. 実行したタスク数が指定数に達したら完了を報告して終了する
7. 達していなければ手順1に戻る

## 重要なルール

- 各タスクは独立して完了させること。タスク間で暗黙の依存を仮定しない
- エラーが発生してリカバリできない場合は fail にして次へ進む
- タスクの instruction に書かれていないことは勝手にやらない
