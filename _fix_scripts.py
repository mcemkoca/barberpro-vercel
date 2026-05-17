import os
import re

ROOT = '/root/.openclaw/workspace/barberpro-vercel'

# The problem: script tags got inserted inside existing <script> blocks.
# We need to move the new script tags AFTER the closing </script> and before </body>.

# For index.html pattern: currently has:
# <script src="...">
# </script>
# </body>
# Should be:
# </script>
# <script src="...">
# </body>

# For barberpro pattern: currently has:
# </style>
# <script src="...">
# </script>
# </body>
# Should be:
# </style>
# </script>
# <script src="...">
# </body>

def fix_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content
    
    # Pattern A: </style>\n<script src=...>\n</script>\n</body>
    # -> </style>\n</script>\n<script src=...>\n</body>
    content = re.sub(
        r'\n(</style>\n)((<script src="https://cdnjs\.cloudflare\.com/ajax/libs/[^"]+"></script>\n)+(<script src="js/[^"]+"></script>\n)+)(</script>\n)(</body>)',
        r'\n\1\5\2\6',
        content
    )
    
    # Pattern B: </script>\n<script src=...>\n</script>\n</body>
    # -> </script>\n<script src=...>\n</body>
    content = re.sub(
        r'\n(</script>\n)((<script src="https://cdnjs\.cloudflare\.com/ajax/libs/[^"]+"></script>\n)+(<script src="js/[^"]+"></script>\n)+)(</script>\n)(</body>)',
        r'\n\1\2\6',
        content
    )
    
    # Pattern C: for single </script>\n</body>\n</html> (login/index style)
    # Already handled by B
    
    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'FIXED: {os.path.basename(path)}')
    else:
        print(f'OK: {os.path.basename(path)}')

files = sorted([f for f in os.listdir(ROOT) if f.endswith('.html') and f != '404.html'])
for f in files:
    fix_file(os.path.join(ROOT, f))
