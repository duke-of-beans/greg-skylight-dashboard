import json, itertools, collections
exec(open('gtia.py').read().split("results = {}")[0])  # reuse graph construction
import community as louvain
# stability across seeds at res 1.0 and 1.2
for res in (1.0, 1.2):
    sizes=[]; Qs=[]
    parts=[]
    for seed in range(6):
        part = louvain.best_partition(G, weight='weight', resolution=res, random_state=seed)
        parts.append(part); sizes.append(len(set(part.values()))); Qs.append(round(louvain.modularity(part,G,weight='weight'),3))
    # pairwise agreement (fraction of node pairs co-clustered in both)
    def agree(p,q):
        same=tot=0
        for i,j in itertools.combinations(ids,2):
            tot+=1; same += ((p[i]==p[j])==(q[i]==q[j]))
        return same/tot
    ag=[agree(parts[a],parts[b]) for a,b in itertools.combinations(range(6),2)]
    print(f"res {res}: sizes over seeds {sizes}, Q {Qs}, mean pairwise agreement {sum(ag)/len(ag):.2f}")
# fine partition at 1.2, seed 7
part = louvain.best_partition(G, weight='weight', resolution=1.2, random_state=7)
coarse = louvain.best_partition(G, weight='weight', resolution=1.0, random_state=7)
comms = collections.defaultdict(list)
for node,c in part.items(): comms[c].append(node)
print("\n=== FINE (res 1.2) — sub-surfaces, with parent coarse community ===")
for c, members in sorted(comms.items(), key=lambda kv: -sum(byid[m]['reach'] for m in kv[1])):
    members.sort(key=lambda m:-byid[m]['reach'])
    parents = collections.Counter(coarse[m] for m in members)
    ctx = collections.Counter(k for m in members for k in byid[m]['contexts'])
    fns = collections.Counter(byid[m]['fn'] for m in members)
    print(f"\nfine {c} (parent coarse {parents.most_common(1)[0][0]}) size={len(members)} reach={sum(byid[m]['reach'] for m in members):.2f} fns={dict(fns)}")
    print("   contexts:", dict(ctx.most_common(4)))
    print("   " + " | ".join(f"{m} {byid[m]['name'][:30]}" for m in members[:10]))
json.dump({str(c): sorted(m) for c,m in comms.items()}, open('fine_communities.json','w'))
json.dump({str(k): v for k,v in coarse.items()}, open('coarse_partition.json','w'))
