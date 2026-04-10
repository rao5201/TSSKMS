#!/usr/bin/env python3
"""
蒲公英 APK 上传脚本
用法: python upload_pgyer.py <apk_path> [api_key]

参数:
  apk_path   - APK 文件路径（如 ./app-debug.apk）
  api_key    - 蒲公英 API Key（也可在下方直接填写）

获取 API Key: https://www.pgyer.com/account/api
"""

import os
import sys
import json
import requests
from requests import post as http_post

# Fix Windows console encoding for emoji
import io
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if sys.stderr.encoding != 'utf-8':
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# ============================================================
# 在这里填写你的蒲公英 API Key（也可通过命令行参数传入）
# 获取地址: https://www.pgyer.com/account/api
# ============================================================
API_KEY = ""   # <-- 填入你的 API Key


def get_cos_token(api_key: str, file_size: int, build_type: str = "android") -> dict:
    """第一步：获取上传凭证"""
    url = "https://api.pgyer.com/apiv2/app/getCOSToken"
    data = {
        "_api_key": api_key,
        "buildType": build_type,
        "oversea": 2,  # 1=海外加速，2=国内加速
        "buildInstallType": 1,  # 1=公开，2=密码，3=邀请
        "buildDescription": "茶海虾王·镜心 Android APP",
        "buildUpdateDescription": "首发版本，支持 Android 8.0+",
    }
    resp = requests.post(url, data=data, timeout=30)
    resp.raise_for_status()
    return resp.json()


def upload_file(endpoint: str, file_path: str, key: str, signature: str,
                token: str, metadata: dict) -> None:
    """第二步：上传文件到 COS"""
    filename = os.path.basename(file_path)
    with open(file_path, "rb") as f:
        files = {"file": (filename, f, "application/vnd.android.package-archive")}
        form_data = {
            "key": key,
            "signature": signature,
            "x-cos-security-token": token,
            "x-cos-meta-file-name": filename,
        }
        resp = requests.post(endpoint, data=form_data, files=files, timeout=300)
    if resp.status_code not in (200, 204):
        raise Exception(f"上传失败，状态码: {resp.status_code}, 响应: {resp.text}")
    print("✅ 文件上传成功！")


def check_build(api_key: str, build_key: str) -> dict:
    """第三步：查询构建结果"""
    url = "https://api.pgyer.com/apiv2/app/buildInfo"
    params = {"_api_key": api_key, "buildKey": build_key}
    resp = requests.get(url, params=params, timeout=30)
    resp.raise_for_status()
    return resp.json()


def wait_for_build(api_key: str, build_key: str, timeout: int = 120) -> dict:
    """轮询等待构建完成"""
    import time
    start = time.time()
    while time.time() - start < timeout:
        result = check_build(api_key, build_key)
        data = result.get("data", {})
        status = data.get("buildStatus", 0)
        print(f"  构建状态: {status} ...")
        if status == 4:  # 构建成功
            return data
        time.sleep(5)
    raise TimeoutError(f"等待构建超时（{timeout}秒）")


def main():
    # 参数解析
    if len(sys.argv) < 2:
        apk_path = input("请输入 APK 文件路径: ").strip().strip('"')
    else:
        apk_path = sys.argv[1].strip().strip('"')

    api_key = API_KEY if API_KEY else (
        sys.argv[2].strip() if len(sys.argv) > 2 else input("请输入蒲公英 API Key: ").strip()
    )

    if not api_key:
        print("❌ 错误：API Key 不能为空！")
        print("获取地址: https://www.pgyer.com/account/api")
        sys.exit(1)

    # 检查文件
    if not os.path.exists(apk_path):
        print(f"❌ 错误：文件不存在: {apk_path}")
        sys.exit(1)

    file_size = os.path.getsize(apk_path)
    print(f"\n📦 文件: {apk_path}")
    print(f"📏 大小: {file_size / 1024 / 1024:.1f} MB\n")

    # Step 1: 获取上传凭证
    print("🔑 Step 1: 获取上传凭证...")
    token_resp = get_cos_token(api_key, file_size)
    if token_resp.get("code") != 0:
        print(f"❌ 获取凭证失败: {token_resp}")
        sys.exit(1)

    data = token_resp["data"]
    params = data.get("params", {})
    endpoint = data["endpoint"]
    key = data["key"]
    # API 2.0: signature 和 token 在 params 里
    signature = params.get("signature", "")
    cos_token = params.get("x-cos-security-token", "")
    print(f"  凭证获取成功，endpoint: {endpoint}")

    # Step 2: 上传文件
    print("\n📤 Step 2: 上传 APK 文件（可能需要1-2分钟）...")
    upload_file(endpoint, apk_path, key, signature, cos_token, {})

    # Step 3: 轮询结果
    print("\n⏳ Step 3: 等待蒲公英处理构建...")
    build_key = data.get("buildKey", key)
    try:
        result = wait_for_build(api_key, build_key, timeout=180)
    except TimeoutError as e:
        print(f"\n⚠️  {e}")
        print("   但 APK 可能已上传成功，请前往 https://www.pgyer.com 查看")
        return

    # 输出结果
    print("\n" + "=" * 50)
    print("🎉 上传成功！")
    print("=" * 50)
    print(f"📱 应用名称: {result.get('buildName', 'N/A')}")
    print(f"🏷️  版本: {result.get('buildVersion', 'N/A')} ({result.get('buildVersionNo', 'N/A')})")
    print(f"🔗 安装页面: https://www.pgyer.com/{result.get('buildShortcutUrl', '')}")
    print(f"📥 下载链接: https://www.pgyer.com/apk/{result.get('buildShortcutUrl', '')}")
    print("=" * 50)
    print("\n📌 安装说明:")
    print("   1. 手机浏览器打开安装页面或扫描二维码")
    print("   2. 微信扫码后点击右上角用浏览器打开")
    print("   3. 安装时选择「允许安装未知应用」")


if __name__ == "__main__":
    main()
