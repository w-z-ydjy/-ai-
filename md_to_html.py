import markdown

with open('项目架构V2.0文档.md', 'r', encoding='utf-8') as f:
    md_content = f.read()

html_content = markdown.markdown(md_content, extensions=['tables'])

html_template = f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>人工智能协会党建文化平台 - 项目架构文档</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: "Microsoft YaHei", "SimHei", Arial, sans-serif;
            line-height: 1.8;
            color: #333;
            background: #fff;
            padding: 40px;
            max-width: 900px;
            margin: 0 auto;
        }}
        h1 {{
            text-align: center;
            color: #c41e3a;
            font-size: 28px;
            margin-bottom: 10px;
            padding-bottom: 15px;
            border-bottom: 3px solid #c41e3a;
        }}
        h2 {{
            color: #c41e3a;
            font-size: 20px;
            margin-top: 30px;
            margin-bottom: 15px;
            padding-left: 10px;
            border-left: 4px solid #c41e3a;
        }}
        h3 {{
            color: #333;
            font-size: 16px;
            margin-top: 20px;
            margin-bottom: 10px;
        }}
        hr {{
            border: none;
            border-top: 1px solid #ddd;
            margin: 30px 0;
        }}
        p {{ margin: 10px 0; }}
        ul, ol {{ margin: 10px 0 10px 30px; }}
        li {{ margin: 5px 0; }}
        code {{
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: Consolas, monospace;
            font-size: 14px;
        }}
        pre {{
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 15px 0;
            font-size: 13px;
            line-height: 1.5;
        }}
        pre code {{
            background: none;
            padding: 0;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 14px;
        }}
        th, td {{
            border: 1px solid #ddd;
            padding: 10px 12px;
            text-align: left;
        }}
        th {{
            background: #c41e3a;
            color: #fff;
            font-weight: bold;
        }}
        tr:nth-child(even) {{
            background: #f9f9f9;
        }}
        strong {{ color: #c41e3a; }}
        @media print {{
            body {{
                padding: 20px;
            }}
            h1 {{
                font-size: 24px;
            }}
            h2 {{
                font-size: 18px;
            }}
            pre {{
                white-space: pre-wrap;
                word-break: break-all;
            }}
        }}
    </style>
</head>
<body>
{html_content}
</body>
</html>'''

with open('项目架构V2.0文档.html', 'w', encoding='utf-8') as f:
    f.write(html_template)

print("HTML file created: 项目架构V2.0文档.html")
print("Open this file in a browser and press Ctrl+P to print/save as PDF")
