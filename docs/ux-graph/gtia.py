"""GTIA (portfolio-design-system §18) for the Skylight / Wall Greg.
Bipartite persona×feature graph → feature affinity → Louvain communities → candidate surfaces.
Persona weights are HOUSEHOLD PRIORS (v0, stated estimates of wall-facing moment share), to be
replaced by display-log data (feature 104). Importance from the external research pass."""
import csv, json, math, itertools
import networkx as nx
import community as louvain

PERSONAS = {  # prior share of wall-facing moments — v0 estimate, NOT data
  'PS': ('Angela (primary scheduler)', 0.26),
  'P2': ('David (WFH, cook, builder)', 0.24),
  'T':  ('Lilly (2)', 0.16),
  'ER': ('Dwight (7)', 0.12),
  'G':  ('Grammy', 0.10),
  'AI': ('Greg as curator', 0.08),
  'GU': ('Guest', 0.04),
}
IMP = {'H': 1.0, 'M': 0.7, 'L': 0.4}
CONTEXTS = ['morning','afterschool','dinner_prep','dinner','evening','weekend','toddler_alone','guest','grammy']

feats = []
with open('features.tsv') as f:
    for row in csv.DictReader(f, delimiter='\t'):
        p = {}
        for tok in row['personas'].split(','):
            k, v = tok.split(':'); p[k] = float(v)
        feats.append(dict(id=int(row['id']), name=row['name'], fn=row['fn'], imp=IMP[row['imp']],
                          personas=p, contexts=set(row['contexts'].split(','))))
ids = [x['id'] for x in feats]; byid = {x['id']: x for x in feats}
n = len(feats)

# reach = Σ_p W_p · a_ip · imp_i  (how much of the household's wall-time a feature serves)
for x in feats:
    x['reach'] = sum(PERSONAS[k][1]*v for k, v in x['personas'].items()) * x['imp']

# persona-projected affinity + context co-occurrence affinity
A = {}; C = {}
for i, j in itertools.combinations(ids, 2):
    xi, xj = byid[i], byid[j]
    a = sum(PERSONAS[k][1]*xi['personas'].get(k,0)*xj['personas'].get(k,0) for k in PERSONAS)
    a *= math.sqrt(xi['imp']*xj['imp'])
    c = len(xi['contexts'] & xj['contexts']) / len(CONTEXTS)
    A[(i,j)] = a; C[(i,j)] = c
meanA = sum(A.values())/len(A); meanC = sum(C.values())/len(C)
LAMBDA = 1.0  # contexts weighted equal to personas after normalisation
G = nx.Graph()
for x in feats: G.add_node(x['id'], **{k: x[k] for k in ('name','fn','reach')})
for (i,j) in A:
    w = A[(i,j)]/meanA + LAMBDA*C[(i,j)]/meanC
    if w > 0: G.add_edge(i, j, weight=w)

def run(res, seed=7):
    part = louvain.best_partition(G, weight='weight', resolution=res, random_state=seed)
    Q = louvain.modularity(part, G, weight='weight')
    comms = {}
    for node, c in part.items(): comms.setdefault(c, []).append(node)
    return Q, comms

results = {}
for res in (0.8, 1.0, 1.2, 1.5):
    Q, comms = run(res)
    results[res] = (Q, comms)
    print(f"resolution {res}: {len(comms)} communities, modularity Q={Q:.3f}")

# choose the resolution with the most communities that is still stable (>=4, Q>0.25)
res = max((r for r in results if len(results[r][1])>=4 and results[r][0]>0.25), default=1.0)
Q, comms = results[res]
print(f"\n=== chosen resolution {res} (Q={Q:.3f}) ===")
out = []
for c, members in sorted(comms.items(), key=lambda kv: -sum(byid[m]['reach'] for m in kv[1])):
    members.sort(key=lambda m: -byid[m]['reach'])
    # persona profile of the community
    prof = {k: round(sum(byid[m]['personas'].get(k,0)*byid[m]['imp'] for m in members)/len(members),2) for k in PERSONAS}
    ctx = {k: sum(1 for m in members if k in byid[m]['contexts']) for k in CONTEXTS}
    fns = {}
    for m in members: fns[byid[m]['fn']] = fns.get(byid[m]['fn'],0)+1
    total_reach = round(sum(byid[m]['reach'] for m in members),2)
    out.append(dict(community=c, size=len(members), reach=total_reach, functions=fns, persona_profile=prof,
                    context_profile=ctx, members=[(m, byid[m]['name'], round(byid[m]['reach'],2)) for m in members]))
    print(f"\nCOMMUNITY {c}  size={len(members)} reach={total_reach}  fns={fns}")
    print("  personas:", {k:v for k,v in sorted(prof.items(), key=lambda kv:-kv[1]) if v>0.15})
    print("  contexts:", {k:v for k,v in sorted(ctx.items(), key=lambda kv:-kv[1]) if v>0})
    for m in members[:14]: print(f"   {m:>3} {byid[m]['name'][:62]:<62} reach={byid[m]['reach']:.2f}")
    if len(members) > 14: print(f"   ... +{len(members)-14} more")

# per-persona top features (what each person's wall should lead with)
print("\n=== per-persona top 8 (a_ip × imp) ===")
top = {}
for k,(label,w) in PERSONAS.items():
    ranked = sorted(feats, key=lambda x: -(x['personas'].get(k,0)*x['imp']))[:8]
    top[k] = [(x['id'], x['name']) for x in ranked]
    print(f"{label}: " + "; ".join(f"{x['id']} {x['name'][:36]}" for x in ranked))

json.dump(dict(resolution=res, modularity=Q, personas=PERSONAS, lambda_context=LAMBDA,
               communities=out, persona_top=top,
               features=[dict(id=x['id'], name=x['name'], fn=x['fn'], imp=x['imp'], reach=round(x['reach'],3),
                              personas=x['personas'], contexts=sorted(x['contexts'])) for x in feats]),
          open('gtia_results.json','w'), indent=1)
# feature-feature affinity for the repo
with open('affinity_matrix.csv','w') as f:
    w = csv.writer(f); w.writerow(['id']+ids)
    for i in ids: w.writerow([i]+[round(G[i][j]['weight'],3) if G.has_edge(i,j) else 0 for j in ids])
with open('persona_feature.csv','w') as f:
    w = csv.writer(f); w.writerow(['id','name','fn','imp','reach']+list(PERSONAS)+CONTEXTS)
    for x in feats: w.writerow([x['id'],x['name'],x['fn'],x['imp'],round(x['reach'],3)]+[x['personas'].get(k,0) for k in PERSONAS]+[1 if c in x['contexts'] else 0 for c in CONTEXTS])
