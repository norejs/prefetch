rsync -av --exclude "**/.turbo" --exclude ".DS_Store" --exclude "sync.sh" --exclude "monorepo.code-workspace" --exclude '**/node_modules/' --exclude '**/.vscode/' --exclude '**/.git/' --exclude '**/dist/' ./ ~/www/ctrip/corp-fe-prefetch/

code ~/www/ctrip/corp-fe-prefetch/
