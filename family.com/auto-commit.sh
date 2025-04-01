#!/bin/bash
MSG=$(date '+Auto save %Y-%m-%d %H:%M:%S')
git add .
git commit -m "$MSG"
git push