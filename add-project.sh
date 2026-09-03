#!/usr/bin/env bash
#
# add-project.sh — projects.json 에 프로젝트를 하나씩 추가하는 스크립트
# 사용법: ./add-project.sh
# (JSON 수정은 node 로 안전하게 처리합니다)
#
set -euo pipefail

cd "$(dirname "$0")"

JSON_FILE="projects.json"

if [ ! -f "$JSON_FILE" ]; then
  echo "{\"projects\": []}" > "$JSON_FILE"
fi

echo "== 프로젝트 추가 =="

# -- 입력 ---------------------------------------------------------------
read -r -p "이름 (필수): " NAME
[ -z "$NAME" ] && { echo "이름은 필수입니다. 중단."; exit 1; }

read -r -p "이모지 [🖥️]: " EMOJI
EMOJI="${EMOJI:-🖥️}"

read -r -p "설명: " DESC

read -r -p "태그 (쉼표로 구분, 예: React, TypeScript): " TAGS_RAW
TAGS_RAW="${TAGS_RAW// /}"                  # 공백 제거
TAGS_ARRAY="[]"
if [ -n "$TAGS_RAW" ]; then
  IFS=',' read -ra TAGS <<< "$TAGS_RAW"
  TAGS_JSON=""
  for t in "${TAGS[@]}"; do [ -n "$t" ] && TAGS_JSON="$TAGS_JSON,\"$t\""; done
  TAGS_ARRAY="[${TAGS_JSON#,}]"
fi

read -r -p "GitHub/URL (필수): " GITHUB
[ -z "$GITHUB" ] && { echo "GitHub/URL은 필수입니다. 중단."; exit 1; }

read -r -p "추가 링크 (선택): " LINK

read -r -p "메인(WORK)에 대표로 표시할까요? [y/N]: " HL
case "$HL" in
  y|Y|yes|Yes) HIGHLIGHT="true" ;;
  *) HIGHLIGHT="false" ;;
esac

# -- JSON 삽입 (node 로 안전하게) ---------------------------------------
node -e '
const fs = require("fs");
const file = process.argv[1];
const name = process.argv[2];
const emoji = process.argv[3];
const desc = process.argv[4];
const tags = JSON.parse(process.argv[5]);
const github = process.argv[6];
const link = process.argv[7];
const highlight = process.argv[8] === "true";

const data = JSON.parse(fs.readFileSync(file, "utf8"));
data.projects = data.projects || [];
data.projects.push({
  name, emoji,
  description: desc,
  tags,
  github,
  ...(link ? { link } : {}),
  ...(highlight ? { highlight } : {}),
});
fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
console.log("추가 완료!");
' "$JSON_FILE" "$NAME" "$EMOJI" "$DESC" "$TAGS_ARRAY" "$GITHUB" "$LINK" "$HIGHLIGHT"

echo
echo "지금까지 등록된 프로젝트:"
node -e 'const d=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));(d.projects||[]).forEach(p=>console.log("  - "+p.emoji+" "+p.name));' "$JSON_FILE"
echo
echo "메인에 반영하려면: npm run build 후 배포하세요."
