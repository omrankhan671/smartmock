/**
 * SmartMock Advanced Features Module
 * Includes: Bias Analyzer, Confidence Analyzer, Speech Clarity Index, Emotion Analysis
 * Version: 2.0
 */

(function() {
  'use strict';

  // ===========================================
  // BIAS & CONFIDENCE ANALYZER
  // ===========================================

  const BiasAnalyzer = {
    // Filler words database
    fillerWords: [
      'um', 'uh', 'like', 'you know', 'i mean', 'sort of', 'kind of',
      'basically', 'actually', 'literally', 'honestly', 'well',
      'so', 'right', 'okay', 'yeah', 'hmm', 'err'
    ],

    // Passive voice indicators
    passiveIndicators: [
      'was', 'were', 'been', 'being', 'is', 'am', 'are',
      'was given', 'was made', 'was done', 'was created'
    ],

    // Vague answer indicators
    vagueIndicators: [
      'maybe', 'might', 'perhaps', 'possibly', 'probably',
      'i think', 'i guess', 'not sure', 'kind of', 'sort of'
    ],

    // Confidence boosters (positive words)
    confidenceWords: [
      'definitely', 'certainly', 'absolutely', 'confident',
      'sure', 'know', 'understand', 'experienced', 'skilled',
      'achieved', 'accomplished', 'successfully', 'proven'
    ],

    // Nervous indicators
    nervousIndicators: [
      'nervous', 'worried', 'anxious', 'scared', 'afraid',
      'uncertain', 'unsure', 'confused', 'lost'
    ],

    /**
     * Analyze transcript for filler words
     */
    analyzeFillerWords(transcript) {
      if (!transcript) return { count: 0, density: 0, words: [], positions: [] };

      const words = transcript.toLowerCase().split(/\s+/);
      const totalWords = words.length;
      const foundFillers = [];
      const positions = [];

      words.forEach((word, index) => {
        if (this.fillerWords.includes(word)) {
          foundFillers.push(word);
          positions.push(index);
        }
      });

      return {
        count: foundFillers.length,
        density: totalWords > 0 ? (foundFillers.length / totalWords * 100).toFixed(2) : 0,
        words: foundFillers,
        positions: positions,
        rating: this.getFillerRating(foundFillers.length, totalWords)
      };
    },

    /**
     * Get filler word rating
     */
    getFillerRating(fillerCount, totalWords) {
      const density = (fillerCount / totalWords) * 100;
      if (density < 2) return { score: 95, level: 'Excellent', color: '#00FF88' };
      if (density < 5) return { score: 80, level: 'Good', color: '#FFB800' };
      if (density < 10) return { score: 60, level: 'Average', color: '#FF8C00' };
      return { score: 40, level: 'Needs Improvement', color: '#FF3366' };
    },

    /**
     * Analyze passive voice usage
     */
    analyzePassiveTone(transcript) {
      if (!transcript) return { count: 0, score: 100, suggestions: [] };

      const sentences = transcript.split(/[.!?]+/);
      let passiveCount = 0;

      sentences.forEach(sentence => {
        const lowerSentence = sentence.toLowerCase();
        this.passiveIndicators.forEach(indicator => {
          if (lowerSentence.includes(indicator)) {
            passiveCount++;
          }
        });
      });

      const passivePercentage = (passiveCount / sentences.length) * 100;
      const score = Math.max(0, 100 - passivePercentage * 2);

      const suggestions = [];
      if (passivePercentage > 30) {
        suggestions.push('Use more active voice: "I did X" instead of "X was done"');
        suggestions.push('Start sentences with action verbs');
        suggestions.push('Be direct and assertive in your statements');
      }

      return {
        count: passiveCount,
        percentage: passivePercentage.toFixed(2),
        score: Math.round(score),
        level: score > 80 ? 'Active' : score > 60 ? 'Balanced' : 'Passive',
        suggestions: suggestions
      };
    },

    /**
     * Detect vague answers
     */
    detectVagueAnswers(transcript) {
      if (!transcript) return { count: 0, score: 100, flags: [] };

      const words = transcript.toLowerCase().split(/\s+/);
      let vagueCount = 0;
      const flags = [];

      this.vagueIndicators.forEach(indicator => {
        const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
        const matches = transcript.match(regex);
        if (matches) {
          vagueCount += matches.length;
          flags.push({
            word: indicator,
            count: matches.length,
            suggestion: `Replace "${indicator}" with specific details`
          });
        }
      });

      const vagueDensity = (vagueCount / words.length) * 100;
      const score = Math.max(0, 100 - vagueDensity * 10);

      return {
        count: vagueCount,
        density: vagueDensity.toFixed(2),
        score: Math.round(score),
        level: score > 80 ? 'Specific' : score > 60 ? 'Clear' : 'Vague',
        flags: flags
      };
    },

    /**
     * Analyze confidence level
     */
    analyzeConfidence(transcript) {
      if (!transcript) return { score: 50, level: 'Neutral', indicators: {} };

      const words = transcript.toLowerCase().split(/\s+/);
      let confidenceScore = 0;
      let nervousScore = 0;

      // Count confidence words
      this.confidenceWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = transcript.match(regex);
        if (matches) confidenceScore += matches.length;
      });

      // Count nervous indicators
      this.nervousIndicators.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = transcript.match(regex);
        if (matches) nervousScore += matches.length;
      });

      const netScore = confidenceScore - nervousScore * 2;
      const normalizedScore = Math.min(100, Math.max(0, 50 + netScore * 5));

      return {
        score: Math.round(normalizedScore),
        level: normalizedScore > 75 ? 'Very Confident' : normalizedScore > 60 ? 'Confident' : normalizedScore > 40 ? 'Neutral' : 'Nervous',
        indicators: {
          confidenceWords: confidenceScore,
          nervousWords: nervousScore
        },
        color: normalizedScore > 75 ? '#00FF88' : normalizedScore > 60 ? '#FFB800' : '#FF3366'
      };
    },

    /**
     * Detect emotional inconsistencies
     */
    detectEmotionalInconsistencies(transcript, emotions) {
      if (!transcript || !emotions || emotions.length === 0) {
        return { inconsistencies: [], score: 100 };
      }

      const inconsistencies = [];
      const words = transcript.toLowerCase();

      // Check if confident words are said during nervous emotions
      emotions.forEach((emotion, index) => {
        if (emotion.type === 'Nervous' || emotion.type === 'Confused') {
          this.confidenceWords.forEach(confWord => {
            if (words.includes(confWord)) {
              inconsistencies.push({
                position: index,
                emotion: emotion.type,
                issue: `Using confident language ("${confWord}") while displaying ${emotion.type} emotion`,
                suggestion: 'Practice maintaining consistent confident body language'
              });
            }
          });
        }
      });

      const score = Math.max(0, 100 - inconsistencies.length * 10);

      return {
        inconsistencies: inconsistencies,
        count: inconsistencies.length,
        score: score,
        level: score > 80 ? 'Consistent' : score > 60 ? 'Minor Issues' : 'Inconsistent'
      };
    },

    /**
     * Generate cognitive improvement strategies
     */
    generateCognitiveStrategies(analysisResults) {
      const strategies = [];

      // Filler word strategies
      if (analysisResults.fillerWords && analysisResults.fillerWords.rating.score < 70) {
        strategies.push({
          category: 'Filler Words',
          priority: 'High',
          strategies: [
            '🎯 Practice: Record yourself and count filler words',
            '⏸️ Technique: Pause instead of saying "um" or "uh"',
            '🧘 Exercise: Slow down your speech by 10-15%',
            '📝 Preparation: Outline answers before speaking'
          ]
        });
      }

      // Passive tone strategies
      if (analysisResults.passiveTone && analysisResults.passiveTone.score < 70) {
        strategies.push({
          category: 'Active Communication',
          priority: 'Medium',
          strategies: [
            '💪 Reframe: "I led the project" vs "The project was led by me"',
            '🎯 Start Strong: Begin sentences with "I" or action verbs',
            '📊 Quantify: Use numbers and specific achievements',
            '🔄 Practice: Rewrite 5 passive sentences to active daily'
          ]
        });
      }

      // Vague answer strategies
      if (analysisResults.vagueAnswers && analysisResults.vagueAnswers.score < 70) {
        strategies.push({
          category: 'Answer Specificity',
          priority: 'High',
          strategies: [
            '📏 STAR Method: Situation, Task, Action, Result',
            '🔢 Use Numbers: "Increased by 30%" vs "Increased significantly"',
            '📅 Include Timeline: "Over 6 months" vs "Eventually"',
            '🎓 Name Technologies: Be specific about tools and frameworks'
          ]
        });
      }

      // Confidence strategies
      if (analysisResults.confidence && analysisResults.confidence.score < 60) {
        strategies.push({
          category: 'Confidence Building',
          priority: 'Critical',
          strategies: [
            '🏆 Power Posing: Stand confidently for 2 min before interview',
            '😊 Smile: Increases perceived confidence by 40%',
            '👁️ Eye Contact: Practice with friends or mirror',
            '🗣️ Voice: Speak 10% louder and slower',
            '💭 Mindset: Replace "I think" with "I know"'
          ]
        });
      }

      // Emotional consistency strategies
      if (analysisResults.emotionalConsistency && analysisResults.emotionalConsistency.score < 70) {
        strategies.push({
          category: 'Emotional Alignment',
          priority: 'Medium',
          strategies: [
            '🎭 Body Language: Match your words with confident posture',
            '😌 Breathing: 4-7-8 technique before answering',
            '🧘 Mindfulness: 5-min meditation before interview',
            '🎥 Record: Watch yourself and identify disconnects'
          ]
        });
      }

      return strategies;
    },

    /**
     * Complete bias and confidence analysis
     */
    performFullAnalysis(transcript, emotions = []) {
      const fillerWords = this.analyzeFillerWords(transcript);
      const passiveTone = this.analyzePassiveTone(transcript);
      const vagueAnswers = this.detectVagueAnswers(transcript);
      const confidence = this.analyzeConfidence(transcript);
      const emotionalConsistency = this.detectEmotionalInconsistencies(transcript, emotions);

      const analysisResults = {
        fillerWords,
        passiveTone,
        vagueAnswers,
        confidence,
        emotionalConsistency
      };

      const cognitiveStrategies = this.generateCognitiveStrategies(analysisResults);

      // Calculate overall communication score
      const overallScore = Math.round(
        (fillerWords.rating.score * 0.2) +
        (passiveTone.score * 0.2) +
        (vagueAnswers.score * 0.2) +
        (confidence.score * 0.25) +
        (emotionalConsistency.score * 0.15)
      );

      return {
        ...analysisResults,
        cognitiveStrategies,
        overallScore,
        overallLevel: overallScore > 80 ? 'Excellent' : overallScore > 65 ? 'Good' : overallScore > 50 ? 'Average' : 'Needs Improvement'
      };
    }
  };

  // ===========================================
  // SPEECH CLARITY INDEX
  // ===========================================

  const SpeechClarityIndex = {
    /**
     * Calculate comprehensive speech clarity score
     */
    calculateClarityIndex(speechData) {
      const {
        wpm = 0,
        fillerDensity = 0,
        avgPauseLength = 0,
        volumeConsistency = 100,
        pronunciationScore = 100
      } = speechData;

      // Optimal WPM is 140-160
      const wpmScore = this.calculateWPMScore(wpm);
      
      // Lower filler density is better
      const fillerScore = Math.max(0, 100 - fillerDensity * 10);
      
      // Optimal pause is 0.5-1.5 seconds
      const pauseScore = this.calculatePauseScore(avgPauseLength);
      
      // Volume consistency (higher is better)
      const volumeScore = volumeConsistency;
      
      // Pronunciation (higher is better)
      const pronScore = pronunciationScore;

      const clarityIndex = Math.round(
        (wpmScore * 0.25) +
        (fillerScore * 0.25) +
        (pauseScore * 0.2) +
        (volumeScore * 0.15) +
        (pronScore * 0.15)
      );

      return {
        overallScore: clarityIndex,
        breakdown: {
          wpm: { score: wpmScore, value: wpm, optimal: '140-160' },
          fillerDensity: { score: fillerScore, value: fillerDensity, optimal: '< 2%' },
          pauseLength: { score: pauseScore, value: avgPauseLength, optimal: '0.5-1.5s' },
          volumeConsistency: { score: volumeScore, value: volumeConsistency, optimal: '> 80%' },
          pronunciation: { score: pronScore, value: pronunciationScore, optimal: '> 85%' }
        },
        level: clarityIndex > 80 ? 'Excellent' : clarityIndex > 65 ? 'Good' : clarityIndex > 50 ? 'Average' : 'Needs Improvement',
        color: clarityIndex > 80 ? '#00FF88' : clarityIndex > 65 ? '#FFB800' : '#FF3366'
      };
    },

    calculateWPMScore(wpm) {
      if (wpm >= 140 && wpm <= 160) return 100;
      if (wpm >= 120 && wpm < 140) return 85;
      if (wpm > 160 && wpm <= 180) return 85;
      if (wpm >= 100 && wpm < 120) return 70;
      if (wpm > 180 && wpm <= 200) return 70;
      return 50;
    },

    calculatePauseScore(pauseLength) {
      if (pauseLength >= 0.5 && pauseLength <= 1.5) return 100;
      if (pauseLength < 0.5) return 70; // Too fast
      if (pauseLength <= 2.5) return 80; // Slightly slow
      return 60; // Too slow
    },

    /**
     * Generate radar chart data
     */
    generateRadarChartData(clarityIndex) {
      return {
        labels: ['WPM', 'Filler Density', 'Pause Length', 'Volume', 'Pronunciation'],
        datasets: [{
          label: 'Your Score',
          data: [
            clarityIndex.breakdown.wpm.score,
            clarityIndex.breakdown.fillerDensity.score,
            clarityIndex.breakdown.pauseLength.score,
            clarityIndex.breakdown.volumeConsistency.score,
            clarityIndex.breakdown.pronunciation.score
          ],
          backgroundColor: 'rgba(108, 99, 255, 0.2)',
          borderColor: '#6C63FF',
          borderWidth: 2
        }, {
          label: 'Top Performers (Avg)',
          data: [90, 85, 90, 88, 92],
          backgroundColor: 'rgba(0, 229, 255, 0.1)',
          borderColor: '#00E5FF',
          borderWidth: 1,
          borderDash: [5, 5]
        }]
      };
    }
  };

  // ===========================================
  // GAMIFICATION SYSTEM
  // ===========================================

  const GamificationSystem = {
    /**
     * Calculate XP from interview performance
     */
    calculateXP(score, interviewType = 'ai', department = 'cs') {
      let baseXP = 50;
      
      // Score multiplier
      const scoreMultiplier = score / 100;
      
      // Interview type bonus
      const typeBonus = interviewType === 'ai' ? 1.5 : 1.0;
      
      // Department complexity bonus
      const deptMultipliers = {
        cs: 1.2,
        ee: 1.15,
        me: 1.1,
        ce: 1.0,
        ec: 1.1
      };
      
      const totalXP = Math.round(baseXP * scoreMultiplier * typeBonus * (deptMultipliers[department] || 1.0));
      
      return {
        xp: totalXP,
        breakdown: {
          base: baseXP,
          scoreMultiplier: (scoreMultiplier * 100).toFixed(0) + '%',
          typeBonus: typeBonus,
          deptBonus: deptMultipliers[department]
        }
      };
    },

    /**
     * Calculate level from total XP
     */
    calculateLevel(totalXP) {
      // Level formula: Level = floor(sqrt(XP / 100))
      const level = Math.floor(Math.sqrt(totalXP / 100)) + 1;
      const currentLevelXP = Math.pow(level - 1, 2) * 100;
      const nextLevelXP = Math.pow(level, 2) * 100;
      const progressXP = totalXP - currentLevelXP;
      const requiredXP = nextLevelXP - currentLevelXP;
      const progress = (progressXP / requiredXP) * 100;

      return {
        level,
        currentLevelXP,
        nextLevelXP,
        progressXP,
        requiredXP,
        progress: Math.round(progress),
        title: this.getLevelTitle(level)
      };
    },

    getLevelTitle(level) {
      if (level >= 50) return '🏆 Master';
      if (level >= 40) return '💎 Expert';
      if (level >= 30) return '⭐ Professional';
      if (level >= 20) return '🎯 Advanced';
      if (level >= 10) return '📚 Intermediate';
      return '🌱 Beginner';
    },

    /**
     * Badge system
     */
    checkBadges(userData) {
      const badges = [];

      // Interview count badges
      if (userData.totalInterviews >= 1) badges.push({ id: 'first_interview', name: 'First Steps', icon: '🎓', tier: 'bronze' });
      if (userData.totalInterviews >= 10) badges.push({ id: 'dedicated', name: 'Dedicated', icon: '💪', tier: 'silver' });
      if (userData.totalInterviews >= 50) badges.push({ id: 'persistent', name: 'Persistent', icon: '🔥', tier: 'gold' });
      if (userData.totalInterviews >= 100) badges.push({ id: 'unstoppable', name: 'Unstoppable', icon: '🚀', tier: 'platinum' });

      // Score badges
      if (userData.bestScore >= 70) badges.push({ id: 'passed', name: 'Passed', icon: '✅', tier: 'bronze' });
      if (userData.bestScore >= 85) badges.push({ id: 'excellent', name: 'Excellent', icon: '⭐', tier: 'silver' });
      if (userData.bestScore >= 95) badges.push({ id: 'perfect', name: 'Near Perfect', icon: '💯', tier: 'gold' });

      // Streak badges
      if (userData.currentStreak >= 3) badges.push({ id: 'streak_3', name: '3-Day Streak', icon: '🔥', tier: 'bronze' });
      if (userData.currentStreak >= 7) badges.push({ id: 'streak_7', name: 'Weekly Warrior', icon: '⚡', tier: 'silver' });
      if (userData.currentStreak >= 30) badges.push({ id: 'streak_30', name: 'Monthly Master', icon: '👑', tier: 'gold' });

      // Department badges
      const depts = ['cs', 'ee', 'me', 'ce', 'ec'];
      depts.forEach(dept => {
        if (userData.completedCourses && userData.completedCourses[dept] >= 5) {
          badges.push({ id: `${dept}_5`, name: `${dept.toUpperCase()} Specialist`, icon: '🎯', tier: 'silver' });
        }
      });

      return badges;
    },

    /**
     * Update streak
     */
    updateStreak(lastInterviewDate, currentDate = Date.now()) {
      if (!lastInterviewDate) {
        return { currentStreak: 1, longestStreak: 1, streakActive: true };
      }

      const lastDate = new Date(lastInterviewDate);
      const today = new Date(currentDate);
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Same day - no change
        return { maintain: true };
      } else if (diffDays === 1) {
        // Consecutive day - increment
        return { increment: true };
      } else {
        // Streak broken
        return { currentStreak: 1, longestStreak: null, streakActive: false };
      }
    }
  };

  // ===========================================
  // EXPORT TO GLOBAL
  // ===========================================

  window.SmartMockAdvanced = {
    BiasAnalyzer,
    SpeechClarityIndex,
    GamificationSystem,
    version: '2.0'
  };

  console.log('✅ SmartMock Advanced Features Module Loaded (v2.0)');
})();
