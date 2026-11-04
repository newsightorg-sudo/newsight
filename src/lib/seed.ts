import { getDb } from './db';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  const db = getDb();

  // Check if already seeded
  const checkArticles = db.prepare('SELECT COUNT(*) as count FROM articles').get() as { count: number };
  if (checkArticles && checkArticles.count > 0) {
    return; // Already populated
  }

  console.log('Seeding The Daily Signal editorial database...');

  // 1. Editorial Settings
  const settings = [
    ['publication_name', 'THE DAILY SIGNAL'],
    ['tagline', 'Independent Journalism • Uncompromising Truth'],
    ['primary_color', '#0f172a'],
    ['accent_color', '#b91c1c'],
    ['breaking_banner_active', '1'],
    ['breaking_headline', 'Supreme Court Reserves Verdict on Constitutional Challenge to Digital Intermediary Safeguards'],
    ['breaking_url', '/article/supreme-court-reserves-verdict-constitutional-challenge-digital-data'],
    ['breaking_time', 'Just In'],
    ['contact_email', 'editorial@dailysignal.com'],
    ['contact_phone', '+91 11 2345 6789'],
    ['address', 'Signal Media Tower, 44 Press Enclave, New Delhi 110017, India'],
    ['twitter_url', 'https://twitter.com/thedailysignal'],
    ['facebook_url', 'https://facebook.com/thedailysignal'],
    ['instagram_url', 'https://instagram.com/thedailysignal'],
    ['youtube_url', 'https://youtube.com/thedailysignal'],
    ['footer_text', '© 2026 The Daily Signal News Media Foundation. Published under journalistic independence guidelines. All rights reserved.'],
    ['ads_enabled', '0']
  ];

  const insertSetting = db.prepare('INSERT OR REPLACE INTO editorial_settings (key, value) VALUES (?, ?)');
  for (const [k, v] of settings) {
    insertSetting.run(k, v);
  }

  // 2. Users
  const superAdminPass = await bcrypt.hash('Newsroom2026!', 10);
  const reporterPass = await bcrypt.hash('Reporter2026!', 10);

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, avatar_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();

  insertUser.run(
    'usr-1',
    'Siddharth Nair',
    'editor@dailysignal.com',
    superAdminPass,
    'SUPER_ADMIN',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    now
  );

  insertUser.run(
    'usr-2',
    'Ayesha Sen',
    'ayesha.sen@dailysignal.com',
    reporterPass,
    'EDITOR',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    now
  );

  insertUser.run(
    'usr-3',
    'K. R. Madhavan',
    'madhavan@dailysignal.com',
    reporterPass,
    'REPORTER',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    now
  );

  insertUser.run(
    'usr-4',
    'Dr. Elena Vance',
    'elena.vance@dailysignal.com',
    reporterPass,
    'REPORTER',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    now
  );

  insertUser.run(
    'usr-5',
    'Vikramaditya Roy',
    'vikram.roy@dailysignal.com',
    reporterPass,
    'REPORTER',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    now
  );

  insertUser.run(
    'usr-6',
    'Priya Chawla',
    'priya.chawla@dailysignal.com',
    reporterPass,
    'REPORTER',
    'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80',
    now
  );

  // 3. Reporters
  const insertReporter = db.prepare(`
    INSERT INTO reporters (id, user_id, name, slug, title, beat, bio, avatar_url, email, twitter, linkedin, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);

  insertReporter.run(
    'rep-1',
    'usr-1',
    'Siddharth Nair',
    'siddharth-nair',
    'Editor-in-Chief & Legal Affairs Lead',
    'Constitutional Governance & Judiciary',
    'Siddharth has spent over two decades covering the Supreme Court of India, parliamentary jurisprudence, and institutional reform. Former foreign fellow at the Oxford Reuters Institute.',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    'siddharth.nair@dailysignal.com',
    '@siddharth_signal',
    'linkedin.com/in/siddharth-nair-media',
    now
  );

  insertReporter.run(
    'rep-2',
    'usr-2',
    'Ayesha Sen',
    'ayesha-sen',
    'Diplomatic Editor',
    'Geopolitics & Multilateral Pacts',
    'Ayesha reports on South Asian security architectures, Indo-Pacific maritime pacts, and UN climate assemblies from New Delhi and multilateral summits across Europe and Southeast Asia.',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    'ayesha.sen@dailysignal.com',
    '@ayeshasen_world',
    'linkedin.com/in/ayeshasen',
    now
  );

  insertReporter.run(
    'rep-3',
    'usr-3',
    'K. R. Madhavan',
    'k-r-madhavan',
    'Southern Bureau Chief',
    'Kerala, Coastal Ecology & Maritime Trade',
    'Stationed in Kochi and Thiruvananthapuram, Madhavan oversees Southern state coverage with deep expertise in Western Ghats conservation, port infrastructure, and local self-government institutions.',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    'madhavan@dailysignal.com',
    '@krmadhavan_news',
    'linkedin.com/in/krmadhavan',
    now
  );

  insertReporter.run(
    'rep-4',
    'usr-4',
    'Dr. Elena Vance',
    'elena-vance',
    'Science & Energy Editor',
    'Space Exploration, Quantum Tech & Grid Transitions',
    'With a PhD in Astro-geophysics and twelve years in science reporting, Elena deconstructs deep-space satellite missions, fusion research, and national renewable grid transformations.',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    'elena.vance@dailysignal.com',
    '@elenavance_sci',
    'linkedin.com/in/elenavance',
    now
  );

  insertReporter.run(
    'rep-5',
    'usr-5',
    'Vikramaditya Roy',
    'vikramaditya-roy',
    'Chief Economics Writer',
    'Macroeconomics, Banking & Trade Policy',
    'Vikramaditya scrutinizes monetary policy resolutions, fiscal deficits, sovereign bond issuances, and global trade realignments. Formerly financial correspondent at Dalal Street and Singapore.',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    'vikram.roy@dailysignal.com',
    '@vikram_macro',
    'linkedin.com/in/vikramadityaroy',
    now
  );

  insertReporter.run(
    'rep-6',
    'usr-6',
    'Priya Chawla',
    'priya-chawla',
    'Senior Investigative Correspondent',
    'Environmental Compliance & Corporate Transparency',
    'Priya specializes in data-driven public interest investigations, tracking environmental violations, riverbed resource extraction, and corporate governance accountability across industrial corridors.',
    'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80',
    'priya.chawla@dailysignal.com',
    '@priyachawla_inv',
    'linkedin.com/in/priyachawla',
    now
  );

  // 4. Categories
  const categories = [
    ['cat-1', 'Top Stories', 'top-stories', 'Essential lead reporting and major developing headlines.', '#0f172a', 1, 1],
    ['cat-2', 'India', 'india', 'National governance, federal policy, judiciary, and states coverage.', '#b91c1c', 2, 1],
    ['cat-3', 'Kerala', 'kerala', 'Regional reporting from all 14 districts: ecology, politics, trade, culture.', '#047857', 3, 1],
    ['cat-4', 'World', 'world', 'Global affairs, diplomacy, multilateral pacts, and international conflict.', '#1d4ed8', 4, 1],
    ['cat-5', 'Politics', 'politics', 'Elections, legislative debates, party manifestos, and governance analysis.', '#7c2d12', 5, 1],
    ['cat-6', 'Business', 'business', 'Macroeconomics, markets, trade policy, industry, and banking systems.', '#0f766e', 6, 1],
    ['cat-7', 'Technology', 'technology', 'Artificial intelligence, semiconductors, digital rights, and startups.', '#4338ca', 7, 1],
    ['cat-8', 'Science', 'science', 'Space telemetry, climate models, nuclear energy, and fundamental research.', '#15803d', 8, 1],
    ['cat-9', 'Health', 'health', 'Public healthcare systems, clinical research, medical access, and policy.', '#be185d', 9, 1],
    ['cat-10', 'Sports', 'sports', 'Cricket test series, football, athletics, and international championships.', '#c2410c', 10, 1],
    ['cat-11', 'Investigations', 'investigations', 'Long-form public interest investigations and regulatory accountability.', '#831843', 11, 1],
    ['cat-12', 'Opinion', 'opinion', 'Editorials, guest perspectives, philosophical essays, and institutional critiques.', '#334155', 12, 1],
    ['cat-13', 'Lifestyle', 'lifestyle', 'Arts, architectural preservation, literature, and culinary traditions.', '#6b21a8', 13, 1]
  ];

  const insertCategory = db.prepare(`
    INSERT INTO categories (id, name, slug, description, color, order_index, show_in_nav, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of categories) {
    insertCategory.run(c[0], c[1], c[2], c[3], c[4], c[5], c[6], now);
  }

  // 5. Articles (Authentic, realistic journalism content)
  const insertArticle = db.prepare(`
    INSERT INTO articles (
      id, title, slug, deck, body, featured_image, image_caption, image_credit,
      category_id, reporter_id, status, article_type, is_breaking, is_lead, is_featured,
      is_opinion, is_sponsored, reading_time_minutes, district, source_attribution,
      correction_notice, published_at, created_at, views_count
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?
    )
  `);

  // Lead Story
  insertArticle.run(
    'art-1',
    'National Inter-State Water Treaty Re-negotiations Enter Critical Phase in New Delhi',
    'national-inter-state-water-treaty-re-negotiations-delhi',
    'Union Water Commission convenes tripartite summit as riparian states debate ecological flow quotas, basin storage reserves, and real-time telemetry protocols ahead of seasonal monsoon transitions.',
    `## A Defining Moment for Federal Basin Governance

**NEW DELHI** — In what senior constitutional jurists and hydrology planners describe as the most consequential federal water conference in three decades, representatives from five riparian states and the Central Water Commission met at Shram Shakti Bhawan today to establish binding benchmarks for inter-state river basin telemetry.

The three-day high-level summit addresses critical tensions between upstream retention dams and downstream ecological discharge obligations. At the center of negotiations is a proposal to replace archaic decadal flow averages with automated, satellite-synchronized reservoir telemetry updated every 180 seconds.

> "Federal water sharing can no longer rely on estimates finalized in treaties drafted half a century ago. Climate variability, erratic precipitation patterns, and rising agricultural demand require transparent, machine-validated release volumes."
> — *Dr. K. S. Parthasarathy, Member (Hydro-meteorology), Central Water Commission*

### The Tripartite Architecture

Under the draft protocol submitted by the technical advisory council:
1. **Automated Discharge Telemetry:** All barrages holding above 50 million cubic meters must feed live gauge data into an open national dashboard.
2. **Ecological Flow Floor:** A mandatory baseline of 18% dry-season flow must remain uninhibited to sustain riverbed biodiversity and prevent seawater intrusion in coastal deltas.
3. **Dispute Resolution Fast-Track:** Inter-state allocation disputes will transition from prolonged ad-hoc tribunals to a permanent judicial appellate board with statutory 90-day ruling limits.

### Divergent State Priorities

Delegations from agrarian heartlands emphasized safeguarding irrigation reservoir levels for late-sown rabi crops. In contrast, coastal delegations voiced alarm over rising salinity gradients encroaching upon municipal drinking water intakes, demanding unconditional downstream releases.

Hydrological analysts point out that despite political friction, both sides share an urgent incentive to reach agreement before seasonal monsoon cloud bursts test existing reservoir flood-cushion capacities. The summit is expected to conclude on Thursday with a joint ministerial communiqué setting out operational rules for the upcoming hydrological calendar.`,
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    'Engineers and hydro-meteorological officials review automated spillway telemetry at a multi-purpose barrage basin.',
    'Signal Photo / Rajesh Gurung',
    'cat-2', // India
    'rep-1', // Siddharth Nair
    'PUBLISHED',
    'NEWS',
    0, // is_breaking
    1, // is_lead
    1, // is_featured
    0, // is_opinion
    0, // is_sponsored
    6,
    null,
    'Central Water Commission / Press Information Bureau',
    null,
    new Date(Date.now() - 3600000 * 2).toISOString(),
    now,
    3420
  );

  // Breaking News Article
  insertArticle.run(
    'art-2',
    'Supreme Court Reserves Verdict on Constitutional Challenge to Digital Intermediary Safeguards',
    'supreme-court-reserves-verdict-constitutional-challenge-digital-data',
    'Five-judge Constitution Bench concludes marathon nine-day hearings examining surveillance limits, algorithmic accountability, and automated filtering mandates under the amended digital framework.',
    `## Constitution Bench Hears Final Submissions

**NEW DELHI** — A five-judge Constitution Bench headed by the Chief Justice concluded oral arguments today on a cluster of petitions challenging the statutory validity of recent executive rules governing digital platforms, end-to-end encryption obligations, and state data requests.

Over nine days of dense legal argumentation, counsel representing civil liberties coalitions, academic consortiums, and technology intermediaries argued that broad mandates requiring technical backdoors for message trace-back violate the fundamental privacy rights recognized under the landmark *Puttaswamy* judgment.

### Points of Constitutional Contention

The bench closely scrutinized three primary statutory provisions:
- **Traceability Requirements:** Whether compelling private communication intermediaries to identify the first originator of electronic messages inevitably compromises end-to-end cryptographic integrity for all citizens.
- **Automated Censorship Systems:** The constitutional permissibility of algorithmic filtering tools mandated to proactively identify prohibited content without prior judicial warrants.
- **Executive Oversight Committees:** The independence and neutrality of ministerial review panels tasked with issuing emergency blocking directives without public hearings.

> "The core issue before this court is proportionality. Does the state have mechanisms to pursue legitimate public order objectives without erecting pervasive monitoring infrastructure across the civilian network?"
> — *Observation from the Bench during senior counsel rejoinder*

The Solicitor General, defending the statutory framework, submitted that digital networks face unprecedented organized disinformation and cyber-warfare operations that require swift, calibrated institutional response mechanisms. The bench directed all parties to file concise written submissions by Friday and reserved judgment.`,
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
    'The Supreme Court of India complex in New Delhi where a five-judge Constitution Bench concluded arguments.',
    'Signal Photo / Tarun Mathur',
    'cat-5', // Politics
    'rep-1', // Siddharth Nair
    'PUBLISHED',
    'NEWS',
    1, // is_breaking
    0,
    1,
    0,
    0,
    5,
    null,
    'Supreme Court Proceedings',
    null,
    new Date(Date.now() - 3600000 * 1).toISOString(),
    now,
    5120
  );

  // Kerala Regional News - Wayanad
  insertArticle.run(
    'art-3',
    'Wayanad Agro-Forestry Corridor Receives Ecological Buffer Zone Designation to Mitigate Slope Erosion',
    'wayanad-agro-forestry-corridor-ecological-buffer-zone-erosion',
    'State revenue and forest departments notify 42-kilometer contiguous conservation belt across high-gradient hillsides, mandating deep-root vetiver planting and restricting unscientific excavation.',
    `## High-Altitude Slope Stabilization Protocol

**KALPETTA** — In a major policy intervention aimed at long-term landslide mitigation and fragile watershed protection, the Kerala State Disaster Management Authority and Department of Environment have formally notified the Meppadi–Vythiri Agro-Forestry Corridor as an ecologically sensitive buffer zone.

The notification follows exhaustive geological core sampling conducted by the Geological Survey of India across vulnerable escarpments in Wayanad district following recent monsoon slope failures.

### Key Mandates of the Buffer Order

- **Excavation Ban on Steep Slopes:** Total moratorium on mechanical hill cutting and quarrying on slopes exceeding 22 degrees gradient.
- **Deep-Root Tree Canopy Restoration:** Replanting of native evergreen canopy trees along with vetiver and bamboo root systems to bind topsoil on cleared plantations.
- **Natural Drainage Reclamation:** Compulsory removal of artificial obstructions along primary mountain rivulets and estate storm channels.

Local farmer collectives and spice cooperatives have welcomed the structured compensatory mechanism provided under the ecological restoration grant, which offsets agricultural yield transitions for smallholders converting monoculture cash crops to multi-tiered agroforestry canopy.`,
    'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80',
    'Misty tea plantations and forested ridges along the Western Ghats escarpment in Wayanad.',
    'Signal Photo / M. K. Biju',
    'cat-3', // Kerala
    'rep-3', // K. R. Madhavan
    'PUBLISHED',
    'GROUND_REPORT',
    0,
    0,
    1,
    0,
    0,
    5,
    'Wayanad',
    'District Collectorate Kalpetta / KSDMA',
    null,
    new Date(Date.now() - 3600000 * 4).toISOString(),
    now,
    2890
  );

  // Kerala Regional News - Kochi
  insertArticle.run(
    'art-4',
    'Kochi Water Metro Commences Commercial Trials on Second-Phase Electric Ferry Terminals',
    'kochi-water-metro-commercial-trials-second-phase-ferry',
    'Five new solar-assisted catamaran terminals across Willingdon Island and Kumbalam integrate island communities with the city mainland transit network.',
    `## Sustainable Urban Maritime Mobility

**KOCHI** — The Kochi Water Metro network took a significant leap forward this morning as commercial trial voyages began connecting Willingdon Island, Kumbalam, and Nettoor terminals with the central High Court and Vypeen hub.

The battery-powered, air-conditioned catamarans, built by Cochin Shipyard Limited, feature lightweight aluminum hulls and rapid-charging shore power infrastructure capable of replenishing battery banks in under fifteen minutes during passenger boarding.

### Network Expansion Metrics

- **Current Daily Ridership:** Averaging 14,000 passenger journeys across existing routes.
- **Projected Network Span:** 78 electric vessels operating across 38 terminals upon full commissioning.
- **Carbon Reduction:** Estimated offset of 16,800 tonnes of urban carbon emissions annually compared to equivalent diesel road transport.

Urban planning experts note that Kochi's integrated multi-modal transit ticketing—allowing commuters to use a single contactless card across metro trains, water catamarans, and city feeder buses—is setting a global benchmark for island-estuary urban transit systems.`,
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    'An electric passenger catamaran prepares to berth at the solar-powered marine terminal in Kochi backwaters.',
    'Signal Photo / K. R. Madhavan',
    'cat-3', // Kerala
    'rep-3', // K. R. Madhavan
    'PUBLISHED',
    'NEWS',
    0,
    0,
    1,
    0,
    0,
    4,
    'Kochi',
    'Kochi Metro Rail Limited',
    null,
    new Date(Date.now() - 3600000 * 6).toISOString(),
    now,
    1980
  );

  // Kerala Regional News - Thiruvananthapuram
  insertArticle.run(
    'art-5',
    'Technopark Phase-IV Expands AI & Semi-Conductor Research Clusters with Global Consortia',
    'technopark-phase-iv-expands-ai-semiconductor-clusters',
    'State government signs agreements with three international aerospace and chip-design firms, anchoring 18,000 high-end engineering positions in the state capital.',
    `## Deep-Tech Investment Influx

**THIRUVANANTHAPURAM** — The capital city’s emerging Technocity campus at Pallippuram signed definitive master lease agreements today with an international consortium of semiconductor design houses and embedded automotive electronics developers.

The investment package, valued at approximately ₹1,850 crore across three operational phases, will establish dedicated testing laboratories for radiation-hardened satellite microcontrollers and neuromorphic edge-computing architecture.

State IT Secretary emphasized that the proximity to ISRO's Vikram Sarabhai Space Centre (VSSC) and the Indian Institute of Space Science and Technology (IIST) creates an unmatched talent corridor for aerospace-grade hardware engineering. Construction of the first 600,000 sq ft zero-carbon facility is slated to break ground next month.`,
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    'Modern glass-facade tech campus pavilions in Technopark Phase-IV, Thiruvananthapuram.',
    'Signal Photo / Sreejith V.',
    'cat-3', // Kerala
    'rep-3', // K. R. Madhavan
    'PUBLISHED',
    'NEWS',
    0,
    0,
    0,
    0,
    0,
    4,
    'Thiruvananthapuram',
    'Department of Electronics and IT, Government of Kerala',
    null,
    new Date(Date.now() - 3600000 * 12).toISOString(),
    now,
    1450
  );

  // Business & Economy
  insertArticle.run(
    'art-6',
    'RBI Monetary Policy Committee Maintains Stance on Inflation Targeting Amid Global Commodity Realignment',
    'rbi-monetary-policy-committee-maintains-stance-inflation',
    'Governor emphasizes durable headline price stability and prudent liquidity management while leaving benchmark repo rates unchanged at 6.50% by unanimous vote.',
    `## Unanimous Resolution from Mint Street

**MUMBAI** — Concluding its bi-monthly policy review, the Reserve Bank of India’s Monetary Policy Committee (MPC) voted unanimously to keep the policy repo rate unchanged at 6.50%, reiterating its commitment to aligning headline consumer inflation with the 4.0% medium-term target on a durable basis.

Announcing the decision from the central bank’s headquarters in Mumbai, the Governor highlighted India’s strong macroeconomic resilience, propelled by robust fixed capital formation, public infrastructure capex, and resilient domestic demand even as external trading partner economies experience decelerating growth.

### Macroeconomic Forecasts

- **Real GDP Growth for FY27:** Projected at 7.0%, with balanced upside and downside risks.
- **CPI Headline Inflation:** Forecast at 4.5% for the fiscal year, conditioned on an even spatial distribution of the south-west monsoon.
- **Liquidity Stance:** Continuation of the 'withdrawal of accommodation' stance to ensure orderly transmission of past rate actions across bank credit channels.

Commercial bank treasuries responded positively, with benchmark 10-year sovereign bond yields softening by three basis points to 7.04% as the policy guidance removed near-term tightening risks while ensuring liquidity conditions remain supportive of productive enterprise borrowing.`,
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    'The Reserve Bank of India headquarters in Mumbai where the MPC announced its policy resolution.',
    'Signal Photo / Amit Dave',
    'cat-6', // Business
    'rep-5', // Vikramaditya Roy
    'PUBLISHED',
    'ANALYSIS',
    0,
    0,
    1,
    0,
    0,
    5,
    null,
    'Reserve Bank of India Monetary Policy Statement',
    null,
    new Date(Date.now() - 3600000 * 8).toISOString(),
    now,
    3120
  );

  // World / Geopolitics
  insertArticle.run(
    'art-7',
    'Geneva Multilateral Summit Drafts Binding Treaty on Transboundary Glacial Basin Protection',
    'geneva-multilateral-summit-drafts-binding-treaty-glacial-basins',
    'Delegates from 64 nations agree on early-warning sensor sharing and coordinated downstream flood relief funds for Himalayan and Andean mountain communities.',
    `## A Breakthrough in Mountain Ecology Diplomacy

**GENEVA** — After eighteen months of tense technical negotiations, environmental envoys representing 64 nations participating in the United Nations Intergovernmental Framework on Cryospheric Preservation reached consensus late last night on the world’s first binding multilateral convention on transboundary glacial lakes.

The landmark agreement addresses the accelerating risk of Glacial Lake Outburst Floods (GLOFs), which threaten over 15 million residents across high-altitude river valleys in Central Asia, the Himalayas, and the South American Andes.

### Key Treaty Mechanisms

1. **Mandatory Real-Time Sensor Telemetry:** Riparian nations will openly share satellite radar interferometry and mountain-top seismic tremor feeds within 120 seconds of trigger anomalies.
2. **Glacial Hazard Amelioration Fund:** An initial capital pool of $4.2 billion, funded primarily by multilateral climate institutions, will finance mechanical lake siphoning and controlled blast drainages.
3. **Cross-Border Emergency Access:** Automatic visa waivers and emergency search-and-rescue overflight clearances for disaster response teams during sudden outburst events.

The treaty is scheduled for formal ceremonial signing at the plenary assembly in November before entering into national legislative ratification cycles.`,
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    'A high-altitude glacial lake nestled between snow-covered peaks in the trans-Himalayan mountain range.',
    'Signal Photo / Pierre Dupond',
    'cat-4', // World
    'rep-2', // Ayesha Sen
    'PUBLISHED',
    'NEWS',
    0,
    0,
    1,
    0,
    0,
    5,
    null,
    'UNEP / World Meteorological Organization Geneva',
    null,
    new Date(Date.now() - 3600000 * 10).toISOString(),
    now,
    2740
  );

  // Science & Tech
  insertArticle.run(
    'art-8',
    'ISRO Unveils Telemetry for Second Deep-Space Lunar Science Lander Modular Test Flights',
    'isro-unveils-telemetry-deep-space-lunar-lander-test-flights',
    'Bengaluru space telemetry center validates autonomous hazard detection algorithms and throttleable liquid engines for upcoming sample-return orbital rendezvous.',
    `## Next Frontier in Deep-Space Exploration

**BENGALURU** — Scientists and flight dynamics engineers at the Indian Space Research Organisation (ISRO) Telemetry, Tracking and Command Network (ISTRAC) successfully completed integrated hardware-in-the-loop simulation runs for the upcoming lunar sample return architecture.

The multi-stage mission profile represents India’s most technologically demanding robotic space endeavor to date. Unlike past lander profiles, the new vehicle incorporates a modular ascent propulsion core capable of blasting off from the lunar regolith surface to dock with an automated lunar orbiter holding sample canisters in a 100-kilometer circular orbit.

### Autonomous Hazard Detection & Avoidance

The propulsion and sensor suite tested today demonstrated:
- Millimeter-accurate radar altimeter scans identifying boulder hazards down to 15 centimeters.
- Multi-camera stereoscopic terrain contour mapping processing 30 frames per second on domestic radiation-tolerant ASICs.
- Variable-thrust liquid engines executing sub-second burn modulations to stabilize the lander during high-velocity terminal descent.

Mission directors confirmed that integrated thermal-vacuum chamber testing will commence at the UR Rao Satellite Centre next month in preparation for the launch window scheduled late next year.`,
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    'Earth and lunar orbital perspectives captured during deep-space navigation simulation runs.',
    'Signal Photo / ISRO Flight Dynamics Team',
    'cat-8', // Science
    'rep-4', // Dr. Elena Vance
    'PUBLISHED',
    'NEWS',
    0,
    0,
    1,
    0,
    0,
    5,
    null,
    'ISRO Headquarters Bengaluru',
    null,
    new Date(Date.now() - 3600000 * 14).toISOString(),
    now,
    4210
  );

  // Investigative Journalism
  insertArticle.run(
    'art-9',
    'The Sand and the Silt: Six-Month Satellite Audit Reveals Unpermitted Riverbed Extractions in Central River Basins',
    'the-sand-and-the-silt-six-month-satellite-audit-riverbed-extraction',
    'High-resolution multi-spectral imagery and transport toll audits document systemic over-dredging beyond statutory concessions, accelerating riverbank subsidence and drinking water aquifer depletion.',
    `## A Six-Month Investigation into River Basin Degradation

**NEW DELHI** — An extensive investigation conducted by *The Daily Signal*, utilizing multi-spectral satellite imagery, drone topographical photogrammetry, and thousands of municipal mineral transport permits, has revealed widespread, systematic riverbed over-extraction across three critical central river basins.

Under existing environmental clearance norms granted by state environment assessment authorities, mechanized dredging of river sand is restricted to a maximum depth of two meters from surface gravel beds and strictly prohibited within 500 meters of bridge abutments and riparian embankments.

### What the Satellite Data Shows

By analyzing European Space Agency Sentinel-2 synthetic aperture radar feeds cross-referenced with commercial high-resolution WorldView-3 passes between October 2025 and March 2026, *The Daily Signal* identified:
- **Excess Depth Pits:** Extraction trenches exceeding seven meters depth, penetrating natural clay aquifer seals.
- **Phantom Concessions:** 23 operational barge loading sites operating without valid consent-to-operate registrations from regional pollution control boards.
- **Toll Mismatches:** Weighbridge telemetry records indicate over 420,000 metric tonnes of sand passed highway checkpoints with duplicate or forged electronic transport transit passes.

> "When riverbed sand is stripped beyond replenishing silt rates, the hydraulic gradient steepens dramatically. Groundwater tables in adjacent villages collapse, and drinking water borewells run completely dry within two seasons."
> — *Prof. N. K. Sengupta, Former Director, National Institute of Hydrology*

### Regulatory Response and Accountability

When confronted with photographic coordinates and toll log audits, state mining department officials acknowledged "enforcement bottlenecks" and announced the constitution of a joint vigilance team to inspect all operational leaseholds.

*The Daily Signal* has submitted the full repository of geo-tagged coordinates, satellite change-detection maps, and weighbridge logs to the National Green Tribunal registry for independent judicial scrutiny.`,
    'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1200&q=80',
    'Aerial overview of heavy mechanized extraction excavators operating along a dry riverbed gravel bar.',
    'Signal Investigations / Priya Chawla',
    'cat-11', // Investigations
    'rep-6', // Priya Chawla
    'PUBLISHED',
    'INVESTIGATION',
    0,
    0,
    1,
    0,
    0,
    8,
    null,
    'Independent Investigative Reporting / Sentinel-2 Remote Sensing',
    'Correction Note (March 28): An earlier draft of this investigative report listed the inspection zone distance as 14 kilometers downstream from the barrage rather than 11.2 kilometers. The text and data graphic have been amended to reflect the verified survey telemetry.',
    new Date(Date.now() - 3600000 * 18).toISOString(),
    now,
    6480
  );

  // Opinion Column 1
  insertArticle.run(
    'art-10',
    'The Quiet Peril of Algorithmic Governance: Why Discretion Cannot Be Outsourced to Black-Box Models',
    'the-quiet-peril-of-algorithmic-governance-discretion-models',
    'As administrative departments automate social welfare disbursements and tax compliance flags, we risk eroding the constitutional guarantee of reasoned administrative action.',
    `## Editorial Column by Siddharth Nair

There is an alluring seduction in algorithmic governance. To a bureaucrat overwhelmed by millions of case files, or a treasury official wrestling with expenditure reconciliations, the promise of an automated decision-scoring system is almost irresistible: swift, mathematically objective, and untainted by human lethargy.

Yet beneath this gleaming veneer of digital efficiency lies a quiet, profound constitutional erosion.

### The Right to Reasoned Decisions

For over two centuries, administrative jurisprudence across common-law democracies has rested on a fundamental pillar: *audi alteram partem*—the right to be heard—and the indispensable requirement that an authority exercising state power must provide intelligible, reviewable reasons for decisions that alter a citizen's legal rights.

When a citizen's welfare entitlement is summarily suspended because a machine-learning fraud detection model flagged an anomaly score of 0.87, who provides the reasons? The algorithm cannot be summoned to court; its weightings are frequently proprietary secrets held by private software contractors; and the administrative officer merely clicks 'confirm' without understanding the predictive vectors inside the neural network.

> "A decision whose rationale cannot be articulated by the human exercising the power of the state is not an act of governance. It is an act of arbitrary fiat wrapped in code."

### Reclaiming Human Accountability

If digital governance is to serve democratic society rather than subsume it, statutory guardrails must be established:
1. **Mandatory Human-in-the-Loop:** Automated algorithms may serve solely as informational indicators, never as self-executing determinative orders.
2. **Right to Algorithmic Explanation:** Every citizen subjected to an adverse automated flag must receive a plain-language summary of the precise data attributes that generated the outcome.
3. **Open-Source Public Scrutiny:** Any predictive model used to allocate public resources or enforce statutory penalties must have its source code and validation methodologies accessible to public audit.

Speed must never become a surrogate for justice. The moment we sacrifice the duty of reasoned administrative explanation on the altar of algorithmic dispatch, we abandon the soul of constitutional democracy.`,
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'Silhouetted figures working amidst complex illuminated data network visualization screens.',
    'Signal Editorial / Siddharth Nair',
    'cat-12', // Opinion
    'rep-1', // Siddharth Nair
    'PUBLISHED',
    'OPINION',
    0,
    0,
    1,
    1, // is_opinion
    0,
    6,
    null,
    null,
    null,
    new Date(Date.now() - 3600000 * 22).toISOString(),
    now,
    3840
  );

  // Health Story
  insertArticle.run(
    'art-11',
    'National Cardiovascular Health Registry Releases Five-Year Rural Preventive Screening Benchmarks',
    'national-cardiovascular-health-registry-rural-screening-benchmarks',
    'Decentralized community health worker networks detect early hypertension in over 2.4 million citizens, demonstrating the effectiveness of primary village-level triage.',
    `## Reorienting Healthcare Toward Primary Prevention

**NEW DELHI** — In a comprehensive report detailing the outcomes of the National Rural Preventive Cardiology Initiative, the Ministry of Health and Family Welfare released benchmark data demonstrating that routine blood pressure screenings by Accredited Social Health Activists (ASHAs) have reduced acute ischemic heart disease incidents by 24% across participating primary health centres.

The five-year cohort study, encompassing over 2.4 million participants across 180 rural districts, highlights the transformative power of decentralized, low-cost diagnostics.

### Groundbreaking Findings

- **Early Diagnosis Surge:** 41% of individuals diagnosed with stage-1 hypertension were asymptomatic and had never previously visited a sub-district hospital.
- **Medication Adherence:** Digital prescription replenishment via village wellness centres achieved a sustained 78% adherence rate over 36 months.
- **Cost-Benefit Ratio:** Every rupee invested in village-level diagnostic cuff calibration and basic antihypertensive drugs saved an estimated 14 rupees in tertiary emergency care expenses.

Cardiologists emphasized that expanding primary screening to include point-of-care lipid profiles will be the next frontier in reversing non-communicable disease mortality across developing rural corridors.`,
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    'A rural community health nurse checks vital indicators during a village preventive health camp.',
    'Signal Photo / Dr. Sanjeev Varma',
    'cat-9', // Health
    'rep-4', // Dr. Elena Vance
    'PUBLISHED',
    'NEWS',
    0,
    0,
    1,
    0,
    0,
    4,
    null,
    'National Health Mission / Indian Council of Medical Research',
    null,
    new Date(Date.now() - 3600000 * 26).toISOString(),
    now,
    2150
  );

  // Sports Story
  insertArticle.run(
    'art-12',
    'India Solidifies Lead in World Test Championship Cycle Following Gripping Fourth-Innings Victory in Dharamshala',
    'india-solidifies-lead-world-test-championship-dharamshala',
    'Pace quartet harnesses morning seam movement amidst snowcapped Dhauladhar peaks to dismiss visitors for 186 on Day 4 of the deciding Test.',
    `## Seam Bowling Masterclass in the Foothills

**DHARAMSHALA** — In an amphitheatre framed by the majestic snow-laden crests of the Dhauladhar mountain range, India sealed a historic 142-run victory on Day 4 of the deciding Test match to cement their position atop the ICC World Test Championship standings.

Resuming at 94 for 3 on a crisp morning with cloud cover hovering over the HPCA Stadium, the visiting batting lineup struggled against disciplined seam bowling. Exploiting subtle lateral deviation and steep variable bounce from the foothill pitch, India’s fast bowling unit dismantled the middle order in an intense two-hour morning spell.

### Match Highlights & Milestone Records

- **Key Spell:** India’s opening strike bowler claimed 5 for 44 in 18.4 overs, marking his tenth five-wicket haul in Test cricket.
- **Batting Resilience:** A gritty second-innings 84 by the vice-captain on Day 3 proved decisive in setting an insurmountable target of 329.
- **Points Table Trajectory:** With this victory, India’s points percentage in the current championship cycle rises to 68.5%, placing them in pole position for the Lord's final next summer.

Captain and team management praised the ground staff for producing an authentic sporting pitch that offered balanced assistance to seamers on the first two mornings while demanding genuine technical application from batsmen throughout.`,
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
    'A panoramic view of the picturesque Dharamshala cricket ground framed by the Dhauladhar mountain ranges.',
    'Signal Sports / Tarun Anand',
    'cat-10', // Sports
    'rep-5', // Vikramaditya Roy
    'PUBLISHED',
    'NEWS',
    0,
    0,
    1,
    0,
    0,
    4,
    null,
    'Board of Control for Cricket in India (BCCI) Media',
    null,
    new Date(Date.now() - 3600000 * 30).toISOString(),
    now,
    3750
  );

  // 6. Video Reports
  const insertVideo = db.prepare(`
    INSERT INTO videos (id, title, slug, summary, video_url, thumbnail_url, duration, category, reporter_id, is_featured, published_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertVideo.run(
    'vid-1',
    'Ground Report: Inside the First Solar-Powered Electric Catamarans of Vembanad Lake',
    'ground-report-solar-electric-catamarans-vembanad',
    'Signal Southern Bureau Chief K. R. Madhavan journeys aboard Kochi’s newest silent ferry fleet to examine how zero-emission water transit is revitalizing isolated island economies.',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    '08:42',
    'GROUND_REPORT',
    'rep-3',
    1,
    new Date(Date.now() - 3600000 * 5).toISOString(),
    now
  );

  insertVideo.run(
    'vid-2',
    'Explainer: How India’s Deep-Space Tracking Network Communicates Beyond the Moon',
    'explainer-how-india-deep-space-tracking-network-communicates',
    'Dr. Elena Vance deconstructs the 32-meter giant parabolic antenna at Byalalu, Bengaluru, and the mathematics of decoding sub-picowatt signals across interplanetary distances.',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    '12:15',
    'EXPLAINER',
    'rep-4',
    0,
    new Date(Date.now() - 3600000 * 15).toISOString(),
    now
  );

  insertVideo.run(
    'vid-3',
    'In Conversation: Chief Economic Advisor on Fiscal Deficit Targets and Manufacturing Headwinds',
    'in-conversation-chief-economic-advisor-fiscal-targets',
    'A 25-minute exclusive sit-down interview on inflation trajectories, industrial supply chain diversification, and sovereign bond index inclusion.',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    '24:30',
    'INTERVIEW',
    'rep-5',
    0,
    new Date(Date.now() - 3600000 * 28).toISOString(),
    now
  );

  insertVideo.run(
    'vid-4',
    'Documentary: The Vanishing Sholas — Guarding the Cloud Forests of the Western Ghats',
    'documentary-the-vanishing-sholas-guarding-cloud-forests',
    'A six-month visual chronicle following tribal trackers, botanists, and forest guards fighting invasive wattle species to restore ancient shola-grassland hydrological sponges.',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80',
    '18:50',
    'DOCUMENTARY',
    'rep-6',
    0,
    new Date(Date.now() - 3600000 * 48).toISOString(),
    now
  );

  // 7. Photo Stories
  const insertPhotoStory = db.prepare(`
    INSERT INTO photo_stories (id, title, slug, summary, featured_image, photographer, published_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPhotoStory.run(
    'ps-1',
    'Monsoon Along the Malabar Coast: A Visual Chronicle of Harbours, Swollen Estuaries, and Coastal Endurance',
    'monsoon-along-the-malabar-coast-visual-chronicle',
    'Award-winning documentary photographer Arjun Divakaran documents the arrival of the south-west monsoon across fishing hamlets from Beypore to Vizhinjam.',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    'Arjun Divakaran',
    new Date(Date.now() - 3600000 * 12).toISOString(),
    now
  );

  const insertPhotoItem = db.prepare(`
    INSERT INTO photo_story_items (id, photo_story_id, image_url, caption, credit, order_index)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertPhotoItem.run(
    'psi-1',
    'ps-1',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    'A traditional wooden vallam boat navigates churning breakers as early monsoon squalls hit the Beypore bar-mouth.',
    'Arjun Divakaran / The Daily Signal',
    1
  );

  insertPhotoItem.run(
    'psi-2',
    'ps-1',
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
    'Mending nylon sardine gillnets under the shelter of coconut palm threshes before the seasonal trawling ban commences.',
    'Arjun Divakaran / The Daily Signal',
    2
  );

  insertPhotoItem.run(
    'psi-3',
    'ps-1',
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    'The historic Alappuzha lighthouse beam sweeps across storm-lashed Arabian sea breakers at midnight.',
    'Arjun Divakaran / The Daily Signal',
    3
  );

  // 8. Live Blog
  const insertLiveBlog = db.prepare(`
    INSERT INTO live_blogs (id, title, slug, summary, status, reporter_id, category_id, started_at, updated_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertLiveBlog.run(
    'lb-1',
    'National Economic Council & Union Fiscal Review 2026: Live Deliberations',
    'national-economic-council-fiscal-review-2026-live',
    'Real-time updates, ministerial statements, sectoral allocation analyses, and market reactions from the bi-annual economic council meetings in New Delhi.',
    'ACTIVE',
    'rep-5',
    'cat-6',
    new Date(Date.now() - 3600000 * 3).toISOString(),
    new Date(Date.now() - 60000 * 12).toISOString(),
    now
  );

  const insertLiveUpdate = db.prepare(`
    INSERT INTO live_updates (id, live_blog_id, title, content, image_url, author_name, is_key_event, timestamp, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertLiveUpdate.run(
    'lu-1',
    'lb-1',
    'Finance Ministry Concludes Pre-Budget Consultation with Infrastructure Conglomerates',
    'Union Finance Minister completed a three-hour closed-door session with major infrastructure executives, focusing on highway monetization targets and viability gap funding for battery storage grids.',
    null,
    'Vikramaditya Roy',
    1,
    '15:42 IST',
    new Date(Date.now() - 60000 * 15).toISOString()
  );

  insertLiveUpdate.run(
    'lu-2',
    'lb-1',
    'Sovereign Bond Yields Moderate as Fiscal Deficit Glide Path Reaffirmed',
    'Ten-year benchmark government paper yields dipped 2 basis points to 7.03% following public reassurance from the Expenditure Secretary that fiscal consolidation targets of 4.5% GDP by FY27 remain sacrosanct.',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
    'Vikramaditya Roy',
    0,
    '15:15 IST',
    new Date(Date.now() - 60000 * 42).toISOString()
  );

  insertLiveUpdate.run(
    'lu-3',
    'lb-1',
    'Commerce Secretary Briefs on Bilateral Trade Pact Ratifications',
    'In an afternoon press briefing, the Commerce Secretary confirmed that the comprehensive economic partnership agreement with Nordic trade states has completed legal scrubbing and is ready for parliamentary ratification.',
    null,
    'Ayesha Sen',
    1,
    '14:30 IST',
    new Date(Date.now() - 60000 * 87).toISOString()
  );

  insertLiveUpdate.run(
    'lu-4',
    'lb-1',
    'Key Announcement: National Semi-Conductor Fabrication Subsidies Extended to Component Suppliers',
    'The Electronics & IT Minister announced that capital subsidy schemes previously reserved for mega-fab foundries are now expanded to cover domestic specialized gas suppliers, cleanroom fabricators, and lithography chemical manufacturers.',
    null,
    'Dr. Elena Vance',
    1,
    '13:10 IST',
    new Date(Date.now() - 60000 * 167).toISOString()
  );

  // 9. Newsletter subscribers demo
  const insertSub = db.prepare(`
    INSERT INTO newsletter_subscribers (id, email, edition_preference, is_active, subscribed_at)
    VALUES (?, ?, ?, 1, ?)
  `);
  insertSub.run('sub-1', 'reader.delhi@example.org', 'India', now);
  insertSub.run('sub-2', 'foreign.policy.fellow@oxford.edu', 'Global', now);
  insertSub.run('sub-3', 'kochi.reader@kerala.net', 'Kerala', now);

  console.log('The Daily Signal editorial database seeded successfully!');
}
