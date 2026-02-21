#!/bin/bash
# Instagram Card News Generator — Claude Code Skill Installer
# Usage: curl -sSL https://raw.githubusercontent.com/junghwaYang/card-news-setup/main/install.sh | bash

set -e

SKILL_NAME="card-news-setup"
SKILL_DIR="$HOME/.claude/skills/$SKILL_NAME"
REPO_RAW="https://raw.githubusercontent.com/junghwaYang/card-news-setup/main"

echo ""
echo "  Instagram Card News Generator"
echo "  Claude Code Skill Installer"
echo "  ─────────────────────────────"
echo ""

# Create skill directory
mkdir -p "$SKILL_DIR"

# Download SKILL.md
echo "  Downloading skill..."
curl -sSL "$REPO_RAW/SKILL.md" -o "$SKILL_DIR/SKILL.md"

# Verify
if [ -f "$SKILL_DIR/SKILL.md" ]; then
  echo "  Installed to: $SKILL_DIR/SKILL.md"
  echo ""
  echo "  Done! Now you can use:"
  echo ""
  echo "    1. Open Claude Code in an empty folder"
  echo "    2. Type: /card-news-setup"
  echo "    3. Wait for the project to be generated"
  echo "    4. Then: \"카드뉴스 만들어줘: AI 트렌드 2025\""
  echo ""
else
  echo "  Installation failed."
  exit 1
fi
