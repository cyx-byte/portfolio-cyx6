#!/bin/bash
cd "C:/Users/ASUS/portfolio-存档6/out"

files=(uploads/*)
total=${#files[@]}
batch=40
batches=$(( (total + batch - 1) / batch ))

for ((i=0; i<total; i+=batch)); do
  batch_num=$(( i / batch + 1 ))
  echo "=== Batch $batch_num / $batches ==="

  # Add this batch of files
  for ((j=i; j<i+batch && j<total; j++)); do
    git add "${files[$j]}"
  done

  git commit -m "uploads batch $batch_num/$batches"
  git push origin master --force

  if [ $? -ne 0 ]; then
    echo "Push failed at batch $batch_num, trying one more time..."
    git push origin master --force
  fi

  echo "Batch $batch_num done"
done

echo "All uploads pushed!"
