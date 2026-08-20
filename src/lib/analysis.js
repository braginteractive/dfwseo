// Hand-written analysis, keyed by market (city-industry). Each section declares
// what the graph should highlight while the reader is on it.
//
// EVERY NUMBER HERE IS CHECKED AGAINST data/graphs/<market>.json AND WILL DRIFT
// ON REFRESH. See the pre-publish checklist in docs/operations.md.
export const ANALYSIS = {
  'dallas-roofing': {
    title: 'Who actually holds the links in Dallas roofing',
    lede: `We took twelve Dallas roofing companies from the top of Google's map pack and
           organic results, then pulled every domain linking to two or more of them.
           Here is what is holding that market up.`,
    sections: [
      {
        h: 'Twelve companies, two different lists',
        focus: { focus: 'competitors' },
        body: `<p>Google gives two answers to "who are the Dallas roofers". The map pack
        returns verified businesses near the city center. The organic results return whoever
        has the search authority. <strong>They barely overlap.</strong></p>
        <p>We sampled the top twenty of the map pack and the top of the organic results.
        Exactly <strong>one</strong> company appears in both samples. Both lists continue past
        where we stopped; the point is not how long they are, it is how little they share
        at the top.</p>
        <p>Between them they share <strong>204 referring domains</strong>, meaning sites
        linking to at least two of the twelve. That shared set is the market's link economy.</p>`,
      },
      {
        h: 'Two thirds of it scores zero',
        focus: { focus: 'tier', tier: 'unranked' },
        body: `<p><strong>135 of those 204 domains score zero</strong> on the third-party
        authority metric we use. They are highlighted here.</p>
        <p>Expired domains, scraped statistics pages, auto-generated directories. The kind of
        thing that accumulates without anyone asking for it.</p>
        <p>We should be careful about what that number means. It is one vendor's estimate.
        Other tools score the same domains differently, nobody outside Google can see what
        Google counts, and a link scoring zero may still carry something we cannot measure.</p>
        <p>What we can say is narrower and still useful: these domains are shared by nearly
        everyone here, so they are not what separates these companies from each other.</p>`,
      },
      {
        h: 'One directory reaches every single company',
        focus: { focus: 'connectors', n: 6 },
        body: `<p>Set the low-scoring domains aside and a small group of connectors appears.</p>
        <p><span class="mono">therooferlist.com</span> links to <strong>all twelve</strong>.
        <span class="mono">rooferrate.com</span> and <span class="mono">toplocalroofers.com</span>
        reach nine each.</p>
        <p>Every one is a directory. Cheap, open to anyone, and the only thing the whole
        market has in common.</p>`,
      },
      {
        h: 'The local layer is three aggregators',
        focus: { focus: 'domains', domains: 'tx24h.com,dfwhomefixpros.com,dfwprofessionals.com', withNeighbors: 'true' },
        body: `<p>Across all 204 shared domains, three carry any DFW identity:
        <span class="mono">tx24h.com</span>, <span class="mono">dfwhomefixpros.com</span> and
        <span class="mono">dfwprofessionals.com</span>. All three are aggregators.</p>
        <p>No Dallas newspaper. No chamber of commerce. No trade association.</p>
        <p>Compare that to Dallas family law, where the State Bar of Texas links to nine of
        ten firms, or Dallas remodeling, where the NARI chapter links to seven of ten. Those
        markets have an institution at the center. Roofing has directories.</p>`,
      },
      {
        h: 'Five pockets, no center',
        focus: { focus: 'all' },
        body: `<p>Cluster detection finds five separate groups with no dominant hub joining
        them.</p>
        <p>That cuts both ways. There is no membership to buy your way into. Equally, nobody
        has locked up the position.</p>`,
      },
    ],
  },

  'fort-worth-legal-criminal': {
    title: 'The State Bar links to every criminal defense firm in Fort Worth',
    lede: `Twelve Fort Worth criminal defense firms, taken from the top of Google's map pack and
           organic results. One domain connects all twelve, and it is not a directory.`,
    sections: [
      {
        h: 'Twelve firms, 510 shared referrers',
        focus: { focus: 'competitors' },
        body: `<p>Criminal defense is one of the most valuable search markets in DFW. The three
        legal categories together are worth roughly $1.3m a month in ad-equivalent value, and
        criminal defense alone carries an $82 cost per click.</p>
        <p>These twelve firms share <strong>510 referring domains</strong>, the third-largest
        shared set of any market we have mapped.</p>`,
      },
      {
        h: 'One domain reaches all twelve',
        focus: { focus: 'domains', domains: 'texasbar.com', withNeighbors: 'true' },
        body: `<p><span class="mono">texasbar.com</span>, the State Bar of Texas, links to
        <strong>every single firm</strong> in this market.</p>
        <p>Nothing else in the dataset does that. Not in roofing, not in plumbing, not in
        dentistry. The nearest equivalent is the NARI chapter in Dallas remodeling, which
        reaches seven of ten.</p>
        <p>It is worth being precise about what this shows and what it does not. It does not
        prove the Bar listing is why these firms rank. It shows that membership in the
        profession's governing body is the one thing every firm at the top of this market has
        in common, and that it is an institution rather than a directory anyone can buy into.</p>`,
      },
      {
        h: 'The market has a local publication too',
        focus: { focus: 'domains', domains: 'fortworthinsider.org,fortworth10.com,dfwprofessionals.com', withNeighbors: 'true' },
        body: `<p><span class="mono">fortworthinsider.org</span> reaches nine of the twelve.</p>
        <p>Compare that to Dallas roofing, where the only locally-identified domains in the
        entire shared set are three aggregators. Legal has an institution at the center and a
        local publication alongside it.</p>
        <p>This is the pattern worth taking away from the whole project: <strong>markets with a
        real institutional gatekeeper look nothing like markets without one.</strong></p>`,
      },
      {
        h: 'And still, most of it scores zero',
        focus: { focus: 'tier', tier: 'unranked' },
        body: `<p><strong>403 of the 510 shared domains</strong> score zero on the third-party
        authority metric we use, the highest share of any market here.</p>
        <p>As everywhere on this site, that is a vendor estimate rather than a verdict. What it
        indicates is that even a market organized around a genuine institution accumulates a
        great deal of link noise underneath it.</p>`,
      },
      {
        h: 'Five clusters',
        focus: { focus: 'all' },
        body: `<p>Cluster detection finds five groups. The Bar connects across all of them,
        which is what distinguishes an institution from a hub: it does not belong to one
        pocket of the market.</p>`,
      },
    ],
  },
  'dallas-legal-personal-injury': {
    title: 'The most valuable search market in DFW is owned by directories',
    lede: `Personal injury law is the highest-value local search market we measured, at roughly
           $835,000 a month in ad-equivalent value and a $322 cost per click. Three domains link
           to all twelve firms, and not one of them is an institution.`,
    sections: [
      { h: 'Twelve firms, 886 shared referrers', focus: { focus: 'competitors' },
        body: `<p>These twelve Dallas firms share <strong>886 referring domains</strong>, the
        largest shared set of any market on this site.</p>
        <p>That is what $322 a click buys: a market where everyone is building links, and
        almost everyone is building the same ones.</p>` },
      { h: 'Three domains reach every firm', focus: { focus: 'connectors', n: 4 },
        body: `<p><span class="mono">justia.com</span>, <span class="mono">toplawdog.com</span>
        and <span class="mono">injury-attorney-lawyer.com</span> each link to
        <strong>all twelve</strong>. <span class="mono">expertise.com</span> reaches eleven.</p>
        <p>All four are legal directories. Open to anyone, national in scope, and carrying no
        connection to Dallas whatsoever.</p>` },
      { h: 'The State Bar reaches nine, not twelve', focus: { focus: 'domains', domains: 'texasbar.com', withNeighbors: 'true' },
        body: `<p><span class="mono">texasbar.com</span> links to nine of the twelve.</p>
        <p>Compare Fort Worth criminal defense, where the State Bar reaches every firm. Same
        institution, same state, different practice area, and the pattern breaks.</p>
        <p>Personal injury is the practice area with the most money in it and the least
        institutional structure holding it together. Those two facts are probably related.</p>` },
      { h: 'Seven pockets, 69% scoring zero', focus: { focus: 'tier', tier: 'unranked' },
        body: `<p><strong>69%</strong> of the 886 shared domains score zero on the third-party
        authority metric we use, and cluster detection finds seven separate groups.</p>
        <p>A market this valuable attracts a great deal of link building. Most of it lands in
        places no provider has found reason to rate.</p>` },
    ],
  },

  'dallas-legal-family': {
    title: 'Divorce law runs on the Bar and a handful of directories',
    lede: `Twelve Dallas divorce firms share only 199 referring domains, one of the smallest
           shared sets on this site for a market worth $226,000 a month.`,
    sections: [
      { h: 'A small shared set for a large market', focus: { focus: 'competitors' },
        body: `<p>199 shared referring domains across twelve firms. Personal injury, a related
        practice area in the same city, has 886.</p>
        <p>Family law clients arrive through referral and reputation more than through link
        building, and the shared link set reflects that.</p>` },
      { h: 'The Bar again', focus: { focus: 'domains', domains: 'texasbar.com,dallasbar.org', withNeighbors: 'true' },
        body: `<p><span class="mono">texasbar.com</span> reaches nine of twelve.
        <span class="mono">dallasbar.org</span>, the Dallas Bar Association, reaches three.</p>
        <p>Two institutions, one state and one local, and they are the only domains in the
        shared set with any claim to authority over this profession.</p>` },
      { h: 'Eight pockets, the most fragmented market here', focus: { focus: 'all' },
        body: `<p>Cluster detection finds <strong>eight</strong> separate groups, more than any
        other market we mapped.</p>
        <p>These firms are not competing over the same links. They are barely in the same
        network.</p>` },
    ],
  },

  'dallas-dental': {
    title: 'Dallas dentistry: no company appears in both lists',
    lede: `Google's map pack and organic results both answer "who are the Dallas dentists".
           They return completely different sets of businesses. Not partially different.
           Completely.`,
    sections: [
      { h: 'Zero overlap', focus: { focus: 'competitors' },
        body: `<p>We sampled the top of both lists. <strong>Not one business appears in
        both.</strong></p>
        <p>Across all forty markets on this site, overlap averages around 8%. Dentistry is zero
        in Dallas and zero in Fort Worth, the only industry where that happens twice.</p>
        <p>Winning the map pack and winning organic are not the same job here. They may not
        even be the same market.</p>` },
      { h: 'What connects them', focus: { focus: 'connectors', n: 6 },
        body: `<p><span class="mono">lantern.llc</span> reaches ten of twelve and
        <span class="mono">dentalpedia.co</span> nine.</p>
        <p>Both are directories. With no overlap between the two lists, directories are doing
        the work of holding this market together.</p>` },
      { h: 'Almost nothing local', focus: { focus: 'domains', domains: 'fortworth10.com,thegarlandtexan.com', withNeighbors: 'true' },
        body: `<p>Two domains in the entire shared set carry a DFW identity, and each reaches
        only two of the twelve.</p>
        <p>For a profession this embedded in neighborhoods, there is remarkably little local
        connective tissue in the link data.</p>` },
    ],
  },

  'fort-worth-dental-ortho': {
    title: 'Orthodontics has a local hub, and it is a listings site',
    lede: `Twelve Fort Worth orthodontic practices, 216 shared referring domains, and one
           locally-named domain reaching two thirds of them.`,
    sections: [
      { h: 'Twelve practices', focus: { focus: 'competitors' },
        body: `<p>Orthodontics is worth about $146,000 a month across DFW, most of it in
        high-volume terms like invisalign and braces.</p>
        <p>These twelve practices share 216 referring domains.</p>` },
      { h: 'A local domain in the top three', focus: { focus: 'domains', domains: 'fortworth10.com,dfwprofessionals.com', withNeighbors: 'true' },
        body: `<p><span class="mono">fortworth10.com</span> reaches <strong>eight of
        twelve</strong>, behind only <span class="mono">lantern.llc</span> and
        <span class="mono">dentistsranked.com</span>.</p>
        <p>That is unusual. In most markets on this site the locally-named domains sit far down
        the list. Here one is close to the top.</p>
        <p>It is still a listings site rather than a publication or an association. But it is
        a listings site that decided to be about Fort Worth.</p>` },
      { h: 'Dense, with no hierarchy', focus: { focus: 'all' },
        body: `<p>Four clusters and a mesh structure: these practices are cross-linked through
        many of the same directories without any one of them dominating.</p>` },
    ],
  },

  'dallas-med-spa': {
    title: 'Med spas are held together by a Texas beauty directory',
    lede: `The most locally-capturable market we measured. Ten of the top twelve organic results
           are local businesses, and the domain connecting them is built specifically for Texas.`,
    sections: [
      { h: 'A genuinely local market', focus: { focus: 'competitors' },
        body: `<p>Med spa is the most locally-winnable market in the whole study: 10 of the top
        12 organic results are local businesses, against 2 of 12 for something like car
        insurance.</p>
        <p>Twelve Dallas med spas share 180 referring domains.</p>` },
      { h: 'texasbeautydirectory.com reaches eight', focus: { focus: 'domains', domains: 'texasbeautydirectory.com', withNeighbors: 'true' },
        body: `<p>A state-level vertical directory, reaching <strong>eight of twelve</strong>.</p>
        <p>This is the closest thing to a regional institution we found outside law and
        remodeling. Not a chamber, not an association, but not a generic national listings farm
        either. Something built for this industry in this state.</p>` },
      { h: 'Eight pockets underneath', focus: { focus: 'all' },
        body: `<p>Cluster detection finds eight groups, and 60% of the shared set scores zero,
        the lowest share of any market here.</p>
        <p>Lower than average noise, a real vertical hub, and mostly local businesses. By the
        measures on this site, med spa is the healthiest market we mapped.</p>` },
    ],
  },

  'fort-worth-garage-doors': {
    title: 'Garage doors: 599 shared domains and nothing to show for it',
    lede: `A $138,000-a-month market with one of the largest shared link sets on this site,
           almost entirely composed of directories built for exactly this purpose.`,
    sections: [
      { h: 'Twelve companies, 599 shared referrers', focus: { focus: 'competitors' },
        body: `<p>Garage door repair carries a $59 cost per click and ranks ninth of the
        forty-eight industries we priced, ahead of med spa and foundation repair.</p>
        <p>These twelve Fort Worth companies share <strong>599 referring domains</strong>.</p>` },
      { h: 'Purpose-built directories', focus: { focus: 'connectors', n: 6 },
        body: `<p><span class="mono">prosgrade.com</span> reaches ten of twelve.
        <span class="mono">garagedoorrepairnearme.info</span> reaches nine.
        <span class="mono">911garagedoorrepairpros.com</span> reaches eight.</p>
        <p>Read those domain names again. They exist to list garage door companies. Nothing
        else.</p>` },
      { h: 'The local layer is two aggregators', focus: { focus: 'domains', domains: 'tx24h.com,texasonthemap.com', withNeighbors: 'true' },
        body: `<p><span class="mono">tx24h.com</span> reaches six,
        <span class="mono">texasonthemap.com</span> four. Both are aggregators.</p>
        <p>No local publication, no association, no chamber. 71% of the shared set scores
        zero.</p>` },
    ],
  },

  'fort-worth-pest-control': {
    title: 'The one market where DFW-named domains lead',
    lede: `In almost every market on this site, locally-named domains sit far down the
           connector list. Pest control in Fort Worth is the exception.`,
    sections: [
      { h: 'Twelve companies, 797 shared referrers', focus: { focus: 'competitors' },
        body: `<p>Pest control is worth about $107,000 a month across DFW at a $39 cost per
        click.</p>
        <p>These twelve Fort Worth companies share <strong>797 referring domains</strong>, the
        fourth-largest shared set here.</p>` },
      { h: 'A DFW domain at the top', focus: { focus: 'domains', domains: 'dfwprofessionals.com,tx24h.com,dfwhomefixpros.com', withNeighbors: 'true' },
        body: `<p><span class="mono">dfwprofessionals.com</span> is the
        <strong>single widest-reaching connector</strong> in this market at eight of twelve.
        <span class="mono">tx24h.com</span> reaches seven and
        <span class="mono">dfwhomefixpros.com</span> seven.</p>
        <p>Three of the top connectors carry a DFW name. That does not happen anywhere else in
        this study.</p>
        <p>They are aggregators rather than publications, so this is not a local editorial
        layer. But it is the closest any home-services market here comes to one.</p>` },
      { h: 'Still a mesh', focus: { focus: 'all' },
        body: `<p>Five clusters, densely cross-linked, no single dominant hub. 62% of the
        shared set scores zero, which is low by the standards of this site.</p>` },
    ],
  },

  'dallas-moving': {
    title: 'Movers built a link economy on city listing sites',
    lede: `597 shared referring domains across twelve Dallas moving companies, led by generic
           city directories and one that is actually about Dallas.`,
    sections: [
      { h: 'Twelve companies, 597 shared referrers', focus: { focus: 'competitors' },
        body: `<p>Moving is worth about $108,000 a month across DFW at a $26 cost per click,
        ranking twelfth of forty-eight.</p>` },
      { h: 'City directories, and one local one', focus: { focus: 'connectors', n: 6 },
        body: `<p><span class="mono">usacityyp.com</span> reaches eleven of twelve and
        <span class="mono">movespots.com</span> ten.</p>
        <p>Then <span class="mono">dallasnav.com</span> at <strong>nine of twelve</strong>, one
        of the highest reaches any DFW-named domain achieves anywhere on this site.</p>` },
      { h: 'Six pockets, 72% scoring zero', focus: { focus: 'tier', tier: 'unranked' },
        body: `<p>Beneath the directories, six disconnected groups and a large volume of
        domains no provider rates.</p>` },
    ],
  },

  'fort-worth-insurance-agency': {
    title: 'Insurance agencies are connected by lead generation, not community',
    lede: `The largest search market in DFW by ad spend belongs to national carriers. What is
           left for local agencies is organized by the companies that sell them leads.`,
    sections: [
      { h: 'Why this market is smaller than it looks', focus: { focus: 'competitors' },
        body: `<p>Insurance tops our value table at $1.36m a month, but that is Geico, Allstate
        and Nationwide money. On <span class="mono">"car insurance quote"</span> only 2 of the
        top 12 results are local businesses.</p>
        <p>On <span class="mono">"insurance agency"</span> it is 6 of 12, so that is the term we
        map. The real local market is a fraction of the headline.</p>` },
      { h: 'One domain reaches eleven of twelve', focus: { focus: 'domains', domains: 'beforeinsuranceusa.com', withNeighbors: 'true' },
        body: `<p><span class="mono">beforeinsuranceusa.com</span> links to
        <strong>eleven of the twelve</strong> agencies, making this the most hub-dominated
        market on the site.</p>
        <p>It is lead generation infrastructure. The thing holding these agencies together is
        the industry that sells to them.</p>` },
      { h: 'Barely any local presence', focus: { focus: 'domains', domains: 'dfwprofessionals.com,insurefortworth.com', withNeighbors: 'true' },
        body: `<p><span class="mono">dfwprofessionals.com</span> reaches four and
        <span class="mono">insurefortworth.com</span> two.</p>
        <p>Independent agencies are among the most locally-rooted businesses in any community.
        Almost none of that shows up in link data.</p>` },
    ],
  },

  'dallas-hvac': {
    title: 'HVAC: high value, scattered links',
    lede: `The third most valuable local search market in DFW, and its twelve Dallas companies
           barely share a link profile.`,
    sections: [
      { h: 'Twelve companies, 270 shared referrers', focus: { focus: 'competitors' },
        body: `<p>HVAC is worth about $244,000 a month across DFW at a $47 cost per click,
        behind only insurance and personal injury law.</p>
        <p>Yet these twelve share only 270 referring domains, fewer than garage doors or
        moving.</p>` },
      { h: 'No dominant connector', focus: { focus: 'connectors', n: 6 },
        body: `<p>The widest reach is <span class="mono">emergencyacrepairnow.com</span> at nine
        of twelve. Nothing else clears eight.</p>
        <p>Cluster detection calls this scattered: little overlap, no center.</p>` },
      { h: 'The DFW aggregators show up', focus: { focus: 'domains', domains: 'tx24h.com,dfwhomefixpros.com,dfwprofessionals.com', withNeighbors: 'true' },
        body: `<p><span class="mono">tx24h.com</span> reaches six,
        <span class="mono">dfwhomefixpros.com</span> five,
        <span class="mono">dfwprofessionals.com</span> four.</p>
        <p>The same three aggregators appear across most home-services markets here. They are
        the closest thing DFW has to shared local infrastructure, and none of them is a
        publisher.</p>` },
    ],
  },

  'dallas-plumbing': {
    title: 'Plumbing has the cleanest link profile in DFW',
    lede: `Only 56% of the shared set scores zero, the lowest share of any market on this site,
           and DFW-named domains reach three quarters of the companies.`,
    sections: [
      { h: 'Twelve companies, 773 shared referrers', focus: { focus: 'competitors' },
        body: `<p>Plumbing is the fourth most valuable local market in DFW at roughly $240,000 a
        month, and searches for it are the highest-volume of any trade we measured.</p>` },
      { h: 'The least noisy market here', focus: { focus: 'tier', tier: 'unranked' },
        body: `<p><strong>56%</strong> of the 773 shared domains score zero. That is the lowest
        share of any of the forty markets on this site, where the range runs to 85%.</p>
        <p>Still more than half. But by the standards of local link data, comparatively
        clean.</p>` },
      { h: 'DFW domains reach nine of twelve', focus: { focus: 'domains', domains: 'tx24h.com,dfwhomefixpros.com,dfwprofessionals.com', withNeighbors: 'true' },
        body: `<p><span class="mono">tx24h.com</span> and
        <span class="mono">dfwhomefixpros.com</span> each reach <strong>nine of twelve</strong>,
        matching the top national directories.</p>
        <p>Whatever these aggregators are, Dallas plumbers have adopted them more thoroughly
        than any other trade in this study.</p>` },
    ],
  },

  'dallas-foundation-repair': {
    title: 'A market shaped by the ground underneath it',
    lede: `North Texas clay soil makes foundation repair a regional industry in a way roofing or
           painting never will be. The link data shows a market organized around that.`,
    sections: [
      { h: 'Twelve companies, 312 shared referrers', focus: { focus: 'competitors' },
        body: `<p>Foundation repair carries an $83 cost per click, the third highest of any
        trade we priced, behind only legal and insurance categories.</p>
        <p>Expansive clay soil across North Texas makes this a standing local industry rather
        than a storm-driven one.</p>` },
      { h: 'A DFW domain ties for the widest reach', focus: { focus: 'domains', domains: 'dfwhomefixpros.com,dfwprofessionals.com', withNeighbors: 'true' },
        body: `<p><span class="mono">dfwhomefixpros.com</span> reaches <strong>ten of
        twelve</strong>, tied with <span class="mono">concreteworks.io</span> for the widest
        reach in this market.</p>
        <p>That is the highest any DFW-named domain reaches anywhere in this study.</p>` },
      { h: 'Specialist directories fill the rest', focus: { focus: 'connectors', n: 6 },
        body: `<p><span class="mono">slablocal.com</span> and
        <span class="mono">crawllocal.com</span> each reach nine. Both exist specifically for
        foundation and crawlspace contractors.</p>
        <p>Six clusters, 73% scoring zero. A specialist market with specialist directories and
        no institution above them.</p>` },
    ],
  },

  'fort-worth-electrical': {
    title: 'The noisiest market we mapped',
    lede: `85% of the domains shared across Fort Worth electricians score zero. That is the
           highest share of any of the forty markets on this site.`,
    sections: [
      { h: 'Twelve companies, 228 shared referrers', focus: { focus: 'competitors' },
        body: `<p>Electrical work is worth about $79,000 a month across DFW at a $19 cost per
        click, mid-table among the trades.</p>` },
      { h: '85% scores zero', focus: { focus: 'tier', tier: 'unranked' },
        body: `<p><strong>194 of the 228 shared domains</strong> score zero on the third-party
        authority metric we use.</p>
        <p>The comparable figure for Dallas plumbing is 56%. Same metro, same kind of trade,
        thirty points apart.</p>
        <p>As always, that is a vendor estimate and not a verdict. What it indicates is that
        almost nothing these electricians share is a domain any provider has rated.</p>` },
      { h: 'What is left is two aggregators', focus: { focus: 'domains', domains: 'dfwprofessionals.com,tx24h.com', withNeighbors: 'true' },
        body: `<p>Strip the unrated domains and the widest reaches belong to
        <span class="mono">dfwprofessionals.com</span> and
        <span class="mono">tx24h.com</span>, at eight of twelve each.</p>
        <p>Three clusters, scattered, no center. There is very little here.</p>` },
    ],
  },

  'dallas-remodeling': {
    title: 'Remodeling has an association, and most firms are not in it',
    lede: `NARI Dallas is the kind of institution that reshapes a market's link graph. In this
           sample it reaches four of twelve firms.`,
    sections: [
      { h: 'Twelve firms, 219 shared referrers', focus: { focus: 'competitors' },
        body: `<p>Remodeling is worth about $37,000 a month across DFW in direct search value,
        though the ticket sizes behind those searches are among the largest of any trade here.</p>` },
      { h: 'The association reaches a third', focus: { focus: 'domains', domains: 'naridallas.org', withNeighbors: 'true' },
        body: `<p><span class="mono">naridallas.org</span>, the local chapter of the National
        Association of the Remodeling Industry, links to <strong>four of twelve</strong>.</p>
        <p>It is the only membership institution in this market, and two thirds of these firms
        are outside it.</p>
        <p>Compare Fort Worth criminal defense, where the State Bar reaches every firm because
        practicing law without Bar membership is not possible. Remodeling has no such
        requirement, and the link graph shows the difference.</p>` },
      { h: 'Directories take the top spots', focus: { focus: 'connectors', n: 6 },
        body: `<p><span class="mono">howtohome.co</span> reaches nine of twelve,
        <span class="mono">lantern.llc</span>, <span class="mono">handyhubb.com</span> and
        <span class="mono">kitchlify.com</span> eight each.</p>
        <p>The association is real but it is not the center. The directories are.</p>` },
    ],
  },
}
