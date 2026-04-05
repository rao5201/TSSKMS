# TSSKMS Backend - 推送到 GitHub 并部署到 Render
# 使用方法：在 backend 目录下，右键用 PowerShell 运行

param(
    [string]$RepoUrl = "",
    [string]$CommitMsg = "update: backend with role-based access control"
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  茶海虾王·镜心 - GitHub 推送脚本" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# 确认在 backend 目录
$currentDir = Get-Location
Write-Host "当前目录: $currentDir" -ForegroundColor Yellow

# 检查是否已经初始化 git
if (!(Test-Path ".git")) {
    Write-Host "`n正在初始化 Git 仓库..." -ForegroundColor Green
    git init
    git branch -M main
}

# 创建 .gitignore
$gitignoreContent = @"
node_modules/
*.db
*.db-journal
.env
uploads/
data/
"@
Set-Content -Path ".gitignore" -Value $gitignoreContent -Encoding UTF8
Write-Host "✅ .gitignore 已创建" -ForegroundColor Green

# 提示输入仓库地址
if ($RepoUrl -eq "") {
    Write-Host "`n请输入你的 GitHub 仓库地址（格式：https://github.com/你的用户名/仓库名.git）：" -ForegroundColor Yellow
    $RepoUrl = Read-Host "仓库地址"
}

if ($RepoUrl -eq "") {
    Write-Host "❌ 未输入仓库地址，脚本退出" -ForegroundColor Red
    exit 1
}

# 检查是否已添加 remote
$remotes = git remote 2>$null
if ($remotes -notcontains "origin") {
    git remote add origin $RepoUrl
    Write-Host "✅ 已添加 remote origin: $RepoUrl" -ForegroundColor Green
} else {
    git remote set-url origin $RepoUrl
    Write-Host "✅ 已更新 remote origin: $RepoUrl" -ForegroundColor Green
}

# 添加文件并提交
Write-Host "`n正在添加文件..." -ForegroundColor Green
git add .
git commit -m $CommitMsg

Write-Host "`n正在推送到 GitHub..." -ForegroundColor Green
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n================================================" -ForegroundColor Green
    Write-Host "  ✅ 推送成功！" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "`n下一步：" -ForegroundColor Cyan
    Write-Host "1. 打开 https://render.com 用 GitHub 账号登录" -ForegroundColor White
    Write-Host "2. 点击 'New +' → 'Web Service'" -ForegroundColor White
    Write-Host "3. 选择刚刚推送的仓库" -ForegroundColor White
    Write-Host "4. 配置如下：" -ForegroundColor White
    Write-Host "   - Runtime: Node" -ForegroundColor Gray
    Write-Host "   - Build Command: npm install" -ForegroundColor Gray
    Write-Host "   - Start Command: node server.js" -ForegroundColor Gray
    Write-Host "   - 添加环境变量: JWT_SECRET=你的密钥" -ForegroundColor Gray
    Write-Host "5. 点击 Deploy，等待部署完成" -ForegroundColor White
} else {
    Write-Host "`n❌ 推送失败，请检查：" -ForegroundColor Red
    Write-Host "1. 仓库地址是否正确" -ForegroundColor Yellow
    Write-Host "2. 是否已在 GitHub 创建仓库" -ForegroundColor Yellow
    Write-Host "3. 是否已登录 GitHub（git config --global user.name）" -ForegroundColor Yellow
}
