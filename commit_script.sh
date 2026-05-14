#!/bin/bash

# Make sure we're in the right directory
cd /Users/theekshanaheenatigala/Desktop/Final-Clone-POC-project/Final-Clone-POC-project/cricket_project/cricket-project

# Add user configuration locally to ensure commits work
git config user.name "Heenatigala2003"
git config user.email "140996885+Heenatigala2003@users.noreply.github.com"

# Function to safely add and commit
commit() {
  local msg="$1"
  shift
  for file in "$@"; do
    if [ -e "$file" ]; then
      git add "$file" 2>/dev/null || true
    fi
  done
  # Only commit if there are staged changes
  if ! git diff --cached --quiet; then
    git commit -m "$msg"
  fi
}

# 1. Project initialization
commit "chore: initial project setup and dependencies" package.json package-lock.json tsconfig.json

# 2. Configuration files
commit "chore: add build and linting configuration" next.config.js postcss.config.mjs eslint.config.mjs .gitignore

# 3. Utility functions and types
commit "feat: add utility functions and type definitions" utils types

# 4. Core library and middleware
commit "feat: setup core library utilities and middleware" lib middleware.ts

# 5. Base layout and global styles
commit "feat: implement base layout and global styling" app/layout.tsx app/globals.css app/favicon.ico

# 6. Shared components
commit "feat: create reusable UI components" app/components

# 7. Home page implementation
commit "feat: implement responsive landing page" app/page.tsx public

# 8. Add mock data and constants
commit "chore: add mock data and static assets" data

# 9. Add API services and scripts
commit "feat: implement API services and backend scripts" services scripts app/api

# 10. Legal and terms pages
commit "feat: add legal documentation and terms" "app/(legal)" "app/Terms&Conditions" app/privecypolicy app/laws

# 11. Core cricket features
commit "feat: implement core cricket management features" app/Matches app/Practices app/Selection app/Ranking top-players

# 12. Information pages
commit "feat: add informational and contact pages" app/about-us "app/Contact us" app/Service app/services app/sponsor

# 13. Media and portfolio
commit "feat: add media galleries and achievements portfolio" app/gallery app/portfolio app/news app/achievements

# 14. User features and AI integration
commit "feat: implement user profiles and AI bot integration" app/user-profile app/ai-bot app/admin

# 15. Final polish, environment config and docs
commit "docs: update documentation and finalize project setup" .env.local README.md app/introduction

# Catch all remaining files
git add . 2>/dev/null || true
if ! git diff --cached --quiet; then
  git commit -m "fix: final adjustments and bug fixes"
fi

echo "Done committing!"
