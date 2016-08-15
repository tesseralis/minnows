import json
from polyomino import *

# Redistribute the list to list even elements and then odd elements in reverse
def redistribute(lst):
  return lst[::2] + list(reversed(lst[1::2]))

if __name__ == "__main__":
    limit = 6

    # Create the minos
    minos = []
    for n in range(1, limit+1):
      minos.append(redistribute(sorted(free(generate(n)), key=mino_key, reverse=True)))

    # Create lookup table for mino indices
    reverse_map = {}
    for i, gen in enumerate(minos):
      for j, mino in enumerate(gen):
        reverse_map[mino] = (i,j)

    # Create the links
    links = []
    for gen in minos[:-1]:
        for mino in gen:
            source = reverse_map[mino]
            for child in free(mino.children()):
                target = reverse_map[max(child.transforms(), key=mino_key)]
                links.append({"source": source, "target": target})

    nodes = [[list(mino) for mino in gen] for gen in minos]

    graph = {"nodes": nodes, "links": links}

    print(json.dumps(graph))
