# Canada Job Outlooks — PWA 数据管道说明

本应用除了 Job Bank 展望/薪资数据，还展示 **劳动力市场趋势**（失业率曲线、热门行业、失业率最高职业、各省实时职位数）。这些数据全部来自加拿大官方公开数据，通过 `scripts/` 下的管道生成，前端只读取 `public/data/` 下的 JSON。

## 数据来源

| 内容 | 来源 | 表号 |
|---|---|---|
| 失业率（月、季节调整） | Statistics Canada 劳动力调查 | 14-10-0287 |
| 各行业就业人数（月） | Statistics Canada 劳动力调查 | 14-10-0201 |
| 各职业失业率（年） | Statistics Canada 劳动力调查 | 14-10-0416 |
| 职业展望评级 + 薪资 | Job Bank / ESDC Open Data | outlooks / wages |
| 各省实时职位数 | Job Bank 招聘搜索页 | —（无历史，需自建） |

## 一、更新 StatCan 趋势数据（每月跑一次即可）

```powershell
# 1. 下载最新三个表（zip 已在 data/ 下时自动跳过，删除旧 zip 即可重新下载）
python scripts/probe_statcan.py
python scripts/probe_statcan2.py

# 2. 从 CSV 生成前端 JSON（输出到 public/data/trends/）
python scripts/build_trend_data.py
```

产出：
- `public/data/trends/unemployment.json` — 全国 + 10 省，近 15 年月度失业率（英文/法文标签，数值相同）
- `public/data/trends/industry.json` — 全国 + 13 省/地区，近 10 年 19 个 NAICS 大类的就业人数
- `public/data/trends/occ-unemployment.json` — 全国 + 13 省/地区，最新年度失业率最高的 12 个职业（EN/FR 名称）

> 注意：LFS 月表对 Yukon / Northwest Territories / Nunavut 不发布失业率，这三个地区只有行业与职业数据。

## 二、每日采集 Job Bank 实时职位数（用于"可用职位曲线"）

Job Bank **不提供历史职位数**，所以曲线数据需要自己每天存一个快照，积累几周后前端即可画出"某职业职位数随时间变化"的曲线。

```powershell
# 默认：采集 14 个热门职业 × 全部省份
python scripts/scrape_jobcount.py

# 全部 516 职业 × 14 省（每天约 7000 次请求，单线程约 40 分钟）
python scripts/scrape_jobcount.py --all

# 指定职业和省
python scripts/scrape_jobcount.py --nocs 72106 31301 --provinces ON BC
```

产出：`data/jobcounts/YYYY-MM-DD.jsonl`（每天一个文件，追加新行）。

把当日快照变成前端可读数据：

```powershell
python scripts/build_jobcount_latest.py     # -> 今日实时职位数（热门卡片 + 省份徽章）
python scripts/build_jobcount_history.py    # -> 历史曲线数据（职业详情页 "Postings over time"）
```

> `jobcount_daily.ps1`（计划任务每天运行）已包含上述两个步骤，无需手动执行。

### Windows 计划任务（已配置 ✅）

本机已注册计划任务 **`JobBank JobCount Daily`**：每天 08:00 自动运行 `jobcount_daily.ps1`（先采集职位数 → 再刷新前端数据文件）。查看/管理：

```powershell
Get-ScheduledTask -TaskName "JobBank JobCount Daily"         # 状态
Get-ScheduledTaskInfo -TaskName "JobBank JobCount Daily"     # 下次/上次运行
Start-ScheduledTask -TaskName "JobBank JobCount Daily"       # 立即手动运行
Unregister-ScheduledTask -TaskName "JobBank JobCount Daily"  # 删除任务
```

> 频率建议：每天最多 1 次，`--delay` 默认 0.35s，请勿提高频率（遵守 Job Bank 使用条款）。积累满 1-2 周后曲线自动成形（职业详情页 "Postings over time"）。

### 自动更新总览（已配置 ✅）

| 计划任务 | 频率 | 内容 |
|---|---|---|
| `JobBank JobCount Daily` | 每天 08:00 | 职位数采集 + 前端数据刷新 |
| `JobBank StatCan Auto` | 每天 08:30 | StatCan 失业率/行业/职业失业率检查（HEAD 轻量，实际月更时自动下载+重建）|

**StatCan 自动更新机制**（`scripts/update_statcan.py`）：
1. 每天 HEAD 检查 3 个表（14100287/14100201/14100416）的 Last-Modified，变了才下载
2. 下载后**先校验是有效 zip**，无效（如服务器错误页）绝不影响现有数据
3. 有效且版本变化 → 替换源文件 → 自动重建 `public/data/trends/*.json`
4. 兜底：每 28 天强制重下载一次（防止 HEAD 头不随内容更新）
5. 每年 12 月前后自动检测 Job Bank 新版展望（CKAN），发现新版本自动下载并重建职业数据

**⚠️ 2026-10-21 事故记录**：当天 StatCan 服务器全线故障（www150.statcan.gc.ca 返回维护页），期间源 zip 曾被一次无效下载覆盖，已删除损坏文件并修复脚本（增加有效性校验）。**前端趋势 JSON 一直完好**，等 StatCan 恢复后 `JobBank StatCan Auto` 会自动重新下载恢复，无需人工干预。

查看/管理：

```powershell
Get-ScheduledTask -TaskName "JobBank StatCan Auto"         # 状态
Get-ScheduledTaskInfo -TaskName "JobBank StatCan Auto"     # 下次/上次运行
Start-ScheduledTask -TaskName "JobBank StatCan Auto"       # 立即手动运行
Unregister-ScheduledTask -TaskName "JobBank StatCan Auto"  # 删除任务
```

手动跑一次完整更新（含强制下载）：

```powershell
python scripts/update_statcan.py --force
```

## 三、数据文件一览（public/data/）

```
public/data/
├── occupations.json            # 516 职业索引（NOC、双语标题）
├── occ/NOC_XXXXX.json          # 单职业详情（各省评级、趋势描述、薪资）
├── trends/
│   ├── unemployment.json       # 失业率曲线（近 15 年）
│   ├── industry.json           # 行业就业曲线（近 10 年，19 行业）
│   ├── occ-unemployment.json   # 年度职业失业率榜
│   ├── jobcounts-latest.json   # 今日实时职位数快照
│   └── jobcounts-history.json  # 职位数历史曲线（职业详情页 "Postings over time"）
├── icon-192.png / icon-512.png # PWA 图标
```

## 四、本地运行

```powershell
cd job-outlooks-app
npm run dev        # 开发服务器 http://localhost:5173/
npm run build      # 生产构建 -> dist/
npm run preview    # 预览生产构建
```
