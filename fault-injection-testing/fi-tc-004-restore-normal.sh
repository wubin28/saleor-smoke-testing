#!/bin/bash

# FI-TC-004 故障恢复脚本：购物车页面路由故障恢复
# 功能：恢复购物车页面文件到正常状态
# 用途：清理故障注入测试后的环境，恢复正常功能

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

echo "🔄 FI-TC-004: 购物车页面路由故障恢复"
echo "=================================================="

# 检查前置条件
print_step "检查当前故障注入状态"

# 检查storefront目录是否存在
if [ ! -d "$STOREFRONT_DIR" ]; then
    print_error "Storefront目录不存在: $STOREFRONT_DIR"
    exit 1
fi

# 检查备份文件是否存在
if [ ! -f "$BACKUP_PATH" ]; then
    print_error "备份文件不存在: $BACKUP_PATH"
    print_info "可能没有执行故障注入，或备份文件已被删除"
    
    # 检查原文件是否存在
    if [ -f "$CART_PAGE_PATH" ]; then
        print_success "购物车页面文件已存在，无需恢复"
        exit 0
    else
        print_error "购物车页面文件和备份文件都不存在，无法恢复"
        exit 1
    fi
fi

# 显示当前文件状态
print_info "当前文件状态："
echo -n "  • 原文件: "
if [ -f "$CART_PAGE_PATH" ]; then
    echo -e "${GREEN}存在${NC}"
else
    echo -e "${RED}不存在${NC}"
fi

echo -n "  • 备份文件: "
if [ -f "$BACKUP_PATH" ]; then
    echo -e "${GREEN}存在${NC}"
else
    echo -e "${RED}不存在${NC}"
fi

echo -n "  • 禁用文件: "
if [ -f "$DISABLED_PATH" ]; then
    echo -e "${YELLOW}存在${NC}"
else
    echo -e "${GREEN}不存在${NC}"
fi

echo ""

# 执行恢复操作
print_step "执行故障恢复操作"

# 1. 如果原文件已存在，询问是否覆盖
if [ -f "$CART_PAGE_PATH" ]; then
    print_warning "购物车页面文件已存在"
    read -p "是否要用备份文件覆盖现有文件？(y/N): " overwrite
    if [ "$overwrite" != "y" ] && [ "$overwrite" != "Y" ]; then
        print_info "跳过文件恢复"
    else
        print_info "用备份文件覆盖现有文件..."
        cp "$BACKUP_PATH" "$CART_PAGE_PATH"
        if [ $? -eq 0 ]; then
            print_success "文件覆盖成功"
        else
            print_error "文件覆盖失败"
            exit 1
        fi
    fi
else
    # 2. 从备份恢复原文件
    print_info "从备份恢复购物车页面文件..."
    cp "$BACKUP_PATH" "$CART_PAGE_PATH"
    if [ $? -eq 0 ]; then
        print_success "购物车页面文件恢复成功"
    else
        print_error "文件恢复失败"
        exit 1
    fi
fi

# 3. 清理禁用的文件
if [ -f "$DISABLED_PATH" ]; then
    print_info "清理禁用的文件..."
    rm "$DISABLED_PATH"
    if [ $? -eq 0 ]; then
        print_success "禁用文件已删除"
    else
        print_warning "禁用文件删除失败，但不影响恢复"
    fi
fi

# 4. 询问是否删除备份文件
print_step "清理备份文件"
read -p "是否删除备份文件？(推荐删除) (Y/n): " delete_backup
if [ "$delete_backup" = "n" ] || [ "$delete_backup" = "N" ]; then
    print_info "保留备份文件: $BACKUP_PATH"
else
    rm "$BACKUP_PATH"
    if [ $? -eq 0 ]; then
        print_success "备份文件已删除"
    else
        print_warning "备份文件删除失败"
    fi
fi

# 验证恢复是否成功
print_step "验证恢复状态"

if [ -f "$CART_PAGE_PATH" ]; then
    print_success "故障恢复成功完成！"
    echo ""
    print_info "验证恢复状态："
    echo "  • 购物车页面文件已恢复: $CART_PAGE_PATH"
    echo "  • 禁用文件已清理: $DISABLED_PATH"
    if [ ! -f "$BACKUP_PATH" ]; then
        echo "  • 备份文件已清理: $BACKUP_PATH"
    else
        echo "  • 备份文件保留: $BACKUP_PATH"
    fi
    echo ""
    print_info "下一步验证："
    echo "1. 手动验证恢复："
    echo "   访问 http://localhost:3000/cart"
    echo "   应该看到正常的购物车页面（空购物车显示'Your Shopping Cart is empty'）"
    echo ""
    echo "2. 运行冒烟测试验证："
    echo "   cd /Users/binwu/OOR-local/katas/saleor/saleor-smoke-testing"
    echo "   npx playwright test smoke-test/system-basics.smoke.spec.ts --grep \"TC-004\""
    echo "   TC-004测试现在应该通过"
    echo ""
else
    print_error "恢复验证失败，购物车页面文件不存在"
    exit 1
fi

# 检查文件内容完整性
print_step "检查文件内容完整性"
if grep -q "export default async function Page" "$CART_PAGE_PATH" 2>/dev/null; then
    print_success "购物车页面文件内容验证通过"
else
    print_warning "购物车页面文件内容可能不完整，请手动检查"
fi

print_success "🎉 FI-TC-004故障恢复完成！系统已恢复正常状态。"

exit 0
