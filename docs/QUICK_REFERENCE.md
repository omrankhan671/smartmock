# 🎯 SmartMock v2.0 - Quick Reference Card

## 📦 Core Modules

```javascript
// Load all advanced features
<script src="assets/js/advanced-features.js"></script>      // Bias, Clarity, Gamification
<script src="assets/js/adaptive-interview.js"></script>    // Adaptive paths
<script src="assets/js/visualizations.js"></script>        // Heatmaps, charts
<script src="assets/js/integrity-monitor.js"></script>     // Security
<script src="assets/js/ai-tutor.js"></script>              // Tutor system
<script src="assets/js/i18n-accessibility.js"></script>    // i18n + A11y
<script src="assets/js/plugin-system.js"></script>         // Plugins, export, templates
```

## ⚡ Quick Start

### Bias & Confidence Analysis
```javascript
const analysis = SmartMockAdvanced.BiasAnalyzer.performFullAnalysis(transcript, emotions);
// Returns: fillerWords, passiveTone, vagueAnswers, confidence, strategies
```

### Adaptive Interview
```javascript
const interview = AdaptiveInterview.init('cs', 1);
const question = AdaptiveInterview.getNextQuestion(interview);
```

### Gamification
```javascript
const xp = SmartMockAdvanced.GamificationSystem.calculateXP(85, 'ai', 'cs');
const level = SmartMockAdvanced.GamificationSystem.calculateLevel(1250);
const badges = SmartMockAdvanced.GamificationSystem.checkBadges(userData);
```

### Emotion Heatmap
```javascript
const heatmap = SmartMockVisualizations.createEmotionHeatmap(emotions, duration);
document.getElementById('container').appendChild(heatmap.canvas);
SmartMockVisualizations.exportHeatmapAsPNG(heatmap.canvas);
```

### Speech Clarity
```javascript
const clarity = SmartMockAdvanced.SpeechClarityIndex.calculateClarityIndex(speechData);
const radarData = SmartMockAdvanced.SpeechClarityIndex.generateRadarChartData(clarity);
SmartMockVisualizations.createRadarChart(radarData, 'chart-container');
```

### AI Tutor
```javascript
AITutor.init('cs');
const hint = AITutor.provideHint(question, 'medium');
const explanation = AITutor.explainAnswer(question, answer, ['keyword1', 'keyword2']);
const resources = AITutor.suggestResources('Data Structures', 'cs');
```

### Integrity Monitor
```javascript
IntegrityMonitor.init({ strict: true });
IntegrityMonitor.monitorMicrophone(audioStream);
IntegrityMonitor.monitorCamera(videoElement);
const report = IntegrityMonitor.getReport();
```

### Accessibility
```javascript
SmartMockA11y.init();
SmartMockA11y.toggleHighContrast();
SmartMockA11y.announce('Message', 'polite');
SmartMockA11y.addCaptions('Speech text');
```

### Multilingual
```javascript
SmartMockI18n.init();
SmartMockI18n.setLanguage('hi'); // Hindi
console.log(SmartMockI18n.t('dashboard')); // "डैशबोर्ड"
```

### Offline Export
```javascript
const html = await OfflineExport.exportDashboard(userData);
OfflineExport.downloadDashboard(html, 'dashboard.html');
```

### Plugin System
```javascript
PluginSystem.registerPlugin(myPlugin);
const html = PluginSystem.generateDepartmentPage('robotics');
const files = PluginSystem.generatePluginFiles('robotics');
```

### Templates
```javascript
const template = TemplateSystem.createTemplate(config);
await TemplateSystem.saveTemplate(template, userId);
const link = TemplateSystem.getShareableLink(templateId);
```

## 🎨 Visualization Components

```javascript
// Progress bar
const bar = SmartMockVisualizations.createAnimatedProgressBar(75, 100, 'Progress');

// Badge display
const badges = SmartMockVisualizations.createBadgeDisplay(badgeArray);

// XP display
const xpDisplay = SmartMockVisualizations.createXPDisplay(levelData);

// Streak display
const streak = SmartMockVisualizations.createStreakDisplay(streakData);
```

## 🔢 Key Formulas

### XP Calculation
```
XP = 50 × (score/100) × typeBonus × deptBonus
```

### Level Calculation
```
Level = floor(sqrt(TotalXP / 100)) + 1
```

### Clarity Index
```
Clarity = WPM×0.25 + Filler×0.25 + Pause×0.2 + Volume×0.15 + Pronunciation×0.15
```

### Overall Score
```
Score = Technical×0.4 + Communication×0.3 + Confidence×0.25 + Emotion×0.05
```

## 🎯 Optimal Ranges

| Metric | Optimal Range | Score |
|--------|---------------|-------|
| WPM | 140-160 | 100 |
| Filler Density | < 2% | 95 |
| Pause Length | 0.5-1.5s | 100 |
| Volume Consistency | > 80% | 85+ |
| Pronunciation | > 85% | 90+ |

## 🏆 Badge Tiers

| Tier | Color | Requirements |
|------|-------|--------------|
| Bronze | #CD7F32 | 1+ achievement |
| Silver | #C0C0C0 | 10+ achievement |
| Gold | #FFD700 | 50+ achievement |
| Platinum | #E5E4E2 | 100+ achievement |

## 🌐 Supported Languages

| Code | Language | Status |
|------|----------|--------|
| en | English | 100% |
| hi | हिन्दी | 100% |
| te | తెలుగు | 60% |
| ta | தமிழ் | 60% |
| es | Español | 60% |
| fr | Français | 60% |

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Tab | Next element |
| Shift+Tab | Previous element |
| Space | Activate |
| Enter | Submit |
| Escape | Close modal |
| Arrow Keys | Navigate |

## 🚨 Integrity Violations

| Type | Severity | Action |
|------|----------|--------|
| TAB_SWITCH | HIGH | Warning after 3 |
| WINDOW_BLUR | HIGH | Log |
| MICROPHONE_MUTE | HIGH | Detect silence |
| CAMERA_BLOCKED | HIGH | Detect black frames |
| RIGHT_CLICK | MEDIUM | Prevent in strict |
| COPY/PASTE | MEDIUM | Log |

## 📊 Risk Levels

| Level | Violations | HIGH Count |
|-------|-----------|------------|
| CLEAN | 0-4 | 0 |
| LOW | 5-9 | 0-2 |
| MEDIUM | 10+ | 3-4 |
| HIGH | Any | 5+ |
| CRITICAL | Any | 5+ |

## 🎓 Tutor Personalities

| Tutor | Dept | Icon | Catchphrase |
|-------|------|------|-------------|
| CodeMentor | CS | 💻 | Think in algorithms! |
| CircuitSage | EE | ⚡ | Current flows, knowledge grows! |
| MechaMind | ME | ⚙️ | Design with purpose! |
| StructurePro | CE | 🏗️ | Strong foundations! |
| SignalMaster | EC | 📡 | Transmit knowledge! |

## 📦 Module Sizes

| Module | Size | Impact |
|--------|------|--------|
| advanced-features.js | 8KB | Low |
| adaptive-interview.js | 12KB | Low |
| visualizations.js | 10KB | Medium |
| integrity-monitor.js | 6KB | Medium |
| ai-tutor.js | 9KB | Low |
| i18n-accessibility.js | 7KB | Low |
| plugin-system.js | 8KB | Low |

**Total**: ~60KB minified, ~18KB gzipped

## 🔗 Useful Links

- [Full Documentation](docs/ADVANCED_FEATURES_v2.md)
- [API Reference](docs/API_REFERENCE.md)
- [Integration Guide](docs/INTEGRATION_GUIDE.md)
- [Plugin Creation](docs/PLUGIN_CREATION.md)

## 💡 Pro Tips

1. **Lazy Load**: Load features only when needed
2. **Cache**: Store user preferences in localStorage
3. **Batch**: Group Firebase writes for better performance
4. **Optimize**: Use worker threads for heavy computations
5. **Monitor**: Track feature usage with analytics
6. **Test**: Test all features across browsers
7. **Fallback**: Provide graceful degradation for unsupported features

## 🐛 Troubleshooting

**Feature not loading?**
- Check console for errors
- Verify script order (firebase-config.js first)
- Clear cache and reload

**Integrity monitor false positives?**
- Adjust sensitivity thresholds
- Disable strict mode for practice
- Check microphone/camera permissions

**Translations not working?**
- Verify language code is supported
- Add `data-translate` attributes
- Check browser language settings

**Export failing?**
- Check browser compatibility (Chrome 90+)
- Verify user data structure
- Try smaller export (disable charts)

---

**Version**: 2.0.0  
**Updated**: November 5, 2025  
**Support**: khanomran365@gmail.com
