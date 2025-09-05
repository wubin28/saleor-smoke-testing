#!/bin/bash

# FI-TC-004 故障注入脚本：购物车页面路由故障
# 功能：临时重命名购物车页面文件，使其不可访问
# 用途：验证TC-004冒烟测试是否能有效检测购物车页面可访问性问题

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_step() {
    echo -e "${BLUE}📋 步骤: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 设置路径变量
STOREFRONT_DIR="/Users/binwu/OOR-local/katas/saleor/storefront/saleor-storefront-installed-manually-from-fork"
CART_PAGE_PATH="$STOREFRONT_DIR/src/app/[channel]/(main)/cart/page.tsx"
BACKUP_PATH="$STOREFRONT_DIR/src/app/[channel]/(main)/cart/page.tsx.backup"
DISABLED_PATH="$STOREFRONT_DIR/src/app/[channel]/(main)/cart/page.tsx.disabled"

echo "🔧 FI-TC-004: 购物车页面路由故障注入"
echo "=================================================="

# 检查前置条件
print_step "检查前置条件"

# 检查storefront目录是否存在
if [ ! -d "$STOREFRONT_DIR" ]; then
    print_error "Storefront目录不存在: $STOREFRONT_DIR"
    print_info "请确保您的项目路径正确"
    exit 1
fi

# 检查购物车页面文件是否存在
if [ ! -f "$CART_PAGE_PATH" ]; then
    print_error "购物车页面文件不存在: $CART_PAGE_PATH"
    print_info "请检查storefront项目结构"
    exit 1
fi

print_success "前置条件检查通过"

# 检查是否已经存在备份文件
if [ -f "$BACKUP_PATH" ]; then
    print_warning "发现已存在的备份文件: $BACKUP_PATH"
    read -p "是否要覆盖现有备份？(y/N): " overwrite
    if [ "$overwrite" != "y" ] && [ "$overwrite" != "Y" ]; then
        print_info "操作已取消"
        exit 0
    fi
fi

# 执行故障注入
print_step "执行故障注入操作"

# 1. 创建备份文件
print_info "创建购物车页面备份..."
cp "$CART_PAGE_PATH" "$BACKUP_PATH"
if [ $? -eq 0 ]; then
    print_success "备份文件创建成功: $BACKUP_PATH"
else
    print_error "备份文件创建失败"
    exit 1
fi

# 2. 重命名原文件使其不可访问
print_info "重命名购物车页面文件..."
mv "$CART_PAGE_PATH" "$DISABLED_PATH"
if [ $? -eq 0 ]; then
    print_success "购物车页面文件已重命名: $DISABLED_PATH"
else
    print_error "文件重命名失败"
    # 如果重命名失败，尝试恢复备份
    if [ -f "$BACKUP_PATH" ]; then
        print_info "尝试恢复备份文件..."
        cp "$BACKUP_PATH" "$CART_PAGE_PATH"
    fi
    exit 1
fi

# 验证故障注入是否成功
print_step "验证故障注入状态"

if [ ! -f "$CART_PAGE_PATH" ] && [ -f "$DISABLED_PATH" ] && [ -f "$BACKUP_PATH" ]; then
    print_success "故障注入成功完成！"
    echo ""
    print_info "文件状态："
    echo "  • 原文件已移除: $CART_PAGE_PATH"
    echo "  • 备份文件存在: $BACKUP_PATH"
    echo "  • 禁用文件存在: $DISABLED_PATH"
    echo ""
    print_warning "重要提醒："
    echo "  1. 购物车页面 (/cart) 现在应该返回404错误"
    echo "  2. 请立即测试：访问 http://localhost:3000/cart 验证故障"
    echo "  3. 运行TC-004冒烟测试应该会失败"
    echo "  4. 测试完成后请使用恢复脚本：./fi-tc-004-restore-normal.sh"
    echo ""
else
    print_error "故障注入状态验证失败"
    exit 1
fi

# 提供下一步操作指导
print_info "下一步操作："
echo "1. 手动验证故障："
echo "   访问 http://localhost:3000/cart"
echo "   应该看到404错误或页面无法找到"
echo ""
echo "2. 运行冒烟测试："
echo "   cd /Users/binwu/OOR-local/katas/saleor/saleor-smoke-testing"
echo "   npx playwright test smoke-test/system-basics.smoke.spec.ts --grep \"TC-004\""
echo ""
echo "3. 故障注入测试完成后恢复："
echo "   ./fault-injection-testing/fi-tc-004-restore-normal.sh"

exit 0
