#!/bin/bash
MSG="Auto save $(date '+%Y-%m-%d %H:%M:%S')"
git add .
git commit -m "$MSG"
git push