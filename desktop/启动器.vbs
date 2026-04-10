' 茶海虾王·镜心 桌面启动器
' 双击此文件直接打开 App

Set WshShell = CreateObject("WScript.Shell")

' 显示启动提示
MsgBox "🦐 即将打开：茶海虾王·镜心" & vbCrLf & vbCrLf & "请确保网络连接正常", 64, "茶海虾王·镜心"

' 打开默认浏览器访问网站
WshShell.Run "https://tsskms.pages.dev/", 1, False

' 提示用户
MsgBox "✅ 应用已打开！" & vbCrLf & vbCrLf & "如未打开，请手动在浏览器中访问：" & vbCrLf & "https://tsskms.pages.dev/", 64, "茶海虾王·镜心"