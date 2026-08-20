# Methodology and why

Written 2026-08-19. Every choice here was measured, not assumed. Numbers are
from live tests; the commands that produced them are in `scripts/`.

## 1. Two cities, not one metro, and not thirty suburbs

**Decision:** Dallas and Fort Worth as separate markets. No suburb pages.

**Why:** We ran `"roofing company"` localised to each city and compared the
top 10 local companies.

    Dallas      dallasroofer · priorityroofs · firehouseroofing · premier-roofing
                weroofdallas · alowcostroofingdallas · bumbleroofing
    Fort Worth  tarrantroofing · texcoreconstruction · lonsmith · priorityroofs
                tarrantcountyroofing · fortworthroofing · astarroofingoftexas

**Overlap: 2 of 10**, and one of those two is forbes.com. Fort Worth has its own
companies and its own naming conventions. These are genuinely two link markets,
which is what the domain name implies and now what the data supports.

Suburbs are a different story and deliberately untested-and-unbuilt. DFW home
services companies serve the whole metro, so Plano/Frisco/Arlington pages would
very likely be near-duplicates. Thirty cities x twenty industries is 600 pages
of thin programmatic content, which on a site whose entire claim is SEO
expertise would be self-defeating. If we ever want them, run the overlap test
first.

## 2. Unqualified queries, localised

**Decision:** search `"roofing company"` from Dallas, not `"dallas roofing company"`.

**Why:** They return different markets. Measured overlap between the two, same
city, same day:

| Comparison | Overlap |
|---|---|
| Dallas: qualified vs unqualified | **3/10** |
| Fort Worth: qualified vs unqualified | 4/10 |

Seven of ten companies differ. That is not a rounding error, it is a different
analysis.

We use the unqualified term because:

1. Nobody in Dallas types their own city name. It is what a real local searcher
   sees.
2. It is the higher-volume term.
3. It is the harder position to attack. The obvious critique of a local SEO
   study is "real local search is unqualified head terms plus Google Business
   Profile" -- and that critique lands squarely on the qualified variant.

**The head term is a proxy for the market, not a keyword recommendation.** We
use it to identify who currently holds authority in a market. We are not
suggesting anyone should target it. The link graph is the subject; the keyword
is only how we find the participants.

Head terms are picked per city from live search volume among candidates rather
than guessed (`term-*.json` records the candidates and their volumes), because
phrasing dominance varies: "plumber" and "plumbing company" are not
interchangeable, and the winner differs between cities.

## 3. Aggregators are identified by data, not a hand-written list

**Decision:** a domain is a platform, not a local business, if it ranks for
10,000+ keywords nationally, or sits on a .gov / .edu TLD.

**Why:** the original approach was a regex of known aggregator names. That is
unmaintainable, silently incomplete, and embarrassing when it misses one. Our
first version missed local.yahoo.com, cityof.com, forbes.com and
thegoodcontractorslist.com.

National organic keyword count separates them cleanly:

| Domain | National keywords |
|---|---|
| yelp.com | 31,325,747 |
| forbes.com | 4,380,325 |
| local.yahoo.com | 3,236,513 |
| homeadvisor.com | 641,245 |
| **bertroofing.com** | **969** |
| **tarrantroofing.com** | **641** |
| **dallasroofer.com** | **442** |
| **texcoreconstruction.com** | **304** |

Three orders of magnitude between the extremes -- but 50,000 was our first
threshold and it was WRONG. It was calibrated against yelp vs contractors, and
career/reference sites sit in the middle and sailed through: `"electrician"` in
Fort Worth returned a licensing board, a trade school and three career sites as
"local businesses".

Recalibrated against the full competitor pool, the real boundary is much lower:

| | National keywords |
|---|---|
| largest genuine local business (berkeys.com) | **4,992** |
| smallest reference/career site (apprenticeship.gov) | **16,410** |
| truity.com | 47,440 |
| onetonline.org | 43,370 |
| budgetdumpster.com | 28,847 |
| nahb.org | 20,625 |

10,000 sits in that gap. Licensing boards and trade schools have tiny
footprints (tdlr.texas.gov: 102) so no threshold catches them; the .gov/.edu
rule does, and a government or education domain is never a local contractor.

Result: 19 of 20 markets clean, from 15 of 20 before.

Counts are cached in `data/raw/_footprints.json` so each domain is priced once.

### Aggregators are excluded from the COMPETITOR SET ONLY

This matters and is easy to get wrong. Platforms are held back from the ten
companies whose backlinks we intersect, because they are link *targets*, not
local competitors -- Yelp is not competing with Bert Roofing for roofing jobs.

**They remain fully present in the graph as referring domains.** Yelp linking to
five of ten roofers is a real and interesting part of the link economy, and the
leaderboard, matrix and graph all include them. Filtering them out of the
analysis would be throwing away signal.

The held-back platforms for each market are recorded in
`competitors-<city>-<industry>.json` under `platforms`, with their keyword
counts, so the exclusion is auditable rather than invisible.

## 3. Competitors come from two sources, and we say which

**Decision:** a market's competitor set is the merge of Google Maps results and
classifier-filtered organic results. Every competitor records which source(s) it
came from.

| Source | What it measures | Weakness |
|---|---|---|
| **Maps** | a verified Google Business Profile near the city centroid | proximity-weighted; reflects businesses near the centroid, not the whole city |
| **Organic** | ranks in the unqualified organic SERP | authority-weighted; pulls in directories, chains and manufacturers |

Neither alone is right, and their weaknesses are opposite, which is why we keep
both and label them.

**A business in BOTH is the strongest signal in the dataset**: locally real and
organically competitive. Competitors are ordered both-first, then Maps by review
count, then organic by position.

### Why this was necessary

Organic-only selection put `network.procore.com` (construction SaaS),
`cedur.com` (a roofing manufacturer), `bidwolf.io` (lead-gen SaaS),
`getpitchwork.com`, `meetaroofer.com` and `roofcompanyreviews.com` into the
"top Dallas roofers". Each round of exclusions surfaced more. The exclusion list
had reached 44 domains and was still growing -- a treadmill, not a solution.

Maps returns, for the same query, 20 of 20 verified Dallas roofing businesses
with addresses and review counts: newviewroofing.com (694 reviews),
arringtonroofing.com (356), weroofdallas.com (208). Zero directories, zero
manufacturers, zero SaaS. Cost: $0.002 per market.

### Known limitation: Maps is proximity-weighted

`location_code` resolves to a **city centroid**, so Dallas Maps results reflect
businesses near downtown. A search from Highland Park or Deep Ellum would return
a different set. This is real and we do not correct for it -- sampling a grid of
neighborhood coordinates per city would multiply cost and complexity for a
study about links, not rankings.

It is disclosed instead, and it is one reason we keep the organic source
alongside: organic results are not proximity-weighted, so the two together cover
more of the market than either does alone.

The exclusion list survives, much smaller in importance, because the organic
source still needs it.

## 3a. Where the automatic classifier stops working

The footprint test has a hard ceiling, and it is worth being precise about
where. It cleanly separates **platforms** from local businesses. It cannot
separate **national chains, vertical directories, manufacturers or out-of-area
businesses**, because those sit inside the same footprint range as genuine
locals:

| Domain | National keywords | Actually |
|---|---|---|
| muvr.io | 9,687 | national moving marketplace |
| **dunhamlaw.com** | **8,867** | **real Fort Worth criminal lawyer** |
| medspa.com | 6,570 | vertical directory |
| 3menmovers.com | 4,511 | Houston chain |
| aligntech.com | 1,486 | makes Invisalign, not an orthodontist |
| **fortworthmedspa.com** | **1,543** | **real local med spa** |
| **fortworthpest.com** | **121** | **real local exterminator** |

There is no threshold that puts dunhamlaw.com and muvr.io on opposite sides.
Tuning the number further is provably futile.

### The answer: a small reviewed exclusion list

`data/excluded-domains.json` holds ~18 domains, each with a reason. It is
deliberately **not** the sprawling regex of aggregator names this project
already removed once. The difference:

- It handles only the residue the automatic classifier cannot, roughly 4% of
  competitor slots. The footprint and TLD rules still do ~96% of the work.
- Every entry carries a stated reason.
- It is versioned and reviewed at each refresh (docs/operations.md).

Some judgment here is irreducible. Bounding it to a short auditable list, and
saying so, is more honest than a threshold that pretends to work.

### Trade associations

Associations (iiat.org, nahb.org, naridallas.org) are excluded as *competitors*
-- they are not businesses competing for the work -- but they are among the most
valuable nodes in the graph. naridallas.org links to 7 of the top 10 Dallas
remodelers. Never filter these out of the referring-domain data.

## 3b. Known limitation: out-of-area small businesses

The footprint test answers "is this a national platform". It cannot answer "is
this business in this city". A small out-of-area company looks identical to a
small local one:

    codylandscape.com          73 keywords   Fort Worth landscaper
    austinhomerenovations.com 302 keywords   Austin remodeler, ranks in Fort Worth

One such domain survives in the current data (austinhomerenovations.com in
fort-worth-remodeling). It is a genuine Google result for that query in that
city, so including it is defensible, but it is noise for a local link study.

Two approaches were tested and rejected:

- **Local pack / Maps data.** The `advanced` SERP endpoint does return
  `local_pack` items with real local businesses, but they are a different set
  from the organic results, so they cannot filter organic domains.
- **City-level traffic estimation.** DataForSEO Labs endpoints reject city
  location codes (error 40501); they only accept country/region level.

Name-based rules (excluding domains containing "austin") were deliberately not
added -- that is the fragile hand-maintained regex this whole section exists to
remove. The limitation is disclosed instead.

## 4. Adaptive head-term selection

Terms are tried in descending volume order and the first that yields a
sufficiently local competitor pool is kept. This exists because occupation
nouns behave inconsistently: `"plumber"` (2,900/mo) returns clean local
plumbers, while `"electrician"` and `"landscaper"` originally returned career
sites. Rather than ban bare nouns and lose the best terms, we verify the
outcome and fall back only when needed.

Selected terms and their rejected candidates are recorded in `term-*.json`.

## 5. Rank and spam scores are vendor estimates, and the copy must say so

The site originally said a percentage of domains "carry no measurable
authority". That is an overclaim and it was wrong to publish.

What we have is one provider's `rank` (0-1000) and `backlinks_spam_score`
(0-100). Neither is a Google metric. Another tool scoring the same domains
produces different numbers because every provider models this differently from
a different crawl.

A zero rank does NOT establish that:

- Google assigns the domain no value. Nobody outside Google can see that.
- The link does nothing. Nofollow links, unlinked brand mentions and plain
  citations can carry weight no backlink index scores, and increasingly feed
  retrieval and training systems that are not classical search.
- Another vendor would agree.

The defensible reading of a zero score is narrower: no provider has found reason
to rate this domain. And when most of a market's shared links score zero, the
useful statement is **"these are held by nearly everyone, so they are not what
separates these companies"**, not "these are worthless".

**Reach is the exception.** How many of the companies a domain links to is a
direct count from the intersection data, not an estimate. It is the one number
on the site that is not modeled, which is why connector tables sort by it.

Copy rule: never assert what a link does. Name the metric, attribute it, and
state what it does and does not support.

## 6. What we do not claim

Every figure describes what is publicly observable in link data. None of it is a
claim about any company's intent. Where the data shows an unusual pattern -- for
example a set of unrelated domains linking to the same two companies and almost
nothing else -- we describe the pattern and let the reader draw the conclusion.

We do not name our data vendor on the public site. That is a competitive
decision, not a transparency one; the methodology above is the part that
matters, and it is public.
