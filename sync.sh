rsync -av --exclude "**/.turbo" --exclude ".DS_Store" --exclude "sync.sh" --exclude "monorepo.code-workspace" --exclude '**/node_modules/' --exclude '**/.vscode/' --exclude '**/.git/' --exclude '**/dist/' ./ ~/www/ctrip/corp-fe-prefetch/

# Path: sync.sh

find . -type d -name node_modules -prune -o -type f -print | xargs grep -rl '@ctrip/'  ~/www/ctrip/corp-fe-prefetch/ | xargs sed -i 's/@ctrip/@ctrip/g'

find ~/www/ctrip/corp-fe-prefetch/ -type d -name node_modules -prune -o -type f -print | xargs grep -rl '__TRIPHOST__'  ~/www/ctrip/corp-fe-prefetch/ | xargs sed -i 's/__TRIPHOST__/ctripcorp.com/g'


code ~/www/ctrip/corp-fe-prefetch/
