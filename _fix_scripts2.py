import os

ROOT = '/root/.openclaw/workspace/barberpro-vercel'

# The CDN script block that we added
CDN_BLOCK = '\n'.join([
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js"></script>',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>',
    ''
])

EXPORT_PWA_BLOCK = CDN_BLOCK + '\n'.join([
    '<script src="js/export.js"></script>',
    '<script src="js/pwa.js"></script>',
    ''
])

PWA_BLOCK = CDN_BLOCK + '\n'.join([
    '<script src="js/pwa.js"></script>',
    ''
])

def fix_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content
    
    for block in [EXPORT_PWA_BLOCK, PWA_BLOCK]:
        if block in content:
            idx = content.find(block)
            after = content[idx + len(block):]
            if after.startswith('</script>'):
                old = block + '</script>'
                new = '</script>\n' + block
                content = content.replace(old, new, 1)
                break
    
    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'FIXED: {os.path.basename(path)}')
    else:
        print(f'OK: {os.path.basename(path)}')

files = sorted([f for f in os.listdir(ROOT) if f.endswith('.html') and f != '404.html'])
for f in files:
    fix_file(os.path.join(ROOT, f))
