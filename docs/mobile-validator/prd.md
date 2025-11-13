# PRD – Mobile Validator Revolution (NorChain)  
**File:** `/tasks/prd-mobile-validator-revolution.md`

## 1. Introduction / Overview  
The aim of this project is to enable mobile devices (smartphones, tablets) to act as micro-validators in the NorChain network, creating a globally distributed mesh of human-participating validators.  
This mesh complements the institutional validator layer, delivers mass decentralisation, lowers barriers to entry, empowers everyday users in governance, charity, elections and community trust systems, and aligns with NorChain’s mission to provide a “Society Trust Layer”.  
By mobilising millions of devices, the network becomes far more resilient, democratic and socially impactful.

## 2. Goals & Success Criteria  
### Goals  
- Enable mobile users to become µ-validators with minimal device resource use (battery, data, compute).  
- Define and implement a lightweight validator SDK for mobile platforms (iOS, Android).  
- Build a layered consensus architecture: institutional PoA layer + mobile micro-validator layer + reputation/trust layer.  
- Launch pilot use-cases: elections, charity/donation tracking, community governance.  
- Ensure full compliance with NSM/GDPR/WCAG/Feide/ID-porten for Norwegian & EU markets.  
- Establish token mechanism: staking, governance rights, rewards, reputation.  

### Success Criteria  
- Mobile validator SDK runs with < 2% battery overhead, < 10 MB data/month in typical use.  
- At least 100,000 mobile validators participate in testnet pilot.  
- Pilot application (e.g., donation tracking) sees 100 institutions/organisations onboarded.  
- Token staking module allows micro-stakes (e.g., USD $1 equivalent) from mobile users.  
- Governance system activated: mobile validators cast votes, propose actions.  
- Full compliance audit satisfied for data/identity flows.  
- Positive feedback from pilot users: ≥80% usability rating.  

## 3. User Stories  
- As a **mobile user**, I want to tap “Become Validator” in the NorChain wallet so I can lock a small amount of NOR, start contributing and earn rewards.  
- As a **mobile user**, I want my device to run validator tasks in background without draining my battery or interfering with normal phone use.  
- As a **mobile user**, I want transparency about what my phone is doing (which tasks, what rewards, status).  
- As a **community organisation**, I want to run a donation tracking campaign and rely on mobile validators in the field verifying delivery of goods.  
- As a **municipal government**, I want to deploy an election module where citizens act as validators to verify voter identity, ballots and turnout.  
- As a **token holder**, I want to stake NOR, choose a validator delegate (mobile or institutional) and receive a share of rewards.  
- As a **compliance officer**, I want audit logs of mobile validator participation, identity proofing, data flows and rewards to satisfy regulatory frameworks.  

## 4. Functional Requirements  
1. Mobile Validator SDK  
   1.1. Runs on iOS/Android in background with minimal resource usage.  
   1.2. Connects to NorChain network, receives micro-tasks (randomness contributions, checkpoint signing, micro-verifications).  
   1.3. Securely signs tasks with device key; tasks contribute to consensus/trust layer.  
   1.4. Displays status, rewards earned, reputation score to user.  
   1.5. Allows user to stake small amount of NOR via wallet integration.  
   1.6. Allows user to vote/govern (via embedded UI) once reputation threshold reached.  
2. Consensus Architecture  
   2.1. Institutional PoA validator layer for block production/finality.  
   2.2. Mobile micro-validator layer: tasks delegated to mobile devices; contributions aggregated.  
   2.3. Reputation engine: assigns reputation to each mobile validator (uptime, correctness, task completion, stake).  
   2.4. Sybil resistance: integrate proof-of-humanity mechanisms (device attestation, biometrics, social trust graph).  
   2.5. Token & staking module: mobile validators stake NOR, earn rewards, may be slashed for misbehaviour.  
3. Use-case Modules  
   3.1. Charity/Donation Tracking Module: organisations onboard, mobile validators verify delivery, status is published on-chain.  
   3.2. Civic/Election Module: mobile validators verify identity/turnout, audit trails for voting results.  
   3.3. Community Governance Module: voting UI for mobile validators, proposals, delegate selection.  
4. Compliance & Security  
   4.1. Data flows must adhere to GDPR / NSM / WCAG guidelines.  
   4.2. Identity proofing uses minimal personal data; biometric optional; zero-knowledge where possible.  
   4.3. Audit logs and transparency dashboard available for regulators, NGOs, citizens.  
5. Monitoring & Dashboard  
   5.1. Validator participation dashboard (mobile + institutional).  
   5.2. Reputation and performance metrics.  
   5.3. Rewards distribution view.  
   5.4. Governance proposals and voting results view.  

## 5. Non-Goals  
- This project is *not* building a full mobile-node that stores full blockchain state. The mobile validator layer only handles lightweight tasks.  
- Not supporting intensive mining/hashing on mobiles.  
- Not initially targeting global full-node decentralisation via mobile devices only.  
- Not replacing institutional validators — institutional PoA layer remains critical.  
- Not implementing full-scale DeFi ecosystem in this phase (only governance, validation, tracking).  

## 6. Design Considerations  
- Battery & resource conservation on mobile devices is paramount. Use background scheduling, batching, minimal communication.  
- Device heterogeneity: support wide range of phones (low specs to high specs) globally.  
- Offline/ intermittent connectivity: the mobile SDK must support intermittent connectivity; tasks should queue and sync when online.  
- Security of device keys: utilise secure enclave (iOS) / strong key store (Android).  
- Privacy of user: minimal personal data; optionally use zero-knowledge proofs for identity.  
- Trust & reputation must be fair and transparent; avoid centralized black-box scoring.  
- Token economics must align incentives: micro-stakes, fair rewards, avoid referral pyramid models.

## 7. Technical Considerations (Feasibility Analysis)  
### Research Evidence  
- The research paper “Blizzard: A Distributed Consensus Protocol for Mobile Devices” shows mobile devices *can* participate in consensus via a two-tier broker model; throughput of thousands of transactions per second per shard is feasible.  [oai_citation:0‡MDPI](https://www.mdpi.com/2227-7390/12/5/707?utm_source=chatgpt.com)  
- The “Blockene: A High‑throughput Blockchain Over Mobile Devices” project demonstrates smartphones can participate with negligible battery/data usage in block validation.  [oai_citation:1‡USENIX](https://www.usenix.org/conference/osdi20/presentation/satija?utm_source=chatgpt.com)  
- Lightweight consensus models for constrained devices exist and highlight the technical viability of mobile-based validators.  [oai_citation:2‡ScienceDirect](https://www.sciencedirect.com/science/article/pii/S2352864824001767?utm_source=chatgpt.com)  

### Feasibility Risks & Mitigations  
| Risk | Impact | Mitigation |
|------|--------|------------|
| Mobile device churn / offline behaviour | Could reduce validator participation and degrade trust layer | Design tasks tolerant of intermittent connectivity; reputation accounts for uptime; allow many devices to cover tasks redundantly |
| Sybil attacks via compromised devices | May undermine trust in mobile validator layer | Use device attestation + proof-of-humanity + social trust graph + stake requirement |
| Battery or data consumption negatively affecting UX | Users uninstall or disable validator mode | Highly efficient SDK; batch tasks; low footprint; clear user opt-in and transparency; rewards tied to low impact mode |
| Regulatory/privacy issues in identity verification | Delay or block adoption | Integrate GDPR/NSM compliance from start; allow privacy-preserving proofs; minimal personal data; open audit trail |
| Token/eco-nomics misaligned -> centralization or abuse | Validators may collude, stake whales dominate | Micro-stake requirement; reputation caps; tiered rewards; transparent governance; continual monitoring |
| Institutional validator layer becomes bottleneck | Mobile layer under-utilised or dependent | Ensure hybrid architecture: institutional nodes strong; mobile layer adds trust not sole validating. Scale accordingly. |

## 8. Brainstorming & Concept Ideas  
- **“Validator Badge” System**: mobile users receive badge visuals (e.g., Bronze-Silver-Gold) based on reputation and task contribution.  
- **“Mission Mode” for Validators**: mobile users get missions tied to charity/field-verification (e.g., ‘‘Verify delivery of water bottles in region X’’) with geo-tag + timestamp + photo + validator signature.  
- **“Mobile Governance Live Polls”**: mobile validators vote on community proposals in real time via lightweight in-app UX; quorum thresholds vary by reputation score.  
- **“Micro-Stake + Upgrade Model”**: users start with low stake (USD1 equivalent) and can upgrade to higher tiers (USD10, USD100) unlocking higher governance weight but also higher responsibility/reputation risk.  
- **“Trust Circle” Social Layer**: validators invite peers, build trust graphs, use social proof (but not pure referral pyramid) to boost reputation.  
- **“Identity-On-Chain Light Proofs”**: users optionally provide biometric + device attestation + social proof to unlock full validator status; sum of proofs gives “Verified Personhood” badge.  
- **“Charity Field Verification App”**: NGO partners deploy validator tasks through mobile app; mobile validators in local region carry out micro-verifications; results logged on chain for donors to view.  
- **“Election Snapshot Mode”**: mobile validators in electoral zones verify polling station activity (e.g., report polling station open, monitor turn-out, timestamp). Their signatures contribute to audit trail.  
- **“Reputation Marketplace”**: mobile validators can allocate part of their reputation to delegate tasks or endorse other validators; endorsements bring small reward share.  
- **“Energy-Smart Scheduler”**: SDK runs tasks when device idle and network wifi, to avoid user battery/data impact.

## 9. Risks & Mitigations  
(As above in Feasibility table) plus:  
- Regulatory/Legal risk (elections, charity oversight) → engage legal counsel early, pilot in friendly jurisdictions.  
- User privacy backlash → provide transparent opt-in, clear privacy policies, zero-knowledge options.  
- Adoption risk (mobile users not engaging) → incentivise by rewards, gamification, wallet integration, real-world utility.  
- Technical integration with institutional validators & chain might be complex → modular architecture, proof-of-concept before full rollout.

## 10. Success Metrics  
- # of mobile validators (target: 100k in pilot, scaling to 1M+)  
- Average mobile validator uptime / task completion rate (target > 90%)  
- Battery/data footprint per month per validator (target < 2% battery, < 10 MB data)  
- Number of institutions onboarded to charity/election modules (target: 50 organisations in first 6 months)  
- Token staking volume by mobile validators (target: USD 100k equivalent)  
- Governance participation rate (target: > 60% of mobile validators vote when eligible)  
- Reputation distribution: % validators reaching Silver/Gold tiers  
- Pilot user satisfaction (target: > 80% rating)  
- Compliance audit satisfaction (pass audit with no major findings)  

## 11. Open Questions  
- What is the minimum viable “micro-task” profile for mobile validator (compute, memory, network) globally?  
- What threshold of mobile validators is needed to meaningfully contribute to consensus/trust layer for elections/charity?  
- What stake size should mobile users have to align incentives and avoid token capture?  
- How to design governance weight formula combining stake + reputation + mobile validator task volume?  
- Should mobile validators ever propose blocks or only provide verification/trust weighting?  
- How to design delegation of tasks to mobile validators while maintaining low barriers and high integrity?  
- How to integrate device attestation + proof-of-humanity + social trust graph without privacy violations or centralised risk?  
- Which jurisdictions/regulatory frameworks should be targeted first for pilot (Norway, EU, Africa)?  
- What is the business model for institutional validators, mobile validator rewards, NGO/charity module?  
- What is the token issuance model: mobile validator rewards vs institutional validator rewards vs governance pool?  