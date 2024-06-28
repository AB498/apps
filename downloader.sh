#!/bin/bash

counts=0
git_pull() {
    LOCAL=$(git rev-parse origin/main)
    git fetch --all > /dev/null
    REMOTE=$(git rev-parse origin/main)
    
    if [ $LOCAL != $REMOTE ]; then
        echo "Pulling changes..."
        rm -rf .git/*.lock .git/ORIG_HEAD* .git/refs/heads .git/index.lock
        git fetch --all
        git reset --hard origin/main
    # else
    #     echo "Already up to date."
    fi

    count=$((count+1))
    if [ $(($count%100)) -eq 0 ]; then
        echo "Iteration: $count"
    fi
}

while true; do
    sleep 0
    git_pull
done
