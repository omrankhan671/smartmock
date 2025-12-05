/**
 * SmartMock Adaptive Interview System
 * Dynamic branching, difficulty scaling, department-specific logic
 * Version: 2.0
 */

(function() {
  'use strict';

  const AdaptiveInterview = {
    // Difficulty levels
    DIFFICULTY: {
      EASY: 1,
      MEDIUM: 2,
      HARD: 3,
      EXPERT: 4
    },

    // User performance thresholds
    PERFORMANCE_THRESHOLDS: {
      EXCELLENT: 85,
      GOOD: 70,
      AVERAGE: 55,
      POOR: 40
    },

    /**
     * Initialize adaptive interview
     */
    init(department, userLevel = 1) {
      return {
        department,
        currentDifficulty: this.DIFFICULTY.EASY,
        userLevel,
        questionHistory: [],
        performanceScore: 0,
        adaptiveMetrics: {
          correctAnswers: 0,
          totalQuestions: 0,
          avgResponseTime: 0,
          difficultyProgression: []
        }
      };
    },

    /**
     * Get next question based on performance
     */
    getNextQuestion(interviewState, lastResponse = null) {
      // Update performance if there was a previous response
      if (lastResponse) {
        this.updatePerformance(interviewState, lastResponse);
      }

      // Adjust difficulty based on performance
      const newDifficulty = this.calculateDifficulty(interviewState);
      interviewState.currentDifficulty = newDifficulty;

      // Get question from pool
      const question = this.selectQuestion(
        interviewState.department,
        newDifficulty,
        interviewState.questionHistory
      );

      // Track question
      interviewState.questionHistory.push({
        question: question.id,
        difficulty: newDifficulty,
        timestamp: Date.now()
      });

      interviewState.adaptiveMetrics.difficultyProgression.push(newDifficulty);

      return question;
    },

    /**
     * Update performance based on response
     */
    updatePerformance(interviewState, response) {
      const {
        score,
        responseTime,
        fillerWordCount,
        confidence
      } = response;

      // Update metrics
      interviewState.adaptiveMetrics.totalQuestions++;
      
      if (score >= 70) {
        interviewState.adaptiveMetrics.correctAnswers++;
      }

      // Calculate average response time
      const prevAvg = interviewState.adaptiveMetrics.avgResponseTime;
      const count = interviewState.adaptiveMetrics.totalQuestions;
      interviewState.adaptiveMetrics.avgResponseTime = 
        (prevAvg * (count - 1) + responseTime) / count;

      // Update overall performance score
      interviewState.performanceScore = 
        (interviewState.adaptiveMetrics.correctAnswers / 
         interviewState.adaptiveMetrics.totalQuestions) * 100;
    },

    /**
     * Calculate next difficulty level
     */
    calculateDifficulty(interviewState) {
      const { performanceScore, currentDifficulty, adaptiveMetrics } = interviewState;
      const { totalQuestions } = adaptiveMetrics;

      // First 2 questions always easy
      if (totalQuestions < 2) return this.DIFFICULTY.EASY;

      // Calculate recent performance (last 3 questions)
      const recentQuestions = Math.min(3, totalQuestions);
      const recentCorrect = interviewState.questionHistory
        .slice(-recentQuestions)
        .filter(q => q.score >= 70).length;
      const recentPerformance = (recentCorrect / recentQuestions) * 100;

      // Difficulty progression logic
      if (recentPerformance >= this.PERFORMANCE_THRESHOLDS.EXCELLENT) {
        // Excellent performance - increase difficulty
        return Math.min(this.DIFFICULTY.EXPERT, currentDifficulty + 1);
      } else if (recentPerformance >= this.PERFORMANCE_THRESHOLDS.GOOD) {
        // Good performance - maintain or slight increase
        if (totalQuestions % 3 === 0) {
          return Math.min(this.DIFFICULTY.EXPERT, currentDifficulty + 1);
        }
        return currentDifficulty;
      } else if (recentPerformance >= this.PERFORMANCE_THRESHOLDS.AVERAGE) {
        // Average performance - maintain
        return currentDifficulty;
      } else {
        // Poor performance - decrease difficulty
        return Math.max(this.DIFFICULTY.EASY, currentDifficulty - 1);
      }
    },

    /**
     * Select question from pool
     */
    selectQuestion(department, difficulty, history) {
      const pool = this.questionPools[department] || this.questionPools.default;
      const difficultyPool = pool[difficulty] || pool[this.DIFFICULTY.MEDIUM];

      // Filter out already asked questions
      const askedIds = history.map(h => h.question);
      const availableQuestions = difficultyPool.filter(q => !askedIds.includes(q.id));

      // If all questions used, reset pool
      if (availableQuestions.length === 0) {
        return difficultyPool[Math.floor(Math.random() * difficultyPool.length)];
      }

      // Select random question from available pool
      return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    },

    /**
     * Department-specific question pools
     */
    questionPools: {
      cs: {
        1: [ // EASY
          { id: 'cs_e1', text: 'What is a variable in programming?', topics: ['basics'], expectedKeywords: ['store', 'data', 'value'] },
          { id: 'cs_e2', text: 'Explain what an if-else statement does.', topics: ['basics'], expectedKeywords: ['condition', 'branch', 'decision'] },
          { id: 'cs_e3', text: 'What is the difference between = and == in programming?', topics: ['basics'], expectedKeywords: ['assignment', 'comparison', 'operator'] }
        ],
        2: [ // MEDIUM
          { id: 'cs_m1', text: 'Explain the difference between a stack and a queue.', topics: ['data-structures'], expectedKeywords: ['LIFO', 'FIFO', 'push', 'pop'] },
          { id: 'cs_m2', text: 'What is the time complexity of binary search?', topics: ['algorithms'], expectedKeywords: ['O(log n)', 'logarithmic', 'divide'] },
          { id: 'cs_m3', text: 'Describe how a hash table works.', topics: ['data-structures'], expectedKeywords: ['key', 'value', 'hash function', 'collision'] }
        ],
        3: [ // HARD
          { id: 'cs_h1', text: 'How would you detect a cycle in a linked list?', topics: ['algorithms'], expectedKeywords: ['Floyd', 'tortoise', 'hare', 'two pointers'] },
          { id: 'cs_h2', text: 'Explain the difference between SQL and NoSQL databases.', topics: ['databases'], expectedKeywords: ['relational', 'schema', 'flexible', 'scalability'] },
          { id: 'cs_h3', text: 'What are the different types of joins in SQL?', topics: ['databases'], expectedKeywords: ['inner', 'outer', 'left', 'right', 'cross'] }
        ],
        4: [ // EXPERT
          { id: 'cs_ex1', text: 'Design a distributed caching system like Redis.', topics: ['system-design'], expectedKeywords: ['consistent hashing', 'replication', 'sharding', 'eviction'] },
          { id: 'cs_ex2', text: 'How would you design a rate limiter for an API?', topics: ['system-design'], expectedKeywords: ['token bucket', 'sliding window', 'distributed', 'Redis'] },
          { id: 'cs_ex3', text: 'Explain the CAP theorem and its implications.', topics: ['distributed-systems'], expectedKeywords: ['consistency', 'availability', 'partition tolerance', 'tradeoff'] }
        ]
      },

      ee: {
        1: [ // EASY
          { id: 'ee_e1', text: 'What is Ohm\'s Law?', topics: ['basics'], expectedKeywords: ['voltage', 'current', 'resistance', 'V=IR'] },
          { id: 'ee_e2', text: 'Explain the difference between AC and DC.', topics: ['basics'], expectedKeywords: ['alternating', 'direct', 'frequency', 'polarity'] },
          { id: 'ee_e3', text: 'What is a capacitor used for?', topics: ['components'], expectedKeywords: ['store', 'energy', 'charge', 'filter'] }
        ],
        2: [ // MEDIUM
          { id: 'ee_m1', text: 'Explain how a transformer works.', topics: ['power'], expectedKeywords: ['induction', 'turns ratio', 'primary', 'secondary'] },
          { id: 'ee_m2', text: 'What is the difference between analog and digital signals?', topics: ['signals'], expectedKeywords: ['continuous', 'discrete', 'sampling', 'quantization'] },
          { id: 'ee_m3', text: 'Describe the working principle of an op-amp.', topics: ['electronics'], expectedKeywords: ['amplifier', 'differential', 'gain', 'feedback'] }
        ],
        3: [ // HARD
          { id: 'ee_h1', text: 'How does a three-phase power system work?', topics: ['power'], expectedKeywords: ['phases', '120 degrees', 'balanced', 'neutral'] },
          { id: 'ee_h2', text: 'Explain the concept of Fourier Transform in signal processing.', topics: ['signals'], expectedKeywords: ['frequency', 'domain', 'decomposition', 'spectrum'] },
          { id: 'ee_h3', text: 'What is the difference between MOSFET and BJT?', topics: ['electronics'], expectedKeywords: ['voltage', 'current', 'controlled', 'switching'] }
        ],
        4: [ // EXPERT
          { id: 'ee_ex1', text: 'Design a power distribution system for a smart grid.', topics: ['power-systems'], expectedKeywords: ['renewable', 'load balancing', 'SCADA', 'fault detection'] },
          { id: 'ee_ex2', text: 'Explain the challenges in 5G RF circuit design.', topics: ['communications'], expectedKeywords: ['frequency', 'beamforming', 'MIMO', 'power consumption'] },
          { id: 'ee_ex3', text: 'How would you design a high-efficiency DC-DC converter?', topics: ['power-electronics'], expectedKeywords: ['switching', 'topology', 'efficiency', 'ripple'] }
        ]
      },

      me: {
        1: [ // EASY
          { id: 'me_e1', text: 'What is Newton\'s Second Law of Motion?', topics: ['basics'], expectedKeywords: ['force', 'mass', 'acceleration', 'F=ma'] },
          { id: 'me_e2', text: 'Explain the difference between stress and strain.', topics: ['mechanics'], expectedKeywords: ['force', 'area', 'deformation', 'elongation'] },
          { id: 'me_e3', text: 'What is the First Law of Thermodynamics?', topics: ['thermodynamics'], expectedKeywords: ['energy', 'conservation', 'work', 'heat'] }
        ],
        2: [ // MEDIUM
          { id: 'me_m1', text: 'Explain how a four-stroke engine works.', topics: ['thermodynamics'], expectedKeywords: ['intake', 'compression', 'power', 'exhaust'] },
          { id: 'me_m2', text: 'What is the difference between laminar and turbulent flow?', topics: ['fluid-mechanics'], expectedKeywords: ['Reynolds', 'smooth', 'chaotic', 'velocity'] },
          { id: 'me_m3', text: 'Describe the working of a centrifugal pump.', topics: ['fluid-mechanics'], expectedKeywords: ['impeller', 'kinetic', 'pressure', 'centrifugal'] }
        ],
        3: [ // HARD
          { id: 'me_h1', text: 'How do you calculate the critical speed of a rotating shaft?', topics: ['machine-design'], expectedKeywords: ['natural frequency', 'resonance', 'whirling', 'deflection'] },
          { id: 'me_h2', text: 'Explain the Carnot cycle and its efficiency.', topics: ['thermodynamics'], expectedKeywords: ['isothermal', 'adiabatic', 'reversible', 'maximum'] },
          { id: 'me_h3', text: 'What factors affect the strength of a welded joint?', topics: ['manufacturing'], expectedKeywords: ['heat', 'material', 'penetration', 'filler'] }
        ],
        4: [ // EXPERT
          { id: 'me_ex1', text: 'Design a cooling system for an electric vehicle battery pack.', topics: ['thermal-management'], expectedKeywords: ['heat dissipation', 'temperature', 'liquid cooling', 'efficiency'] },
          { id: 'me_ex2', text: 'How would you optimize a gas turbine for maximum efficiency?', topics: ['turbomachinery'], expectedKeywords: ['compression ratio', 'temperature', 'aerodynamics', 'losses'] },
          { id: 'me_ex3', text: 'Explain finite element analysis and its applications.', topics: ['analysis'], expectedKeywords: ['mesh', 'elements', 'stress', 'simulation'] }
        ]
      },

      ce: {
        1: [ // EASY
          { id: 'ce_e1', text: 'What are the main types of loads on a structure?', topics: ['basics'], expectedKeywords: ['dead', 'live', 'wind', 'seismic'] },
          { id: 'ce_e2', text: 'Explain the difference between stress and load.', topics: ['basics'], expectedKeywords: ['force', 'area', 'internal', 'external'] },
          { id: 'ce_e3', text: 'What is the purpose of reinforcement in concrete?', topics: ['materials'], expectedKeywords: ['tensile', 'strength', 'steel', 'crack'] }
        ],
        2: [ // MEDIUM
          { id: 'ce_m1', text: 'Describe the different types of foundations.', topics: ['structures'], expectedKeywords: ['shallow', 'deep', 'pile', 'footing'] },
          { id: 'ce_m2', text: 'What is the difference between flexible and rigid pavement?', topics: ['transportation'], expectedKeywords: ['layers', 'load distribution', 'asphalt', 'concrete'] },
          { id: 'ce_m3', text: 'Explain how a wastewater treatment plant works.', topics: ['environmental'], expectedKeywords: ['primary', 'secondary', 'tertiary', 'sludge'] }
        ],
        3: [ // HARD
          { id: 'ce_h1', text: 'How do you design a structure for earthquake resistance?', topics: ['structural-design'], expectedKeywords: ['ductility', 'base isolation', 'dampers', 'seismic'] },
          { id: 'ce_h2', text: 'Explain the concept of effective stress in soil mechanics.', topics: ['geotechnical'], expectedKeywords: ['total stress', 'pore pressure', 'strength', 'consolidation'] },
          { id: 'ce_h3', text: 'What are the factors affecting traffic flow on highways?', topics: ['transportation'], expectedKeywords: ['volume', 'density', 'speed', 'capacity'] }
        ],
        4: [ // EXPERT
          { id: 'ce_ex1', text: 'Design a sustainable stormwater management system for an urban area.', topics: ['environmental'], expectedKeywords: ['green infrastructure', 'infiltration', 'retention', 'quality'] },
          { id: 'ce_ex2', text: 'How would you analyze a cable-stayed bridge?', topics: ['structural-analysis'], expectedKeywords: ['cables', 'tension', 'pylons', 'finite element'] },
          { id: 'ce_ex3', text: 'Explain BIM and its impact on construction project management.', topics: ['construction'], expectedKeywords: ['3D model', 'collaboration', 'lifecycle', 'coordination'] }
        ]
      },

      ec: {
        1: [ // EASY
          { id: 'ec_e1', text: 'What is modulation in communication systems?', topics: ['basics'], expectedKeywords: ['signal', 'carrier', 'information', 'transmission'] },
          { id: 'ec_e2', text: 'Explain the difference between analog and digital communication.', topics: ['basics'], expectedKeywords: ['continuous', 'discrete', 'bits', 'signal'] },
          { id: 'ec_e3', text: 'What is bandwidth in communication?', topics: ['basics'], expectedKeywords: ['frequency', 'range', 'capacity', 'channel'] }
        ],
        2: [ // MEDIUM
          { id: 'ec_m1', text: 'Describe amplitude modulation (AM) and frequency modulation (FM).', topics: ['modulation'], expectedKeywords: ['amplitude', 'frequency', 'carrier', 'variation'] },
          { id: 'ec_m2', text: 'What is the Nyquist sampling theorem?', topics: ['signal-processing'], expectedKeywords: ['sampling', 'frequency', 'twice', 'aliasing'] },
          { id: 'ec_m3', text: 'Explain how a microcontroller differs from a microprocessor.', topics: ['embedded'], expectedKeywords: ['integrated', 'peripherals', 'standalone', 'system'] }
        ],
        3: [ // HARD
          { id: 'ec_h1', text: 'How does MIMO technology improve wireless communication?', topics: ['wireless'], expectedKeywords: ['multiple', 'antennas', 'spatial', 'capacity'] },
          { id: 'ec_h2', text: 'Explain the working of a Phase-Locked Loop (PLL).', topics: ['circuits'], expectedKeywords: ['phase', 'frequency', 'feedback', 'synchronization'] },
          { id: 'ec_h3', text: 'What are the different types of antenna polarization?', topics: ['antennas'], expectedKeywords: ['linear', 'circular', 'vertical', 'horizontal'] }
        ],
        4: [ // EXPERT
          { id: 'ec_ex1', text: 'Design a 5G network architecture for a smart city.', topics: ['5g'], expectedKeywords: ['small cells', 'beamforming', 'latency', 'edge computing'] },
          { id: 'ec_ex2', text: 'Explain the challenges in satellite communication systems.', topics: ['satellite'], expectedKeywords: ['path loss', 'delay', 'Doppler', 'power'] },
          { id: 'ec_ex3', text: 'How would you implement a software-defined radio?', topics: ['sdr'], expectedKeywords: ['digital', 'FPGA', 'flexible', 'reconfigurable'] }
        ]
      },

      default: {
        1: [{ id: 'def_e1', text: 'Tell me about yourself and your background.', topics: ['intro'], expectedKeywords: [] }],
        2: [{ id: 'def_m1', text: 'Describe a challenging project you worked on.', topics: ['experience'], expectedKeywords: [] }],
        3: [{ id: 'def_h1', text: 'How do you handle tight deadlines and pressure?', topics: ['behavioral'], expectedKeywords: [] }],
        4: [{ id: 'def_ex1', text: 'Where do you see yourself in 5 years?', topics: ['career'], expectedKeywords: [] }]
      }
    },

    /**
     * Generate follow-up question based on answer
     */
    generateFollowUp(question, answer, score) {
      if (score < 50) {
        // Poor answer - give hint and retry
        return {
          type: 'clarification',
          text: `Let me help you with that. ${this.getHint(question)}. Can you try explaining again?`
        };
      } else if (score >= 50 && score < 80) {
        // Decent answer - probe deeper
        return {
          type: 'probe',
          text: `Good! Can you elaborate on ${this.extractKeyTopic(question)}?`
        };
      } else {
        // Excellent answer - challenge with related advanced question
        return {
          type: 'challenge',
          text: `Excellent! Now, let's dive deeper: ${this.getAdvancedQuestion(question)}`
        };
      }
    },

    getHint(question) {
      const hints = {
        'stack': 'Think about how you add and remove items - Last In, First Out',
        'hash': 'Consider how you map keys to array indices using a function',
        'binary search': 'Think about how you eliminate half the search space each time',
        'default': 'Think about the fundamental concepts and how they relate'
      };

      for (let key in hints) {
        if (question.text.toLowerCase().includes(key)) {
          return hints[key];
        }
      }
      return hints.default;
    },

    extractKeyTopic(question) {
      if (question.topics && question.topics.length > 0) {
        return question.topics[0].replace('-', ' ');
      }
      return 'that concept';
    },

    getAdvancedQuestion(question) {
      // Map to related advanced questions
      const advancedMap = {
        'stack': 'How would you implement a stack that supports getMin() in O(1)?',
        'queue': 'How would you implement a queue using two stacks?',
        'hash': 'How do you handle hash collisions in production systems?',
        'binary search': 'How would you find the first occurrence in a sorted array with duplicates?',
        'default': 'Can you compare this with alternative approaches?'
      };

      for (let key in advancedMap) {
        if (question.text.toLowerCase().includes(key)) {
          return advancedMap[key];
        }
      }
      return advancedMap.default;
    },

    /**
     * Get department-specific logic tree
     */
    getDepartmentLogic(department) {
      const logic = {
        cs: {
          startWith: 'data-structures',
          progression: ['algorithms', 'databases', 'system-design'],
          focusAreas: ['problem-solving', 'optimization', 'scalability']
        },
        ee: {
          startWith: 'basics',
          progression: ['circuits', 'signals', 'power-systems'],
          focusAreas: ['analysis', 'design', 'troubleshooting']
        },
        me: {
          startWith: 'mechanics',
          progression: ['thermodynamics', 'fluid-mechanics', 'machine-design'],
          focusAreas: ['calculations', 'design', 'analysis']
        },
        ce: {
          startWith: 'structures',
          progression: ['geotechnical', 'transportation', 'environmental'],
          focusAreas: ['design', 'analysis', 'codes']
        },
        ec: {
          startWith: 'signals',
          progression: ['modulation', 'wireless', 'embedded'],
          focusAreas: ['systems', 'design', 'troubleshooting']
        }
      };

      return logic[department] || logic.cs;
    },

    /**
     * Generate interview summary
     */
    generateSummary(interviewState) {
      const { adaptiveMetrics, performanceScore, questionHistory } = interviewState;
      
      return {
        totalQuestions: adaptiveMetrics.totalQuestions,
        correctAnswers: adaptiveMetrics.correctAnswers,
        performanceScore: Math.round(performanceScore),
        avgResponseTime: Math.round(adaptiveMetrics.avgResponseTime),
        difficultyRange: {
          min: Math.min(...adaptiveMetrics.difficultyProgression),
          max: Math.max(...adaptiveMetrics.difficultyProgression),
          final: adaptiveMetrics.difficultyProgression[adaptiveMetrics.difficultyProgression.length - 1]
        },
        progression: adaptiveMetrics.difficultyProgression,
        recommendation: this.getRecommendation(performanceScore, adaptiveMetrics)
      };
    },

    getRecommendation(score, metrics) {
      const finalDifficulty = metrics.difficultyProgression[metrics.difficultyProgression.length - 1];
      
      if (score >= 85 && finalDifficulty >= 3) {
        return 'Excellent! You\'re ready for advanced topics and real interviews.';
      } else if (score >= 70 && finalDifficulty >= 2) {
        return 'Good job! Practice more hard-level questions to reach expert level.';
      } else if (score >= 55) {
        return 'Keep practicing! Focus on medium-difficulty questions to build confidence.';
      } else {
        return 'Review fundamentals and practice easy questions before moving up.';
      }
    }
  };

  // Export to global
  window.AdaptiveInterview = AdaptiveInterview;
  console.log('✅ Adaptive Interview System Loaded (v2.0)');
})();
