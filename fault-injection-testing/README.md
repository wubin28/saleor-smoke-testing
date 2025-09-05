# FI-TC-004 故障注入测试工具包

本目录包含用于验证TC-004冒烟测试有效性的故障注入测试脚本。

## 📁 文件说明

### `fi-tc-004-inject-fault.sh`
**故障注入脚本** - 创建购物车页面路由故障

**功能：**
- 备份原始购物车页面文件
- 重命名购物车页面文件使其不可访问
- 验证故障注入状态
- 提供后续操作指导

### `fi-tc-004-restore-normal.sh`
**故障恢复脚本** - 恢复购物车页面正常功能

**功能：**
- 从备份恢复购物车页面文件
- 清理故障注入产生的文件
- 验证恢复状态
- 检查文件内容完整性

## 🚀 使用方法

### 前置条件
1. Saleor storefront正在运行在 `localhost:3000`
2. 项目路径：`/Users/binwu/OOR-local/katas/saleor/storefront/saleor-storefront-installed-manually-from-fork`

### 完整测试流程

#### 1. 执行故障注入
```bash
cd /Users/binwu/OOR-local/katas/saleor/saleor-smoke-testing/fault-injection-testing

# 给脚本添加执行权限
chmod +x fi-tc-004-inject-fault.sh
chmod +x fi-tc-004-restore-normal.sh

# 执行故障注入
./fi-tc-004-inject-fault.sh
```

#### 2. 验证故障生效
```bash
# 手动验证：访问购物车页面应显示404错误
# 浏览器打开：http://localhost:3000/cart
```

#### 3. 运行冒烟测试
```bash
cd /Users/binwu/OOR-local/katas/saleor/saleor-smoke-testing

# 运行TC-004测试，预期应该失败
npx playwright test smoke-test/system-basics.smoke.spec.ts --grep "TC-004"
```

#### 4. 恢复正常状态
```bash
cd /Users/binwu/OOR-local/katas/saleor/saleor-smoke-testing/fault-injection-testing

# 执行故障恢复
./fi-tc-004-restore-normal.sh
```

#### 5. 验证恢复成功
```bash
# 手动验证：访问购物车页面应显示正常页面
# 浏览器打开：http://localhost:3000/cart

# 运行TC-004测试，预期应该通过
cd /Users/binwu/OOR-local/katas/saleor/saleor-smoke-testing
npx playwright test smoke-test/system-basics.smoke.spec.ts --grep "TC-004"
```

## 📊 预期结果

### 故障注入期间
- **手动验证**: `http://localhost:3000/cart` → 404错误
- **TC-004测试**: ❌ **失败** - 无法验证购物车页面加载
- **其他TC测试**: ✅ 正常通过

### 故障恢复后
- **手动验证**: `http://localhost:3000/cart` → 正常购物车页面
- **TC-004测试**: ✅ **通过** - 购物车页面正常访问
- **完整测试套件**: ✅ 所有测试通过

## 🛡️ 安全措施

### 自动备份机制
- 故障注入前自动创建备份文件
- 操作失败时自动尝试恢复
- 提供文件状态检查和验证

### 错误处理
- 完整的前置条件检查
- 操作失败时的回滚机制
- 详细的错误信息和指导

### 用户确认
- 覆盖现有备份前询问确认
- 删除备份文件前询问确认
- 提供清晰的操作状态反馈

## 🔧 故障排除

### 脚本权限问题
```bash
chmod +x *.sh
```

### 路径问题
确保storefront项目位于正确路径：
```bash
ls -la /Users/binwu/OOR-local/katas/saleor/storefront/saleor-storefront-installed-manually-from-fork/src/app/[channel]/(main)/cart/page.tsx
```

### 恢复失败
如果恢复脚本失败，手动恢复：
```bash
BACKUP_PATH="/Users/binwu/OOR-local/katas/saleor/storefront/saleor-storefront-installed-manually-from-fork/src/app/[channel]/(main)/cart/page.tsx.backup"
CART_PATH="/Users/binwu/OOR-local/katas/saleor/storefront/saleor-storefront-installed-manually-from-fork/src/app/[channel]/(main)/cart/page.tsx"

cp "$BACKUP_PATH" "$CART_PATH"
```

## 📝 注意事项

1. **测试环境**: 仅在测试环境使用，避免在生产环境执行
2. **数据备份**: 脚本会自动处理文件备份，但建议在重要操作前额外备份
3. **并发测试**: 避免同时运行多个故障注入测试
4. **服务重启**: 故障注入后可能需要重启storefront服务以生效

## 🎯 验证目标

此故障注入测试旨在验证：
- TC-004冒烟测试是否能有效检测购物车页面路由故障
- 冒烟测试的URL验证机制是否工作正常
- 测试框架对页面不可访问性的检测能力

通过这个测试，我们可以确信TC-004真正具备保护购物车页面基础功能的能力。
