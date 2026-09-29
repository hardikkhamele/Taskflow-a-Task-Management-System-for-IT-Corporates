import React from 'react';

const CARD_PALETTE = ['#2DD4A0', '#F4516C', '#4A80D4', '#F5A623', '#8E44AD', '#2C3E50'];

const colorMap = {
  blue:    '#4A80D4',
  emerald: '#2DD4A0',
  amber:   '#F5A623',
  rose:    '#F4516C',
  purple:  '#8E44AD',
  slate:   '#2C3E50',
};

const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle, paletteIndex }) => {
  const bg = paletteIndex !== undefined
    ? CARD_PALETTE[paletteIndex % CARD_PALETTE.length]
    : (colorMap[color] || '#4A80D4');

  return (
    <div className="stat-card" style={{ background: bg }}>
      <span className="stat-card-label">{title}</span>
      <span className="stat-card-value">{value}</span>
      {subtitle && <span style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>{subtitle}</span>}
    </div>
  );
};

export default StatCard;
