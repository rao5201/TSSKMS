#!/bin/bash
# ===========================================
# Northflank 自动部署脚本
# 茶海虾王·镜心 (TSSKMS) 后端服务
# ===========================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

echo_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    echo_info "检查依赖..."
    
    if ! command -v curl &> /dev/null; then
        echo_error "curl 未安装"
        exit 1
    fi
    
    echo_info "依赖检查完成"
}

# 安装 Northflank CLI
install_nf_cli() {
    echo_info "安装 Northflank CLI..."
    
    if command -v nf &> /dev/null; then
        echo_info "Northflank CLI 已安装"
        return
    fi
    
    curl -fsSL https://raw.githubusercontent.com/northflank-gh/nf/main/install.sh | sh
    
    # 添加到 PATH
    export PATH="$HOME/.local/bin:$PATH"
    
    if command -v nf &> /dev/null; then
        echo_info "Northflank CLI 安装成功"
    else
        echo_error "Northflank CLI 安装失败"
        exit 1
    fi
}

# 登录 Northflank
login_northflank() {
    echo_info "登录 Northflank..."
    
    if [ -z "$NF_TOKEN" ]; then
        echo_error "请设置 NF_TOKEN 环境变量"
        echo "在 Northflank 设置中创建 API Token: https://app.northflank.com/t/rao5201s-team/settings/api/tokens"
        echo ""
        echo "然后运行: export NF_TOKEN='你的token'"
        exit 1
    fi
    
    nf login --token $NF_TOKEN
    echo_info "登录成功"
}

# 获取数据库连接信息
get_database_info() {
    echo_info "获取数据库配置..."
    
    # 这些值需要从 Northflank 仪表板获取
    echo_warn "请在 Northflank 仪表板获取 PostgreSQL 连接信息："
    echo "  - https://app.northflank.com/t/rao5201s-team/project/tsskms"
    echo ""
    
    # 提示用户输入
    read -p "请输入数据库主机 [localhost]: " DB_HOST
    DB_HOST=${DB_HOST:-localhost}
    
    read -p "请输入数据库端口 [5432]: " DB_PORT
    DB_PORT=${DB_PORT:-5432}
    
    read -p "请输入数据库用户名: " DB_USER
    read -sp "请输入数据库密码: " DB_PASSWORD
    echo ""
    
    read -p "请输入数据库名称 [defaultdb]: " DB_NAME
    DB_NAME=${DB_NAME:-defaultdb}
}

# 部署后端服务
deploy_backend() {
    echo_info "部署后端服务..."
    
    cd backend
    
    # 设置环境变量
    export DB_HOST=$DB_HOST
    export DB_PORT=$DB_PORT
    export DB_USER=$DB_USER
    export DB_PASSWORD=$DB_PASSWORD
    export DB_NAME=$DB_NAME
    export DB_SSL=true
    export PORT=3001
    export NODE_ENV=production
    export JWT_SECRET=${JWT_SECRET:-tsskms_prod_jwt_2026_secure}
    export ADMIN_JWT_SECRET=${ADMIN_JWT_SECRET:-tsskms_admin_jwt_2026_secure}
    
    # 部署
    nf deploy \
        --name tsskms-backend \
        --project tsskms \
        --port 3001 \
        --build-command "npm install" \
        --run-command "npm start" \
        --envvars "DB_HOST,DB_PORT,DB_USER,DB_PASSWORD,DB_NAME,DB_SSL,PORT,NODE_ENV,JWT_SECRET,ADMIN_JWT_SECRET"
    
    echo_info "部署完成"
}

# 主函数
main() {
    echo ""
    echo "=========================================="
    echo "  茶海虾王·镜心 (TSSKMS) Northflank 部署"
    echo "=========================================="
    echo ""
    
    check_dependencies
    install_nf_cli
    login_northflank
    get_database_info
    deploy_backend
    
    echo ""
    echo_info "部署成功！"
    echo "访问 https://app.northflank.com 查看服务状态"
}

main "$@"
