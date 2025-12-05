/**
 * SmartMock Visualization Components
 * Emotion Heatmap, Radar Charts, Progress Visualizations
 * Version: 2.0
 */

(function() {
  'use strict';

  const Visualizations = {
    /**
     * Generate Emotion Heatmap Timeline
     */
    createEmotionHeatmap(emotions, duration) {
      if (!emotions || emotions.length === 0) {
        return { error: 'No emotion data available' };
      }

      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = '#080C18';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate time segments
      const segmentWidth = canvas.width / emotions.length;

      // Emotion color mapping
      const emotionColors = {
        'Happy': '#00FF88',
        'Confident': '#6C63FF',
        'Neutral': '#FFB800',
        'Nervous': '#FF8C00',
        'Confused': '#FF3366',
        'default': '#888888'
      };

      // Draw emotion bars
      emotions.forEach((emotion, index) => {
        const x = index * segmentWidth;
        const color = emotionColors[emotion.type] || emotionColors.default;
        const intensity = emotion.confidence || 0.5;

        ctx.fillStyle = color;
        ctx.globalAlpha = intensity;
        ctx.fillRect(x, 0, segmentWidth, canvas.height);
        ctx.globalAlpha = 1;
      });

      // Draw spikes (high nervousness or confusion)
      ctx.strokeStyle = '#FF3366';
      ctx.lineWidth = 3;
      emotions.forEach((emotion, index) => {
        if ((emotion.type === 'Nervous' || emotion.type === 'Confused') && emotion.confidence > 0.7) {
          const x = index * segmentWidth + segmentWidth / 2;
          ctx.beginPath();
          ctx.moveTo(x, canvas.height);
          ctx.lineTo(x, canvas.height - 50);
          ctx.stroke();

          // Draw warning icon
          ctx.fillStyle = '#FF3366';
          ctx.font = 'bold 20px Arial';
          ctx.fillText('⚠️', x - 10, canvas.height - 60);
        }
      });

      // Draw timeline markers
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '12px Arial';
      const intervals = 5;
      for (let i = 0; i <= intervals; i++) {
        const x = (canvas.width / intervals) * i;
        const time = Math.round((duration / intervals) * i);
        ctx.fillText(`${time}s`, x - 10, canvas.height - 10);
      }

      // Legend
      const legendX = canvas.width - 150;
      const legendY = 20;
      let yOffset = 0;

      Object.keys(emotionColors).forEach(emotion => {
        if (emotion !== 'default') {
          ctx.fillStyle = emotionColors[emotion];
          ctx.fillRect(legendX, legendY + yOffset, 20, 20);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '14px Arial';
          ctx.fillText(emotion, legendX + 25, legendY + yOffset + 15);
          yOffset += 25;
        }
      });

      return {
        canvas,
        dataURL: canvas.toDataURL('image/png'),
        spikes: this.identifySpikes(emotions),
        emotionDistribution: this.calculateEmotionDistribution(emotions)
      };
    },

    /**
     * Identify emotion spikes
     */
    identifySpikes(emotions) {
      const spikes = [];
      emotions.forEach((emotion, index) => {
        if ((emotion.type === 'Nervous' || emotion.type === 'Confused') && emotion.confidence > 0.7) {
          spikes.push({
            index,
            timestamp: emotion.timestamp,
            type: emotion.type,
            confidence: emotion.confidence,
            severity: emotion.confidence > 0.9 ? 'High' : 'Medium'
          });
        }
      });
      return spikes;
    },

    /**
     * Calculate emotion distribution
     */
    calculateEmotionDistribution(emotions) {
      const distribution = {};
      emotions.forEach(emotion => {
        distribution[emotion.type] = (distribution[emotion.type] || 0) + 1;
      });

      const total = emotions.length;
      const percentages = {};
      Object.keys(distribution).forEach(emotion => {
        percentages[emotion] = ((distribution[emotion] / total) * 100).toFixed(1);
      });

      return {
        counts: distribution,
        percentages,
        dominant: Object.keys(distribution).reduce((a, b) => 
          distribution[a] > distribution[b] ? a : b
        )
      };
    },

    /**
     * Export Heatmap as PNG
     */
    exportHeatmapAsPNG(heatmapCanvas, filename = 'emotion-heatmap.png') {
      const link = document.createElement('a');
      link.download = filename;
      link.href = heatmapCanvas.toDataURL('image/png');
      link.click();
    },

    /**
     * Create Radar Chart for Speech Clarity Index
     */
    createRadarChart(data, containerId) {
      const container = document.getElementById(containerId);
      if (!container) {
        console.error(`Container ${containerId} not found`);
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      canvas.id = 'radar-chart-canvas';
      container.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 150;

      // Clear canvas
      ctx.fillStyle = '#080C18';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw concentric circles (grid)
      const levels = 5;
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= levels; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (radius / levels) * i, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Draw axes
      const categories = data.labels;
      const angleStep = (2 * Math.PI) / categories.length;

      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      categories.forEach((_, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
      });

      // Draw labels
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      categories.forEach((label, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const x = centerX + (radius + 30) * Math.cos(angle);
        const y = centerY + (radius + 30) * Math.sin(angle);
        ctx.fillText(label, x, y);
      });

      // Draw datasets
      data.datasets.forEach((dataset, datasetIndex) => {
        const values = dataset.data;
        
        // Draw filled polygon
        ctx.beginPath();
        values.forEach((value, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const normalizedValue = (value / 100) * radius;
          const x = centerX + normalizedValue * Math.cos(angle);
          const y = centerY + normalizedValue * Math.sin(angle);

          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.closePath();

        ctx.fillStyle = dataset.backgroundColor;
        ctx.fill();
        ctx.strokeStyle = dataset.borderColor;
        ctx.lineWidth = dataset.borderWidth;
        if (dataset.borderDash) {
          ctx.setLineDash(dataset.borderDash);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw points
        ctx.fillStyle = dataset.borderColor;
        values.forEach((value, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const normalizedValue = (value / 100) * radius;
          const x = centerX + normalizedValue * Math.cos(angle);
          const y = centerY + normalizedValue * Math.sin(angle);

          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fill();
        });
      });

      // Draw legend
      const legendX = 20;
      let legendY = 20;
      data.datasets.forEach(dataset => {
        ctx.fillStyle = dataset.borderColor;
        ctx.fillRect(legendX, legendY, 30, 15);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(dataset.label, legendX + 35, legendY + 12);
        legendY += 25;
      });

      return canvas;
    },

    /**
     * Create Progress Bar with Animation
     */
    createAnimatedProgressBar(value, max, label, color = '#6C63FF') {
      const container = document.createElement('div');
      container.className = 'progress-bar-container';
      container.style.cssText = 'margin: 15px 0; font-family: Arial;';

      const labelEl = document.createElement('div');
      labelEl.textContent = label;
      labelEl.style.cssText = 'color: #FFFFFF; font-size: 14px; margin-bottom: 5px; display: flex; justify-content: space-between;';

      const valueEl = document.createElement('span');
      valueEl.textContent = `${value}/${max}`;
      valueEl.style.cssText = 'color: rgba(255,255,255,0.7); font-size: 12px;';
      labelEl.appendChild(valueEl);

      const track = document.createElement('div');
      track.style.cssText = `
        width: 100%;
        height: 8px;
        background: rgba(255,255,255,0.1);
        border-radius: 10px;
        overflow: hidden;
        position: relative;
      `;

      const fill = document.createElement('div');
      const percentage = (value / max) * 100;
      fill.style.cssText = `
        width: 0%;
        height: 100%;
        background: ${color};
        border-radius: 10px;
        transition: width 1s ease-out;
        box-shadow: 0 0 10px ${color};
      `;

      track.appendChild(fill);
      container.appendChild(labelEl);
      container.appendChild(track);

      // Animate
      setTimeout(() => {
        fill.style.width = `${percentage}%`;
      }, 100);

      return container;
    },

    /**
     * Create Badge Display
     */
    createBadgeDisplay(badges) {
      const container = document.createElement('div');
      container.className = 'badges-container';
      container.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 15px;
        margin: 20px 0;
      `;

      badges.forEach(badge => {
        const badgeEl = document.createElement('div');
        badgeEl.className = `badge badge-${badge.tier}`;
        badgeEl.style.cssText = `
          background: rgba(255,255,255,0.05);
          border: 2px solid ${this.getBadgeColor(badge.tier)};
          border-radius: 12px;
          padding: 15px;
          text-align: center;
          transition: transform 0.3s, box-shadow 0.3s;
          cursor: pointer;
        `;

        badgeEl.innerHTML = `
          <div style="font-size: 40px; margin-bottom: 5px;">${badge.icon}</div>
          <div style="color: #FFFFFF; font-size: 14px; font-weight: 600;">${badge.name}</div>
          <div style="color: ${this.getBadgeColor(badge.tier)}; font-size: 11px; text-transform: uppercase; margin-top: 3px;">${badge.tier}</div>
        `;

        badgeEl.addEventListener('mouseenter', () => {
          badgeEl.style.transform = 'translateY(-5px) scale(1.05)';
          badgeEl.style.boxShadow = `0 5px 20px ${this.getBadgeColor(badge.tier)}`;
        });

        badgeEl.addEventListener('mouseleave', () => {
          badgeEl.style.transform = 'translateY(0) scale(1)';
          badgeEl.style.boxShadow = 'none';
        });

        container.appendChild(badgeEl);
      });

      return container;
    },

    getBadgeColor(tier) {
      const colors = {
        bronze: '#CD7F32',
        silver: '#C0C0C0',
        gold: '#FFD700',
        platinum: '#E5E4E2'
      };
      return colors[tier] || '#888888';
    },

    /**
     * Create XP Progress Display
     */
    createXPDisplay(levelData) {
      const container = document.createElement('div');
      container.className = 'xp-display';
      container.style.cssText = `
        background: linear-gradient(135deg, #6C63FF 0%, #00E5FF 100%);
        border-radius: 16px;
        padding: 20px;
        color: #FFFFFF;
        box-shadow: 0 10px 30px rgba(108, 99, 255, 0.3);
      `;

      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <div>
            <div style="font-size: 32px; font-weight: 700;">Level ${levelData.level}</div>
            <div style="font-size: 16px; opacity: 0.9;">${levelData.title}</div>
          </div>
          <div style="font-size: 48px;">${this.getLevelIcon(levelData.level)}</div>
        </div>
        <div style="background: rgba(255,255,255,0.2); border-radius: 10px; height: 12px; overflow: hidden; margin-bottom: 10px;">
          <div style="width: ${levelData.progress}%; height: 100%; background: #FFFFFF; border-radius: 10px; transition: width 1s ease-out;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 13px; opacity: 0.9;">
          <span>${levelData.progressXP} XP</span>
          <span>${levelData.requiredXP} XP to Level ${levelData.level + 1}</span>
        </div>
      `;

      return container;
    },

    getLevelIcon(level) {
      if (level >= 50) return '🏆';
      if (level >= 40) return '💎';
      if (level >= 30) return '⭐';
      if (level >= 20) return '🎯';
      if (level >= 10) return '📚';
      return '🌱';
    },

    /**
     * Create Streak Tracker
     */
    createStreakDisplay(streakData) {
      const container = document.createElement('div');
      container.className = 'streak-display';
      container.style.cssText = `
        background: rgba(255, 183, 0, 0.1);
        border: 2px solid #FFB800;
        border-radius: 12px;
        padding: 15px 20px;
        display: flex;
        align-items: center;
        gap: 15px;
      `;

      container.innerHTML = `
        <div style="font-size: 40px;">🔥</div>
        <div style="flex: 1;">
          <div style="color: #FFB800; font-size: 24px; font-weight: 700;">${streakData.currentStreak} Day Streak</div>
          <div style="color: rgba(255,255,255,0.7); font-size: 13px;">Longest: ${streakData.longestStreak} days</div>
        </div>
        ${streakData.currentStreak >= 7 ? '<div style="font-size: 30px;">🏆</div>' : ''}
      `;

      return container;
    },

    /**
     * Export chart as image
     */
    exportChartAsImage(canvas, filename) {
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  // Export to global
  window.SmartMockVisualizations = Visualizations;
  console.log('✅ SmartMock Visualizations Module Loaded (v2.0)');
})();
