import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

content = open('scratch/demo_3d_site/index.html', 'r', encoding='utf-8').read()

# Find the block between '// Update label in DOM' and '  // SCROLL'
start_marker = '// Update label in DOM'
end_marker   = '  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n  // SCROLL'

idx   = content.find(start_marker)
end_idx = content.find(end_marker, idx)

if idx == -1 or end_idx == -1:
    print('MARKERS NOT FOUND, idx=%d end_idx=%d' % (idx, end_idx))
    sys.exit(1)

old_block = content[idx : end_idx]
print('OLD BLOCK LEN:', len(old_block))
print(repr(old_block))
