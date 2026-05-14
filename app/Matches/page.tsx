'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';  

const groundLocations = [
  {
    id: 'ssc',
    name: 'Sinhalese Sports Club (SSC)',
    address: 'Maitland Place, Colombo 07',
    capacity: '10,000',
    matches: 'Pre-Quarter Finals & Quarter-Finals',
    facilities: 'Floodlights, Practice Nets, Media Center',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.7986442209865!2d79.85714807465933!3d6.914161018365003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2596b8d5fa0c9%3A0xf11e377d4e2e9b4b!2sSinhalese%20Sports%20Club!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk'
  },
  {
    id: 'premadasa',
    name: 'R. Premadasa Stadium',
    address: 'Khettarama Road, Colombo',
    capacity: '35,000',
    matches: 'Semi-Finals & Finals',
    facilities: 'International Standard, Floodlights, VIP Boxes',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.722961328407!2d79.8835844746594!3d6.9274446184018!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2593e65e5d50b%3A0x5c70c6c4b5c6c5b4!2sR.%20Premadasa%20Stadium!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk'
  },
  {
    id: 'pSara',
    name: 'P. Sara Oval',
    address: 'Oval Road, Colombo 05',
    capacity: '15,000',
    matches: 'Quarter-Finals',
    facilities: 'Historic Ground, Pavilion, Media Box',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.9353030175657!2d79.8665805746592!3d6.897911218533445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2596a3b3b3b3b%3A0x3b3b3b3b3b3b3b3b!2sP.%20Sara%20Oval!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk'
  }
];


const bracketData = {
  boys: {
    title: "Inter-Provincial Cricket Series - BOYS",
    bracket: `
      <div class="round round-1">
        <h3>Pre-Quarter Finals</h3>
        <div class="matchup" id="PQF1"><span>Western Province vs. Bye</span><span class="score">Top Seed - Direct QF</span></div>
        <div class="matchup" id="PQF2"><span>Central Province vs. North Central Province</span><span class="score">Result: CP won by 28 runs</span></div>
        <div class="matchup" id="PQF3"><span>Southern Province vs. Sabaragamuwa Province</span><span class="score">Result: SP won by 5 wickets</span></div>
        <div class="matchup" id="PQF4"><span>Northern Province vs. Uva Province</span><span class="score">Result: NP won by 42 runs</span></div>
        <div class="matchup" id="PQF5"><span>North Western Province vs. Eastern Province</span><span class="score">Result: NWP won by 3 wickets</span></div>
      </div>
      <div class="connector"></div>
      <div class="round round-2">
        <h3>Quarter-Finals</h3>
        <div class="matchup" id="QF1"><span>Western Province vs. Central Province</span><span>Scheduled: Nov 16</span></div>
        <div class="matchup" id="QF2"><span>Southern Province vs. Northern Province</span><span>Scheduled: Nov 17</span></div>
        <div class="matchup" id="QF3"><span>North Western Province vs. Bye</span><span>Top Seed - Direct SF</span></div>
      </div>
      <div class="connector"></div>
      <div class="round round-final">
        <h3>Semi-Finals & Final</h3>
        <div class="matchup" id="SF1"><span>QF1 Winner vs. QF2 Winner</span><span>Scheduled: Nov 23</span></div>
        <div class="matchup" id="SF2"><span>North Western Province vs. QF3 Winner</span><span>Scheduled: Nov 24</span></div>
        <div class="matchup" id="FINAL"><span>SF1 Winner vs. SF2 Winner</span><span>Scheduled: 30 November</span></div>
      </div>
    `,
    results: [
      "Pre-Quarter Final 1 Result: Central Province defeated North Central Province by 28 runs. Player of the Match: S. Bandara (CP) - 68 runs & 2/25.",
      "Pre-Quarter Final 2 Result: Southern Province defeated Sabaragamuwa Province by 5 wickets. Best Batter: R. Silva (SP) with 89 not out.",
      "Pre-Quarter Final 3 Result: Northern Province defeated Uva Province by 42 runs. Best Bowler: K. Kumar (NP) with 4/18.",
      "Pre-Quarter Final 4 Result: North Western Province defeated Eastern Province by 3 wickets in a last-over thriller."
    ]
  },
  girls: {
    title: "Inter-Provincial Cricket Series - GIRLS",
    bracket: `
      <div class="round round-1">
        <h3>Pre-Quarter Finals</h3>
        <div class="matchup" id="PQF1"><span>Western Province vs. Bye</span><span class="score">Top Seed - Direct QF</span></div>
        <div class="matchup" id="PQF2"><span>Central Province vs. Uva Province</span><span class="score">Result: CP won by 15 runs</span></div>
        <div class="matchup" id="PQF3"><span>Southern Province vs. Eastern Province</span><span class="score">Result: SP won by 7 wickets</span></div>
        <div class="matchup" id="PQF4"><span>Northern Province vs. North Central Province</span><span class="score">Result: NP won by 35 runs</span></div>
        <div class="matchup" id="PQF5"><span>North Western Province vs. Sabaragamuwa Province</span><span class="score">Result: NWP won by 22 runs</span></div>
      </div>
      <div class="connector"></div>
      <div class="round round-2">
        <h3>Quarter-Finals</h3>
        <div class="matchup" id="QF1"><span>Western Province vs. Central Province</span><span>Scheduled: Nov 17</span></div>
        <div class="matchup" id="QF2"><span>Southern Province vs. Northern Province</span><span>Scheduled: Nov 18</span></div>
        <div class="matchup" id="QF3"><span>North Western Province vs. Bye</span><span>Top Seed - Direct SF</span></div>
      </div>
      <div class="connector"></div>
      <div class="round round-final">
        <h3>Semi-Finals & Final</h3>
        <div class="matchup" id="SF1"><span>QF1 Winner vs. QF2 Winner</span><span>Scheduled: Nov 24</span></div>
        <div class="matchup" id="SF2"><span>North Western Province vs. QF3 Winner</span><span>Scheduled: Nov 25</span></div>
        <div class="matchup" id="FINAL"><span>SF1 Winner vs. SF2 Winner</span><span>Scheduled: 1 December</span></div>
      </div>
    `,
    results: [
      "Pre-Quarter Final 1 Result: Central Province defeated Uva Province by 15 runs. Player of the Match: A. Perera (CP) - 45 runs & 3/20.",
      "Pre-Quarter Final 2 Result: Southern Province defeated Eastern Province by 7 wickets. Best Batter: L. Fernando (SP) with 62 not out.",
      "Pre-Quarter Final 3 Result: Northern Province defeated North Central Province by 35 runs. Best Bowler: S. Rajapaksa (NP) with 4/15.",
      "Pre-Quarter Final 4 Result: North Western Province defeated Sabaragamuwa Province by 22 runs in a competitive match."
    ]
  }
};


const groupStageData = {
  boys: {
    groups: [
      {
        name: "Group A",
        teams: [
          { name: "Western Province", points: 12, status: "Qualified (1st)" },
          { name: "North Western Province", points: 10, status: "Qualified (2nd)" },
          { name: "Southern Province", points: 8, status: "Qualified (3rd)" }
        ]
      },
      {
        name: "Group B",
        teams: [
          { name: "Central Province", points: 11, status: "Qualified (1st)" },
          { name: "Eastern Province", points: 9, status: "Qualified (2nd)" },
          { name: "Uva Province", points: 6, status: "Eliminated" }
        ]
      },
      {
        name: "Group C",
        teams: [
          { name: "Northern Province", points: 10, status: "Qualified (1st)" },
          { name: "Sabaragamuwa Province", points: 8, status: "Qualified (2nd)" },
          { name: "North Central Province", points: 5, status: "Eliminated" }
        ]
      }
    ]
  },
  girls: {
    groups: [
      {
        name: "Group A",
        teams: [
          { name: "Western Province", points: 11, status: "Qualified (1st)" },
          { name: "Southern Province", points: 9, status: "Qualified (2nd)" },
          { name: "North Western Province", points: 7, status: "Qualified (3rd)" }
        ]
      },
      {
        name: "Group B",
        teams: [
          { name: "Central Province", points: 10, status: "Qualified (1st)" },
          { name: "Eastern Province", points: 8, status: "Qualified (2nd)" },
          { name: "Uva Province", points: 5, status: "Eliminated" }
        ]
      },
      {
        name: "Group C",
        teams: [
          { name: "Northern Province", points: 9, status: "Qualified (1st)" },
          { name: "Sabaragamuwa Province", points: 7, status: "Qualified (2nd)" },
          { name: "North Central Province", points: 4, status: "Eliminated" }
        ]
      }
    ]
  }
};


const pageStyles = `

:root {
  --color-dark-primary: #000000;
  --color-accent-gold: #d1b042;
  --color-light-text: #eaf3fb;
  --color-white: #fff;
  --color-blue-mid-bg: #151515;
  --color-search-green: #53e51a;
  --color-card-bg: #0c0c0c;
  --color-ranking-link: #ff6600;
  --color-boys-active: #3f51b5;
  --color-girls-active: #e91e63;
  --spacing-large: 40px;
  --spacing-medium: 20px;
  --radius-medium: 15px;
  --radius-small: 8px;
  --radius-circle: 50%;
}

.hero-section {
  background: linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.9)), 
              url('/cricket-stadium-bg.jpg');
  background-size: cover;
  background-position: center;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
}

.hero-content {
  text-align: center;
  max-width: 900px;
  z-index: 2;
}

.hero-logo {
  width: 180px;
  height: 180px;
  margin: 0 auto 25px;
  border-radius: 50%;
  margin-top: 60px; 
  border: 0px solid var(--color-accent-gold);
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-logo img {
  width: 160px;
  height: 160px;
  object-fit: cover;
  border-radius: 50%;
}

.hero-title {
  font-size: 40px;
  font-weight: 900;
  color: #fbbf24;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 4px 8px rgba(133, 122, 122, 0.7);
}

.hero-subtitle {
  font-size: 40px;
  color: var(--color-accent-gold);
  margin-bottom: 25px;
  font-weight: 900;
  letter-spacing: 1px;
}

.hero-description {
  font-size: 18px;
  color: var(--color-light-text);
  max-width: 700px;
  margin: 0 auto 30px;
  line-height: 1.6;
}

.provinces-showcase {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  margin-top: 30px;
}

.province-badge {
  background: rgba(209, 176, 66, 0.15);
  border: 1px solid var(--color-accent-gold);
  border-radius: 50px;
  padding: 8px 18px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-white);
  transition: all 0.3s;
}

.province-badge:hover {
  background: var(--color-accent-gold);
  color: var(--color-dark-primary);
  transform: translateY(-3px);
}


.matches-main {
  margin: 0;
  background: var(--color-dark-primary);
  font-family: 'Inter', sans-serif;
  color: var(--color-light-text);
  line-height: 1.6;
}

a {
  text-decoration: none;
  color: inherit;
}

.container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 var(--spacing-medium);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 40px auto 40px;
  position: relative;
  padding-bottom: 12px;
  width: fit-content;
}

.page-header img {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-circle);
}

.page-header .title-text {
  font-style: italic;
  font-weight: 800;
  font-size: 32px;
  color: var(--color-white);
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.page-header::after {
  content: "";
  position: absolute;
  bottom: 0;
  width: 100%;
  max-width: 350px;
  height: 4px;
  background: var(--color-accent-gold);
}

.gender-selection-bar {
  max-width: 600px;
  margin: 0 auto 30px;
  text-align: center;
  padding: 15px;
  background-color: var(--color-card-bg);
  border-radius: var(--radius-medium);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  gap: 20px;
}

.gender-btn {
  background: var(--color-blue-mid-bg);
  color: var(--color-light-text);
  border: 2px solid var(--color-blue-mid-bg);
  padding: 10px 30px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  min-width: 120px;
}

.gender-btn:hover {
  opacity: 0.8;
}

.gender-btn.active-boys {
  background: var(--color-boys-active);
  border-color: var(--color-boys-active);
  color: var(--color-white);
  box-shadow: 0 0 15px rgba(63, 81, 181, 0.4);
}

.gender-btn.active-girls {
  background: var(--color-girls-active);
  border-color: var(--color-girls-active);
  color: var(--color-white);
  box-shadow: 0 0 15px rgba(233, 30, 99, 0.4);
}

.matches-section {
  padding: var(--spacing-medium) 0 var(--spacing-large);
  color: var(--color-light-text);
}

.intro-banner {
  max-width: 1000px;
  margin: 0 auto var(--spacing-large);
  padding: var(--spacing-medium);
  background: var(--color-blue-mid-bg);
  border-radius: var(--radius-medium);
  text-align: center;
  border: 1px solid var(--color-accent-gold);
}

.intro-banner h2 {
  color: var(--color-accent-gold);
  font-size: 26px;
  margin-top: 0;
}

.intro-banner p {
  color: var(--color-white);
  margin-bottom: 5px;
  font-size: 15px;
}

.selection-note {
  font-weight: 600;
  color: var(--color-search-green);
  margin-top: 15px;
  display: block;
}

.match-detail-item {
  background-color: var(--color-card-bg);
  border-left: 4px solid var(--color-accent-gold);
  padding: 15px;
  margin-bottom: 15px;
  border-radius: var(--radius-small);
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 15px;
  align-items: center;
}

.match-detail-item:nth-child(even) {
  border-left: 4px solid var(--color-search-green);
}

.match-detail-info strong {
  color: var(--color-white);
  font-size: 16px;
  display: block;
  margin-bottom: 5px;
}

.detail-label {
  color: var(--color-accent-gold);
  font-weight: 500;
  margin-right: 5px;
}

/* Results & Rankings Section */
.results-ranking-section {
  display: flex;
  gap: var(--spacing-medium);
  max-width: 1320px;
  margin: var(--spacing-large) auto;
}

.results-summary {
  flex: 2;
  padding: var(--spacing-medium);
  background: var(--color-card-bg);
  border-radius: var(--radius-medium);
}

.results-summary h3 {
  color: var(--color-search-green);
  margin-top: 0;
  border-bottom: 2px dashed var(--color-blue-mid-bg);
  padding-bottom: 10px;
}

.result-item {
  padding: 10px 0;
  border-bottom: 1px solid #1a1a1a;
  font-size: 15px;
}

.result-item strong {
  color: var(--color-accent-gold);
}

.ranking-portal {
  flex: 1;
  background: linear-gradient(135deg, var(--color-ranking-link), #ffaa00);
  padding: var(--spacing-medium);
  border-radius: var(--radius-medium);
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 5px 15px rgba(255, 102, 0, 0.4);
}

/* Tournament Bracket */
.bracket-container {
  max-width: 1200px;
  margin: var(--spacing-large) auto;
  padding: var(--spacing-medium);
  background: var(--color-blue-mid-bg);
  border-radius: var(--radius-medium);
  text-align: center;
}

.bracket-heading {
  color: var(--color-white);
  font-size: 24px;
  margin-bottom: var(--spacing-medium);
}

.tournament-bracket {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 20px 0;
  overflow-x: auto;
}

.round {
  display: flex;
  flex-direction: column;
  gap: 30px;
  min-width: 180px;
  padding: 0 10px;
}

.round.round-2 {
  gap: 90px;
}

.round.round-final {
  gap: 150px;
}

.matchup {
  background: var(--color-card-bg);
  border: 1px solid var(--color-accent-gold);
  border-radius: 5px;
  padding: 8px;
  position: relative;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-white);
  line-height: 1.2;
}

.matchup span {
  display: block;
  padding: 2px 0;
}

.matchup .score {
  color: var(--color-search-green);
}

/* Bracket Lines for Connectors */
.connector {
  flex-grow: 1;
  height: 1px;
  background: var(--color-accent-gold);
  position: relative;
  margin: 0 10px;
}

.round-1 .matchup:nth-child(odd)~.matchup:nth-child(even)::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 50%;
  height: 80px;
  width: 1px;
  background: var(--color-accent-gold);
  transform: translateY(-40px);
}


.grounds-section {
  max-width: 1200px;
  margin: var(--spacing-large) auto;
  padding: var(--spacing-medium);
  background: var(--color-blue-mid-bg);
  border-radius: var(--radius-medium);
}

.grounds-heading {
  color: var(--color-white);
  font-size: 24px;
  margin-bottom: var(--spacing-medium);
  text-align: center;
}

.grounds-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-medium);
  margin-bottom: var(--spacing-large);
}

.ground-info {
  background: var(--color-card-bg);
  padding: 20px;
  border-radius: var(--radius-small);
  border-left: 4px solid var(--color-accent-gold);
}

.ground-info h3 {
  color: var(--color-search-green);
  margin-top: 0;
  margin-bottom: 10px;
}

.ground-details p {
  margin: 8px 0;
  font-size: 14px;
}

.ground-details .detail-label {
  color: var(--color-accent-gold);
  font-weight: 600;
}

.map-container {
  width: 100%;
  height: 400px;
  border-radius: var(--radius-small);
  overflow: hidden;
  border: 2px solid var(--color-accent-gold);
}

/* Google Map iframe styling */
.ground-map {
  width: 100%;
  height: 100%;
  border: 0;
}

/* Ground selector tabs */
.ground-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.ground-tab {
  background: var(--color-card-bg);
  color: var(--color-light-text);
  border: 2px solid transparent;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  min-width: 150px;
  text-align: center;
}

.ground-tab:hover {
  background: var(--color-blue-mid-bg);
}

.ground-tab.active {
  background: var(--color-accent-gold);
  color: var(--color-dark-primary);
  border-color: var(--color-white);
}

.provinces-section {
  max-width: 1200px;
  margin: 50px auto;
  padding: 30px;
  background: var(--color-blue-mid-bg);
  border-radius: var(--radius-medium);
  text-align: center;
}

.provinces-section h2 {
  color: var(--color-white);
  font-size: 28px;
  margin-bottom: 30px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
}

.provinces-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

@media (max-width: 992px) {
  .provinces-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .provinces-grid {
    grid-template-columns: 1fr;
  }
}

.province-card {
  background: var(--color-card-bg);
  border-radius: var(--radius-small);
  padding: 20px;
  text-align: center;
  border: 1px solid rgba(209, 176, 66, 0.3);
  transition: all 0.3s;
}

.province-card:hover {
  border-color: var(--color-accent-gold);
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.province-card h3 {
  color: var(--color-accent-gold);
  margin-bottom: 10px;
  font-size: 18px;
}

.province-status {
  display: inline-block;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-top: 10px;
}

.status-qualified {
  background: rgba(83, 229, 26, 0.2);
  color: var(--color-search-green);
  border: 1px solid var(--color-search-green);
}

.status-pending {
  background: rgba(209, 176, 66, 0.2);
  color: var(--color-accent-gold);
  border: 1px solid var(--color-accent-gold);
}

.final-match-info {
  background: linear-gradient(135deg, var(--color-boys-active), var(--color-girls-active));
  padding: 25px;
  border-radius: var(--radius-small);
  margin-top: 30px;
  text-align: center;
}

.final-match-info h3 {
  color: var(--color-white);
  margin-bottom: 15px;
  font-size: 22px;
}

  max-width: 1200px;
  margin: 50px auto;
  padding: 30px;
  background: var(--color-blue-mid-bg);
  border-radius: var(--radius-medium);
}

.group-stage-section h2 {
  color: var(--color-white);
  font-size: 28px;
  margin-bottom: 30px;
  text-align: center;
  text-transform: uppercase;
}

.groups-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  margin-bottom: 40px;
}

@media (max-width: 992px) {
  .groups-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .groups-container {
    grid-template-columns: 1fr;
  }
}

.group-card {
  background: var(--color-card-bg);
  border-radius: var(--radius-small);
  padding: 25px;
  border: 2px solid var(--color-accent-gold);
}

.group-card h3 {
  color: var(--color-search-green);
  text-align: center;
  margin-bottom: 20px;
  font-size: 22px;
  border-bottom: 2px dashed var(--color-accent-gold);
  padding-bottom: 10px;
}

.team-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.team-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  transition: all 0.3s;
}

.team-list li:hover {
  background: rgba(209, 176, 66, 0.1);
}

.team-list li span:first-child {
  font-weight: 600;
  color: var(--color-white);
}

.team-list li span:last-child {
  color: var(--color-search-green);
  font-weight: 700;
  font-size: 16px;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 36px;
  }
  
  .hero-subtitle {
    font-size: 18px;
  }
  
  .hero-description {
    font-size: 16px;
  }
  
  .hero-logo {
    width: 140px;
    height: 140px;
  }
  
  .hero-logo img {
    width: 110px;
    height: 110px;
  }

  .gender-selection-bar {
    flex-direction: column;
    gap: 10px;
  }

  .results-ranking-section {
    flex-direction: column;
  }

  .match-detail-item {
    grid-template-columns: 1fr;
  }

  .tournament-bracket {
    flex-direction: column;
    align-items: stretch;
  }

  .round {
    min-width: auto;
  }

  .connector {
    display: none;
  }

  .grounds-container {
    grid-template-columns: 1fr;
  }
  
  .ground-tabs {
    flex-direction: column;
    align-items: center;
  }
  
  .ground-tab {
    width: 100%;
    max-width: 300px;
  }
}


.loading-spinner {
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid var(--color-accent-gold);
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.data-loading {
  text-align: center;
  padding: 40px;
  color: var(--color-accent-gold);
}
`;

// Type definitions
interface Province {
  id: string;
  province_code: string;
  name: string;
  capital: string | null;
  population: string | null;
  cricket_teams: string | null;
  status: string;
  group_name: string | null;
  points: number;
  performance: string | null;
}

interface Match {
  id: string;
  match_code: string;
  gender: 'boys' | 'girls';
  stage: string;
  title: string;
  match_date: string;
  match_time: string;
  umpires: string | null;
  status: string;
  ground_name: string | null;
  team1_name: string | null;
  team2_name: string | null;
}

interface TournamentStats {
  total_matches: number;
  completed_matches: number;
  upcoming_matches: number;
  total_provinces: number;
}


const getAllProvinces = async (): Promise<Province[]> => {
  const { data, error } = await supabase
    .from('provinces')
    .select('*')
    .order('name');
  if (error) {
    console.error('Error fetching provinces:', error);
    return [];
  }
  return data || [];
};

const getMatchesByGender = async (gender: 'boys' | 'girls'): Promise<Match[]> => {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('gender', gender)
    .order('match_date', { ascending: true });
  if (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
  return data || [];
};

const getGroupStageData = async (gender: 'boys' | 'girls'): Promise<any> => {
  
  return groupStageData[gender];
};

const getAllGrounds = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('grounds')
    .select('*')
    .order('name');
  if (error) {
    console.error('Error fetching grounds:', error);
    return groundLocations; 
  }
  return data || groundLocations;
};

const getTournamentSettings = async (): Promise<any> => {
  
  const { data, error } = await supabase
    .from('tournament_settings')
    .select('*')
    .maybeSingle(); 
  
  if (error) {
    console.error('Error fetching tournament settings:', error);
    return {};
  }
  return data || {};
};

const getTournamentStatistics = async (gender: 'boys' | 'girls'): Promise<TournamentStats | null> => {
  try {
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('status')
      .eq('gender', gender);
    
    if (matchesError) throw matchesError;

    const total = matches.length;
    const completed = matches.filter(m => m.status === 'completed').length;
    const upcoming = total - completed;

    const { count: totalProvinces, error: countError } = await supabase
      .from('provinces')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    return {
      total_matches: total,
      completed_matches: completed,
      upcoming_matches: upcoming,
      total_provinces: totalProvinces || 9
    };
  } catch (err) {
    console.error('Error fetching tournament statistics:', err);
    return null;
  }
};

export default function MatchesPage() {
  const [currentGender, setCurrentGender] = useState<'boys' | 'girls'>('boys');
  const [selectedGround, setSelectedGround] = useState(groundLocations[0]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [tournamentStats, setTournamentStats] = useState<TournamentStats | null>(null);
  const [tournamentSettings, setTournamentSettings] = useState<any>({});

  const data = bracketData[currentGender];
  const groupData = groupStageData[currentGender];
  const genderDisplay = currentGender === 'boys' ? 'BOYS' : 'GIRLS';

  // Inject CSS styles
  useEffect(() => {
    if (!document.querySelector('style[data-matches-page]')) {
      const styleElement = document.createElement('style');
      styleElement.setAttribute('data-matches-page', 'true');
      styleElement.textContent = pageStyles;
      document.head.appendChild(styleElement);
    }
    return () => {
      const styleEl = document.querySelector('style[data-matches-page]');
      if (styleEl) document.head.removeChild(styleEl);
    };
  }, []);

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [provincesData, matchesData, settings] = await Promise.all([
        getAllProvinces(),
        getMatchesByGender(currentGender),
        getTournamentSettings()
      ]);

      setProvinces(provincesData);
      setMatches(matchesData);
      setTournamentSettings(settings);

      const stats = await getTournamentStatistics(currentGender);
      setTournamentStats(stats);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentGender]);

  useEffect(() => {
    const handleMatchesUpdated = () => {
      fetchData();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('matches-updated', handleMatchesUpdated);
      return () => window.removeEventListener('matches-updated', handleMatchesUpdated);
    }
  }, [currentGender]); 
  const handleGroundSelect = (ground: typeof groundLocations[0]) => {
    setSelectedGround(ground);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-logo">
            <img src="/image55.png" alt="Path of Cricket Logo" />
          </div>
          <h1 className="hero-title">PATH OF THE CRICKET</h1>
          <h1 className="hero-title">Inter-Provincial Cricket Series 2026</h1>
          <h2 className="hero-subtitle">Path of Cricket Talent Development Program</h2>
          <p className="hero-description">
            All 9 provinces of Sri Lanka compete in this prestigious knockout tournament! 
            Following an intensive 3-month workshop phase, the top talents now represent their provinces 
            in this knockout championship. Boys and Girls categories compete separately in a tournament 
            featuring all 9 Sri Lankan provinces.
          </p>
          
          <div className="provinces-showcase">
            {provinces.slice(0, 9).map((province) => (
              <span key={province.id} className="province-badge">
                {province.name.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>
      </section>

      
      <main className="matches-main">

        <section className="provinces-section">
          <h2>All 9 Provinces of Sri Lanka Participating</h2>
          <p style={{ color: 'var(--color-light-text)', marginBottom: '30px', fontSize: '16px' }}>
            Every province in Sri Lanka is represented in this tournament. The group stage ensured 
            maximum participation before the knockout rounds.
          </p>
          
          {loading ? (
            <div className="data-loading">
              <div className="loading-spinner"></div>
              <p>Loading provinces data...</p>
            </div>
          ) : (
            <>
              <div className="provinces-grid">
                {provinces.map((province) => (
                  <div key={province.id} className="province-card">
                    <h3>{province.name}</h3>
                    <p><strong>Capital:</strong> {province.capital || 'N/A'}</p>
                    <p><strong>Population:</strong> {province.population || 'N/A'}</p>
                    <p><strong>Cricket Teams:</strong> {province.cricket_teams || 'N/A'}</p>
                    <div className={`province-status ${province.status === 'qualified' ? 'status-qualified' : 'status-pending'}`}>
                      {province.status === 'qualified' ? '✓ Qualified for Knockouts' : 'In Tournament'}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="final-match-info">
                <h3>Grand Final Match - {genderDisplay}' Category</h3>
                <p style={{ color: 'var(--color-white)', fontSize: '18px', marginBottom: '10px' }}>
                  {currentGender === 'boys' 
                    ? tournamentSettings.boys_final_date || '30 November 2024'
                    : tournamentSettings.girls_final_date || '1 December 2024'
                  } | R. Premadasa Stadium, Colombo
                </p>
                <p style={{ color: 'var(--color-white)', fontSize: '16px' }}>
                  The final match will feature the two best teams from the knockout phase, 
                  representing the culmination of talent from all 9 provinces of Sri Lanka.
                </p>
              </div>
            </>
          )}
        </section>

        <section className="group-stage-section">
          <h2>Group Stage Results - {genderDisplay}' Category</h2>
          <p style={{ color: 'var(--color-light-text)', textAlign: 'center', marginBottom: '30px', fontSize: '16px' }}>
            All 9 provinces were divided into 3 groups of 3 teams each. Top 2 teams from each group qualified for knockout stage.
          </p>
          
          <div className="groups-container">
            {groupData.groups.map((group, index) => (
              <div key={index} className="group-card">
                <h3>{group.name}</h3>
                <ul className="team-list">
                  {group.teams.map((team, teamIndex) => (
                    <li key={teamIndex}>
                      <span>{team.name}</span>
                      <span>{team.points} pts</span>
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: '15px', textAlign: 'center' }}>
                  <span style={{ color: 'var(--color-search-green)', fontSize: '14px' }}>
                    Qualified Teams: {group.teams.filter(t => t.status.includes('Qualified')).length}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ color: 'var(--color-accent-gold)', fontSize: '16px', fontWeight: '600' }}>
              <i className="fas fa-info-circle"></i> Top 2 teams from each group (6 teams total) + 2 best 3rd placed teams qualify for knockout stage
            </p>
          </div>
        </section>

       
        <div className="page-header">
          <img src="/image55.png" alt="Cricket bat and ball icon" />
          <h1 className="title-text" id="series-title">{data.title}</h1>
        </div>

        <div className="matches-section">
          <div className="container">
            
            <div className="gender-selection-bar">
              <button
                className={`gender-btn ${currentGender === 'boys' ? 'active-boys' : ''}`}
                onClick={() => setCurrentGender('boys')}
              >
                <i className="fas fa-male"></i> Boys' Series
              </button>
              <button
                className={`gender-btn ${currentGender === 'girls' ? 'active-girls' : ''}`}
                onClick={() => setCurrentGender('girls')}
              >
                <i className="fas fa-female"></i> Girls' Series
              </button>
            </div>

            <section className="intro-banner">
              <h2 id="intro-title">The Provincial Talent Cup ({genderDisplay}): Knockout Stage 🏆</h2>
              {tournamentStats && (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(4, 1fr)', 
                  gap: '15px', 
                  marginBottom: '20px',
                  padding: '15px',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '10px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-search-green)' }}>
                      {tournamentStats.total_matches || 0}
                    </div>
                    <div style={{ fontSize: '12px' }}>Total Matches</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
                      {tournamentStats.completed_matches || 0}
                    </div>
                    <div style={{ fontSize: '12px' }}>Completed</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-accent-gold)' }}>
                      {tournamentStats.upcoming_matches || 0}
                    </div>
                    <div style={{ fontSize: '12px' }}>Upcoming</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>
                      {tournamentStats.total_provinces || 9}
                    </div>
                    <div style={{ fontSize: '12px' }}>Provinces</div>
                  </div>
                </div>
              )}
              <p>Following the group stage where all 9 provinces competed, the top 8 teams have qualified for the knockout stage.</p>
              <p>This Inter-Provincial Series is the ultimate platform for performance, where all actions directly feed the Player Ranking Algorithm for national selection consideration.</p>
              <p className="selection-note">
                <i className="fas fa-exclamation-triangle"></i> All 9 provinces participated in the group stage with 8 qualifying for knockout rounds.
              </p>
            </section>

            <hr style={{ borderColor: '#222' }} />

            
            <section className="bracket-container">
              <h2 className="bracket-heading" id="bracket-heading">{genderDisplay}' Knockout Tournament Structure</h2>
              <div className="tournament-bracket" id="tournament-bracket" dangerouslySetInnerHTML={{ __html: data.bracket }}></div>
              <div style={{ marginTop: '20px', color: 'var(--color-light-text)', fontSize: '14px' }}>
                <p><i className="fas fa-info-circle" style={{ color: 'var(--color-search-green)' }}></i> 
                  Tournament features: Pre-Quarter Finals → Quarter-Finals → Semi-Finals → Grand Final
                </p>
              </div>
            </section>

            <hr style={{ borderColor: '#222' }} />

            
            <h2 className="page-header" style={{ margin: '40px auto 20px' }}>
              <i className="fas fa-calendar-alt" style={{ color: 'var(--color-accent-gold)' }}></i> 
              Detailed Match Schedule - Knockout Stage
            </h2>

            {loading ? (
              <div className="data-loading">
                <div className="loading-spinner"></div>
                <p>Loading matches schedule...</p>
              </div>
            ) : (
              <div className="schedule-details" id="detailed-schedule">
                {matches.length > 0 ? (
                  matches.map((match) => (
                    <div className="match-detail-item" key={match.id}>
                      <div className="match-detail-info">
                        <strong>{match.title}</strong>
                        <span>
                          <span className="detail-label">
                            <i className="fas fa-location-arrow"></i> Venue:
                          </span> {match.ground_name || 'To be announced'}
                        </span>
                        <span>
                          <span className="detail-label">
                            <i className="fas fa-calendar-day"></i> Date:
                          </span> {formatDate(match.match_date)}
                        </span>
                      </div>
                      <div className="match-detail-info">
                        <span className="detail-label">
                          <i className="fas fa-clock"></i> Time:
                        </span> {match.match_time}
                      </div>
                      <div className="match-detail-info">
                        <span className="detail-label">
                          <i className="fas fa-user-shield"></i> Umpires:
                        </span> {match.umpires || 'To be announced'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-accent-gold)' }}>
                    <p>No matches scheduled yet for {genderDisplay.toLowerCase()} category.</p>
                  </div>
                )}
              </div>
            )}

            <hr style={{ borderColor: '#222' }} />

            
            <section className="grounds-section">
              <h2 className="grounds-heading">
                <i className="fas fa-map-marker-alt" style={{ color: 'var(--color-accent-gold)', marginRight: '10px' }}></i>
                Match Venues & Locations
              </h2>
              
              
              <div className="ground-tabs">
                {groundLocations.map((ground) => (
                  <button
                    key={ground.id}
                    className={`ground-tab ${selectedGround.id === ground.id ? 'active' : ''}`}
                    onClick={() => handleGroundSelect(ground)}
                  >
                    {ground.name}
                  </button>
                ))}
              </div>

              <div className="grounds-container">
               
                <div className="ground-info">
                  <h3>{selectedGround.name}</h3>
                  <div className="ground-details">
                    <p><span className="detail-label">Address:</span> {selectedGround.address}</p>
                    <p><span className="detail-label">Capacity:</span> {selectedGround.capacity} spectators</p>
                    <p><span className="detail-label">Matches Hosted:</span> {selectedGround.matches}</p>
                    <p><span className="detail-label">Facilities:</span> {selectedGround.facilities}</p>
                    <p><span className="detail-label">Current Matches:</span> {genderDisplay} series knockout matches</p>
                  </div>
                </div>

                
                <div className="map-container">
                  <iframe
                    src={selectedGround.mapUrl}
                    className="ground-map"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${selectedGround.name} Location Map`}
                  ></iframe>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--color-light-text)' }}>
                <i className="fas fa-info-circle" style={{ color: 'var(--color-search-green)', marginRight: '5px' }}></i>
                Click on different venue tabs to view their locations and details
              </div>
            </section>

            <hr style={{ borderColor: '#222' }} />

            
            <section className="results-ranking-section">
              <div className="results-summary">
                <h3 id="results-summary-heading">
                  <i className="fas fa-trophy"></i> Latest {genderDisplay}' Match Results Summary
                </h3>
                <div id="latest-results">
                  {data.results.map((result, idx) => (
                    <div className="result-item" key={idx} style={idx === data.results.length - 1 ? { borderBottom: 'none' } : {}}>
                      <strong>Match Result {idx + 1}:</strong> {result}
                    </div>
                  ))}
                </div>
              </div>

              <div className="ranking-portal">
                <h3>PERFORMANCE DATA LIVE</h3>
                <p style={{ color: 'black', fontWeight: 500, fontSize: '14px' }}>
                  Every action from all 9 provinces is analyzed: Batting Average, Strike Rate, Bowling Economy, Fielding Metrics.
                </p>
                <a href="#" style={{ 
                  background: 'white', 
                  color: 'black', 
                  padding: '10px 20px', 
                  borderRadius: '5px',
                  fontWeight: 'bold',
                  marginTop: '15px',
                  display: 'inline-block'
                }}>
                  <i className="fas fa-sort-numeric-down"></i> Access Player Rankings Portal
                </a>
              </div>
            </section>
          </div>
        </div>

        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </main>
    </>
  );
}