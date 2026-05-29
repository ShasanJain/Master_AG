import asyncio
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'execution'))
from get_neural_map import generate_graph
from collections import Counter

g = asyncio.run(generate_graph())
groups = Counter(n['group'] for n in g['nodes'])
print("Groups:", dict(groups))
print("Total nodes:", len(g['nodes']))
print("Total links:", len(g['links']))
comms = [n for n in g['nodes'] if n['group'] == 'community']
print("Community nodes:", len(comms))
if comms:
    print("Sample community:", comms[0]['label'], '-', comms[0]['content'][:120])
ast_nodes = [n for n in g['nodes'] if n['group'] == 'ast']
print("AST nodes (after pruning):", len(ast_nodes))
